import React, { useContext } from "react";
import Login from "./pages/Login";
import { ToastContainer } from "react-toastify";
import { AdminContext } from "./context/AdminContext";
import { Route, Routes, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import AdminLayout from "./components/AdminLayout";
import DoctorLayout from "./components/DoctorLayout";
import Dashboard from "./pages/Admin/Dashboard";
import AddService from "./pages/Admin/AddService";
import ServicesList from "./pages/Admin/ServiceList";
import AllAppointments from "./pages/Admin/AllAppointment";
import DoctorToday from "./pages/Doctor/DoctorToday";
import DoctorStats from "./pages/Doctor/DoctorStats";
import { DoctorContext } from "./context/DoctorContext";
import DoctorCalendar from "./pages/Doctor/DoctorCalender";
import DoctorAppointments from "./pages/Doctor/DoctorAppointments";
import EditService from "./pages/Admin/EditService";
import AdminCourses from "./pages/Admin/AdminCourses";
import AdminCourseLessons from "./pages/Admin/AdminCourseLessons";
import AdminCreateProduct from "./pages/Admin/AdminCreateProduct";
import AdminEditProduct from "./pages/Admin/AdminEditProducts";
import AdminCategories from "./pages/Admin/AdminCategories";
import AdminOrders from "./pages/Admin/AdminOrders";
import AdminProducts from "./pages/Admin/AdminProducts";
import DoctorAppointmentDetails from "./pages/Doctor/DoctorAppointmentDetails";
import AdminEditService from "./pages/Admin/EditService";

const App = () => {
  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);

  return (
    <div className="bg-[#F8F9FD] min-h-screen">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <AnimatePresence mode="wait">
        <Routes>
          {/* SINGLE LOGIN PAGE FOR BOTH ADMIN AND DOCTOR */}
          {!aToken && !dToken && <Route path="/" element={<Login />} />}

          {/* PROTECTED ADMIN SECTION */}
          {aToken && (
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="add-service" element={<AddService />} />
              <Route path="services-list" element={<ServicesList />} />
              <Route path="appointments" element={<AllAppointments />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route
                path="courses/:courseId/lessons"
                element={<AdminCourseLessons />}
              />
              <Route index element={<Navigate to="dashboard" />} />
              <Route
                path="/admin/edit-service/:serviceId"
                element={<AdminEditService />}
              />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/create" element={<AdminCreateProduct />} />
              <Route
                path="products/edit/:productId"
                element={<AdminEditProduct />}
              />

              {/* E-commerce - Categories */}
              <Route path="categories" element={<AdminCategories />} />

              {/* E-commerce - Orders */}
              <Route path="orders" element={<AdminOrders />} />
            </Route>
          )}

          {/* PROTECTED DOCTOR SECTION */}
          {dToken && (
            <Route path="/doctor" element={<DoctorLayout />}>
              <Route path="calendar" element={<DoctorCalendar />} />
              <Route path="today" element={<DoctorToday />} />
              <Route path="appointments" element={<DoctorAppointments />} />
              <Route
                path="/doctor/appointments/:id"
                element={<DoctorAppointmentDetails />}
              />

              <Route path="stats" element={<DoctorStats />} />
              <Route index element={<Navigate to="calendar" />} />
            </Route>
          )}

          {/* DEFAULT REDIRECTS */}
          <Route
            path="/"
            element={
              <Navigate
                to={
                  aToken
                    ? "/admin/dashboard"
                    : dToken
                    ? "/doctor/calendar"
                    : "/"
                }
              />
            }
          />

          <Route
            path="*"
            element={
              <Navigate
                to={
                  aToken
                    ? "/admin/dashboard"
                    : dToken
                    ? "/doctor/calendar"
                    : "/"
                }
              />
            }
          />
        </Routes>
      </AnimatePresence>
    </div>
  );
};

export default App;
