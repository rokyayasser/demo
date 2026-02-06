const express = require("express");
const authUser = require("../middlewares/authUser.js");
const {
  bookAppointment,
  getUserAppointments,
  cancelAppointment,
  payAppointment,
  updateAppointmentStatus,
  checkSlotAvailability,
  getAllBookedSlots,
  getAvailableSlotsForDate,
} = require("../controllers/appointmentController.js");

// Import the NEW FormData parser
const parseFormData = require("../middlewares/formDataParser.js");

const router = express.Router();

// IMPORTANT: These routes use JSON, so add express.json()
router.get("/user", express.json(), authUser, getUserAppointments);
router.post("/cancel", express.json(), authUser, cancelAppointment);
router.post("/pay", express.json(), authUser, payAppointment);
router.post("/update-status", express.json(), updateAppointmentStatus);

// Book appointment - uses FormData, NO express.json()
router.post(
  "/",
  authUser, // This should extract userId from token
  (req, res, next) => {
    console.log("🔄 Starting appointment booking route");
    console.log("Content-Type:", req.headers["content-type"]);
    next();
  },
  parseFormData, // This will parse FormData and populate req.body/req.files
  (req, res, next) => {
    console.log("✅ After FormData parser");
    console.log("Body keys:", Object.keys(req.body || {}));
    console.log("File keys:", Object.keys(req.files || {}));
    next();
  },
  bookAppointment
);

// GET routes (no body parsing needed)
router.get("/booked-slots", getAllBookedSlots);
router.get("/check-slot", checkSlotAvailability);
router.get("/available-slots/:date", getAvailableSlotsForDate);

module.exports = router;
