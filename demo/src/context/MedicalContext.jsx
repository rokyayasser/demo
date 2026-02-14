/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const MedicalContext = createContext();

const MedicalContextProvider = (props) => {
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
  const [Medicalservices, setMedicalservices] = useState([]);
  const [loading, setLoading] = useState(true);
  const currencySymbol = "جنيه";

  // Fetch medical services from backend
  const getMedicalServices = async () => {
    try {
      console.log(
        "Fetching medical services from:",
        `${backendUrl}/api/v1/appointments/medical-services`
      );
      const response = await axios.get(
        `${backendUrl}/api/v1/appointments/medical-services`
      );

      console.log("Medical services response:", response.data);

      if (response.data.success) {
        // FIX: BaseController wraps in data, and paginatedResponse puts array in data.data
        // API returns: { success: true, data: { data: [...services], pagination: {...} } }
        // OR for simple success: { success: true, data: [...services] }
        const services =
          response.data.data?.data || // paginatedResponse structure
          response.data.data || // simple success structure
          response.data.services ||
          [];
        console.log("Extracted services:", services);
        setMedicalservices(Array.isArray(services) ? services : []);
      } else {
        toast.error(response.data.message || "فشل في تحميل الخدمات");
        setMedicalservices([]);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      console.error("Error response:", error.response?.data);
      toast.error("حدث خطأ أثناء تحميل الخدمات");
      setMedicalservices([]);
    }
  };

  // Get service by ID
  const getServiceById = async (serviceId) => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/v1/appointments/medical-services/${serviceId}`
      );

      console.log("getServiceById raw response:", response.data);

      if (response.data.success) {
        // FIX: BaseController.success(res, { service }, ...) produces:
        // { success: true, data: { service: {...} } }
        // axios wraps it so response.data = { success: true, data: { service: {...} } }
        // Therefore we need response.data.data.service
        const service =
          response.data.data?.service || // ✅ correct path
          response.data.service || // fallback
          response.data.data; // last resort

        console.log("Extracted service:", service);
        return service;
      } else {
        toast.error(response.data.message || "فشل في تحميل الخدمة");
        return null;
      }
    } catch (error) {
      console.error("Error fetching service:", error);
      toast.error("حدث خطأ أثناء تحميل الخدمة");
      return null;
    }
  };

  // Get services by category
  const getServicesByCategory = async (category) => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/v1/appointments/medical-services/category/${category}`
      );

      if (response.data.success) {
        return (
          response.data.data?.data ||
          response.data.data ||
          response.data.services ||
          []
        );
      } else {
        toast.error(response.data.message || "فشل في تحميل الخدمات");
        return [];
      }
    } catch (error) {
      console.error("Error fetching services by category:", error);
      return [];
    }
  };

  // Manual refresh function
  const refreshServices = async () => {
    setLoading(true);
    await getMedicalServices();
    setLoading(false);
  };

  useEffect(() => {
    const initialFetch = async () => {
      setLoading(true);
      await getMedicalServices();
      setLoading(false);
    };
    initialFetch();
  }, []);

  const value = {
    Medicalservices: Medicalservices || [],
    backendUrl,
    currencySymbol,
    loading,
    getMedicalServices,
    getServiceById,
    getServicesByCategory,
    refreshServices,
  };

  return (
    <MedicalContext.Provider value={value}>
      {props.children}
    </MedicalContext.Provider>
  );
};

export default MedicalContextProvider;
