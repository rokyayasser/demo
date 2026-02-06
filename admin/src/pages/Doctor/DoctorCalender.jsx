/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FiChevronRight,
  FiChevronLeft,
  FiCalendar,
  FiUsers,
  FiClock,
  FiCheckCircle,
  FiRefreshCw,
  FiInfo,
} from "react-icons/fi";
import { DoctorContext } from "../../context/DoctorContext";

const DoctorCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [appointments, setAppointments] = useState([]);
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("month"); // "month" or "day"
  const [debugInfo, setDebugInfo] = useState("");

  const { backendUrl, dToken } = useContext(DoctorContext);

  // Arabic month names
  const arabicMonths = [
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

  const arabicDays = [
    "الأحد",
    "الاثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت",
  ];

  // Helper function to convert Arabic date to ISO format - FIXED VERSION
  const convertArabicToISO = (arabicDate) => {
    if (!arabicDate) return "";

    console.log(`Attempting to convert Arabic date: "${arabicDate}"`);

    // If already in ISO format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(arabicDate)) {
      return arabicDate;
    }

    try {
      // Map Arabic month names to month numbers
      const monthMap = {
        يناير: "01",
        فبراير: "02",
        مارس: "03",
        أبريل: "04",
        مايو: "05",
        يونيو: "06",
        يوليو: "07",
        أغسطس: "08",
        سبتمبر: "09",
        أكتوبر: "10",
        نوفمبر: "11",
        ديسمبر: "12",
      };

      // Eastern Arabic numerals to Western
      const easternToWestern = {
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

      // First, try to convert Eastern Arabic numerals to Western
      let convertedDate = arabicDate;
      Object.keys(easternToWestern).forEach((easternNum) => {
        const regex = new RegExp(easternNum, "g");
        convertedDate = convertedDate.replace(
          regex,
          easternToWestern[easternNum]
        );
      });

      console.log(`After numeral conversion: "${convertedDate}"`);

      // Now try to match the pattern with Western numerals
      // Pattern: "الثلاثاء، 6 يناير 2026"
      const pattern = /(\d{1,2})\s+(\S+)\s+(\d{4})/;
      const match = convertedDate.match(pattern);

      if (match) {
        const day = match[1].padStart(2, "0");
        const monthName = match[2].trim();
        const year = match[3];

        console.log(`Parsed: day=${day}, month=${monthName}, year=${year}`);

        const monthNum = monthMap[monthName];
        if (monthNum) {
          const isoDate = `${year}-${monthNum}-${day}`;
          console.log(`Successfully converted to ISO: ${isoDate}`);
          return isoDate;
        } else {
          console.error(`Unknown month name: ${monthName}`);
        }
      } else {
        console.error(`Could not match pattern in: "${convertedDate}"`);
      }

      // Try alternative approach - use JavaScript Date parsing
      try {
        // Remove weekday and comma
        const dateWithoutWeekday = convertedDate.replace(
          /^[\u0600-\u06FF\s،]+/,
          ""
        );
        console.log(`Date without weekday: "${dateWithoutWeekday}"`);

        // Try to parse as Arabic date
        const parsedDate = new Date(dateWithoutWeekday);
        if (!isNaN(parsedDate.getTime())) {
          const isoDate = parsedDate.toISOString().split("T")[0];
          console.log(`Parsed via Date object: ${isoDate}`);
          return isoDate;
        }
      } catch (dateParseError) {
        console.error("Date parsing error:", dateParseError);
      }
    } catch (error) {
      console.error("Error in convertArabicToISO:", error);
    }

    console.warn(`Could not convert Arabic date to ISO: ${arabicDate}`);
    return "";
  };

  // Helper function to convert ISO date to Arabic display format
  const convertISOToArabic = (isoDate) => {
    if (!isoDate) return "";

    try {
      const date = new Date(isoDate + "T00:00:00");
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("ar-EG", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }
    } catch (error) {
      console.error("Error converting ISO to Arabic:", error);
    }

    return isoDate;
  };

  // Utility function to safely display date
  const getSafeDateDisplay = (date) => {
    if (!date) return "غير محدد";

    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      // ISO format
      try {
        return convertISOToArabic(date) || date;
      } catch (error) {
        return date;
      }
    }

    // Already in Arabic or some other format
    return date;
  };

  // Fetch calendar data
  const fetchCalendarData = async (month, year) => {
    setLoading(true);
    try {
      console.log(`Fetching calendar data for ${month}/${year}`);

      const response = await axios.get(`${backendUrl}/api/doctor/calendar`, {
        params: {
          month: month.toString(),
          year: year.toString(),
        },
        headers: { token: dToken },
      });

      console.log("Calendar API response:", response.data);

      if (response.data.success) {
        setCalendarData(response.data);

        // Convert date keys to ISO format for easier lookup
        if (response.data.appointmentsByDate) {
          const isoAppointmentsByDate = {};
          Object.keys(response.data.appointmentsByDate).forEach(
            (arabicDate) => {
              const isoDate = convertArabicToISO(arabicDate);
              if (isoDate) {
                isoAppointmentsByDate[isoDate] =
                  response.data.appointmentsByDate[arabicDate];
              }
            }
          );

          // Update calendarData with ISO dates
          setCalendarData((prev) => ({
            ...prev,
            appointmentsByDateISO: isoAppointmentsByDate,
          }));
        }

        setDebugInfo(`تم تحميل ${response.data.calendarDays?.length || 0} يوم`);
      } else {
        toast.error("فشل في تحميل بيانات التقويم");
      }
    } catch (error) {
      console.error("Calendar fetch error:", error);
      toast.error("فشل في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  // Fetch appointments for selected date - IMPROVED VERSION
  const fetchDateAppointments = async (date) => {
    setLoading(true);
    try {
      console.log(`Fetching appointments for date: "${date}"`);

      let queryDate = date;

      // Always convert to Arabic for backend query
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        // It's ISO format
        queryDate = convertISOToArabic(date);
        if (!queryDate) {
          // If conversion fails, try direct API call with ISO
          queryDate = date;
        }
      }

      console.log(`Querying backend with date: "${queryDate}"`);

      const response = await axios.get(
        `${backendUrl}/api/doctor/appointments/${encodeURIComponent(
          queryDate
        )}`,
        {
          headers: { token: dToken },
        }
      );

      console.log("Date appointments response:", response.data);

      if (response.data.success) {
        setAppointments(response.data.appointments || []);
        if (response.data.appointments?.length === 0) {
          toast.info(`لا توجد مواعيد في تاريخ ${getSafeDateDisplay(date)}`);
        } else {
          toast.success(`تم تحميل ${response.data.appointments.length} موعد`);
        }
      } else {
        toast.error("فشل في تحميل مواعيد اليوم: " + response.data.message);
      }
    } catch (error) {
      console.error("Date appointments fetch error:", error);

      // If error is 404, it might mean no appointments for that date
      if (error.response?.status === 404) {
        setAppointments([]);
        toast.info("لا توجد مواعيد في هذا التاريخ");
      } else {
        toast.error("فشل في تحميل المواعيد");
      }
    } finally {
      setLoading(false);
    }
  };

  // Refresh all data
  const refreshAllData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    console.log("Refreshing data for:", year, month);
    fetchCalendarData(month, year);

    if (selectedDate) {
      fetchDateAppointments(selectedDate);
    }
  };

  // Go to today - FIXED VERSION
  const goToToday = () => {
    const today = new Date();
    const todayISO = today.toISOString().split("T")[0];
    const todayArabic = today.toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    console.log("Going to today - ISO:", todayISO, "Arabic:", todayArabic);

    setCurrentDate(today);
    setSelectedDate(todayISO);

    // Fetch appointments for today
    fetchDateAppointments(todayISO);

    // Refresh calendar for current month
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    fetchCalendarData(month, year);
  };

  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    console.log("Component mounted/date changed:", year, month);
    fetchCalendarData(month, year);
  }, [currentDate, dToken]);

  useEffect(() => {
    if (selectedDate) {
      fetchDateAppointments(selectedDate);
    }
  }, [selectedDate, dToken]);

  const nextMonth = () => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1
    );
    console.log("Next month:", newDate);
    setCurrentDate(newDate);
  };

  const prevMonth = () => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    );
    console.log("Prev month:", newDate);
    setCurrentDate(newDate);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "قيد الانتظار";
      case "confirmed":
        return "مؤكد";
      case "completed":
        return "مكتمل";
      case "cancelled":
        return "ملغي";
      default:
        return status;
    }
  };

  // Add this new function for debugging and conversion
  const debugDateConversion = () => {
    console.log("=== DEBUG DATE CONVERSION ===");

    const testDates = [
      "الثلاثاء، ٦ يناير ٢٠٢٦",
      "الخميس، ١ يناير ٢٠٢٦",
      "الأربعاء، ١٥ يناير ٢٠٢٦",
      "2024-12-25",
    ];

    testDates.forEach((testDate, index) => {
      console.log(`\nTest ${index + 1}: "${testDate}"`);
      const isoResult = convertArabicToISO(testDate);
      console.log(`ISO Result: "${isoResult}"`);

      if (isoResult) {
        const backToArabic = convertISOToArabic(isoResult);
        console.log(`Back to Arabic: "${backToArabic}"`);
      }
    });
  };

  // Render month view - FIXED VERSION
  const renderMonthView = () => {
    if (!calendarData?.calendarDays) {
      return (
        <div className="text-center py-12 text-gray-500">
          <FiCalendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>جارٍ تحميل التقويم...</p>
        </div>
      );
    }

    // Calculate empty cells for the first day of the month
    const firstDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const firstDayIndex = firstDay.getDay();

    let startFrom = firstDayIndex;
    if (startFrom === 0) startFrom = 6;
    else startFrom = startFrom - 1;

    return (
      <div className="space-y-4">
        {/* Debug Info */}
        <div className="bg-gray-50 p-3 rounded-lg text-sm">
          <div className="flex items-center gap-2 text-blue-600">
            <FiInfo />
            <span>
              الشهر الحالي: {arabicMonths[currentDate.getMonth()]}{" "}
              {currentDate.getFullYear()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {arabicDays.map((day) => (
            <div
              key={day}
              className="text-center font-bold text-gray-600 py-2 border-b"
            >
              {day}
            </div>
          ))}

          {/* Empty cells */}
          {Array.from({ length: startFrom }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className="min-h-32 border border-transparent"
            ></div>
          ))}

          {/* Calendar days */}
          {calendarData.calendarDays.map((day) => {
            // Get appointments for this date (Arabic date from backend)
            const dayAppointments = day.appointments || [];

            // Convert the Arabic date to ISO for comparison with selectedDate
            const isoDate = convertArabicToISO(day.date);
            const isSelected = isoDate === selectedDate;

            // Check if today
            const today = new Date();
            const todayISO = today.toISOString().split("T")[0];
            const isToday = isoDate === todayISO;

            return (
              <motion.div
                key={day.date}
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  console.log("Clicked on date - Arabic:", day.date);

                  // Try to convert to ISO
                  const isoDate = convertArabicToISO(day.date);
                  console.log("Clicked on date - ISO:", isoDate);

                  if (isoDate) {
                    setSelectedDate(isoDate);
                    setView("day");
                    fetchDateAppointments(isoDate);
                  } else {
                    // If conversion fails, use the Arabic date directly
                    console.log("Using Arabic date directly:", day.date);
                    setSelectedDate(day.date);
                    setView("day");
                    fetchDateAppointments(day.date);
                  }
                }}
                className={`min-h-32 border rounded-lg p-2 cursor-pointer transition-all ${
                  isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                } ${day.isPast && !isToday ? "opacity-60" : ""} ${
                  isToday ? "border-2 border-green-500 bg-green-50" : ""
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span
                    className={`font-bold ${
                      isToday ? "text-green-600" : "text-gray-700"
                    }`}
                  >
                    {day.day}
                  </span>
                  {dayAppointments.length > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      {dayAppointments.length}
                    </span>
                  )}
                </div>

                {dayAppointments.slice(0, 3).map((apt, idx) => (
                  <div
                    key={idx}
                    className="text-xs mt-1 p-1 rounded truncate"
                    style={{
                      backgroundColor:
                        apt.status === "confirmed"
                          ? "#dbeafe"
                          : apt.status === "completed"
                          ? "#dcfce7"
                          : apt.status === "pending"
                          ? "#fef3c7"
                          : "#f3f4f6",
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {apt.time || "غير محدد"}
                      </span>
                      <span
                        className={`px-1 rounded text-xs ${getStatusColor(
                          apt.status
                        )}`}
                      >
                        {getStatusText(apt.status).charAt(0)}
                      </span>
                    </div>
                    <div className="text-xs truncate mt-1">
                      {typeof apt.service === "string"
                        ? apt.service
                        : apt.service?.title_ar || "خدمة"}
                    </div>
                  </div>
                ))}

                {dayAppointments.length > 3 && (
                  <div className="text-xs text-gray-500 mt-1 text-center">
                    +{dayAppointments.length - 3} مواعيد أخرى
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render day view - UPDATED VERSION
  const renderDayView = () => {
    let dayName = "";
    let dayNumber = "";
    let monthName = "";
    let displayDate = selectedDate;

    try {
      // Check if selectedDate is ISO or Arabic
      if (/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
        // It's ISO format
        const selectedDateObj = new Date(selectedDate + "T00:00:00");
        if (!isNaN(selectedDateObj.getTime())) {
          dayName = arabicDays[selectedDateObj.getDay()];
          dayNumber = selectedDateObj.getDate();
          monthName = arabicMonths[selectedDateObj.getMonth()];
          displayDate = convertISOToArabic(selectedDate) || selectedDate;
        }
      } else {
        // It's already in Arabic format
        displayDate = selectedDate;

        // Try to extract day number and month from Arabic string
        const match = selectedDate.match(/(\d{1,2})\s+(\S+)\s+(\d{4})/);
        if (match) {
          dayNumber = match[1];
          monthName = match[2];
        }

        // Try to get day name
        try {
          const isoFromArabic = convertArabicToISO(selectedDate);
          if (isoFromArabic) {
            const dateObj = new Date(isoFromArabic + "T00:00:00");
            dayName = arabicDays[dateObj.getDay()];
          }
        } catch (error) {
          console.error("Error getting day name:", error);
        }
      }
    } catch (error) {
      console.error("Error parsing selected date:", error);
      dayName = "غير معروف";
      dayNumber = "?";
      monthName = "?";
    }

    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl p-4 shadow">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                {dayName ? `${dayName}، ` : ""}
                {dayNumber} {monthName}
              </h3>
              <p className="text-sm text-gray-500">{displayDate}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setView("month")}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                العودة للتقويم
              </button>
              <button
                onClick={() => fetchDateAppointments(selectedDate)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                تحديث
              </button>
            </div>
          </div>

          {appointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FiCalendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h4 className="text-lg font-bold text-gray-600 mb-2">
                لا توجد مواعيد في هذا اليوم
              </h4>
              <p className="text-gray-500 mb-4">تاريخ اليوم: {displayDate}</p>
              <button
                onClick={() => setView("month")}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                عرض التقويم
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">
                  {appointments.length} موعد
                </span>
                <span className="text-sm text-gray-600">
                  تم التحميل: {new Date().toLocaleTimeString("ar-EG")}
                </span>
              </div>

              {appointments.map((apt) => (
                <motion.div
                  key={apt._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            apt.status === "confirmed"
                              ? "bg-blue-500"
                              : apt.status === "completed"
                              ? "bg-green-500"
                              : apt.status === "pending"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                        ></div>
                        <h4 className="font-bold text-gray-800">{apt.name}</h4>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                            apt.status
                          )}`}
                        >
                          {getStatusText(apt.status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <FiClock className="text-blue-500" />
                          <span>{apt.time || "غير محدد"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiUsers className="text-green-500" />
                          <span>
                            {typeof apt.service === "object"
                              ? apt.service?.title_ar ||
                                apt.service?.title ||
                                "خدمة"
                              : apt.service || "خدمة"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-orange-500">📞</span>
                          <span>{apt.phone || "لا يوجد"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-purple-500">💰</span>
                          <span>{apt.amount || 0} جنيه</span>
                        </div>
                      </div>

                      {apt.message && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{apt.message}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      {apt.status === "confirmed" && (
                        <button
                          onClick={() => handleCompleteAppointment(apt._id)}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                        >
                          <FiCheckCircle />
                          إكمال
                        </button>
                      )}
                      {apt.status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleStatusUpdate(apt._id, "confirmed")
                            }
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            تأكيد
                          </button>
                          <button
                            onClick={() =>
                              handleStatusUpdate(apt._id, "cancelled")
                            }
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            إلغاء
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleCompleteAppointment = async (appointmentId) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/doctor/appointments/${appointmentId}/status`,
        { status: "completed" },
        { headers: { token: dToken } }
      );

      if (response.data.success) {
        toast.success("تم إكمال الموعد بنجاح");
        // Refresh data
        fetchDateAppointments(selectedDate);
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        fetchCalendarData(month, year);
      }
    } catch (error) {
      toast.error("فشل في تحديث حالة الموعد");
      console.error("Status update error:", error);
    }
  };

  const handleStatusUpdate = async (appointmentId, status) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/doctor/appointments/${appointmentId}/status`,
        { status },
        { headers: { token: dToken } }
      );

      if (response.data.success) {
        toast.success(`تم تحديث حالة الموعد إلى ${getStatusText(status)}`);
        // Refresh data
        fetchDateAppointments(selectedDate);
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        fetchCalendarData(month, year);
      }
    } catch (error) {
      toast.error("فشل في تحديث حالة الموعد");
      console.error("Status update error:", error);
    }
  };

  if (loading && !calendarData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="text-gray-600">جارٍ تحميل التقويم...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">تقويم المواعيد</h1>
            <p className="text-gray-600">عرض وإدارة مواعيد المرضى</p>
            {debugInfo && (
              <p className="text-sm text-gray-500 mt-1">{debugInfo}</p>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              اليوم
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <FiChevronRight className="w-5 h-5" />
              </button>

              <span className="text-lg font-bold text-gray-800">
                {arabicMonths[currentDate.getMonth()]}{" "}
                {currentDate.getFullYear()}
              </span>

              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
            </div>

            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setView("month")}
                className={`px-4 py-2 rounded ${
                  view === "month" ? "bg-white shadow" : ""
                }`}
              >
                الشهر
              </button>
              <button
                onClick={() => setView("day")}
                className={`px-4 py-2 rounded ${
                  view === "day" ? "bg-white shadow" : ""
                }`}
              >
                اليوم
              </button>
            </div>

            <button
              onClick={refreshAllData}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <FiRefreshCw />
              تحديث
            </button>
          </div>
        </div>

        {/* Stats */}
        {calendarData?.monthlyStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="text-2xl font-bold text-blue-600">
                {calendarData.monthlyStats.total || 0}
              </div>
              <div className="text-sm text-blue-800">إجمالي المواعيد</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <div className="text-2xl font-bold text-yellow-600">
                {calendarData.monthlyStats.pending || 0}
              </div>
              <div className="text-sm text-yellow-800">قيد الانتظار</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="text-2xl font-bold text-green-600">
                {calendarData.monthlyStats.completed || 0}
              </div>
              <div className="text-sm text-green-800">مكتملة</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <div className="text-2xl font-bold text-purple-600">
                {calendarData.monthlyStats.confirmed || 0}
              </div>
              <div className="text-sm text-purple-800">مؤكدة</div>
            </div>
          </div>
        )}
      </div>

      {/* Calendar View */}
      <div className="bg-white rounded-xl p-6 shadow">
        {view === "month" ? renderMonthView() : renderDayView()}
      </div>
    </div>
  );
};

export default DoctorCalendar;
