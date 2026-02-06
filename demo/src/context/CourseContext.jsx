/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "./AppContext";

export const CourseContext = createContext();

export const CourseProvider = ({ children }) => {
  const { backendUrl, token, userData } = useContext(AppContext);

  const [courses, setCourses] = useState([]);

  const [currentCourse, setCurrentCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);

  // الحصول على جميع الدورات
  const getAllCourses = async (filters = {}) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${backendUrl}/api/courses`, {
        params: filters,
      });

      if (response.data.success) {
        setCourses(response.data.courses);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("فشل في تحميل الدورات");
    } finally {
      setIsLoading(false);
    }
  };
  // الحصول على تفاصيل دورة محددة - UPDATED
  const getCourseDetails = async (courseId) => {
    try {
      setIsLoading(true);
      const headers = token ? { token } : {};

      const response = await axios.get(
        `${backendUrl}/api/courses/${courseId}`,
        {
          headers,
        }
      );

      if (response.data.success) {
        setCurrentCourse(response.data.course);
        return response.data.course;
      }
    } catch (error) {
      console.error("Error fetching course details:", error);
      toast.error("فشل في تحميل تفاصيل الدورة");
    } finally {
      setIsLoading(false);
    }
  };
  // الحصول على دورات المستخدم
  const getUserCourses = async () => {
    try {
      if (!token) return [];

      const response = await axios.get(
        `${backendUrl}/api/courses/user/my-courses`,
        { headers: { token } }
      );

      if (response.data.success) {
        return response.data.courses;
      }
      return [];
    } catch (error) {
      console.error("Error fetching user courses:", error);
      return [];
    }
  };
  // بدء عملية الدفع للدورة - UPDATED
  const initiateCoursePayment = async (courseId) => {
    try {
      if (!token) {
        toast.error("يجب تسجيل الدخول أولاً");
        return null;
      }

      setIsLoading(true);

      const response = await axios.post(
        `${backendUrl}/api/courses/payment/initiate`,
        { courseId },
        { headers: { token } }
      );

      console.log("Payment initiation response:", response.data);

      if (response.data.success && response.data.paymentUrl) {
        // Open payment URL in new window
        const paymentWindow = window.open(
          response.data.paymentUrl,
          "_blank",
          "width=800,height=600"
        );

        // Start polling for enrollment status
        startEnrollmentPolling(courseId, paymentWindow);

        return response.data;
      } else {
        toast.error(response.data.message || "فشل في بدء عملية الدفع");
        return null;
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      toast.error(error.response?.data?.message || "فشل في بدء عملية الدفع");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Start polling for enrollment status after payment

  // التحقق من تسجيل المستخدم في الدورة - UPDATED
  const checkEnrollment = async (courseId) => {
    try {
      if (!token) {
        return { isEnrolled: false };
      }

      const response = await axios.get(
        `${backendUrl}/api/courses/enrollment/check/${courseId}`,
        { headers: { token } }
      );

      console.log("Enrollment check response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error checking enrollment:", error);
      return { isEnrolled: false };
    }
  };

  // تحديث تقدم الدرس
  const updateLessonProgress = async (courseId, lessonId, progressData) => {
    try {
      if (!token) return;

      await axios.post(
        `${backendUrl}/api/courses/progress/${courseId}/${lessonId}`,
        progressData,
        { headers: { token } }
      );
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  // الحصول على محتوى الدورة (للمستخدمين المسجلين)
  const getCourseContent = async (courseId) => {
    try {
      if (!token) {
        toast.error("يجب تسجيل الدخول");
        return null;
      }

      const response = await axios.get(
        `${backendUrl}/api/courses/content/${courseId}`,
        { headers: { token } }
      );

      if (response.data.success) {
        return response.data;
      } else {
        toast.error(response.data.message || "فشل في تحميل محتوى الدورة");
        return null;
      }
    } catch (error) {
      console.error("Error fetching course content:", error);
      if (error.response?.status === 403) {
        toast.error("يجب شراء الدورة أولاً");
      } else {
        toast.error("فشل في تحميل محتوى الدورة");
      }
      return null;
    }
  };

  // تقييم الدورة
  const rateCourse = async (courseId, rating, review) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/courses/rate/${courseId}`,
        { rating, review },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("تم إرسال تقييمك بنجاح");
        return response.data;
      }
    } catch (error) {
      console.error("Error rating course:", error);
      toast.error("فشل في إرسال التقييم");
    }
  };
  // In CourseContext.js - Fix the polling function
  const startEnrollmentPolling = (courseId, paymentWindow) => {
    let pollCount = 0;
    const maxPolls = 30; // Poll for 2.5 minutes (30 * 5 seconds)

    const pollInterval = setInterval(async () => {
      pollCount++;

      // Stop polling if max reached
      if (pollCount >= maxPolls) {
        clearInterval(pollInterval);
        console.log("Polling stopped - max attempts reached");
        toast.info(
          "انتهى وقت الانتظار، يرجى تحديث الصفحة للتحقق من حالة الاشتراك"
        );
        return;
      }

      // Stop polling if payment window is closed
      if (paymentWindow && paymentWindow.closed) {
        console.log("Payment window closed - checking enrollment...");
      }

      // Check enrollment status
      try {
        const enrollmentStatus = await checkEnrollment(courseId);
        console.log(`Poll ${pollCount}: Enrollment status:`, enrollmentStatus);

        if (enrollmentStatus.isEnrolled) {
          clearInterval(pollInterval);

          // Close payment window if still open
          if (paymentWindow && !paymentWindow.closed) {
            paymentWindow.close();
          }

          toast.success("✅ تم التسجيل في الدورة بنجاح! 🎉");

          // Reload page to update UI after a short delay
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else if (pollCount === 1) {
          // First check - give initial feedback
          console.log("Payment initiated, waiting for confirmation...");
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 5000); // Check every 5 seconds

    // Store interval ID for cleanup if needed
    return pollInterval;
  };
  const forceCheckEnrollment = async (courseId) => {
    try {
      if (!token) return { isEnrolled: false };

      const response = await axios.get(
        `${backendUrl}/api/courses/enrollment/check/${courseId}`,
        { headers: { token } }
      );

      console.log("Force enrollment check:", response.data);

      if (response.data.isEnrolled) {
        toast.success("✅ أنت مسجل في هذه الدورة!");
        // Reload page to update UI
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }

      return response.data;
    } catch (error) {
      console.error("Error forcing enrollment check:", error);
      return { isEnrolled: false };
    }
  };

  // الحصول على سجل المدفوعات
  const getPaymentHistory = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/courses/payments/history`,
        {
          headers: { token },
        }
      );

      if (response.data.success) {
        setPaymentHistory(response.data.payments);
        return response.data.payments;
      }
    } catch (error) {
      console.error("Error fetching payment history:", error);
    }
  };

  const retryPayment = async (courseId) => {
    try {
      if (!token) {
        toast.error("يجب تسجيل الدخول أولاً");
        return null;
      }

      const response = await axios.post(
        `${backendUrl}/api/courses/payment/retry`,
        { courseId },
        { headers: { token } }
      );

      if (response.data.success && response.data.paymentUrl) {
        const paymentWindow = window.open(
          response.data.paymentUrl,
          "_blank",
          "width=800,height=600"
        );

        startEnrollmentPolling(courseId, paymentWindow);
        return response.data;
      }
    } catch (error) {
      console.error("Error retrying payment:", error);
      toast.error("فشل في إعادة محاولة الدفع");
      return null;
    }
  };

  // التحقق من حالة الدفع
  const checkPaymentStatus = async (courseId) => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/courses/payment/status/${courseId}`,
        { headers: { token } }
      );

      return response.data;
    } catch (error) {
      console.error("Error checking payment status:", error);
      return { isPaid: false };
    }
  };

  // دالة مساعدة للحصول على دورات المستخدم من البيانات المحلية
  const getUserCoursesFromData = () => {
    if (userData && userData.courses) {
      return userData.courses;
    }
    return [];
  };

  // دالة لتنظيف حالة التحميل
  const clearLoading = () => {
    setIsLoading(false);
  };

  return (
    <CourseContext.Provider
      value={{
        courses,

        currentCourse,
        isLoading,
        paymentHistory,

        getAllCourses,
        getCourseDetails,
        getUserCourses,
        initiateCoursePayment,
        checkEnrollment,
        updateLessonProgress,
        getCourseContent,
        rateCourse,
        retryPayment,
        getPaymentHistory,
        checkPaymentStatus,
        forceCheckEnrollment,
        getUserCoursesFromData,
        startEnrollmentPolling,
        clearLoading,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};
