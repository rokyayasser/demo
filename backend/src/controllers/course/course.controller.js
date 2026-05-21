// controllers/course/course.controller.js
"use strict";
const BaseController = require("../BaseController");
const Course = require("../../models/Course");
const CourseEnrollment = require("../../models/Courseenrollment");
const User = require("../../models/User");

let cloudinary,
  sendCourseAccessEmail,
  sendCertificateEmail,
  generateCertificate;
try {
  cloudinary = require("../../config/cloudinary");
} catch (e) {
  console.warn("cloudinary not loaded");
}
try {
  ({
    sendCourseAccessEmail,
    sendCertificateEmail,
  } = require("../../services/email.service"));
} catch (e) {
  console.warn("email service not loaded");
}
try {
  ({ generateCertificate } = require("../../services/certificate.service"));
} catch (e) {
  console.warn("certificate service not loaded");
}

// Load Paymob — store the class/instance separately so we can call it safely
let PaymobService = null;
try {
  PaymobService = require("../../config/paymob");
  // Handle both `module.exports = new PaymobService()` and `module.exports = PaymobService`
  if (typeof PaymobService === "function") {
    PaymobService = new PaymobService();
  }
} catch (e) {
  console.warn("paymob not loaded:", e.message);
}

const parseArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  const str = String(value).trim();
  if (str.startsWith("[")) {
    try {
      return JSON.parse(str).filter(Boolean);
    } catch {
      /* fall */
    }
  }
  return str
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

const safeNumber = (val) => {
  if (val === "" || val === "null" || val === "undefined" || val == null)
    return undefined;
  const n = Number(val);
  return isNaN(n) ? undefined : n;
};

class CourseController extends BaseController {
  constructor() {
    super();
    [
      "getAllCourses",
      "getCourseById",
      "getCourseByIdAdmin",
      "getEnrolledCourses",
      "enrollCourse",
      "handleEnrollCallback",
      "updateProgress",
      "completeCourse",
      "createCourse",
      "updateCourse",
      "deleteCourse",
    ].forEach((m) => (this[m] = this[m].bind(this)));
  }

