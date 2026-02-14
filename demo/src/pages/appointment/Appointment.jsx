/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

// Contexts
import { AppContext } from "../../context/AppContext";
import { MedicalContext } from "../../context/MedicalContext";

// API
import { appointmentApi } from "../../api/appointment.api";

// Components
import AppointmentForm from "../../components/appointment/AppointmentForm";
import TimeSlots from "../../components/appointment/TimeSlots";
import ServiceDetails from "../../components/appointment/ServiceDetails";
import Calendar from "../../components/appointment/Calender";

const Appointment = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();

  const { api } = useContext(AppContext);
  const { getServiceById } = useContext(MedicalContext);

  const [state, setState] = useState({
    serviceInfo: null,
    selectedDate: "",
    selectedTime: "",
    showForm: false,
    loading: true,
    bookedSlots: {},
    blockedSlots: {},
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
    selectedDayIndex: null,
    slotsError: null,
  });

  // Fetch service and slots data
  useEffect(() => {
    const fetchData = async () => {
      setState((prev) => ({ ...prev, loading: true, slotsError: null }));

      try {
        // Fetch service info
        const serviceData = await getServiceById(serviceId);
        console.log("Service data fetched:", serviceData);

        // Fetch booked slots with improved error handling
        let bookedSlots = {};
        let blockedSlots = {};
        let slotsError = null;

        try {
          console.log("Fetching booked slots...");
          const slotsData = await appointmentApi.getBookedSlots();
          console.log("Received slots data:", slotsData);

          if (slotsData.success === false) {
            console.warn("Slots API returned failure:", slotsData.message);
            slotsError = slotsData.message || "Failed to load slots";
          } else {
            // Handle both response structures (BaseController wraps in data)
            bookedSlots =
              slotsData.bookedSlots || slotsData.data?.bookedSlots || {};
            blockedSlots =
              slotsData.blockedSlots || slotsData.data?.blockedSlots || {};
          }
        } catch (error) {
          console.warn("Error fetching slots:", error.message);
          slotsError = error.message;
        }

        setState((prev) => ({
          ...prev,
          serviceInfo: serviceData,
          bookedSlots,
          blockedSlots,
          loading: false,
          slotsError,
        }));
      } catch (error) {
        console.error("Error fetching service data:", error);
        toast.error("حدث خطأ في تحميل بيانات الخدمة");
        setState((prev) => ({
          ...prev,
          loading: false,
          slotsError: error.message,
        }));
      }
    };

    if (serviceId) {
      fetchData();
    }
  }, [serviceId, getServiceById]);

  // Handle date selection
  const handleDateSelect = (dateKey) => {
    setState((prev) => ({
      ...prev,
      selectedDate: dateKey,
      selectedTime: "",
    }));
  };

  // Handle time selection
  const handleTimeSelect = async (time) => {
    if (!state.selectedDate) {
      toast.error("يرجى اختيار التاريخ أولاً");
      return;
    }

    try {
      // Convert Arabic time to 24-hour format for API
      const convertTo24Hour = (arabicTime) => {
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

        let englishTime = arabicTime;
        Object.entries(arabicToEnglish).forEach(([arabic, english]) => {
          englishTime = englishTime.replace(new RegExp(arabic, "g"), english);
        });

        const match = englishTime.match(/(\d+):(\d+)\s*(ص|م)/);
        if (!match) return "00:00";

        let [_, hour, minute, period] = match;
        hour = parseInt(hour);

        if (period === "م" && hour < 12) hour += 12;
        if (period === "ص" && hour === 12) hour = 0;

        return `${hour.toString().padStart(2, "0")}:${minute}`;
      };

      const numericTime = convertTo24Hour(time);

      // Check slot availability
      const checkResponse = await appointmentApi.checkSlotAvailability(
        state.selectedDate,
        numericTime
      );

      console.log("Check slot response:", checkResponse);

      if (checkResponse && checkResponse.success === false) {
        toast.error(checkResponse.message || "هذا الموعد غير متاح");
        return;
      }

      // FIX: BaseController.success() wraps everything in `data`
      // API returns: { success: true, data: { isAvailable: true, ... } }
      // So read from checkResponse.data.isAvailable, with fallback to top-level
      const isAvailable =
        checkResponse?.data?.isAvailable ?? checkResponse?.isAvailable;

      if (isAvailable === false) {
        toast.error("هذا الموعد محجوز بالفعل. يرجى اختيار موعد آخر.");
        return;
      }

      setState((prev) => ({
        ...prev,
        selectedTime: time,
      }));
    } catch (error) {
      console.error("Error checking slot availability:", error);
      toast.error("حدث خطأ في التحقق من توفر الموعد");
    }
  };

  // Handle booking confirmation
  const handleConfirmBooking = () => {
    if (!state.selectedDate || !state.selectedTime) {
      toast.error("يرجى اختيار التاريخ والوقت أولاً");
      return;
    }

    if (!state.serviceInfo?.available) {
      toast.error("هذه الخدمة غير متاحة للحجز حالياً");
      return;
    }

    setState((prev) => ({
      ...prev,
      showForm: true,
    }));

    // Scroll to form
    setTimeout(() => {
      document.getElementById("appointment-form")?.scrollIntoView({
        behavior: "smooth",
      });
    }, 300);
  };

  // Handle month navigation
  const handleMonthChange = (direction) => {
    setState((prev) => {
      let newMonth = prev.currentMonth;
      let newYear = prev.currentYear;

      if (direction === "next") {
        if (newMonth === 11) {
          newMonth = 0;
          newYear += 1;
        } else {
          newMonth += 1;
        }
      } else {
        if (newMonth === 0) {
          newMonth = 11;
          newYear -= 1;
        } else {
          newMonth -= 1;
        }
      }

      return {
        ...prev,
        currentMonth: newMonth,
        currentYear: newYear,
        selectedDayIndex: null,
        selectedTime: "",
      };
    });
  };

  // Load available slots for the selected date
  useEffect(() => {
    const loadAvailableSlotsForDate = async () => {
      if (!state.selectedDate) return;

      try {
        const response = await appointmentApi.getAvailableSlots(
          state.selectedDate
        );
        if (response && response.success) {
          const updatedBookedSlots = { ...state.bookedSlots };
          const updatedBlockedSlots = { ...state.blockedSlots };

          // Handle BaseController wrapping: response.data.slots or response.slots
          const slots = response.data?.slots || response.slots || [];

          const bookedTimes = slots
            .filter((slot) => slot.isBooked)
            .map((slot) => slot.time);

          const blockedTimes = slots
            .filter((slot) => slot.isBlocked)
            .map((slot) => slot.time);

          updatedBookedSlots[state.selectedDate] = bookedTimes;
          updatedBlockedSlots[state.selectedDate] = blockedTimes;

          setState((prev) => ({
            ...prev,
            bookedSlots: updatedBookedSlots,
            blockedSlots: updatedBlockedSlots,
          }));
        }
      } catch (error) {
        console.error("Error loading available slots:", error);
      }
    };

    loadAvailableSlotsForDate();
  }, [state.selectedDate]); // eslint-disable-line react-hooks/exhaustive-deps

  if (state.loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-textSoft text-lg">جاري تحميل الخدمة...</p>
        </div>
      </div>
    );
  }

  if (!state.serviceInfo) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-textMain mb-2">
            الخدمة غير متاحة
          </h3>
          <p className="text-textSoft">
            عذراً، لم نتمكن من العثور على هذه الخدمة
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-4 py-8"
      dir="rtl"
    >
      {/* Service Details */}
      <ServiceDetails serviceInfo={state.serviceInfo} />

      {/* Error message for slots */}
      {state.slotsError && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-700 text-sm flex items-center">
            <span className="ml-2">⚠️</span>
            لا يمكن تحميل معلومات المواعيد المتاحة حالياً. يمكنك المتابعة مع
            الحجز.
            <button
              onClick={() => window.location.reload()}
              className="mr-2 text-blue-600 hover:text-blue-800 underline text-sm"
            >
              إعادة المحاولة
            </button>
          </p>
        </div>
      )}

      {!state.showForm ? (
        <>
          {/* Calendar Section */}
          <div className="mt-12">
            <Calendar
              currentMonth={state.currentMonth}
              currentYear={state.currentYear}
              selectedDate={state.selectedDate}
              bookedSlots={state.bookedSlots}
              blockedSlots={state.blockedSlots}
              onMonthChange={handleMonthChange}
              onDateSelect={handleDateSelect}
            />
          </div>

          {/* Time Slots Section */}
          {state.selectedDate && (
            <div className="mt-8">
              <TimeSlots
                selectedDate={state.selectedDate}
                selectedTime={state.selectedTime}
                bookedSlots={state.bookedSlots[state.selectedDate] || []}
                blockedSlots={state.blockedSlots[state.selectedDate] || []}
                onTimeSelect={handleTimeSelect}
              />
            </div>
          )}

          {/* Confirm Button */}
          {state.selectedDate && state.selectedTime && (
            <div className="mt-8 text-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleConfirmBooking}
                className="bg-gradient-to-r from-primary to-secondary text-white text-lg font-bold px-12 py-4 rounded-xl hover:from-secondary hover:to-primary transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                تأكيد الحجز والمتابعة →
              </motion.button>
            </div>
          )}
        </>
      ) : (
        /* Appointment Form */
        <div id="appointment-form" className="mt-12">
          <AppointmentForm
            selectedDate={`${state.selectedDate} - ${state.selectedTime}`}
            selectedCategory={state.serviceInfo.category}
            serviceId={state.serviceInfo._id}
            serviceFees={state.serviceInfo.fees}
            serviceInfo={state.serviceInfo}
          />
        </div>
      )}
    </motion.div>
  );
};

export default Appointment;
