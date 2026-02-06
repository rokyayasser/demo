/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MedicalContext } from "../context/MedicalContext";
import { assets } from "../assets/assets";
import RelatedServices from "../components/RelatedServices";
import AppointmentForm from "../components/AppointmentForm";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import axios from "axios";

const Appointment = () => {
  const { serviceId } = useParams();
  const { Medicalservices, backendUrl } = useContext(MedicalContext);

  const daysOfWeekArabic = [
    "الأحد",
    "الاثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت",
  ];

  const monthsArabic = [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];

  const [serviceInfo, setServiceInfo] = useState(null);
  const [monthSlots, setMonthSlots] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookedSlots, setBookedSlots] = useState({});
  const [blockedSlots, setBlockedSlots] = useState({});
  const [fullyBookedDates, setFullyBookedDates] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Helper function to normalize date keys
  const normalizeDateKey = (dateStr) => {
    if (!dateStr) return "";

    console.log(`Normalizing date: "${dateStr}"`);

    // Try to parse as Date first
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        // Return in Arabic format
        return date.toLocaleDateString("ar-EG", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }
    } catch (error) {
      // Not a standard date string
    }

    // If it's already in Arabic format, return as is
    if (
      dateStr.includes("ديسمبر") ||
      dateStr.includes("يناير") ||
      dateStr.includes("فبراير") ||
      dateStr.includes("مارس") ||
      dateStr.includes("أبريل") ||
      dateStr.includes("مايو") ||
      dateStr.includes("يونيو") ||
      dateStr.includes("يوليو") ||
      dateStr.includes("أغسطس") ||
      dateStr.includes("سبتمبر") ||
      dateStr.includes("أكتوبر") ||
      dateStr.includes("نوفمبر")
    ) {
      return dateStr;
    }

    // Try to extract date components
    const match = dateStr.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
    if (match) {
      const [_, month, day, year] = match;
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString("ar-EG", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    return dateStr; // Return as is if we can't normalize
  };

  // Page Variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
      },
    },
  };

  // Initialize current month
  useEffect(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    console.log("Current date:", today.toLocaleDateString());
    console.log("Current month (number):", currentMonth);
    console.log("Current month (name):", monthsArabic[currentMonth]);

    setCurrentMonth(currentMonth);
    setCurrentYear(currentYear);
  }, []);

  // Debug booked slots format
  useEffect(() => {
    if (bookedSlots && Object.keys(bookedSlots).length > 0) {
      console.log("=== BOOKED SLOTS DEBUG ===");
      console.log("Total booked dates:", Object.keys(bookedSlots).length);

      // Show first few dates and their format
      const sampleDates = Object.keys(bookedSlots).slice(0, 5);
      sampleDates.forEach((dateStr, index) => {
        console.log(`Date ${index + 1}: "${dateStr}"`);
        console.log(`Slots for this date:`, bookedSlots[dateStr]);

        // Try to parse the date
        try {
          const parsedDate = new Date(dateStr);
          console.log(`Parsed as Date:`, parsedDate.toString());
          console.log(`Is valid date?`, !isNaN(parsedDate.getTime()));
        } catch (error) {
          console.log(`Could not parse as Date:`, error.message);
        }
      });

      // Check specifically for December 25th
      const dec25Keys = Object.keys(bookedSlots).filter(
        (key) =>
          key.includes("25") || key.includes("٢٥") || key.includes("ديسمبر")
      );
      console.log("December 25th keys:", dec25Keys);
    }
  }, [bookedSlots]);

  // Fetch Service and Booked Slots
  useEffect(() => {
    const fetchServiceAndSlots = async () => {
      setLoading(true);
      const foundService = Medicalservices.find((s) => s._id === serviceId);
      setServiceInfo(foundService);

      // Fetch all booked appointments (globally)
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/appointments/booked-slots`
        );

        if (data.success) {
          console.log("Received booked slots data:", data);

          // Separate booked and blocked slots
          const normalizedBookedSlots = {};
          const normalizedBlockedSlots = {};

          // Process booked slots (regular appointments)
          Object.keys(data.bookedSlots || {}).forEach((dateStr) => {
            const normalizedKey = normalizeDateKey(dateStr);
            const slots = data.bookedSlots[dateStr];

            // Filter for regular booked slots
            const booked = slots.filter(
              (slot) => slot.isBooked && !slot.isBlocked
            );
            if (booked.length > 0) {
              normalizedBookedSlots[normalizedKey] = booked.map(
                (slot) => slot.time
              );
            }

            // Filter for blocked slots
            const blocked = slots.filter((slot) => slot.isBlocked);
            if (blocked.length > 0) {
              normalizedBlockedSlots[normalizedKey] = blocked.map(
                (slot) => slot.time
              );
            }
          });

          // Also process blocked slots separately if available
          if (data.blockedSlots) {
            Object.keys(data.blockedSlots || {}).forEach((dateStr) => {
              const normalizedKey = normalizeDateKey(dateStr);
              const blockedTimes = data.blockedSlots[dateStr];

              if (!normalizedBlockedSlots[normalizedKey]) {
                normalizedBlockedSlots[normalizedKey] = [];
              }
              normalizedBlockedSlots[normalizedKey].push(...blockedTimes);
            });
          }

          setBookedSlots(normalizedBookedSlots || {});
          setBlockedSlots(normalizedBlockedSlots || {});

          console.log(
            "Normalized booked slots loaded:",
            Object.keys(normalizedBookedSlots || {}).length,
            "dates"
          );
          console.log(
            "Normalized blocked slots loaded:",
            Object.keys(normalizedBlockedSlots || {}).length,
            "dates"
          );

          // Debug: Show some slots
          const sampleDates = Object.keys(normalizedBookedSlots || {}).slice(
            0,
            3
          );
          sampleDates.forEach((date) => {
            console.log(
              `Booked slots for ${date}:`,
              normalizedBookedSlots[date]
            );
          });

          const blockedSampleDates = Object.keys(
            normalizedBlockedSlots || {}
          ).slice(0, 3);
          blockedSampleDates.forEach((date) => {
            console.log(
              `Blocked slots for ${date}:`,
              normalizedBlockedSlots[date]
            );
          });
        } else {
          console.error("Failed to fetch booked slots:", data.message);
        }
      } catch (error) {
        console.error("Error fetching booked slots:", error);
      }

      setLoading(false);
    };

    if (serviceId) {
      fetchServiceAndSlots();
    }
  }, [serviceId, Medicalservices, backendUrl]);

  // Generate month slots when month/year changes or booked slots update
  useEffect(() => {
    if (serviceInfo) {
      generateMonthSlots();
    }
  }, [currentMonth, currentYear, bookedSlots, blockedSlots, serviceInfo]);

  // Function to refresh booked slots
  const refreshBookedSlots = async () => {
    try {
      setIsRefreshing(true);
      const { data } = await axios.get(
        `${backendUrl}/api/appointments/booked-slots`
      );

      if (data.success) {
        // Separate booked and blocked slots
        const normalizedBookedSlots = {};
        const normalizedBlockedSlots = {};

        // Process booked slots (regular appointments)
        Object.keys(data.bookedSlots || {}).forEach((dateStr) => {
          const normalizedKey = normalizeDateKey(dateStr);
          const slots = data.bookedSlots[dateStr];

          // Filter for regular booked slots
          const booked = slots.filter(
            (slot) => slot.isBooked && !slot.isBlocked
          );
          if (booked.length > 0) {
            normalizedBookedSlots[normalizedKey] = booked.map(
              (slot) => slot.time
            );
          }

          // Filter for blocked slots
          const blocked = slots.filter((slot) => slot.isBlocked);
          if (blocked.length > 0) {
            normalizedBlockedSlots[normalizedKey] = blocked.map(
              (slot) => slot.time
            );
          }
        });

        // Also process blocked slots separately if available
        if (data.blockedSlots) {
          Object.keys(data.blockedSlots || {}).forEach((dateStr) => {
            const normalizedKey = normalizeDateKey(dateStr);
            const blockedTimes = data.blockedSlots[dateStr];

            if (!normalizedBlockedSlots[normalizedKey]) {
              normalizedBlockedSlots[normalizedKey] = [];
            }
            normalizedBlockedSlots[normalizedKey].push(...blockedTimes);
          });
        }

        setBookedSlots(normalizedBookedSlots || {});
        setBlockedSlots(normalizedBlockedSlots || {});
        console.log("Slots refreshed at:", new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error("Error refreshing slots:", error);
      toast.error("حدث خطأ أثناء تحديث المواعيد");
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  // Generate slots for the entire month - UPDATED to handle both booked and blocked
  const generateMonthSlots = () => {
    const slots = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get first and last day of current month view
    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 1, 0);
    const totalDays = endDate.getDate();

    console.log(
      `Generating slots for ${monthsArabic[currentMonth]} ${currentYear}`
    );
    console.log(`Total days: ${totalDays}`);
    console.log(`Booked slots:`, bookedSlots);
    console.log(`Blocked slots:`, blockedSlots);

    // Generate all days of the month
    for (let day = 1; day <= totalDays; day++) {
      const currentDate = new Date(currentYear, currentMonth, day);
      currentDate.setHours(0, 0, 0, 0);

      // Create consistent dateKey format (YYYY-MM-DD for comparison)
      const dateKeyISO = currentDate.toISOString().split("T")[0];

      // Arabic formatted date for display
      const dateKeyArabic = currentDate.toLocaleDateString("ar-EG", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // Check if date is in the past
      const isPastDate = currentDate < today;

      // Get all possible time slots for this day
      const allTimeSlots = [];
      // Working hours: 10 AM to 9 PM
      const startHour = 10;
      const endHour = 21;

      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const slotTime = new Date(currentDate);
          slotTime.setHours(hour, minute, 0, 0);

          const formattedTime = slotTime
            .toLocaleTimeString("ar-EG", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
            .replace("AM", "ص")
            .replace("PM", "م");

          allTimeSlots.push(formattedTime);
        }
      }

      // Check booked slots for this date using multiple formats
      const bookedSlotsForDate = [];
      const blockedSlotsForDate = [];

      // Try to find matching date in different formats for BOOKED slots
      Object.keys(bookedSlots).forEach((dateStr) => {
        // Check different matching strategies:
        // 1. Check if dateStr contains the day number and month name
        if (
          dateStr.includes(day.toString()) &&
          dateStr.includes(monthsArabic[currentMonth])
        ) {
          bookedSlotsForDate.push(...bookedSlots[dateStr]);
        }
        // 2. Check if dateStr matches the Arabic formatted date exactly
        else if (dateStr === dateKeyArabic) {
          bookedSlotsForDate.push(...bookedSlots[dateStr]);
        }
        // 3. Check if it's a ISO format date (YYYY-MM-DD)
        else if (dateStr === dateKeyISO) {
          bookedSlotsForDate.push(...bookedSlots[dateStr]);
        }
        // 4. Try to parse and compare dates
        else {
          try {
            const parsedDate = new Date(dateStr);
            if (!isNaN(parsedDate.getTime())) {
              const parsedArabic = parsedDate.toLocaleDateString("ar-EG", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              });

              if (parsedArabic === dateKeyArabic) {
                bookedSlotsForDate.push(...bookedSlots[dateStr]);
              }
            }
          } catch (error) {
            // Could not parse date
          }
        }
      });

      // Try to find matching date in different formats for BLOCKED slots
      Object.keys(blockedSlots).forEach((dateStr) => {
        // Check different matching strategies:
        // 1. Check if dateStr contains the day number and month name
        if (
          dateStr.includes(day.toString()) &&
          dateStr.includes(monthsArabic[currentMonth])
        ) {
          blockedSlotsForDate.push(...blockedSlots[dateStr]);
        }
        // 2. Check if dateStr matches the Arabic formatted date exactly
        else if (dateStr === dateKeyArabic) {
          blockedSlotsForDate.push(...blockedSlots[dateStr]);
        }
        // 3. Check if it's a ISO format date (YYYY-MM-DD)
        else if (dateStr === dateKeyISO) {
          blockedSlotsForDate.push(...blockedSlots[dateStr]);
        }
        // 4. Try to parse and compare dates
        else {
          try {
            const parsedDate = new Date(dateStr);
            if (!isNaN(parsedDate.getTime())) {
              const parsedArabic = parsedDate.toLocaleDateString("ar-EG", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              });

              if (parsedArabic === dateKeyArabic) {
                blockedSlotsForDate.push(...blockedSlots[dateStr]);
              }
            }
          } catch (error) {
            // Could not parse date
          }
        }
      });

      const totalTimeSlots = allTimeSlots.length;
      const bookedTimeSlots = bookedSlotsForDate.length;
      const blockedTimeSlots = blockedSlotsForDate.length;
      const unavailableTimeSlots = bookedTimeSlots + blockedTimeSlots;

      // Debug: Show what we found
      console.log(
        `Day ${day} (${dateKeyArabic}) - Found ${bookedTimeSlots} booked slots, ${blockedTimeSlots} blocked slots`
      );

      // Check if ALL time slots are booked/blocked for this date
      const isFullyBooked = unavailableTimeSlots >= totalTimeSlots;

      // Generate time slots for ALL days (including fully booked/blocked) for visual display
      const timeSlots = [];
      if (!isPastDate) {
        for (let hour = startHour; hour < endHour; hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            const slotTime = new Date(currentDate);
            slotTime.setHours(hour, minute, 0, 0);

            // Skip if time is in the past for today
            const now = new Date();
            if (
              currentDate.toDateString() === today.toDateString() &&
              slotTime < now
            ) {
              continue;
            }

            const formattedTime = slotTime
              .toLocaleTimeString("ar-EG", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
              .replace("AM", "ص")
              .replace("PM", "م");

            // Check if this specific slot is booked
            const isBooked = bookedSlotsForDate.includes(formattedTime);
            // Check if this specific slot is blocked
            const isBlocked = blockedSlotsForDate.includes(formattedTime);
            // Slot is available only if not booked AND not blocked
            const isAvailable = !isBooked && !isBlocked;

            // Debug: Log blocked slots
            if (isBlocked) {
              console.log(
                `🔒 Slot ${formattedTime} on ${dateKeyArabic} is BLOCKED`
              );
            }
            if (isBooked) {
              console.log(
                `✅ Slot ${formattedTime} on ${dateKeyArabic} is BOOKED`
              );
            }

            timeSlots.push({
              datetime: slotTime,
              time: formattedTime,
              isBooked: isBooked,
              isBlocked: isBlocked,
              isAvailable: isAvailable,
              status: isBlocked ? "blocked" : isBooked ? "booked" : "available",
            });
          }
        }
      }

      slots.push({
        date: currentDate,
        dateKey: dateKeyArabic,
        dateKeyISO: dateKeyISO,
        dayOfWeek: daysOfWeekArabic[currentDate.getDay()],
        dayNumber: currentDate.getDate(),
        monthName: monthsArabic[currentDate.getMonth()],
        isPast: isPastDate,
        isFullyBooked: isFullyBooked,
        totalSlots: totalTimeSlots,
        bookedSlots: bookedTimeSlots,
        blockedSlots: blockedTimeSlots,
        availableSlots: totalTimeSlots - unavailableTimeSlots,
        timeSlots: timeSlots,
        hasAvailableSlots: timeSlots.some((slot) => slot.isAvailable),
      });
    }

    setMonthSlots(slots);

    // Track fully booked dates
    const fullyBooked = slots
      .filter((day) => day.isFullyBooked && !day.isPast)
      .map((day) => day.dateKey);
    setFullyBookedDates(fullyBooked);
    console.log(
      "Generated slots for month:",
      monthsArabic[currentMonth],
      currentYear
    );
    console.log("Total days generated:", slots.length);
    console.log("Fully booked/blocked dates:", fullyBooked.length);

    // Auto-select first available day if none selected
    if (selectedDayIndex === null) {
      const firstAvailableDay = slots.findIndex(
        (day) => !day.isPast && !day.isFullyBooked && day.hasAvailableSlots
      );
      if (firstAvailableDay !== -1) {
        setSelectedDayIndex(firstAvailableDay);
        console.log("Auto-selected day index:", firstAvailableDay);
      }
    }
  };

  // Real-time updates for booked slots
  useEffect(() => {
    let intervalId;

    if (!showForm && serviceInfo) {
      // Initial fetch
      refreshBookedSlots();

      // Set up polling every 10 seconds for better real-time updates
      intervalId = setInterval(() => {
        refreshBookedSlots();
      }, 10000); // Check every 10 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [showForm, serviceInfo, backendUrl]);

  // Navigation between months
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDayIndex(null);
    setSelectedTime("");
  };

  const prevMonth = () => {
    const today = new Date();
    const prevDate = new Date(currentYear, currentMonth - 1, 1);

    // Don't go back before current month
    if (
      prevDate.getFullYear() < today.getFullYear() ||
      (prevDate.getFullYear() === today.getFullYear() &&
        prevDate.getMonth() < today.getMonth())
    ) {
      toast.info("لا يمكن العودة للأشهر السابقة");
      return;
    }

    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDayIndex(null);
    setSelectedTime("");
  };

  // Handle Booking Confirmation with REAL-TIME checking
  const handleConfirm = async () => {
    if (!serviceInfo.available) {
      toast.error(
        "هذه الخدمة غير متاحة للحجز حالياً. الرجاء اختيار خدمة أخرى."
      );
      return;
    }
    if (!selectedTime || selectedDayIndex === null) {
      toast.error("يرجى اختيار وقت الحجز أولاً");
      return;
    }

    const selectedDay = monthSlots[selectedDayIndex];
    if (!selectedDay) {
      toast.error("يرجى اختيار تاريخ صالح");
      return;
    }

    // Check if selected slot is booked or blocked (REAL-TIME check)
    const selectedSlot = selectedDay.timeSlots.find(
      (slot) => slot.time === selectedTime
    );

    if (selectedSlot?.isBooked || selectedSlot?.isBlocked) {
      const message = selectedSlot.isBlocked
        ? "هذا الموعد محظور من قبل الإدارة. يرجى اختيار موعد آخر."
        : "هذا الموعد محجوز بالفعل. يرجى اختيار موعد آخر.";
      toast.error(message);

      // Update the UI to show this slot as unavailable immediately
      const updatedSlots = [...monthSlots];
      updatedSlots[selectedDayIndex] = {
        ...selectedDay,
        timeSlots: selectedDay.timeSlots.map((slot) =>
          slot.time === selectedTime
            ? {
                ...slot,
                isBooked: selectedSlot.isBooked,
                isBlocked: selectedSlot.isBlocked,
                isAvailable: false,
              }
            : slot
        ),
      };
      setMonthSlots(updatedSlots);
      setSelectedTime("");
      return;
    }

    // Double-check with backend API (REAL-TIME verification)
    try {
      const response = await axios.get(
        `${backendUrl}/api/appointments/check-slot`,
        {
          params: {
            date: selectedDay.dateKey,
            time: selectedTime,
          },
        }
      );

      if (!response.data.success || !response.data.isAvailable) {
        const message = response.data.bookedBy?.isBlocked
          ? "هذا الموعد محظور من قبل الإدارة. يرجى اختيار موعد آخر."
          : "هذا الموعد محجوز بالفعل. يرجى اختيار موعد آخر.";
        toast.error(message);

        // Update UI immediately
        const updatedSlots = [...monthSlots];
        updatedSlots[selectedDayIndex] = {
          ...selectedDay,
          timeSlots: selectedDay.timeSlots.map((slot) =>
            slot.time === selectedTime
              ? {
                  ...slot,
                  isBooked: !response.data.bookedBy?.isBlocked,
                  isBlocked: response.data.bookedBy?.isBlocked || false,
                  isAvailable: false,
                }
              : slot
          ),
        };
        setMonthSlots(updatedSlots);
        setSelectedTime("");
        return;
      }
    } catch (error) {
      console.error("Error checking slot availability:", error);
      // Continue anyway, server will validate on submission
    }

    const chosenDate = `${selectedDay.dateKey} - ${selectedTime}`;
    setSelectedDate(chosenDate);
    setShowForm(true);

    // Scroll to form
    setTimeout(() => {
      document.getElementById("appointment-form")?.scrollIntoView({
        behavior: "smooth",
      });
    }, 300);
  };

  // Reset form when service changes
  useEffect(() => {
    setShowForm(false);
    setSelectedTime("");
    setSelectedDate("");
    setSelectedDayIndex(null);
  }, [serviceId]);

  // Get day status color and style
  const getDayStatusStyle = (day) => {
    if (day.isPast) {
      return {
        bg: "bg-gray-100",
        text: "text-gray-400",
        border: "border-gray-200",
        cursor: "cursor-not-allowed",
        label: "منتهي",
        icon: "calendar-x",
        blur: false,
        filter: "",
        className: "opacity-60",
      };
    }

    if (day.isFullyBooked) {
      return {
        bg: "bg-gray-200",
        text: "text-gray-500",
        border: "border-gray-300",
        cursor: "cursor-not-allowed",
        label: "مكتمل",
        icon: "calendar-off",
        blur: true,
        filter: "blur-[1.5px]",
        className: "opacity-70 filter-blur-sm disabled-blurred",
      };
    }

    if (
      !day.hasAvailableSlots &&
      (day.bookedSlots > 0 || day.blockedSlots > 0)
    ) {
      return {
        bg: "bg-yellow-50",
        text: "text-yellow-600",
        border: "border-yellow-200",
        cursor: "cursor-pointer",
        label: `${day.availableSlots}/${day.totalSlots}`,
        icon: "calendar-clock",
        blur: false,
        filter: "",
        className: "",
      };
    }

    if (
      selectedDayIndex !== null &&
      monthSlots[selectedDayIndex]?.dateKey === day.dateKey
    ) {
      return {
        bg: "bg-gradient-to-r from-primary to-secondary",
        text: "text-white",
        border: "border-primary",
        cursor: "cursor-pointer",
        label: "محدد",
        icon: "calendar-check",
        blur: false,
        filter: "",
        className: "",
      };
    }

    return {
      bg: "bg-white",
      text: "text-textMain",
      border: "border-borderLight hover:border-primary",
      cursor: "cursor-pointer",
      label: `${day.availableSlots}/${day.totalSlots}`,
      icon: "calendar",
      blur: false,
      filter: "",
      className: "",
    };
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-textSoft text-lg">جاري تحميل الخدمة...</p>
        </div>
      </div>
    );
  }

  if (!serviceInfo) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-lightBg rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-textSoft"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
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
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className="text-textMain my-10 relative max-w-7xl mx-auto px-4"
    >
      {/* Service Details */}
      <motion.div className="flex flex-col lg:flex-row gap-8 mb-12">
        <motion.div className="lg:w-1/3">
          <motion.img
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="w-full h-64 lg:h-80 object-cover rounded-2xl shadow-xl border-2 border-borderLight"
            src={serviceInfo.image}
            alt={serviceInfo.title}
          />
        </motion.div>

        <motion.div className="lg:w-2/3 border border-borderLight rounded-2xl p-8 bg-white shadow-lg">
          <motion.p
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 text-2xl font-semibold text-primary mb-2"
          >
            {serviceInfo.title}
            <motion.img
              animate={{ rotate: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-5"
              src={assets.verified_icon}
              alt="verified"
            />
          </motion.p>

          <p className="text-secondary text-sm mb-4 font-medium">
            {serviceInfo.category_ar}
          </p>
          <p className="text-textSoft text-sm mb-6 leading-relaxed">
            {serviceInfo.description}
          </p>

          <div className="mb-6">
            <p className="font-medium text-textMain mb-3">المميزات:</p>
            <ul className="list-disc pr-5 text-textSoft text-sm space-y-2">
              {serviceInfo.features?.map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="hover:text-secondary transition-colors"
                >
                  {feature}
                </motion.li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-textMain font-medium mb-2">سعر الخدمة:</p>
              <p className="text-primary text-3xl font-bold">
                {serviceInfo.fees} جنيه
              </p>
            </div>

            {serviceInfo.duration && (
              <div className="text-center">
                <p className="text-textSoft text-sm mb-1">المدة</p>
                <p className="text-textMain font-medium">
                  {serviceInfo.duration}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Legend for Calendar */}
      {!showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-borderLight">
            <h3 className="text-lg font-bold text-primary mb-4">
              مفتاح الألوان:
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gradient-to-r from-primary to-secondary"></div>
                  <span className="text-sm text-textMain">اليوم المحدد</span>
                </div>
                <div className="pr-6">
                  <div className="text-xs text-gray-500 mt-1">
                    مثال: 12 ديسمبر
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-white border border-borderLight"></div>
                  <span className="text-sm text-textMain">متاح للحجز</span>
                </div>
                <div className="pr-6">
                  <div className="text-xs text-gray-500 mt-1">
                    مثال: 10:00 ص
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 relative">
                  <div className="w-4 h-4 rounded bg-gray-300 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-400/50 to-gray-500/30 blur-[0.5px] rounded"></div>
                  </div>
                  <span className="text-sm text-textMain">محجوز</span>
                </div>
                <div className="pr-6">
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <span className="line-through filter blur-[0.5px]">
                      11:00 ص
                    </span>
                    <svg
                      className="w-3 h-3 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-100 border border-red-300 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-400/30 to-red-500/20 blur-[0.5px] rounded"></div>
                  </div>
                  <span className="text-sm text-textMain">محظور</span>
                </div>
                <div className="pr-6">
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <span className="line-through filter blur-[0.5px]">
                      02:00 م
                    </span>
                    <svg
                      className="w-3 h-3 text-red-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Real-time update indicator */}
            <div className="flex items-center justify-end gap-2 text-xs text-textSoft mt-4">
              <svg
                className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>آخر تحديث: {new Date().toLocaleTimeString("ar-EG")}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Month Navigation & Calendar */}
      {!showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6 bg-white rounded-2xl p-6 shadow-lg border border-borderLight">
            <h2 className="text-2xl font-bold text-primary">اختر موعد الحجز</h2>

            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={prevMonth}
                className="bg-lightBg text-textMain p-3 rounded-xl hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </motion.button>

              <span className="text-xl font-bold text-primary min-w-[150px] text-center">
                {monthsArabic[currentMonth]} {currentYear}
              </span>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={nextMonth}
                className="bg-lightBg text-textMain p-3 rounded-xl hover:bg-primary hover:text-white transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </motion.button>

              {/* Refresh Button */}
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-borderLight mb-8">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {daysOfWeekArabic.map((day, index) => (
                <div
                  key={index}
                  className="text-center font-bold text-primary text-sm py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {/* Add empty cells for days before month starts */}
              {Array.from({
                length: new Date(currentYear, currentMonth, 1).getDay(),
              }).map((_, index) => (
                <div key={`empty-${index}`} className="aspect-square"></div>
              ))}

              {/* Month days - Fully booked dates appear blurred */}
              {monthSlots.map((day, index) => {
                const status = getDayStatusStyle(day);
                const isFullyBooked = day.isFullyBooked;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.01 }}
                    whileHover={
                      status.cursor === "cursor-pointer" ? { scale: 1.05 } : {}
                    }
                    whileTap={
                      status.cursor === "cursor-pointer" ? { scale: 0.95 } : {}
                    }
                    onClick={() =>
                      status.cursor === "cursor-pointer" &&
                      setSelectedDayIndex(index)
                    }
                    className={`aspect-square flex flex-col items-center justify-center rounded-xl transition-all duration-300 border-2 relative overflow-hidden blur-transition ${status.bg} ${status.text} ${status.border} ${status.cursor} ${status.className}`}
                  >
                    {/* Blur overlay with pattern for fully booked dates */}
                    {isFullyBooked && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-300/60 to-gray-400/40 backdrop-blur-[1px]"></div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-70">
                          <svg
                            className="w-10 h-10 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1"
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                      </>
                    )}

                    {/* Day number */}
                    <p
                      className={`text-xl font-bold relative z-10 ${
                        isFullyBooked ? "text-gray-600 filter blur-[0.5px]" : ""
                      }`}
                    >
                      {day.dayNumber}
                    </p>

                    {/* Status indicator */}
                    <span
                      className={`text-[10px] mt-1 relative z-10 font-medium ${
                        isFullyBooked ? "text-gray-700 filter blur-[0.5px]" : ""
                      }`}
                    >
                      {isFullyBooked ? "مكتمل" : status.label}
                    </span>

                    {/* X icon for fully booked */}
                    {isFullyBooked && (
                      <div className="absolute top-1 right-1">
                        <svg
                          className="w-5 h-5 text-red-500 opacity-80"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Summary of availability */}
            <div className="mt-6 pt-4 border-t border-borderLight">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-textMain">
                    إجمالي الأيام المتاحة هذا الشهر:
                  </span>
                  <span className="font-bold text-primary">
                    {
                      monthSlots.filter(
                        (day) => !day.isPast && !day.isFullyBooked
                      ).length
                    }{" "}
                    يوم
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-textMain">
                    الأيام المكتملة (محجوزة/محظورة بالكامل):
                  </span>
                  <span className="font-bold text-red-500">
                    {fullyBookedDates.length} يوم
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Time Slots for Selected Day */}
          {selectedDayIndex !== null && monthSlots[selectedDayIndex] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-borderLight mb-8"
            >
              <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                أوقات الحجز المتاحة ليوم{" "}
                {monthSlots[selectedDayIndex].dayOfWeek}{" "}
                {monthSlots[selectedDayIndex].dayNumber}{" "}
                {monthSlots[selectedDayIndex].monthName}
              </h3>

              <div className="mb-4 text-sm text-textSoft">
                <div className="flex items-center gap-4">
                  <span>
                    إجمالي المواعيد: {monthSlots[selectedDayIndex].totalSlots}
                  </span>
                  <span>
                    المحجوزة: {monthSlots[selectedDayIndex].bookedSlots}
                  </span>
                  <span>
                    المحظورة: {monthSlots[selectedDayIndex].blockedSlots}
                  </span>
                  <span>
                    المتاحة: {monthSlots[selectedDayIndex].availableSlots}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {monthSlots[selectedDayIndex].timeSlots.length > 0 ? (
                  monthSlots[selectedDayIndex].timeSlots.map((slot, index) => {
                    const isBooked = slot.isBooked;
                    const isBlocked = slot.isBlocked;
                    const isUnavailable = isBooked || isBlocked;

                    console.log(
                      `Slot ${slot.time} - isBooked: ${isBooked}, isBlocked: ${isBlocked}`
                    );

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className={`relative transition-all duration-300 ${
                          isUnavailable ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                      >
                        {/* Main Time Slot Button */}
                        <motion.button
                          whileHover={slot.isAvailable ? { scale: 1.05 } : {}}
                          whileTap={slot.isAvailable ? { scale: 0.95 } : {}}
                          onClick={() => {
                            if (slot.isAvailable) {
                              setSelectedTime(slot.time);
                            } else {
                              const message = isBlocked
                                ? "هذا الموعد محظور من قبل الإدارة. يرجى اختيار موعد آخر."
                                : "هذا الموعد محجوز بالفعل. يرجى اختيار موعد آخر.";
                              toast.warning(message);
                            }
                          }}
                          disabled={!slot.isAvailable}
                          className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden ${
                            isBlocked
                              ? "bg-red-50 border border-red-200 text-red-600 cursor-not-allowed slot-blurred"
                              : isBooked
                              ? "bg-gray-100 border border-gray-300 text-gray-500 cursor-not-allowed slot-blurred"
                              : selectedTime === slot.time
                              ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg"
                              : "bg-lightBg text-textMain hover:bg-accent hover:shadow-md"
                          }`}
                        >
                          {/* Slot content with blurred effect */}
                          <div className="relative z-10">
                            <span className={isUnavailable ? "blur-text" : ""}>
                              {slot.time}
                            </span>
                          </div>

                          {/* Red X mark for booked/blocked slots */}
                          {isUnavailable && (
                            <>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="relative w-6 h-6">
                                  {/* Diagonal red X */}
                                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500 transform -rotate-45"></div>
                                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500 transform rotate-45"></div>
                                </div>
                              </div>

                              {/* Status text */}
                              <div className="absolute top-1 left-1 z-20">
                                <span
                                  className={`text-[10px] font-bold ${
                                    isBlocked ? "text-red-600" : "text-red-500"
                                  }`}
                                >
                                  {isBlocked ? "محظور" : "محجوز"}
                                </span>
                              </div>
                            </>
                          )}
                        </motion.button>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="col-span-full text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-500">
                      لا توجد أوقات متاحة لهذا اليوم
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      جميع الأوقات محجوزة أو محظورة
                    </p>
                  </div>
                )}
              </div>

              {selectedTime && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl"
                >
                  <p className="text-green-700 font-medium flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    تم اختيار الموعد: {monthSlots[selectedDayIndex].dateKey}{" "}
                    الساعة {selectedTime}
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Book Button */}
          {selectedTime && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleConfirm}
                className="bg-gradient-to-r from-primary to-secondary text-white text-lg font-bold px-12 py-4 rounded-xl hover:from-secondary hover:to-primary transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                تأكيد الحجز والمتابعة →
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Appointment Form */}
      {showForm ? (
        <motion.div
          id="appointment-form"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {serviceInfo && (
            <AppointmentForm
              selectedDate={selectedDate}
              selectedCategory={serviceInfo.title}
              serviceFees={serviceInfo.fees}
              serviceId={serviceInfo._id}
              backendUrl={backendUrl}
              serviceInfo={serviceInfo}
            />
          )}
        </motion.div>
      ) : null}

      {/* Related Services */}
      {serviceInfo && !showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <RelatedServices
            category={serviceInfo.category}
            serviceId={serviceInfo._id}
          />
        </motion.div>
      )}
    </motion.div>
  );
};

export default Appointment;
