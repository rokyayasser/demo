// routes/v1/courses.routes.js
"use strict";
const express = require("express");
const router = express.Router();
const c = require("../../controllers/course/course.controller");
const authAdmin = require("../../middlewares/auth/admin.auth");
const authUser = require("../../middlewares/auth/user.auth");
const { upload } = require("../../middlewares/upload/multer.config");
const CourseEnrollment = require("../../models/CourseEnrollment");
const Course = require("../../models/Course");

// ─── All static/named paths BEFORE /:id ──────────────────────────────────────
// Express matches routes top-down. If /:id came first, "enroll", "learn",
// "complete" etc. would all be treated as course IDs.

// ── Paymob webhook (no auth) ──────────────────────────────────────────────────
router.post("/enroll/callback", c.handleEnrollCallback);

// ── Guest enroll — NO auth required ──────────────────────────────────────────
// User provides name/email/phone. For free courses: email sent immediately.
// For paid courses: Paymob payment initiated, email sent after payment callback.
router.post("/enroll-guest", async (req, res) => {
  try {
    const { courseId, customerInfo } = req.body;
    if (!courseId)
      return res
        .status(400)
        .json({ success: false, message: "courseId مطلوب" });
    if (!customerInfo?.email)
      return res
        .status(400)
        .json({ success: false, message: "البريد الإلكتروني مطلوب" });
    if (!customerInfo?.name)
      return res.status(400).json({ success: false, message: "الاسم مطلوب" });
    if (!customerInfo?.phone)
      return res.status(400).json({ success: false, message: "الهاتف مطلوب" });

    const Course = require("../../models/Course");
    const course = await Course.findById(courseId).select("+playlistUrl");
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "الكورس غير موجود" });
    if (!course.available)
      return res
        .status(400)
        .json({ success: false, message: "الكورس غير متاح" });

    const { email, name, phone } = customerInfo;
    const frontendUrl =
      process.env.FRONTEND_URL ||
      process.env.USER_FRONTEND_URL ||
      "http://localhost:5173";

    // ── Free course — send access email immediately ───────────────────────
    if (!course.price || Number(course.price) === 0) {
      let sendCourseAccessEmail;
      try {
        ({ sendCourseAccessEmail } = require("../../services/email.service"));
      } catch (e) {}
      if (sendCourseAccessEmail) {
        await sendCourseAccessEmail({
          toEmail: email,
          userName: name,
          courseTitle: course.title_ar || course.title,
          courseUrl: `${frontendUrl}/courses/${course._id}`,
          playlistUrl: course.playlistUrl || "",
        }).catch(console.error);
      }
      return res.json({ success: true, data: { free: true, enrolled: true } });
    }

    // ── Paid course — initiate Paymob ─────────────────────────────────────
    let paymob;
    try {
      paymob = require("../../config/paymob");
    } catch (e) {}

    const merchantOrderId = `course-guest-${courseId}-${Date.now()}`;

    if (paymob && typeof paymob.initiatePayment === "function") {
      const nameParts = name.split(" ");
      const paymobData = await paymob.initiatePayment(
        merchantOrderId,
        Number(course.price),
        { name, email, phone: phone.replace(/\s+/g, "") },
        [],
      );
      const paymentUrl = paymobData?.paymentUrl || paymobData?.iframeUrl;

      // Store guest enrollment data in a temp record so callback can find it
      // We use a simple in-memory approach — for production use Redis or a GuestEnrollment model
      // Here we embed info in merchantOrderId: course-guest-{courseId}-{timestamp}
      // The callback reads courseId from merchantOrderId and email from Paymob billing_data

      return res.json({
        success: true,
        data: {
          enrolled: false,
          paid: false,
          paymentUrl,
          iframeUrl: paymobData?.iframeUrl,
        },
      });
    }

    return res.json({
      success: true,
      data: { enrolled: false, needsPayment: true, amount: course.price },
    });
  } catch (err) {
    console.error("enroll-guest:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ── User protected ────────────────────────────────────────────────────────────
router.post("/enroll", authUser, c.enrollCourse);
router.post("/complete", authUser, c.completeCourse);
router.put("/progress", authUser, c.updateProgress);
router.get("/user/enrolled", authUser, c.getEnrolledCourses);

// ── Course player — returns playlistUrl only for paid enrolled users ───────────
router.get("/learn/:id", authUser, async (req, res) => {
  try {
    const enrollment = await CourseEnrollment.findOne({
      userId: req.userId,
      courseId: req.params.id,
      paid: true,
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "يجب الاشتراك في الكورس أولاً للوصول للمحتوى",
      });
    }

    const course = await Course.findById(req.params.id).select("+playlistUrl");
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "الكورس غير موجود" });

    return res.json({
      success: true,
      data: {
        course: {
          _id: course._id,
          title: course.title_ar || course.title,
          description: course.description_ar || course.description,
          image: course.image,
          totalLessons: course.totalLessons,
          duration: course.duration,
          instructor: course.instructor,
          features: course.features,
          timeline: course.timeline,
          note: course.note,
          playlistUrl: course.playlistUrl, // ← only here, after enrollment check
        },
        enrollment: {
          progress: enrollment.progress,
          completedLessons: enrollment.completedLessons,
          enrolledAt: enrollment.enrolledAt,
          completedAt: enrollment.completedAt,
        },
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ── Admin: get single course WITH playlistUrl (for edit form pre-fill) ─────────
router.get("/admin/:id", authAdmin, c.getCourseByIdAdmin);

// ── Confirm payment (called by frontend after Paymob redirect) ───────────────
// Works even when webhook can't reach localhost in development
router.post("/confirm-payment", async (req, res) => {
  try {
    const { merchantOrderId, transactionId, courseId } = req.body;
    if (!merchantOrderId)
      return res
        .status(400)
        .json({ success: false, message: "merchantOrderId مطلوب" });

    const CourseEnrollment = require("../../models/CourseEnrollment");
    const Course = require("../../models/Course");

    // merchantOrderId format from Paymob redirect:
    //   "course-{courseId}-{userId}-{ts1}_{ts2}"
    // paymobMerchantOrderId stored on enrollment is the same full string
    const prefix = merchantOrderId.split("_")[0]; // "course-{cId}-{uId}-{ts1}"

    // Extract courseId and userId from the merchantOrderId
    // format: course-{24hexCourseId}-{24hexUserId}-{timestamp}_{paymobTs}
    const courseMatch = merchantOrderId.match(
      /course-([a-f0-9]{24})-([a-f0-9]{24})/i,
    );
    const cIdFromMerchant = courseMatch ? courseMatch[1] : null;
    const uIdFromMerchant = courseMatch ? courseMatch[2] : null;

    let enrollment = await CourseEnrollment.findOne({
      $or: [
        { paymobMerchantOrderId: merchantOrderId }, // exact match (new format)
        { paymobMerchantOrderId: prefix }, // prefix match (legacy)
      ].filter(Boolean),
    });

    // Fallback: find by courseId + userId extracted from merchantOrderId
    if (!enrollment && cIdFromMerchant && uIdFromMerchant) {
      enrollment = await CourseEnrollment.findOne({
        courseId: cIdFromMerchant,
        userId: uIdFromMerchant,
        paid: false,
      }).sort({ createdAt: -1 });
      if (enrollment)
        console.log("confirm-payment: found via courseId+userId fallback");
    }

    // Last resort: by courseId from query param
    if (!enrollment && courseId) {
      enrollment = await CourseEnrollment.findOne({
        courseId,
        paid: false,
      }).sort({ createdAt: -1 });
      if (enrollment)
        console.log("confirm-payment: found via courseId last-resort");
    }

    if (!enrollment) {
      console.error(
        "confirm-payment: enrollment not found for",
        merchantOrderId,
      );
      return res
        .status(404)
        .json({ success: false, message: "الاشتراك غير موجود" });
    }

    // Already paid — idempotent, return success WITHOUT resending email
    if (enrollment.paid) {
      console.log("confirm-payment: already paid", enrollment._id);
      return res.json({
        success: true,
        message: "مدفوع بالفعل",
        alreadyPaid: true,
      });
    }

    // Mark as paid atomically — use findByIdAndUpdate to prevent race condition
    const updated = await CourseEnrollment.findOneAndUpdate(
      { _id: enrollment._id, paid: false }, // only update if still unpaid
      {
        $set: {
          paid: true,
          paymentDate: new Date(),
          paymobTransactionId: transactionId || "",
        },
      },
      { new: true },
    );

    if (!updated) {
      // Another request already marked it paid
      console.log(
        "confirm-payment: race condition — already paid by parallel request",
      );
      return res.json({
        success: true,
        message: "مدفوع بالفعل",
        alreadyPaid: true,
      });
    }

    console.log("✅ confirm-payment: enrollment marked paid", updated._id);

    // Send course access email ONCE
    let sendCourseAccessEmail;
    try {
      ({ sendCourseAccessEmail } = require("../../services/email.service"));
    } catch (e) {
      console.warn("Email service not available:", e.message);
    }

    const course = await Course.findById(enrollment.courseId).select(
      "+playlistUrl",
    );
    const User = require("../../models/User");
    const user = await User.findById(enrollment.userId)
      .select("name email")
      .catch(() => null);

    if (course && sendCourseAccessEmail) {
      const frontendUrl =
        process.env.FRONTEND_URL ||
        process.env.USER_FRONTEND_URL ||
        "http://localhost:5173";
      const emailTo = user?.email || enrollment.email;
      const emailName = user?.name || enrollment.name || "العميل";

      if (emailTo) {
        try {
          await sendCourseAccessEmail({
            toEmail: emailTo,
            userName: emailName,
            courseTitle: course.title_ar || course.title,
            courseUrl: `${frontendUrl}/courses/${course._id}`,
            playlistUrl: course.playlistUrl || "",
          });
          console.log("✅ Course access email sent to", emailTo);
        } catch (emailErr) {
          console.error("❌ Email failed:", emailErr.message);
          // Don't fail the whole request if email fails
        }
      } else {
        console.warn("No email address found for enrollment", enrollment._id);
      }
    }

    return res.json({
      success: true,
      message: "تم تأكيد الدفع وتفعيل الاشتراك",
    });
  } catch (err) {
    console.error("confirm-payment error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ── Public ────────────────────────────────────────────────────────────────────
router.get("/", c.getAllCourses);
router.get("/:id", c.getCourseById); // public — does NOT include playlistUrl

// ── Admin CRUD ────────────────────────────────────────────────────────────────
router.post("/", authAdmin, upload.single("image"), c.createCourse);
router.put("/:id", authAdmin, upload.single("image"), c.updateCourse);
router.delete("/:id", authAdmin, c.deleteCourse);

module.exports = router;
