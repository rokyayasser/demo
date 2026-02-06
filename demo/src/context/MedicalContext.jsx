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

      // Check different possible response structures
      if (response.data.success) {
        // Try multiple possible response structures
        const services =
          response.data.data || response.data.services || response.data || [];
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

      if (response.data.success) {
        return response.data.service || response.data.data || response.data;
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
          response.data.data || response.data.services || response.data || []
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
