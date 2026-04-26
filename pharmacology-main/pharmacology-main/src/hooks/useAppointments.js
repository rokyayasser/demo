import { useState, useCallback } from "react";
import { appointmentApi } from "../api/appointment.api";
import { toast } from "react-toastify";

export const useAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await appointmentApi.getUserAppointments();
      if (response.success) {
        setAppointments(response.appointments);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error loading appointments:", error);
      toast.error("حدث خطأ في تحميل المواعيد");
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelAppointment = useCallback(
    async (appointmentId) => {
      try {
        const response = await appointmentApi.cancelAppointment(appointmentId);
        if (response.success) {
          toast.success("تم إلغاء الموعد بنجاح");
          await loadAppointments();
          return true;
        } else {
          toast.error(response.message);
          return false;
        }
      } catch (error) {
        console.error("Error cancelling appointment:", error);
        toast.error("حدث خطأ أثناء الإلغاء");
        return false;
      }
    },
    [loadAppointments]
  );

  return {
    appointments,
    loading,
    loadAppointments,
    cancelAppointment,
  };
};
