import api from "./api.config";

class AdminService {
  // ==================== AUTH ====================
  async login(email, password) {
    const { data } = await api.post("/admin/login", { email, password });
    if (!data.success) throw new Error(data.message);
    return data.data;
  }

  // ==================== SERVICES ====================
  async getServices(params = {}) {
    const { data } = await api.get("/admin/services", { params });
    if (!data.success) throw new Error(data.message);
    return data.data;
  }

  async getServiceById(serviceId) {
    const { data } = await api.get(`/admin/services/${serviceId}`);
    if (!data.success) throw new Error(data.message);
    return data.data;
  }

  async addService(formData) {
    const { data } = await api.post("/admin/services", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (!data.success) throw new Error(data.message);
    return data.data;
  }

  async updateService(serviceId, formData) {
    const { data } = await api.put(`/admin/services/${serviceId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (!data.success) throw new Error(data.message);
    return data.data;
  }

  async deleteService(serviceId) {
    const { data } = await api.delete(`/admin/services/${serviceId}`);
    if (!data.success) throw new Error(data.message);
    return data.data;
  }

  async toggleAvailability(serviceId) {
    const { data } = await api.post("/admin/services/availability", {
      serviceId,
    });
    if (!data.success) throw new Error(data.message);
    return data.data;
  }

  async getServicesByCategory(category) {
    const { data } = await api.get(`/admin/services/category/${category}`);
    if (!data.success) throw new Error(data.message);
    return data.data;
  }

  // ==================== APPOINTMENTS ====================
  async getAppointments(filters = {}) {
    const { data } = await api.get("/admin/appointments", { params: filters });
    if (!data.success) throw new Error(data.message);
    return data.data;
  }

  async updateAppointmentStatus(appointmentId, status, sendEmail = true) {
    const { data } = await api.post("/admin/appointments/status", {
      appointmentId,
      status,
      sendEmail,
    });
    if (!data.success) throw new Error(data.message);
    return data.data;
  }

  // ==================== SLOTS ====================
  async blockTimeSlot(date, time, reason = "") {
    const { data } = await api.post("/admin/slots/block", {
      date,
      time,
      reason,
    });
    if (!data.success) throw new Error(data.message);
    return data.data;
  }

  async blockTimeSlotRange(rangeData) {
    const { data } = await api.post("/admin/slots/block-range", rangeData);
    if (!data.success) throw new Error(data.message);
    return data.data;
  }

  async unblockTimeSlot(slotId) {
    const { data } = await api.delete(`/admin/slots/unblock/${slotId}`);
    if (!data.success) throw new Error(data.message);
    return data.data;
  }

  async getBlockedSlots(date = null) {
    const { data } = await api.get("/admin/slots/blocked", {
      params: { date },
    });
    if (!data.success) throw new Error(data.message);
    return data.data;
  }

  // ==================== STATISTICS ====================
  async getDashboardStats() {
    const { data } = await api.get("/admin/dashboard/stats");
    if (!data.success) throw new Error(data.message);
    return data.data;
  }
}

export default new AdminService();
