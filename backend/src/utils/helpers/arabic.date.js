// Helper functions for Arabic date manipulation

class ArabicDateHelper {
  constructor() {
    this.monthsArabic = [
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

    this.weekdaysArabic = [
      "الأحد",
      "الاثنين",
      "الثلاثاء",
      "الأربعاء",
      "الخميس",
      "الجمعة",
      "السبت",
    ];

    this.monthsArabicShort = [
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

    this.arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  }

  // Convert English numerals to Arabic
  toArabicNumerals(number) {
    return number
      .toString()
      .replace(/\d/g, (digit) => this.arabicNumerals[digit]);
  }

  // Convert Arabic numerals to English
  toEnglishNumerals(arabicNumber) {
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

    return arabicNumber
      .toString()
      .split("")
      .map((char) => arabicToEnglish[char] || char)
      .join("");
  }

  // Format date to Arabic string
  formatToArabicDate(date) {
    const day = date.getDate();
    const month = this.monthsArabic[date.getMonth()];
    const year = date.getFullYear();
    const weekday = this.weekdaysArabic[date.getDay()];

    return `${weekday}، ${this.toArabicNumerals(day)} ${month} ${this.toArabicNumerals(year)}`;
  }

  // Format date to short Arabic string
  formatToShortArabicDate(date) {
    const day = date.getDate();
    const month = this.monthsArabicShort[date.getMonth()];
    const year = date.getFullYear();

    return `${this.toArabicNumerals(day)} ${month} ${this.toArabicNumerals(year)}`;
  }

  // Parse Arabic date string to Date object
  parseArabicDate(arabicDateString) {
    try {
      // Clean the string
      let cleanString = arabicDateString.trim();

      // Remove weekday if present
      this.weekdaysArabic.forEach((weekday) => {
        if (cleanString.startsWith(weekday)) {
          cleanString = cleanString.replace(weekday, "").trim();
          // Remove comma if present
          if (cleanString.startsWith("،")) {
            cleanString = cleanString.substring(1).trim();
          }
        }
      });

      // Convert Arabic numerals to English
      cleanString = this.toEnglishNumerals(cleanString);

      // Extract day, month, and year
      const parts = cleanString.split(" ");
      if (parts.length < 3) {
        throw new Error("Invalid Arabic date format");
      }

      const day = parseInt(parts[0], 10);
      const monthName = parts[1];
      const year = parseInt(parts[2], 10);

      // Find month index
      const monthIndex = this.monthsArabic.findIndex(
        (month) => month.toLowerCase() === monthName.toLowerCase()
      );

      if (monthIndex === -1) {
        // Try short month names
        const shortMonthIndex = this.monthsArabicShort.findIndex(
          (month) => month.toLowerCase() === monthName.toLowerCase()
        );
        if (shortMonthIndex === -1) {
          throw new Error("Invalid month name");
        }
        return new Date(year, shortMonthIndex, day);
      }

      return new Date(year, monthIndex, day);
    } catch (error) {
      console.error("Parse Arabic Date Error:", error);
      return null;
    }
  }

  // Get current date in Arabic format
  getCurrentArabicDate() {
    return this.formatToArabicDate(new Date());
  }

  // Add days to an Arabic date
  addDaysToArabicDate(arabicDateString, days) {
    const date = this.parseArabicDate(arabicDateString);
    if (!date) return null;

    date.setDate(date.getDate() + days);
    return this.formatToArabicDate(date);
  }

  // Check if date is in the past
  isPastDate(arabicDateString) {
    const date = this.parseArabicDate(arabicDateString);
    if (!date) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    return date < today;
  }

  // Check if date is today
  isToday(arabicDateString) {
    const date = this.parseArabicDate(arabicDateString);
    if (!date) return false;

    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  // Compare two Arabic dates
  compareArabicDates(date1, date2) {
    const d1 = this.parseArabicDate(date1);
    const d2 = this.parseArabicDate(date2);

    if (!d1 || !d2) return 0;

    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);

    if (d1 < d2) return -1;
    if (d1 > d2) return 1;
    return 0;
  }

  // Get date range in Arabic
  getDateRangeInArabic(startDate, endDate) {
    const start = this.parseArabicDate(startDate);
    const end = this.parseArabicDate(endDate);

    if (!start || !end) return null;

    if (start.getTime() === end.getTime()) {
      return this.formatToArabicDate(start);
    }

    return `${this.formatToShortArabicDate(start)} - ${this.formatToShortArabicDate(end)}`;
  }

  // Format time to Arabic
  formatTimeToArabic(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? "م" : "ص";
    const formattedHours = hours % 12 || 12;

    return `${this.toArabicNumerals(formattedHours)}:${this.toArabicNumerals(minutes.toString().padStart(2, "0"))} ${period}`;
  }

  // Parse Arabic time
  parseArabicTime(arabicTime) {
    try {
      // Convert Arabic numerals to English
      const englishTime = this.toEnglishNumerals(arabicTime);

      const [timePart, period] = englishTime.split(" ");
      const [hours, minutes] = timePart.split(":").map(Number);

      let hour = hours;
      if (period === "م" || period === "pm" || period === "PM") {
        if (hour < 12) hour += 12;
      } else if (period === "ص" || period === "am" || period === "AM") {
        if (hour === 12) hour = 0;
      }

      return { hour, minute: minutes || 0 };
    } catch (error) {
      console.error("Parse Arabic Time Error:", error);
      return null;
    }
  }
}

module.exports = new ArabicDateHelper();
