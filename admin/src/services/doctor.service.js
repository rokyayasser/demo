import api from "./api.config";

class DoctorService {
  // ==================== AUTH ====================
  async login(email, password) {
    const { data } = await api.post("/doctor/login", { email, password });
    if (!data.success) throw new Error(data.message);
    return data.data;
  }

  // ==================== APPOINTMENTS ====================
  async getAppointments(filters = {}) {
    const { data } = await api.get("/doctor/appointments", { params: filters });
    if (!data.success) throw new Error(data.message);
    return data.data;
  }

  async getTodayAppointments() {
    const { data } = await api.get("/doctor/appointments/today");
    if (!data.success) throw new Error(data.message);
    return data.data;
  }

  async getAppointmentDetails(appointmentId) {
    const { data } = await api.get(
      `/doctor/appointments/${appointmentId}/details`,
    );
    if (!data.success) throw new Error(data.message);
    return data.data;
  }

  async getAppointmentsByDate(date) {
    const { data } = await api.get(
      `/doctor/appointments/date/${encodeURIComponent(date)}`,
    );
    if (!data.success) throw new Error(data.message);
    return data.data;
  }

  async updateAppointmentStatus(appointmentId, status, notes = "") {
    const { data } = await api.put(
      `/doctor/appointments/${appointmentId}/status`,
      {
        status,
        doctorNotes: notes,
      },
    );
    if (!data.success) throw new Error(data.message);
    return data.data;
  }

  // ==================== CALENDAR ====================
  async getCalendarView(month, year) {
    const { data } = await api.get("/doctor/calendar", {
      params: { month, year },
    });
    if (!data.success) throw new Error(data.message);
    return data.data;
  }

  // ==================== STATISTICS ====================
  async getDoctorStats() {
    const { data } = await api.get("/doctor/stats");
    if (!data.success) throw new Error(data.message);
    return data.data;
  }

  // ==================== FILE DOWNLOAD ====================
  async downloadFile(fileUrl, fileName) {
    const response = await api.get("/doctor/download-file", {
      params: { fileUrl, fileName },
      responseType: "blob",
    });
    return response.data;
  }
}

export default new DoctorService();
