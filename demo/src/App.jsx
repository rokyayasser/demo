/* eslint-disable no-unused-vars */
import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Layout Components
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import WhatsAppCompact from "./components/common/WhatsAppCompact";

// Pages
import Home from "./pages/Home";

import Appointment from "./pages/appointment/Appointment";
import Login from "./pages/auth/Login";
import About from "./pages/About";
import Contact from "./pages/Contact";
import MyProfile from "./pages/user/MyProfile";
import MyAppointments from "./pages/user/MyAppointments";

// Protected Route Wrapper
import ProtectedRoute from "./components/common/ProtectedRoute";
import Service from "./pages/Service";

const App = () => {
  const location = useLocation();

  return (
    <div className="mx-4 sm:mx-[10%] min-h-screen flex flex-col">
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
      <Navbar />

      <main className="flex-grow">
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/medical-services" element={<Service />} />
            <Route path="/medical-services/:category" element={<Service />} />
            <Route path="/login" element={<Login />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

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
              path="/my-profile"
              element={
                <ProtectedRoute>
                  <MyProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-appointments"
              element={
                <ProtectedRoute>
                  <MyAppointments />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AnimatePresence>
      </main>

      <Footer />
      <WhatsAppCompact />
    </div>
  );
};

export default App;
