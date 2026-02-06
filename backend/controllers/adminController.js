const validator = require("validator");
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary").v2;
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const medicalServiceModel = require("../models/medicalServiceModel.js");
const appointmentModel = require("../models/appointmentModel.js");
const userModel = require("../models/userModel.js");
const {
  sendAppointmentConfirmation,
} = require("../src/services/emailService.js");

// Add Medical Service
// In adminController.js - update addMedicalService function
const addMedicalService = async (req, res) => {
  try {
    const {
      title,
      title_ar,
      category,
      category_ar,
      description,
      features,
      fees,
      duration,
    } = req.body;

    const imageFile = req.file;

    console.log("=== ADDING MEDICAL SERVICE ===");
    console.log("Title:", title);
    console.log("Category:", category);
    console.log("Fees:", fees);

    if (
      !title ||
      !title_ar ||
      !category ||
      !category_ar ||
      !description ||
      !features ||
      !fees
    ) {
      return res.json({ success: false, message: "Missing required details" });
    }

    if (!imageFile) {
      return res.json({ success: false, message: "Please upload an image" });
    }

    // Upload image to Cloudinary from buffer
    const imageUpload = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "medical-services",
          resource_type: "image",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      stream.end(imageFile.buffer);
    });
    const imageUrl = imageUpload.secure_url;

    // Parse features if it's a string
    const parsedFeatures =
      typeof features === "string" ? JSON.parse(features) : features;

    const serviceData = {
      title,
      title_ar,
      category,
      category_ar,
      description,
      image: imageUrl,
      features: parsedFeatures,
      fees: Number(fees),
      duration: duration || "30 minutes",
      available: true,
      slots_booked: {},
      date: Date.now(),
    };

    const newService = new medicalServiceModel(serviceData);
    await newService.save();

    console.log("✅ Medical service added successfully:", newService._id);

    res.json({
      success: true,
      message: "تم إضافة الخدمة الطبية بنجاح",
      service: newService,
    });
  } catch (error) {
    console.error("❌ Error adding medical service:", error);
    res.json({
      success: false,
      message: error.message,
      error: error.toString(),
    });
  }
};
// Get all medical services
const allMedicalServices = async (req, res) => {
  try {
    const services = await medicalServiceModel.find({}).sort({ createdAt: -1 });

    console.log(`✅ Retrieved ${services.length} medical services`);

    res.json({
      success: true,
      services,
      count: services.length,
    });
  } catch (error) {
    console.error("❌ Error fetching medical services:", error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Get medical service by ID
const getMedicalServiceById = async (req, res) => {
  try {
    const { serviceId } = req.params;

    if (!serviceId) {
      return res.json({
        success: false,
        message: "Service ID is required",
      });
    }

    const service = await medicalServiceModel.findById(serviceId);

    if (!service) {
      return res.json({
        success: false,
        message: "Service not found",
      });
    }

    res.json({
      success: true,
      service,
    });
  } catch (error) {
    console.error("❌ Error fetching medical service:", error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Edit medical service
// In adminController.js - update editMedicalService function
const editMedicalService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const {
      title,
      title_ar,
      category,
      category_ar,
      description,
      description_ar,
      features,
      fees,
      duration,
      available,
    } = req.body;

    const imageFile = req.file;

    console.log("=== EDITING MEDICAL SERVICE ===");
    console.log("Service ID:", serviceId);
    console.log("Request body:", req.body);

    // Check if service exists
    const existingService = await medicalServiceModel.findById(serviceId);
    if (!existingService) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // Parse features if it's a string
    let parsedFeatures = existingService.features;
    if (features) {
      try {
        parsedFeatures =
          typeof features === "string" ? JSON.parse(features) : features;
      } catch (parseError) {
        console.error("Error parsing features:", parseError);
        parsedFeatures = [];
      }
    }

    const updateData = {
      title: title || existingService.title,
      title_ar: title_ar || existingService.title_ar,
      category: category || existingService.category,
      category_ar: category_ar || existingService.category_ar,
      description: description || existingService.description,
      description_ar: description_ar || existingService.description_ar,
      features: parsedFeatures,
      fees: fees ? Number(fees) : existingService.fees,
      duration: duration || existingService.duration,
      available:
        available !== undefined ? available : existingService.available,
      updatedAt: Date.now(),
    };

    // Upload new image if provided - USING BUFFER APPROACH
    if (imageFile) {
      try {
        // Delete old image from Cloudinary if it exists
        if (existingService.image) {
          const oldPublicId = existingService.image
            .split("/")
            .pop()
            .split(".")[0];
          await cloudinary.uploader.destroy(`medical-services/${oldPublicId}`);
          console.log("Old image deleted successfully");
        }
      } catch (cloudinaryError) {
        console.warn("⚠️ Could not delete old image:", cloudinaryError.message);
        // Continue with upload even if delete fails
      }

      // Upload new image using buffer (same as addMedicalService)
      const imageUpload = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "medical-services",
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        stream.end(imageFile.buffer);
      });

      updateData.image = imageUpload.secure_url;
      console.log("New image uploaded:", imageUpload.secure_url);
    }

    const updatedService = await medicalServiceModel.findByIdAndUpdate(
      serviceId,
      updateData,
      { new: true, runValidators: true }
    );

    console.log("✅ Medical service updated successfully:", serviceId);

    res.json({
      success: true,
      message: "تم تحديث الخدمة الطبية بنجاح",
      service: updatedService,
    });
  } catch (error) {
    console.error("❌ Error editing medical service:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      error: error.toString(),
    });
  }
};
// Get medical services by category
const getMedicalServicesByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    if (!category) {
      return res.json({
        success: false,
        message: "Category parameter is required",
      });
    }

    const services = await medicalServiceModel
      .find({
        category: { $regex: new RegExp(category, "i") },
      })
      .sort({ createdAt: -1 });

    console.log(
      `✅ Retrieved ${services.length} services for category: ${category}`
    );

    res.json({
      success: true,
      services,
      count: services.length,
    });
  } catch (error) {
    console.error("❌ Error fetching services by category:", error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Change service availability
const changeServiceAvailability = async (req, res) => {
  try {
    const { serviceId } = req.body;

    if (!serviceId) {
      return res.json({
        success: false,
        message: "Service ID is required",
      });
    }

    const serviceData = await medicalServiceModel.findById(serviceId);

    if (!serviceData) {
      return res.json({
        success: false,
        message: "Service not found",
      });
    }

    const newAvailability = !serviceData.available;

    await medicalServiceModel.findByIdAndUpdate(serviceId, {
      available: newAvailability,
    });

    console.log(
      `✅ Service ${serviceId} availability changed to: ${newAvailability}`
    );

    res.json({
      success: true,
      message: `تم ${newAvailability ? "تفعيل" : "تعطيل"} الخدمة بنجاح`,
      available: newAvailability,
    });
  } catch (error) {
    console.error("❌ Error changing service availability:", error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Delete medical service
const deleteMedicalService = async (req, res) => {
  try {
    const { serviceId } = req.params;

    if (!serviceId) {
      return res.json({
        success: false,
        message: "Service ID is required",
      });
    }

    const service = await medicalServiceModel.findById(serviceId);

    if (!service) {
      return res.json({
        success: false,
        message: "Service not found",
      });
    }

    // Optional: Delete image from Cloudinary
    try {
      const publicId = service.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`medical-services/${publicId}`);
      console.log(
        `🗑️  Deleted image from Cloudinary for service: ${serviceId}`
      );
    } catch (cloudinaryError) {
      console.warn(
        "⚠️  Could not delete image from Cloudinary:",
        cloudinaryError.message
      );
    }

    await medicalServiceModel.findByIdAndDelete(serviceId);

    console.log(`✅ Deleted medical service: ${serviceId}`);

    res.json({
      success: true,
      message: "تم حذف الخدمة الطبية بنجاح",
    });
  } catch (error) {
    console.error("❌ Error deleting medical service:", error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Get all appointments for admin
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await appointmentModel
      .find({})
      .populate("serviceId")
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 });

    console.log(`✅ Retrieved ${appointments.length} appointments`);

    // Transform data for frontend
    const transformedAppointments = appointments.map((appt) => ({
      _id: appt._id,
      name: appt.userId?.name || appt.name,
      email: appt.userId?.email || appt.email,
      phone: appt.userId?.phone || appt.phone,
      date: appt.date,
      time: appt.time,
      status: appt.status,
      paid: appt.paid,
      amount: appt.amount,
      message: appt.message,
      serviceId: appt.serviceId,
      createdAt: appt.createdAt,
      updatedAt: appt.updatedAt,
      isBlockedSlot: appt.isBlockedSlot || false,
    }));

    res.json({
      success: true,
      appointments: transformedAppointments,
      count: appointments.length,
    });
  } catch (error) {
    console.error("❌ Error fetching appointments:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update appointment status with email confirmation
const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId, status, sendEmail = false } = req.body;
    const adminEmail = req.adminEmail;

    console.log("=== ADMIN UPDATING APPOINTMENT ===");
    console.log("Admin Email:", adminEmail);
    console.log("Appointment ID:", appointmentId);
    console.log("New status:", status);
    console.log("Send email:", sendEmail);

    // Validate input
    if (!appointmentId || !status) {
      return res.json({
        success: false,
        message: "Appointment ID and status are required",
      });
    }

    // Valid statuses
    const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.json({
        success: false,
        message: "Invalid status value",
      });
    }

    // Find appointment with populated service
    const appointment = await appointmentModel
      .findById(appointmentId)
      .populate("serviceId")
      .populate("userId", "name email phone");

    if (!appointment) {
      return res.json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Get the email from appointment form data (priority)
    const patientEmail = appointment.email;
    const patientName = appointment.name || "العميل";
    const patientPhone = appointment.phone || "";

    console.log("Patient email from form:", patientEmail);
    console.log("Patient name from form:", patientName);

    if (!patientEmail) {
      console.warn("⚠️ No email found in appointment record");
    }

    // Update appointment status
    appointment.status = status;

    // Mark as admin confirmed
    if (status === "confirmed") {
      appointment.adminConfirmed = true;
      appointment.adminEmail = adminEmail;
      appointment.adminConfirmedAt = new Date();
      appointment.updatedBy = `admin:${adminEmail}`;
    } else {
      appointment.updatedBy = `admin:${adminEmail}`;
    }

    // Save the appointment
    await appointment.save();

    console.log(`✅ Appointment status updated to: ${status}`);

    let emailSent = false;
    let emailResult = null;

    // Send confirmation email if requested and status is confirmed
    if (sendEmail && status === "confirmed" && patientEmail) {
      console.log("Attempting to send confirmation email...");
      console.log("Patient email:", patientEmail);
      console.log("Patient name:", patientName);

      // Create user object for email service using FORM DATA
      const userForEmail = {
        _id: appointment.userId?._id || appointment.userId,
        name: patientName,
        email: patientEmail,
        phone: patientPhone,
      };

      emailResult = await sendAppointmentConfirmation(
        appointment,
        userForEmail,
        appointment.serviceId,
        true,
        adminEmail || "إدارة العيادة"
      );

      emailSent = emailResult.success;

      if (emailSent) {
        console.log(
          "✅ Confirmation email sent successfully to:",
          patientEmail
        );

        // Update email tracking in appointment
        appointment.confirmationEmailSent = true;
        appointment.emailSentAt = new Date();
        await appointment.save();
      } else {
        console.log("❌ Failed to send confirmation email:", emailResult.error);

        // Record email error
        appointment.emailError = emailResult.error;
        await appointment.save();
      }
    } else if (sendEmail && !patientEmail) {
      console.warn("⚠️ Cannot send email: No email address in appointment");
    }

    // Get updated appointment with populated fields
    const updatedAppointment = await appointmentModel
      .findById(appointmentId)
      .populate("serviceId")
      .populate("userId", "name email phone");

    res.json({
      success: true,
      message: getStatusMessageAr(status),
      appointment: updatedAppointment,
      emailSent: emailSent,
      emailError: emailResult?.error,
      statusText: getStatusTextAr(status),
    });
  } catch (error) {
    console.error("❌ Error updating appointment:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      error: error.toString(),
    });
  }
};

// Keep the original blockTimeSlot for single slot blocking
const blockSingleTimeSlot = async (req, res) => {
  try {
    const { date, time, reason } = req.body;
    const adminEmail = req.adminEmail;

    console.log("=== BLOCKING SINGLE TIME SLOT ===");
    console.log("Admin:", adminEmail);
    console.log("Date:", date);
    console.log("Time:", time);
    console.log("Reason:", reason);

    if (!date || !time) {
      return res.json({
        success: false,
        message: "Date and time are required",
      });
    }

    // Check if slot is already booked
    const existingAppointment = await appointmentModel.findOne({
      date: date,
      time: time,
      status: { $nin: ["cancelled", "blocked"] },
    });

    if (existingAppointment) {
      return res.json({
        success: false,
        message: "Cannot block an already booked slot",
        appointment: existingAppointment,
      });
    }

    // Check if already blocked
    const alreadyBlocked = await appointmentModel.findOne({
      date: date,
      time: time,
      status: "blocked",
      isBlockedSlot: true,
    });

    if (alreadyBlocked) {
      return res.json({
        success: false,
        message: "This slot is already blocked",
      });
    }

    // Create a blocked appointment record with valid amount
    const blockedAppointment = new appointmentModel({
      userId: new mongoose.Types.ObjectId(), // Dummy user ID
      serviceId: new mongoose.Types.ObjectId(), // Dummy service ID
      name: "إدارة النظام",
      email: "system@khateebpharma.com",
      phone: "0000000000",
      date: date,
      time: time,
      category: "ممنوع",
      status: "blocked",
      amount: 1, // Minimum valid amount for appointment validation
      paid: true, // Mark as paid since it's an admin block
      notes: reason || "تم حظر هذا الموعد من قبل الإدارة",
      adminBlocked: true,
      blockedBy: adminEmail,
      blockedAt: new Date(),
      doctorName: "إدارة النظام",
      location: "عيادة الخطيب فارما",
      isBlockedSlot: true,
    });

    await blockedAppointment.save();

    console.log("✅ Time slot blocked successfully");

    res.json({
      success: true,
      message: "تم حظر الموعد بنجاح",
      blockedSlot: {
        date,
        time,
        reason,
        blockedBy: adminEmail,
      },
    });
  } catch (error) {
    console.error("❌ Error blocking time slot:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// New function for date range blocking
// Updated blockTimeSlotRange function with better Arabic time parsing
const blockTimeSlotRange = async (req, res) => {
  try {
    const { startDate, endDate, startTime, endTime, reason } = req.body;
    const adminEmail = req.adminEmail;

    console.log("=== BLOCKING TIME SLOT RANGE ===");
    console.log("Admin:", adminEmail);
    console.log("Start Date:", startDate);
    console.log("End Date:", endDate || "Same as start");
    console.log("Start Time:", startTime || "All day");
    console.log("End Time:", endTime || "All day");
    console.log("Reason:", reason);

    if (!startDate) {
      return res.json({
        success: false,
        message: "Start date is required",
      });
    }

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(startDate);

    // If no end date, use start date as end date
    if (!endDate) {
      end.setDate(start.getDate());
    }

    const blockedSlots = [];
    const errors = [];
    let totalSlotsGenerated = 0;
    let totalSlotsConsidered = 0;

    // Helper function to parse Arabic and English time strings
    const parseTimeString = (timeStr) => {
      if (!timeStr || timeStr === "") return null;

      console.log(`Parsing time string: "${timeStr}"`);

      // Check if it's Arabic numerals (١٢:٣٠ م) or English (12:30 م)
      let timePart, period;

      // Handle Arabic time strings like "١١:٠٠ ص" or "٠٣:٠٠ م"
      if (
        timeStr.includes("١") ||
        timeStr.includes("٢") ||
        timeStr.includes("٣") ||
        timeStr.includes("٤") ||
        timeStr.includes("٥") ||
        timeStr.includes("٦") ||
        timeStr.includes("٧") ||
        timeStr.includes("٨") ||
        timeStr.includes("٩") ||
        timeStr.includes("٠")
      ) {
        // Convert Arabic numerals to English
        const arabicToEnglish = {
          "٠": "0",
          "١": "1",
          "٢": "2",
          "٣": "3",
          "٤": "4",
          "٥": "5",
          "٦": "6",
          "٧": "7",
          "٨": "8",
          "٩": "9",
        };

        let convertedTime = "";
        for (let char of timeStr) {
          convertedTime += arabicToEnglish[char] || char;
        }
        timeStr = convertedTime;
        console.log(`Converted Arabic to English: "${timeStr}"`);
      }

      // Split by space to get time and period (ص/م)
      const parts = timeStr.split(" ");
      if (parts.length >= 2) {
        timePart = parts[0];
        period = parts[1]; // ص or م
      } else {
        // If no period specified, assume 24-hour format
        timePart = timeStr;
        period = "";
      }

      const [hoursStr, minutesStr] = timePart.split(":");
      let hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr || "0", 10);

      // Handle AM/PM (ص/م)
      if (period === "م" || period === "pm" || period === "PM") {
        if (hours < 12) hours += 12;
      } else if (period === "ص" || period === "am" || period === "AM") {
        if (hours === 12) hours = 0;
      }

      const totalMinutes = hours * 60 + minutes;
      console.log(
        `Parsed result: ${hours}:${minutes} (${totalMinutes} minutes)`
      );

      return totalMinutes;
    };

    // Loop through each day in the range
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const currentDate = d.toISOString().split("T")[0];

      console.log(`\n=== Processing date: ${currentDate} ===`);

      // Parse time boundaries if provided
      const startMinutes = startTime ? parseTimeString(startTime) : null;
      const endMinutes = endTime ? parseTimeString(endTime) : null;

      console.log(
        `Time range: ${startMinutes ? startMinutes + " min" : "All day"} to ${
          endMinutes ? endMinutes + " min" : "All day"
        }`
      );

      // Generate all time slots for this day (10 AM to 9 PM)
      for (let hour = 10; hour < 21; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const time = new Date();
          time.setHours(hour, minute, 0, 0);
          const formattedTime = time
            .toLocaleTimeString("ar-EG", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
            .replace("AM", "ص")
            .replace("PM", "م");

          totalSlotsGenerated++;

          // Check if time is within the selected range
          let shouldBlock = true;
          const slotMinutes = hour * 60 + minute;

          if (startMinutes !== null && endMinutes !== null) {
            shouldBlock =
              slotMinutes >= startMinutes && slotMinutes <= endMinutes;
          } else if (startMinutes !== null) {
            shouldBlock = slotMinutes >= startMinutes;
          } else if (endMinutes !== null) {
            shouldBlock = slotMinutes <= endMinutes;
          }

          console.log(
            `Slot ${formattedTime} (${slotMinutes} min): ${
              shouldBlock ? "Should block" : "Skipped"
            }`
          );

          if (shouldBlock) {
            totalSlotsConsidered++;

            // Check if slot is already booked
            const existingAppointment = await appointmentModel.findOne({
              date: currentDate,
              time: formattedTime,
              status: { $nin: ["cancelled", "blocked"] },
            });

            if (existingAppointment) {
              console.log(
                `❌ Slot already booked: ${currentDate} ${formattedTime}`
              );
              errors.push({
                date: currentDate,
                time: formattedTime,
                reason: "Already booked",
                appointment: existingAppointment._id,
              });
              continue;
            }

            // Check if already blocked
            const alreadyBlocked = await appointmentModel.findOne({
              date: currentDate,
              time: formattedTime,
              status: "blocked",
              isBlockedSlot: true,
            });

            if (alreadyBlocked) {
              console.log(
                `❌ Slot already blocked: ${currentDate} ${formattedTime}`
              );
              errors.push({
                date: currentDate,
                time: formattedTime,
                reason: "Already blocked",
              });
              continue;
            }

            try {
              // Create a blocked appointment record with valid amount
              const blockedAppointment = new appointmentModel({
                userId: new mongoose.Types.ObjectId(),
                serviceId: new mongoose.Types.ObjectId(),
                name: "إدارة النظام",
                email: "system@khateebpharma.com",
                phone: "0000000000",
                date: currentDate,
                time: formattedTime,
                category: "ممنوع",
                status: "blocked",
                amount: 1, // Minimum valid amount for appointment validation
                paid: true, // Mark as paid since it's an admin block
                notes: reason || "تم حظر هذا الموعد من قبل الإدارة",
                adminBlocked: true,
                blockedBy: adminEmail,
                blockedAt: new Date(),
                doctorName: "إدارة النظام",
                location: "عيادة الخطيب فارما",
                isBlockedSlot: true,
              });

              await blockedAppointment.save();
              console.log(`✅ Blocked: ${currentDate} ${formattedTime}`);
              blockedSlots.push({
                date: currentDate,
                time: formattedTime,
                _id: blockedAppointment._id,
              });
            } catch (slotError) {
              console.log(`❌ Error blocking slot: ${slotError.message}`);
              console.log(`❌ Error details:`, slotError.errors || slotError);
              errors.push({
                date: currentDate,
                time: formattedTime,
                reason: slotError.message,
                details: slotError.errors,
              });
            }
          }
        }
      }
    }

    console.log(`\n=== SUMMARY ===`);
    console.log(`Total slots generated: ${totalSlotsGenerated}`);
    console.log(`Total slots considered for blocking: ${totalSlotsConsidered}`);
    console.log(`✅ Successfully blocked ${blockedSlots.length} slots`);
    console.log(`❌ ${errors.length} slots failed`);

    if (blockedSlots.length === 0) {
      return res.json({
        success: false,
        message:
          "Failed to block any slots. Check if slots are already booked or blocked.",
        totalSlotsGenerated,
        totalSlotsConsidered,
        errors: errors.slice(0, 10),
      });
    }

    res.json({
      success: true,
      message: `تم حظر ${blockedSlots.length} موعد بنجاح`,
      blockedCount: blockedSlots.length,
      errorCount: errors.length,
      totalSlotsGenerated,
      totalSlotsConsidered,
      blockedSlots: blockedSlots.slice(0, 10), // Return first 10 for reference
      errors: errors.slice(0, 10), // Return first 10 errors
      summary: {
        startDate: startDate,
        endDate: endDate || startDate,
        startTime: startTime || "All day",
        endTime: endTime || "All day",
      },
    });
  } catch (error) {
    console.error("❌ Error blocking time slot range:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Unblock time slot
const unblockTimeSlot = async (req, res) => {
  try {
    const { slotId } = req.params;
    const adminEmail = req.adminEmail;

    console.log("=== UNBLOCKING TIME SLOT ===");
    console.log("Slot ID:", slotId);
    console.log("Admin:", adminEmail);

    // Find and delete blocked appointment
    const blockedAppointment = await appointmentModel.findOne({
      _id: slotId,
      isBlockedSlot: true,
      status: "blocked",
    });

    if (!blockedAppointment) {
      return res.json({
        success: false,
        message: "Blocked slot not found",
      });
    }

    await appointmentModel.findByIdAndDelete(slotId);

    console.log("✅ Time slot unblocked successfully");

    res.json({
      success: true,
      message: "تم إلغاء حظر الموعد بنجاح",
      unblockedSlot: {
        date: blockedAppointment.date,
        time: blockedAppointment.time,
      },
    });
  } catch (error) {
    console.error("❌ Error unblocking time slot:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all blocked slots
const getBlockedSlots = async (req, res) => {
  try {
    const { date } = req.query;

    console.log("=== GETTING BLOCKED SLOTS ===");

    const query = {
      isBlockedSlot: true,
      status: "blocked",
    };

    if (date) {
      query.date = date;
    }

    const blockedSlots = await appointmentModel
      .find(query)
      .select("date time notes blockedBy blockedAt")
      .sort({ date: 1, time: 1 })
      .lean();

    console.log(`✅ Found ${blockedSlots.length} blocked slots`);

    // Group by date for easier frontend consumption
    const blockedByDate = {};
    blockedSlots.forEach((slot) => {
      if (!blockedByDate[slot.date]) {
        blockedByDate[slot.date] = [];
      }
      blockedByDate[slot.date].push({
        _id: slot._id,
        time: slot.time,
        notes: slot.notes,
        blockedBy: slot.blockedBy,
        blockedAt: slot.blockedAt,
      });
    });

    res.json({
      success: true,
      blockedSlots,
      blockedByDate,
      total: blockedSlots.length,
    });
  } catch (error) {
    console.error("❌ Error getting blocked slots:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Admin login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("=== ADMIN LOGIN ATTEMPT ===");
    console.log("Email:", email);

    if (!email || !password) {
      return res.json({
        success: false,
        message: "Email and password are required",
      });
    }

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(
        {
          email,
          isAdmin: true,
          userId: "admin-" + Date.now(),
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      console.log("✅ Admin login successful for:", email);

      res.json({
        success: true,
        message: "تم تسجيل الدخول بنجاح",
        token,
      });
    } else {
      console.log("❌ Invalid admin credentials for:", email);
      res.json({
        success: false,
        message: "بيانات الدخول غير صحيحة",
      });
    }
  } catch (error) {
    console.error("❌ Error in admin login:", error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Helper function for Arabic status text
const getStatusTextAr = (status) => {
  switch (status) {
    case "pending":
      return "قيد الانتظار";
    case "confirmed":
      return "مؤكد";
    case "completed":
      return "مكتمل";
    case "cancelled":
      return "ملغي";
    case "blocked":
      return "محجوز (ممنوع)";
    default:
      return status;
  }
};

// Helper function for Arabic status messages
const getStatusMessageAr = (status) => {
  switch (status) {
    case "pending":
      return "تم تحديث حالة الموعد إلى قيد الانتظار";
    case "confirmed":
      return "تم تأكيد الموعد بنجاح";
    case "completed":
      return "تم إكمال الموعد بنجاح";
    case "cancelled":
      return "تم إلغاء الموعد";
    case "blocked":
      return "تم حظر الموعد";
    default:
      return "تم تحديث حالة الموعد";
  }
};

module.exports = {
  addMedicalService,
  allMedicalServices,
  getMedicalServiceById,
  editMedicalService,
  getMedicalServicesByCategory,
  changeServiceAvailability,
  deleteMedicalService,
  getAllAppointments,
  updateAppointmentStatus,
  blockTimeSlot: blockSingleTimeSlot, // Single slot blocking
  blockTimeSlotRange, // New range blocking
  unblockTimeSlot,
  getBlockedSlots,
  loginAdmin,
  getStatusTextAr,
  getStatusMessageAr,
};