  async getAllCourses(req, res) {
    try {
      const { category, page = 1, limit = 20 } = req.query;
      const query = { available: true };
      if (category) query.category = category;
      const skip = (Number(page) - 1) * Number(limit);
      const [courses, total] = await Promise.all([
        Course.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit)),
        Course.countDocuments(query),
      ]);
      return this.success(res, { data: courses, total });
    } catch (err) {
      return this.error(res, err.message);
    }
  }

  async getCourseById(req, res) {
    try {
      const course = await Course.findById(req.params.id);
      if (!course) return this.notFound(res, "الكورس غير موجود");
      return this.success(res, { course });
    } catch (err) {
      return this.error(res, err.message);
    }
  }

  async getCourseByIdAdmin(req, res) {
    try {
      const course = await Course.findById(req.params.id).select(
        "+playlistUrl",
      );
      if (!course) return this.notFound(res, "الكورس غير موجود");
      return this.success(res, { course });
    } catch (err) {
      return this.error(res, err.message);
    }
  }

  async getEnrolledCourses(req, res) {
    try {
      const enrollments = await CourseEnrollment.find({
        userId: req.userId,
        paid: true,
      }).populate({ path: "courseId", model: "Course" });
      const courses = enrollments
        .filter((e) => e.courseId)
        .map((e) => ({
          ...e.courseId.toObject(),
          progress: e.progress,
          completedLessons: e.completedLessons,
          enrolledAt: e.enrolledAt,
          completedAt: e.completedAt,
        }));
      return this.success(res, { courses });
    } catch (err) {
      return this.error(res, err.message);
    }
  }

  // ── Enroll ──────────────────────────────────────────────────────────────────
  async enrollCourse(req, res) {
    try {
      const { courseId } = req.body;
      const userId = req.userId;

      if (!courseId) return this.badRequest(res, "courseId مطلوب");
      if (!userId) return this.unauthorized(res, "يجب تسجيل الدخول");

      // ── Fetch user FIRST — we need it for both free and paid paths ──────────
      const [course, user] = await Promise.all([
        Course.findById(courseId),
        User.findById(userId).select("name email phone"),
      ]);

      if (!course) return this.notFound(res, "الكورس غير موجود");
      if (!course.available)
        return this.conflict(res, "الكورس غير متاح حالياً");

      if (!user) {
        console.error(`enrollCourse: User ${userId} not found in DB`);
        return this.notFound(
          res,
          "المستخدم غير موجود — يرجى تسجيل الخروج والدخول مرة أخرى",
        );
      }

      // ── Already enrolled and paid ─────────────────────────────────────────
      const existing = await CourseEnrollment.findOne({ userId, courseId });
      if (existing?.paid) {
        return this.success(res, { alreadyEnrolled: true, courseId });
      }

      const enrollment = existing || new CourseEnrollment({ userId, courseId });

      // ── FREE COURSE ──────────────────────────────────────────────────────────
      if (!course.price || Number(course.price) === 0) {
        enrollment.paid = true;
        enrollment.paymentDate = new Date();
        await enrollment.save();
        this._sendCourseEmail(enrollment, course, userId).catch(console.error);
        return this.success(res, { enrolled: true, free: true, courseId });
      }

      // ── PAID COURSE — initiate Paymob ────────────────────────────────────────
      const merchantOrderId = `course-${courseId}-${userId}-${Date.now()}`;
      enrollment.paymobMerchantOrderId = merchantOrderId;
      await enrollment.save();

      // Build billing_data with guaranteed non-empty strings (Paymob rejects empty fields)
      const nameParts = (user.name || "User").trim().split(/\s+/);
      const firstName = nameParts[0] || "User";
      const lastName = nameParts.slice(1).join(" ") || firstName;
      const email = user.email || "user@example.com";
      const phone = (user.phone || "01000000000").replace(/\s+/g, "");

      if (
        PaymobService &&
        typeof PaymobService.initiatePayment === "function"
      ) {
        try {
          // ── Paymob expects POSITIONAL args: (paymentId, amount, userInfo, items)
          // Matches payment.service.js pattern exactly:
          //   this.paymob.initiatePayment(appointmentId, amount, userInfo, [])
          const userInfo = {
            name: `${firstName} ${lastName}`.trim(),
            email,
            phone,
          };

          // Use merchantOrderId as paymentId so we can trace it back
          // paymob.createOrder wraps it: "{paymentId}_{timestamp}"
          // We store the full Paymob merchantOrderId so callback can find enrollment
          const paymobData = await PaymobService.initiatePayment(
            merchantOrderId, // paymentId — stored as merchant_order_id prefix
            Number(course.price), // amount in EGP
            userInfo, // { name, email, phone }
            [], // items
          );

          const paymentUrl =
            paymobData?.paymentUrl ||
            paymobData?.iframeUrl ||
            paymobData?.iframe_url ||
            paymobData?.url;

          if (!paymentUrl) {
            console.error("Paymob returned no payment URL:", paymobData);
            return this.error(res, "فشل الحصول على رابط الدفع من Paymob");
          }

          // Store the FULL Paymob merchantOrderId (includes _timestamp suffix added by paymob.js)
          // This is what the webhook callback receives in callbackData.order.merchant_order_id
          enrollment.paymobOrderId = paymobData.orderId;
          enrollment.paymobMerchantOrderId =
            paymobData.merchantOrderId || merchantOrderId;
          await enrollment.save();
          console.log(
            "Enrollment saved with paymobMerchantOrderId:",
            enrollment.paymobMerchantOrderId,
          );

          return this.success(res, {
            enrolled: false,
            paid: false,
            paymentUrl,
            iframeUrl: paymentUrl,
          });
        } catch (paymobErr) {
          console.error("❌ Paymob initiatePayment error:", paymobErr.message);
          return this.error(res, `فشل بوابة الدفع: ${paymobErr.message}`);
        }
      }

      // Paymob not configured — return pending status
      return this.success(
        res,
        {
          enrolled: false,
          needsPayment: true,
          amount: course.price,
          courseTitle: course.title_ar || course.title,
          merchantOrderId,
        },
        "يرجى التواصل معنا لإتمام الدفع",
      );
    } catch (err) {
      console.error("enrollCourse error:", err.message);
      return this.error(res, err.message);
    }
  }

  // ── Paymob webhook ────────────────────────────────────────────────────────
  async handleEnrollCallback(req, res) {
    try {
      const callbackData = req.body.obj || req.body;
      const receivedHmac = req.query.hmac;

      if (
        PaymobService &&
        typeof PaymobService.verifyHmac === "function" &&
        receivedHmac
      ) {
        if (!PaymobService.verifyHmac(callbackData, receivedHmac)) {
          console.error("Invalid HMAC on course callback");
          return res.status(200).json({ success: false });
        }
      }

      const success =
        callbackData.success === true || callbackData.success === "true";
      if (!success) return res.status(200).json({ success: false });

      const merchantOrderId =
        callbackData.order?.merchant_order_id || callbackData.merchant_order_id;
      if (!merchantOrderId) return res.status(200).json({ success: false });

      // ── Guest enrollment — no CourseEnrollment record ─────────────────────
      if (merchantOrderId.startsWith("course-guest-")) {
        const parts = merchantOrderId.split("-");
        const courseId = parts[2];
        const billing =
          callbackData.order?.shipping_data || callbackData.billing_data || {};
        const email = billing.email;
        const name =
          (
            (billing.first_name || "") +
            " " +
            (billing.last_name || "")
          ).trim() || "العميل";
        if (courseId && email) {
          try {
            const guestCourse =
              await Course.findById(courseId).select("+playlistUrl");
            if (guestCourse) {
              const frontendUrl =
                process.env.FRONTEND_URL ||
                process.env.USER_FRONTEND_URL ||
                "http://localhost:5173";
              this._sendGuestCourseEmail(
                email,
                name,
                guestCourse,
                frontendUrl,
              ).catch(console.error);
            }
          } catch (e) {
            console.error("guest email:", e.message);
          }
        }
        return res.status(200).json({ success: true, guest: true });
      }

      // Find enrollment — try multiple strategies:
      // 1. exact merchantOrderId match (stored after our fix)
      // 2. paymobOrderId match
      // 3. merchantOrderId prefix match (merchantOrderId without _timestamp)
      const paymobOrderId = callbackData.order?.id?.toString();
      const merchantPrefix = merchantOrderId.split("_")[0]; // "course-{courseId}-{userId}-{ts}"

      const enrollment = await CourseEnrollment.findOne({
        $or: [
          { paymobMerchantOrderId: merchantOrderId },
          { paymobOrderId: paymobOrderId },
          { paymobMerchantOrderId: merchantPrefix },
        ],
      });
      console.log("Callback lookup:", {
        merchantOrderId,
        paymobOrderId,
        found: !!enrollment,
      });
      if (!enrollment || enrollment.paid)
        return res.status(200).json({ success: true });

      enrollment.paid = true;
      enrollment.paymobTransactionId = String(callbackData.id || "");
      enrollment.paymentDate = new Date();
      await enrollment.save();

      const course = await Course.findById(enrollment.courseId).select(
        "+playlistUrl",
      );
      if (course)
        this._sendCourseEmail(enrollment, course, enrollment.userId).catch(
          console.error,
        );

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("handleEnrollCallback:", err.message);
      return res.status(200).json({ success: false });
    }
  }

  async updateProgress(req, res) {
    try {
      const { courseId, progress, completedLesson } = req.body;
      const enrollment = await CourseEnrollment.findOne({
        userId: req.userId,
        courseId,
        paid: true,
      });
      if (!enrollment) return this.notFound(res, "الاشتراك غير موجود");
      enrollment.progress = Math.min(100, Math.max(0, Number(progress) || 0));
      if (
        completedLesson &&
        !enrollment.completedLessons.includes(completedLesson)
      )
        enrollment.completedLessons.push(completedLesson);
      await enrollment.save();
      return this.success(res, { progress: enrollment.progress });
    } catch (err) {
      return this.error(res, err.message);
    }
  }

  async completeCourse(req, res) {
    try {
      const { courseId } = req.body;
      const enrollment = await CourseEnrollment.findOne({
        userId: req.userId,
        courseId,
        paid: true,
      });
      if (!enrollment) return this.notFound(res, "الاشتراك غير موجود");
      if (enrollment.completedAt)
        return this.success(res, {}, "تم إتمام الكورس مسبقاً");
      enrollment.progress = 100;
      enrollment.completedAt = new Date();
      await enrollment.save();
      this._sendCertificate(enrollment, req.userId).catch(console.error);
      return this.success(
        res,
        { completed: true },
        "مبروك! ستصلك شهادتك على البريد الإلكتروني",
      );
    } catch (err) {
      return this.error(res, err.message);
    }
  }

  // ── Admin CRUD ──────────────────────────────────────────────────────────────
  async createCourse(req, res) {
    try {
      const body = req.body;
      let imageUrl = "";
      if (req.file && cloudinary)
        imageUrl = (await cloudinary.uploadImage(req.file.buffer, "courses"))
          .secure_url;

      const course = new Course({
        title: body.title || "",
        title_ar: body.title_ar || "",
        description: body.description || "",
        description_ar: body.description_ar || "",
        category: body.category || "",
        price: safeNumber(body.price) ?? 0,
        duration: body.duration || "10 ساعات",
        totalLessons: safeNumber(body.totalLessons) ?? 0,
        instructor: body.instructor || "د. أحمد الخطيب",
        image: imageUrl,
        features: parseArray(body.features),
        tags: parseArray(body.tags),
        timeline: parseArray(body.timeline),
        note: body.note || "",
        available: body.available !== "false" && body.available !== false,
        playlistUrl: (body.playlistUrl || "").trim(),
      });

      await course.save();
      return this.success(res, { course }, "تم إنشاء الكورس بنجاح");
    } catch (err) {
      console.error("createCourse:", err.message);
      return this.error(res, err.message);
    }
  }

  async updateCourse(req, res) {
    try {
      const body = req.body;
      const updates = {};

      [
        "title",
        "title_ar",
        "description",
        "description_ar",
        "category",
        "duration",
        "instructor",
        "note",
      ].forEach((k) => {
        if (body[k] !== undefined) updates[k] = body[k];
      });

      if (body.price !== undefined) updates.price = safeNumber(body.price) ?? 0;
      if (body.totalLessons !== undefined)
        updates.totalLessons = safeNumber(body.totalLessons) ?? 0;
      if (body.available !== undefined)
        updates.available =
          body.available !== "false" && body.available !== false;
      if (body.features !== undefined)
        updates.features = parseArray(body.features);
      if (body.tags !== undefined) updates.tags = parseArray(body.tags);
      if (body.timeline !== undefined)
        updates.timeline = parseArray(body.timeline);
      if (body.playlistUrl !== undefined)
        updates.playlistUrl = (body.playlistUrl || "").trim();

      if (req.file && cloudinary)
        updates.image = (
          await cloudinary.uploadImage(req.file.buffer, "courses")
        ).secure_url;

      const course = await Course.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true, runValidators: true },
      );
      if (!course) return this.notFound(res, "الكورس غير موجود");
      return this.success(res, { course }, "تم تحديث الكورس");
    } catch (err) {
      console.error("updateCourse:", err.message);
      return this.error(res, err.message);
    }
  }

  async deleteCourse(req, res) {
    try {
      await Course.findByIdAndDelete(req.params.id);
      return this.success(res, null, "تم حذف الكورس");
    } catch (err) {
      return this.error(res, err.message);
    }
  }

  // ── Private helpers ──────────────────────────────────────────────────────────
  async _sendCourseEmail(enrollment, course, userId) {
    if (!sendCourseAccessEmail) return;
    try {
      const user = await User.findById(userId);
      if (!user?.email) return;
      const playlistUrl =
        course.playlistUrl ||
        (await Course.findById(course._id).select("+playlistUrl"))
          ?.playlistUrl ||
        "";
      const frontendUrl =
        process.env.USER_FRONTEND_URL || "http://localhost:5173";
      await sendCourseAccessEmail({
        toEmail: user.email,
        userName: user.name,
        courseTitle: course.title_ar || course.title,
        courseUrl: `${frontendUrl}/learn/${course._id}`,
        playlistUrl,
      });
    } catch (err) {
      console.error("_sendCourseEmail:", err.message);
    }
  }

  async _sendGuestCourseEmail(email, name, course, frontendUrl) {
    if (!sendCourseAccessEmail) return;
    try {
      await sendCourseAccessEmail({
        toEmail: email,
        userName: name,
        courseTitle: course.title_ar || course.title,
        courseUrl: `${frontendUrl}/courses/${course._id}`,
        playlistUrl: course.playlistUrl || "",
      });
      console.log(`Guest course email sent to ${email}`);
    } catch (err) {
      console.error("_sendGuestCourseEmail:", err.message);
    }
  }

  // In course.controller.js - Fix the _sendCertificate method
  async _sendCertificate(enrollment, userId) {
    if (!sendCertificateEmail || !generateCertificate) return;
    try {
      const [user, course] = await Promise.all([
        User.findById(userId),
        Course.findById(enrollment.courseId),
      ]);

      if (!user?.email || !course) return;

      // IMPORTANT: Get the completion date properly
      let completionDate = enrollment.completedAt;
      if (!completionDate) {
        completionDate = new Date();
      }

      console.log("Sending certificate for:", {
        userName: user.name,
        courseTitle: course.title_ar || course.title,
        completionDate: completionDate,
      });

      const pdfBuffer = await generateCertificate({
        userName: user.name,
        courseTitle: course.title_ar || course.title,
        completionDate: completionDate, // Pass the Date object
        instructorName: course.instructor || "د. أحمد الخطيب",
      });

      await sendCertificateEmail({
        toEmail: user.email,
        userName: user.name,
        courseTitle: course.title_ar || course.title,
        completionDate: completionDate,
        certificatePdf: pdfBuffer,
      });

      console.log("Certificate email sent successfully");
    } catch (err) {
      console.error("_sendCertificate error:", err.message);
    }
  }
}

module.exports = new CourseController();
