const arabicDateHelper = require("./arabic.date");

class DateFormatter {
  // Format date to Arabic string with weekday
  toArabicDateString(date) {
    return arabicDateHelper.formatToArabicDate(date);
  }

  // Format date to short Arabic string
  toShortArabicDateString(date) {
    return arabicDateHelper.formatToShortArabicDate(date);
  }

  // Parse Arabic date string to Date object
  arabicToDate(arabicDateString) {
    return arabicDateHelper.parseArabicDate(arabicDateString);
  }

  // Convert ISO date string to Arabic date string
  isoToArabic(isoDateString) {
    try {
      const date = new Date(isoDateString);
      if (isNaN(date.getTime())) {
        return null;
      }
      return this.toArabicDateString(date);
    } catch (error) {
      console.error("ISO to Arabic Error:", error);
      return null;
    }
  }

  // Convert Arabic date string to ISO string
  arabicToISO(arabicDateString) {
    const date = this.arabicToDate(arabicDateString);
    if (!date) return null;

    return date.toISOString().split("T")[0]; // Returns YYYY-MM-DD
  }

  // Format time to Arabic
  formatTime(date) {
    return arabicDateHelper.formatTimeToArabic(date);
  }

  // Parse Arabic time
  parseArabicTime(arabicTime) {
    return arabicDateHelper.parseArabicTime(arabicTime);
  }

  // Get today in Arabic
  getTodayArabic() {
    return arabicDateHelper.getCurrentArabicDate();
  }

  // Get tomorrow in Arabic
  getTomorrowArabic() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return this.toArabicDateString(tomorrow);
  }

  // Get yesterday in Arabic
  getYesterdayArabic() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return this.toArabicDateString(yesterday);
  }

  // Add days to Arabic date
  addDaysToArabic(arabicDateString, days) {
    return arabicDateHelper.addDaysToArabicDate(arabicDateString, days);
  }

  // Check if Arabic date is in the past
  isArabicDatePast(arabicDateString) {
    return arabicDateHelper.isPastDate(arabicDateString);
  }

  // Check if Arabic date is today
  isArabicDateToday(arabicDateString) {
    return arabicDateHelper.isToday(arabicDateString);
  }

  // Compare two Arabic dates
  compareArabicDates(date1, date2) {
    return arabicDateHelper.compareArabicDates(date1, date2);
  }

  // Get date range in Arabic
  getArabicDateRange(startDate, endDate) {
    return arabicDateHelper.getDateRangeInArabic(startDate, endDate);
  }

  // Generate array of dates in Arabic
  generateDateRangeInArabic(startDate, endDate) {
    const start = this.arabicToDate(startDate);
    const end = this.arabicToDate(endDate);

    if (!start || !end) return [];

    const dates = [];
    const current = new Date(start);

    while (current <= end) {
      dates.push(this.toArabicDateString(new Date(current)));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }

  // Format for display in forms
  formatForInput(arabicDateString) {
    const date = this.arabicToDate(arabicDateString);
    if (!date) return null;

    return date.toISOString().split("T")[0]; // YYYY-MM-DD format for HTML date input
  }

  // Get month name in Arabic
  getMonthNameArabic(monthIndex) {
    return arabicDateHelper.monthsArabic[monthIndex] || "";
  }

  // Get weekday name in Arabic
  getWeekdayNameArabic(weekdayIndex) {
    return arabicDateHelper.weekdaysArabic[weekdayIndex] || "";
  }

  // Validate Arabic date format
  isValidArabicDate(arabicDateString) {
    return this.arabicToDate(arabicDateString) !== null;
  }

  // Extract components from Arabic date
  extractDateComponents(arabicDateString) {
    const date = this.arabicToDate(arabicDateString);
    if (!date) return null;

    return {
      day: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      weekday: date.getDay(),
      arabic: {
        day: arabicDateHelper.toArabicNumerals(date.getDate()),
        month: this.getMonthNameArabic(date.getMonth()),
        year: arabicDateHelper.toArabicNumerals(date.getFullYear()),
        weekday: this.getWeekdayNameArabic(date.getDay()),
      },
    };
  }

  // Get start and end of week in Arabic
  getWeekRangeArabic(date = new Date()) {
    const current = new Date(date);
    const day = current.getDay();

    // Start of week (Sunday)
    const start = new Date(current);
    start.setDate(current.getDate() - day);

    // End of week (Saturday)
    const end = new Date(current);
    end.setDate(current.getDate() + (6 - day));

    return {
      start: this.toArabicDateString(start),
      end: this.toArabicDateString(end),
      startDate: start,
      endDate: end,
    };
  }

  // Get start and end of month in Arabic
  getMonthRangeArabic(date = new Date()) {
    const year = date.getFullYear();
    const month = date.getMonth();

    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);

    return {
      start: this.toArabicDateString(start),
      end: this.toArabicDateString(end),
      startDate: start,
      endDate: end,
    };
  }
}

module.exports = new DateFormatter();
