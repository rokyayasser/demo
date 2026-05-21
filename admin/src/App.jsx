import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AnimatePresence } from "framer-motion";
import "react-toastify/dist/ReactToastify.css";

// Contexts
import { AdminContext } from "./context/AdminContext";
import { DoctorContext } from "./context/DoctorContext";

// Auth
import Login from "./pages/auth/Login";

// ── Admin Layout & Pages ──────────────────────────────────────────────────────
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/Admin/Dashboard";
import AllAppointments from "./pages/Admin/AllAppointments";
import AdminServices from "./pages/Admin/AdminServices";
import BlockSlots from "./pages/Admin/BlockSlots";
import AdminCourses from "./pages/Admin/AdminCourses";
import AdminProducts from "./pages/Admin/AdminProducts";
import AdminUsers from "./pages/Admin/AdminUsers";
import AdminBlogs from "./pages/Admin/AdminBlogs";
import AdminManagement from "./pages/Admin/Adminmanagement";
import AdminProfile from "./pages/Admin/AdminProfile";
import ForgotPassword from "./pages/ForgetPassword";

// Public route (outside auth):

// Protected route (inside admin layout):

// ── Doctor Layout & Pages ─────────────────────────────────────────────────────
import DoctorLayout from "./components/doctor/DoctorLayout";
import DoctorCalendar from "./pages/Doctor/DoctorCalendar";
import DoctorToday from "./pages/Doctor/DoctorToday";
import DoctorAppointments from "./pages/Doctor/DoctorAppointments";
import DoctorAppointmentDetails from "./pages/Doctor/DoctorAppointmentDetails";
import DoctorStats from "./pages/Doctor/DoctorStats";

// inside admin routes:

const App = () => {
  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <AnimatePresence mode="wait">
        <Routes>
          {/* Public login */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/"
            element={
              aToken ? (
                <Navigate to="/admin/dashboard" />
              ) : dToken ? (
                <Navigate to="/doctor/calendar" />
              ) : (
                <Login />
              )
            }
          />

          {/* ── Admin routes ─────────────────────────────────────────────── */}
          {aToken && (
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="appointments" element={<AllAppointments />} />
              <Route path="services" element={<AdminServices />} />
              <Route path="services-list" element={<AdminServices />} />
              <Route path="add-service" element={<AdminServices />} />
              <Route path="block-slots" element={<BlockSlots />} />
              {/* New sections */}
              <Route path="courses" element={<AdminCourses />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="blogs" element={<AdminBlogs />} />
              <Route path="admins" element={<AdminManagement />} />
              <Route path="profile" element={<AdminProfile />} />;
            </Route>
          )}

          {/* ── Doctor routes ─────────────────────────────────────────────── */}
          {dToken && (
            <Route path="/doctor" element={<DoctorLayout />}>
              <Route index element={<Navigate to="calendar" />} />
              <Route path="calendar" element={<DoctorCalendar />} />
              <Route path="today" element={<DoctorToday />} />
              <Route path="appointments" element={<DoctorAppointments />} />
              <Route
                path="appointments/:id"
                element={<DoctorAppointmentDetails />}
              />
              <Route path="stats" element={<DoctorStats />} />
            </Route>
          )}

          {/* Catch-all */}
          <Route
            path="*"
            element={
              aToken ? (
                <Navigate to="/admin/dashboard" />
              ) : dToken ? (
                <Navigate to="/doctor/calendar" />
              ) : (
                <Navigate to="/" />
              )
            }
          />
        </Routes>
      </AnimatePresence>
    </>
  );
};

export default App;
