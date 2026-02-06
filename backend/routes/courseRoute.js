// courseRoute.js - CLEAN VERSION

const express = require("express");
const authUser = require("../middlewares/authUser.js");
const authAdmin = require("../middlewares/authAdmin.js");

// Course controller
const {
  createCourse,
  addLesson,
  getAllCourses,
  getCourseDetails,
  getCourseLessons,
  updateLessonProgress,
  addLessonNote,
  rateCourse,
  getUserCourses,
  updateCourse,
  deleteCourse,
} = require("../controllers/courseController.js");

// Enrollment controller (clean - no pending)
const {
  initiateCoursePayment,
  handleCoursePaymentCallback,
  checkEnrollmentStatus,
  checkCoursePaymentStatus,
  getPaymentHistory,
  retryPayment,
} = require("../controllers/enrollmentController.js");

const { upload, checkUploadErrors } = require("../middlewares/multer.js");

const router = express.Router();

// ========================================
// PUBLIC ROUTES (No Auth)
// ========================================

// Get all courses
router.get("/", getAllCourses);

// Get course details
router.get("/:courseId", getCourseDetails);

// Payment callback from Paymob (NO AUTH - called by Paymob)
router.post("/payment/callback", handleCoursePaymentCallback);

// ========================================
// USER ROUTES (Require Auth)
// ========================================

// Get user's enrolled courses
router.get("/user/my-courses", authUser, getUserCourses);

// Check if user is enrolled in course
router.get("/enrollment/check/:courseId", authUser, checkEnrollmentStatus);

// Initiate payment for course
router.post("/payment/initiate", authUser, initiateCoursePayment);

// Retry failed payment
router.post("/payment/retry", authUser, retryPayment);

// Check payment status (for polling)
router.get("/payment/status/:courseId", authUser, checkCoursePaymentStatus);

// Get user's payment history
router.get("/payments/history", authUser, getPaymentHistory);

// Get course content (lessons - for enrolled users only)
router.get("/content/:courseId", authUser, getCourseLessons);

// Update lesson progress
router.post("/progress/:courseId/:lessonId", authUser, updateLessonProgress);

// Add note to lesson
router.post("/note/:courseId/:lessonId", authUser, addLessonNote);

// Rate course
router.post("/rate/:courseId", authUser, rateCourse);

// ========================================
// ADMIN ROUTES (Require Admin Auth)
// ========================================

// Create new course
router.post(
  "/admin/create",
  authAdmin,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "promotionalVideo", maxCount: 1 },
  ]),
  checkUploadErrors,
  createCourse
);

// Add lesson to course
router.post(
  "/admin/:courseId/lesson",
  authAdmin,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  checkUploadErrors,
  addLesson
);

// Update course
router.put(
  "/admin/:courseId",
  authAdmin,
  upload.fields([{ name: "thumbnail", maxCount: 1 }]),
  checkUploadErrors,
  updateCourse
);

// Delete course
router.delete("/admin/:courseId", authAdmin, deleteCourse);

module.exports = router;
