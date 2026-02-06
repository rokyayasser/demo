const BaseController = require("../BaseController");
const Appointment = require("../../models/Appointment");
const { dateFormatter } = require("../../utils/helpers/date.formatter");

class DoctorDashboardController extends BaseController {
  constructor() {
    super();
    this.getDoctorStats = this.getDoctorStats.bind(this);
    this.getCalendarView = this.getCalendarView.bind(this);
  }

  async getDoctorStats(req, res) {
    try {
      const allAppointments = await Appointment.find({})
        .populate("serviceId", "title title_ar fees")
        .lean();

      // Get today's Arabic date
      const today = new Date();
      const todayArabicDate = dateFormatter.toArabicDateString(today);

      // Simple counts
      const totalAppointments = allAppointments.length;
      const todayAppointments = allAppointments.filter(
        (appt) => appt.date === todayArabicDate
      ).length;

      // Count by status
      const pendingAppointments = allAppointments.filter(
        (appt) => appt.status === "pending"
      ).length;
      const confirmedAppointments = allAppointments.filter(
        (appt) => appt.status === "confirmed"
      ).length;
      const completedAppointments = allAppointments.filter(
        (appt) => appt.status === "completed"
      ).length;

      // Calculate revenue
      let totalRevenue = 0;
      allAppointments.forEach((appt) => {
        if (appt.paid) {
          if (appt.amount && appt.amount > 0) {
            totalRevenue += appt.amount;
          } else if (
            appt.serviceId &&
            appt.serviceId.fees &&
            appt.serviceId.fees > 0
          ) {
            totalRevenue += appt.serviceId.fees;
          }
        }
      });

      // Get dates for week and month calculations
      const now = new Date();
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date(now);
      monthAgo.setDate(monthAgo.getDate() - 30);

      // Helper function to parse Arabic date
      const parseArabicDate = (arabicDate) => {
        if (!arabicDate) return null;
        try {
          return dateFormatter.arabicToDate(arabicDate);
        } catch (error) {
          return null;
        }
      };

      // Count appointments for week and month
      let weekAppointments = 0;
      let monthAppointments = 0;

      allAppointments.forEach((appt) => {
        const apptDate = parseArabicDate(appt.date);
        if (apptDate) {
          if (apptDate >= monthAgo) {
            monthAppointments++;
            if (apptDate >= weekAgo) {
              weekAppointments++;
            }
          }
        }
      });

      // Calculate completion rate
      const completionRate =
        totalAppointments > 0
          ? ((completedAppointments / totalAppointments) * 100).toFixed(1)
          : "0.0";

      // Calculate average daily
      const averageDaily =
        totalAppointments > 0 ? (totalAppointments / 30).toFixed(1) : "0.0";

      const statsData = {
        totalAppointments,
        todayAppointments,
        weekAppointments,
        monthAppointments,
        completedAppointments,
        pendingAppointments,
        confirmedAppointments,
        totalRevenue,
        averageDaily,
        completionRate,
      };

      return this.success(
        res,
        {
          stats: statsData,
          lastUpdated: new Date().toISOString(),
        },
        "Doctor statistics retrieved"
      );
    } catch (error) {
      console.error("Get Doctor Stats Error:", error);
      return this.error(res, error.message);
    }
  }

  async getCalendarView(req, res) {
    try {
      const { month, year } = req.query;

      const currentDate = new Date();
      const targetMonth = month ? parseInt(month) - 1 : currentDate.getMonth();
      const targetYear = year ? parseInt(year) : currentDate.getFullYear();

      // Generate all days in the month
      const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
      const calendarDays = [];

      // Get ALL appointments
      const allAppointments = await Appointment.find({
        status: { $nin: ["cancelled"] },
      })
        .select("date time status serviceId")
        .populate("serviceId", "title_ar category")
        .lean();

      // Group appointments by date
      const appointmentsByDate = {};
      allAppointments.forEach((appt) => {
        if (!appointmentsByDate[appt.date]) {
          appointmentsByDate[appt.date] = [];
        }
        appointmentsByDate[appt.date].push({
          time: appt.time,
          status: appt.status,
          service: appt.serviceId?.title_ar || "خدمة",
          category: appt.serviceId?.category || "عام",
        });
      });

      // Generate calendar days
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(targetYear, targetMonth, day);
        const arabicDate = dateFormatter.toArabicDateString(date);

        const dayAppointments = appointmentsByDate[arabicDate] || [];

        calendarDays.push({
          date: arabicDate,
          day: day,
          dayOfWeek: date.getDay(),
          appointments: dayAppointments,
          totalAppointments: dayAppointments.length,
          statusCounts: {
            pending: dayAppointments.filter((a) => a.status === "pending")
              .length,
            confirmed: dayAppointments.filter((a) => a.status === "confirmed")
              .length,
            completed: dayAppointments.filter((a) => a.status === "completed")
              .length,
          },
          isToday: date.toDateString() === new Date().toDateString(),
          isPast: date < new Date().setHours(0, 0, 0, 0),
        });
      }

      // Calculate monthly stats
      const monthlyStats = {
        total: allAppointments.length,
        pending: allAppointments.filter((a) => a.status === "pending").length,
        confirmed: allAppointments.filter((a) => a.status === "confirmed")
          .length,
        completed: allAppointments.filter((a) => a.status === "completed")
          .length,
        daysWithAppointments: Object.keys(appointmentsByDate).length,
      };

      return this.success(
        res,
        {
          month: targetMonth + 1,
          year: targetYear,
          calendarDays,
          monthlyStats,
          appointmentsByDate,
        },
        "Calendar view retrieved"
      );
    } catch (error) {
      console.error("Get Calendar View Error:", error);
      return this.error(res, error.message);
    }
  }
}

module.exports = new DoctorDashboardController();
