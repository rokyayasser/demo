/* eslint-disable no-unused-vars */
import api from "./axios.config";

export const courseApi = {
  // Get all courses
  getAllCourses: async (filters = {}) => {
    try {
      const response = await api.get("/api/v1/courses", { params: filters });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "فشل في تحميل الكورسات",
      };
    }
  },

  // Get course by ID
  getCourseById: async (courseId) => {
    try {
      const response = await api.get(`/api/v1/courses/${courseId}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "فشل في تحميل الكورس",
      };
    }
  },

  // Get enrolled courses (protected)
  getEnrolledCourses: async () => {
    try {
      const response = await api.get("/api/v1/courses/user/enrolled");
      return response.data;
    } catch (error) {
      return { success: false, courses: [] };
    }
  },

  // Enroll in a course (protected)
  enrollCourse: async (courseId) => {
    try {
      const response = await api.post("/api/v1/courses/enroll", { courseId });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "فشل الاشتراك",
      };
    }
  },

  // Update course progress (protected)
  updateProgress: async (courseId, progress, completedLesson) => {
    try {
      const response = await api.put("/api/v1/courses/progress", {
        courseId,
        progress,
        completedLesson,
      });
      return response.data;
    } catch (error) {
      return { success: false };
    }
  },
};
