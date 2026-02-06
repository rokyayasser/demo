// enrollmentController.js - CLEAN VERSION (No Pending Status)

const mongoose = require("mongoose");
const enrollmentModel = require("../models/enrollmentModel.js");
const courseModel = require("../models/courseModel.js");
const paymentModel = require("../models/coursePaymentModel.js");
const userModel = require("../models/userModel.js");
const { initiatePayment } = require("../src/config/paymob.js");

// ========================================
// 1. INITIATE PAYMENT (Start payment process)
// ========================================
const initiateCoursePayment = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.userId;

    console.log(
      `=== INITIATING PAYMENT: Course ${courseId}, User ${userId} ===`
    );

    // Check if already enrolled
    const existingEnrollment = await enrollmentModel.findOne({
      userId,
      courseId,
      status: "completed",
    });

    if (existingEnrollment) {
      return res.json({
        success: false,
        message: "أنت مسجل بالفعل في هذه الدورة",
      });
    }

    // Get course
    const course = await courseModel.findById(courseId);
    if (!course || !course.isPublished) {
      return res.json({
        success: false,
        message: "الدورة غير متاحة",
      });
    }

    // Get user
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({
        success: false,
        message: "المستخدم غير موجود",
      });
    }

    const amount = course.discountPrice || course.price;

    // Create payment record
    const payment = new paymentModel({
      userId,
      courseId,
      amount,
      status: "initiated", // Now this is allowed
      paymentMethod: "paymob",
      paymentInitiatedAt: new Date(),
    });
    await payment.save();

    console.log("💳 Payment record created:", payment._id);

    // Initiate Paymob payment
    const userInfo = {
      name: user.name || "عميل",
      email: user.email || "customer@example.com",
      phone: user.phone || "01000000000",
    };

    const paymentData = await initiatePayment(
      payment._id.toString(),
      amount,
      userInfo
    );

    // Update payment with Paymob info
    payment.paymobOrderId = paymentData.orderId;
    payment.paymobMerchantOrderId = paymentData.merchantOrderId;
    payment.status = "pending"; // Change to pending after Paymob response
    await payment.save();

    console.log("✅ Payment initiated successfully");

    res.json({
      success: true,
      message: "تم إنشاء رابط الدفع بنجاح",
      paymentUrl: paymentData.iframeUrl,
      paymentId: payment._id,
      courseTitle: course.title_ar,
      amount: amount,
    });
  } catch (error) {
    console.error("❌ Error initiating payment:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// 2. PAYMENT CALLBACK (Create enrollment only on success)
// ========================================
// enrollmentController.js - FIX THE PAYMENT CALLBACK
const handleCoursePaymentCallback = async (req, res) => {
  try {
    console.log("=== PAYMENT CALLBACK RECEIVED ===");
    console.log("Body:", JSON.stringify(req.body, null, 2));

    const callbackData = req.body.obj || req.body || req.query;

    if (!callbackData || Object.keys(callbackData).length === 0) {
      console.error("❌ No callback data");
      return res.json({ success: true, message: "No data" });
    }

    // Extract merchant order ID
    const merchantOrderId =
      callbackData.order?.merchant_order_id ||
      callbackData.merchant_order_id ||
      callbackData.obj?.order?.merchant_order_id;

    if (!merchantOrderId) {
      console.error("❌ No merchant_order_id");
      console.log("Available callback data:", Object.keys(callbackData));
      return res.json({ success: true, message: "No merchant ID" });
    }

    // Extract payment ID from merchant order ID (format: paymentId_timestamp)
    const paymentId = merchantOrderId.split("_")[0];
    console.log("Payment ID extracted:", paymentId);
    console.log("Full merchant order ID:", merchantOrderId);

    // Determine success
    const success =
      callbackData.success === true ||
      callbackData.success === "true" ||
      callbackData.is_successful === true ||
      callbackData.obj?.success === true ||
      callbackData.txn_response_code === "APPROVED" ||
      callbackData.obj?.txn_response_code === "APPROVED";

    console.log("Payment Success Status:", success);
    console.log("Transaction Response:", callbackData.txn_response_code);

    // Find payment by payment ID
    let payment = null;
    if (mongoose.Types.ObjectId.isValid(paymentId)) {
      payment = await paymentModel.findById(paymentId);
      console.log("Payment found by ID:", payment ? payment._id : "Not found");
    }

    // If not found by ID, try to find by paymob order ID
    if (!payment && callbackData.order?.id) {
      payment = await paymentModel.findOne({
        paymobOrderId: callbackData.order.id.toString(),
      });
      console.log(
        "Payment found by paymobOrderId:",
        payment ? payment._id : "Not found"
      );
    }

    if (!payment) {
      console.error("❌ Payment not found in database");
      console.log("Searched paymentId:", paymentId);
      console.log("Searched paymobOrderId:", callbackData.order?.id);
      return res.json({ success: true, message: "Payment not found" });
    }

    console.log("✅ Payment found:", payment._id);
    console.log("Payment status before:", payment.status);

    if (success) {
      console.log("💰 PAYMENT SUCCESSFUL - Creating enrollment");

      // Check if enrollment already exists
      let enrollment = await enrollmentModel.findOne({
        userId: payment.userId,
        courseId: payment.courseId,
        status: "completed",
      });

      if (enrollment) {
        console.log("ℹ️ Enrollment already exists");
        return res.json({
          success: true,
          message: "Already enrolled",
          paymentStatus: "completed",
          enrollmentId: enrollment._id,
        });
      }

      // Update payment first
      payment.status = "completed";
      payment.paymobTransactionId =
        callbackData.id || callbackData.transaction_id;
      payment.paymentDate = new Date();
      payment.metadata = callbackData;
      await payment.save();
      console.log("✅ Payment marked as completed");

      // CREATE NEW ENROLLMENT
      enrollment = new enrollmentModel({
        userId: payment.userId,
        courseId: payment.courseId,
        paymentId: payment._id,
        amountPaid: payment.amount,
        paymentMethod: "paymob",
        status: "completed",
        enrolledAt: new Date(),
        totalProgress: 0,
        completedLessons: [],
      });

      await enrollment.save();
      console.log("✅ NEW ENROLLMENT CREATED:", enrollment._id);

      // Update course student count
      const course = await courseModel.findById(payment.courseId);
      if (course) {
        course.studentsEnrolled = (course.studentsEnrolled || 0) + 1;
        await course.save();
        console.log("✅ Student count updated:", course.studentsEnrolled);
      }

      // Update user courses
      const user = await userModel.findById(payment.userId);
      if (user) {
        const courseExists = user.courses?.some(
          (c) =>
            c.courseId && c.courseId.toString() === payment.courseId.toString()
        );

        if (!courseExists) {
          user.courses = user.courses || [];
          user.courses.push({
            courseId: payment.courseId,
            enrolledAt: new Date(),
            progress: 0,
          });
          await user.save();
          console.log("✅ Course added to user profile");
        }
      }

      console.log("🎉 ENROLLMENT COMPLETED SUCCESSFULLY!");

      return res.json({
        success: true,
        message: "Payment successful and enrollment created",
        paymentStatus: "completed",
        enrollmentId: enrollment._id,
        courseId: payment.courseId,
        userId: payment.userId,
      });
    } else {
      // PAYMENT FAILED
      console.log("❌ PAYMENT FAILED");

      payment.status = "failed";
      payment.metadata = callbackData;
      await payment.save();

      console.log("✅ Payment marked as failed");

      return res.json({
        success: true,
        message: "Payment failed",
        paymentStatus: "failed",
      });
    }
  } catch (error) {
    console.error("❌ Callback Error:", error);
    console.error("Stack:", error.stack);

    // Always return success to Paymob
    return res.json({
      success: true,
      message: "Callback error",
      error: error.message,
    });
  }
};
// ========================================
// 3. CHECK ENROLLMENT STATUS (Simple check)
// ========================================
const checkEnrollmentStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.userId;

    console.log(
      `=== CHECKING ENROLLMENT: User ${userId}, Course ${courseId} ===`
    );

    // Simple check - only look for completed enrollments
    const enrollment = await enrollmentModel.findOne({
      userId,
      courseId,
      status: "completed",
    });

    // Also check user model
    const user = await userModel.findById(userId);
    const hasCourseInUserModel = user?.courses?.some(
      (course) => course.courseId && course.courseId.toString() === courseId
    );

    const isEnrolled = !!enrollment || hasCourseInUserModel;

    console.log("Enrollment status:", {
      hasEnrollment: !!enrollment,
      inUserModel: hasCourseInUserModel,
      isEnrolled,
    });

    res.json({
      success: true,
      isEnrolled,
      enrollment: enrollment || null,
    });
  } catch (error) {
    console.error("❌ Error checking enrollment:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// 4. CHECK PAYMENT STATUS (For polling)
// ========================================
const checkCoursePaymentStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.userId;

    console.log(`=== CHECKING PAYMENT: User ${userId}, Course ${courseId} ===`);

    // Check enrollment first
    const enrollment = await enrollmentModel.findOne({
      userId,
      courseId,
      status: "completed",
    });

    if (enrollment) {
      return res.json({
        success: true,
        isPaid: true,
        isEnrolled: true,
        message: "Payment successful and enrolled",
      });
    }

    // Check latest payment
    const latestPayment = await paymentModel
      .findOne({ userId, courseId })
      .sort({ createdAt: -1 });

    if (!latestPayment) {
      return res.json({
        success: true,
        isPaid: false,
        isEnrolled: false,
        message: "No payment found",
      });
    }

    res.json({
      success: true,
      isPaid: latestPayment.status === "completed",
      isEnrolled: false,
      paymentStatus: latestPayment.status,
      message: `Payment status: ${latestPayment.status}`,
    });
  } catch (error) {
    console.error("❌ Error checking payment:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// 5. GET PAYMENT HISTORY
// ========================================
const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const payments = await paymentModel
      .find({ userId })
      .populate("courseId", "title_ar thumbnail")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await paymentModel.countDocuments({ userId });

    res.json({
      success: true,
      payments,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error("❌ Error fetching payment history:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// 6. RETRY FAILED PAYMENT
// ========================================
const retryPayment = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.userId;

    console.log(`=== RETRYING PAYMENT: Course ${courseId}, User ${userId} ===`);

    // Check if already enrolled
    const enrollment = await enrollmentModel.findOne({
      userId,
      courseId,
      status: "completed",
    });

    if (enrollment) {
      return res.json({
        success: false,
        message: "أنت مسجل بالفعل في هذه الدورة",
      });
    }

    // Delete any old failed/initiated payments (cleanup)
    await paymentModel.deleteMany({
      userId,
      courseId,
      status: { $in: ["failed", "initiated"] },
      createdAt: { $lt: new Date(Date.now() - 60 * 60 * 1000) }, // Older than 1 hour
    });

    // Create new payment (same as initiate)
    return initiateCoursePayment(req, res);
  } catch (error) {
    console.error("❌ Error retrying payment:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  initiateCoursePayment,
  handleCoursePaymentCallback,
  checkEnrollmentStatus,
  checkCoursePaymentStatus,
  getPaymentHistory,
  retryPayment,
};
