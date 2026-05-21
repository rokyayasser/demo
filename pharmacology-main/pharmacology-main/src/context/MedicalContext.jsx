/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import api from "../api/axios.config";
import { AppContext } from "./AppContext";

export const MedicalContext = createContext();

const MedicalContextProvider = ({ children }) => {
  const { backendUrl } = useContext(AppContext);
  const [Medicalservices, setMedicalservices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const currencySymbol = "جنيه";

  // Prevent double-fetch in React StrictMode
  const fetchingRef = useRef(false);
  const fetchedRef = useRef(false);

  const getMedicalServices = useCallback(async (force = false) => {
    // Skip if already fetching or already fetched (unless forced refresh)
    if (fetchingRef.current) return;
    if (fetchedRef.current && !force) return;

    fetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const response = await api.get("/api/v1/appointments/medical-services", {
        params: { limit: 50 }, // get all services
      });

      if (response.data.success) {
        const raw = response.data.data;
        // Handle both paginated { data: [...] } and flat array responses
        const services = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
            ? raw.data
            : [];
        setMedicalservices(services);
        fetchedRef.current = true;
      } else {
        setMedicalservices([]);
      }
    } catch (err) {
      // Silently handle SSL/network errors — the UI shows empty state, no toast
      const isNetworkOrSSL =
        !err.response ||
        err.code === "ERR_NETWORK" ||
        err.code === "ECONNABORTED" ||
        /ssl|tls|network/i.test(err.message || "");

      if (!isNetworkOrSSL) {
        console.error("MedicalContext: failed to fetch services:", err.message);
      }
      setError(err.message);
      setMedicalservices([]);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  const getServiceById = useCallback(async (serviceId) => {
    try {
      const response = await api.get(
        `/api/v1/appointments/medical-services/${serviceId}`,
      );
      if (response.data.success) {
        return response.data.data?.service || response.data.data || null;
      }
      return null;
    } catch (err) {
      console.error("MedicalContext: failed to fetch service:", err.message);
      return null;
    }
  }, []);

  /** Force a fresh fetch (e.g. after admin adds a service) */
  const refreshServices = useCallback(() => {
    fetchedRef.current = false;
    getMedicalServices(true);
  }, [getMedicalServices]);

  // Fetch on mount — deferred 150ms so the server has time to warm up
  useEffect(() => {
    const t = setTimeout(() => getMedicalServices(), 150);
    return () => clearTimeout(t);
  }, [getMedicalServices]);

  return (
    <MedicalContext.Provider
      value={{
        Medicalservices,
        backendUrl,
        currencySymbol,
        loading,
        error,
        getMedicalServices,
        getServiceById,
        refreshServices,
      }}
    >
      {children}
    </MedicalContext.Provider>
  );
};

export default MedicalContextProvider;
