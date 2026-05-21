/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import api from "../api/axios.config";

export const CourseContext = createContext(null);

const CourseContextProvider = ({ children }) => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const fetchedRef = useRef(false);
  const fetchingRef = useRef(false);

  const extractArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.data?.data)) return data.data.data; // ← { data:{ data:[...] } }
    if (Array.isArray(data.data?.courses)) return data.data.courses;
    if (Array.isArray(data.courses)) return data.courses;
    return [];
  };

  // ── All useCallback definitions FIRST ──────────────────────────────────────

  const getAllCourses = useCallback(async (force = false) => {
    if (fetchingRef.current) return;
    if (fetchedRef.current && !force) return;
    fetchingRef.current = true;
    setIsLoading(true);
    try {
      const res = await api.get("/api/v1/courses");
      setCourses(extractArray(res.data));
      fetchedRef.current = true;
    } catch (err) {
      const isNetwork =
        !err.response || /network|ssl|tls/i.test(err.message || "");
      if (!isNetwork) console.error("getAllCourses:", err.message);
      setCourses([]);
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  const getCourseById = useCallback(async (id) => {
    try {
      const { data } = await api.get(`/api/v1/courses/${id}`);
      if (data.success) return data.data?.course || data.course || null;
      return null;
    } catch (err) {
      console.error("getCourseById:", err.message);
      return null;
    }
  }, []);

  const checkEnrollment = useCallback(async (courseId) => {
    try {
      const { data } = await api.get("/api/v1/courses/user/enrolled");
      if (data.success) {
        const list = extractArray(data.data?.courses || data.data);
        return list.some((c) => (c._id || c.courseId) === courseId);
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  // ── useEffect AFTER all useCallback definitions ───────────────────────────
  // Auto-fetch on mount — data available everywhere without per-component calls
  useEffect(() => {
    const t = setTimeout(() => getAllCourses(), 200);
    return () => clearTimeout(t);
  }, [getAllCourses]);

  return (
    <CourseContext.Provider
      value={{
        courses,
        isLoading,
        getAllCourses,
        getCourseById,
        checkEnrollment,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};

export { CourseContextProvider as CourseProvider };
export default CourseContextProvider;
