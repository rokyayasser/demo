/* eslint-disable no-unused-vars */
import React, { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Layout Components
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import ScrollToTop from "./components/common/ScrollToTop";

// Pages
import Home from "./pages/Home";
import Appointment from "./pages/appointment/Appointments";
import Login from "./pages/auth/Login";
import About from "./pages/About";

import MyProfile from "./pages/user/MyProfile";
import MyAppointments from "./pages/user/MyAppointments";
import Service from "./pages/Service";
import ProductsPage from "./pages/product/ProductsPage";
import ProductDetails from "./pages/product/ProductDetails";
import Courses from "./pages/course/Courses";
import CourseDetails from "./pages/course/CourseDetails";
import MyCourses from "./pages/course/MyCourses";
import Consultations from "./pages/Consultations";
import Blogs from "./pages/blog/Blogs";
import BlogDetails from "./pages/blog/BlogDetails";
import CartPage from "./pages/product/CartPage";

// Protected Route Wrapper
import ProtectedRoute from "./components/common/ProtectedRoute";
import CourseLearning from "./pages/course/CourseLearning";

import CheckoutPage from "./pages/product/CheckOutPage";
import PaymentCallback from "./pages/PaymentCallback";

const App = () => {
  const location = useLocation();

  // Hide Navbar and Footer on login page
  const hideLayout = location.pathname === "/login";

  // Scroll to top on every route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* Toast Notifications */}
      {/* 
      <ToastContainer
        position="top-left"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName="font-sans min-h-[60px] text-lg"
        bodyClassName="text-right py-3"
      />
      */}

      {!hideLayout && <Navbar />}

      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/medical-services" element={<Service />} />
            <Route path="/medical-services/:category" element={<Service />} />
            <Route path="/login" element={<Login />} />
            <Route path="/about" element={<About />} />

            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetails />} />
            <Route path="/consultations" element={<Consultations />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blogs/:id" element={<BlogDetails />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/payment/callback" element={<PaymentCallback />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/my-appointments" element={<MyAppointments />} />
            <Route path="/my-courses" element={<MyCourses />} />

            {/* Protected Routes */}
            <Route
              path="/appointment/:serviceId"
              element={
                <ProtectedRoute>
                  <Appointment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/learn/:id"
              element={
                <ProtectedRoute>
                  <CourseLearning />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-profile"
              element={
                // <ProtectedRoute>
                <MyProfile />
                // </ProtectedRoute>
              }
            />

            <Route
              path="/my-appointments"
              element={
                // <ProtectedRoute>
                <MyAppointments />
                // </ProtectedRoute>
              }
            />

            <Route
              path="/my-courses"
              element={
                // <ProtectedRoute>
                <MyCourses />
                // </ProtectedRoute>
              }
            />
          </Routes>
        </AnimatePresence>
        <ScrollToTop />
      </main>

      {!hideLayout && <Footer />}
    </div>
  );
};

export default App;
