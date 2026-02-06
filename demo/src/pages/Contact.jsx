/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaExclamationTriangle,
  FaPaperPlane,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    inquiryType: "نوع الاستفسار",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const pageVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
    exit: { opacity: 0 },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const cardVariants = {
    hover: {
      y: -5,
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
      transition: {
        duration: 0.3,
      },
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      toast.success("تم إرسال رسالتك بنجاح! سنتواصل معك قريباً");
      setFormData({
        name: "",
        phone: "",
        email: "",
        inquiryType: "نوع الاستفسار",
        message: "",
      });
      setSubmitting(false);
    }, 1500);
  };

  return (
    <motion.div
      dir="rtl"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className="min-h-screen bg-gradient-to-b from-lightBg to-white flex flex-col items-center py-16 px-4 sm:px-6"
    >
      {/* === Header === */}
      <motion.div
        variants={itemVariants}
        className="text-center mb-12 max-w-3xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-gradient-to-r from-primary to-secondary text-white text-2xl shadow-lg"
        >
          📞
        </motion.div>
        <h2 className="text-3xl md:text-4xl font-bold text-primary mt-6">
          اتصل بنا
        </h2>
        <p className="text-textSoft mt-3 text-lg">
          نحن هنا لخدمتكم على مدار الساعة. تواصلوا معنا للحصول على أفضل الخدمات
          الطبية المتخصصة.
        </p>
      </motion.div>

      {/* === Main Section === */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl"
      >
        {/* === Left Info Cards === */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Phone Card */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="bg-white rounded-2xl shadow-lg p-6 flex items-start gap-4 border border-borderLight hover:border-secondary transition-all"
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="text-primary bg-accent p-4 rounded-full text-xl"
            >
              <FaPhoneAlt />
            </motion.div>
            <div className="flex-1">
              <h3 className="font-bold text-xl text-textMain mb-2">اتصل بنا</h3>
              <p className="text-textSoft text-sm mb-3">
                متاحون على مدار الساعة
              </p>
              <div className="space-y-2">
                <motion.p
                  whileHover={{ x: -5 }}
                  className="text-secondary font-medium text-lg hover:text-primary transition-colors cursor-pointer"
                >
                  +966 11 234 5678
                </motion.p>
                <motion.p
                  whileHover={{ x: -5 }}
                  className="text-secondary font-medium text-lg hover:text-primary transition-colors cursor-pointer"
                >
                  +966 50 123 4567
                </motion.p>
              </div>
            </div>
          </motion.div>

          {/* Email Card */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="bg-white rounded-2xl shadow-lg p-6 flex items-start gap-4 border border-borderLight hover:border-secondary transition-all"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="text-primary bg-accent p-4 rounded-full text-xl"
            >
              <FaEnvelope />
            </motion.div>
            <div>
              <h3 className="font-bold text-xl text-textMain mb-2">
                البريد الإلكتروني
              </h3>
              <p className="text-textSoft text-sm mb-3">راسلنا في أي وقت</p>
              <div className="space-y-2">
                <p className="text-secondary font-medium hover:text-primary transition-colors cursor-pointer">
                  info@medicalcenter.com
                </p>
                <p className="text-secondary font-medium hover:text-primary transition-colors cursor-pointer">
                  appointments@medicalcenter.com
                </p>
              </div>
            </div>
          </motion.div>

          {/* Address Card */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="bg-white rounded-2xl shadow-lg p-6 flex items-start gap-4 border border-borderLight hover:border-secondary transition-all"
          >
            <div className="text-primary bg-accent p-4 rounded-full text-xl">
              <FaMapMarkerAlt />
            </div>
            <div>
              <h3 className="font-bold text-xl text-textMain mb-2">العنوان</h3>
              <p className="text-textSoft text-lg">
                شارع الملك فهد، حي العليا، الرياض <br />
                المملكة العربية السعودية 12211
              </p>
            </div>
          </motion.div>

          {/* Working Hours */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="bg-white rounded-2xl shadow-lg p-6 flex items-start gap-4 border border-borderLight hover:border-secondary transition-all"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="text-primary bg-accent p-4 rounded-full text-xl"
            >
              <FaClock />
            </motion.div>
            <div>
              <h3 className="font-bold text-xl text-textMain mb-2">
                ساعات العمل
              </h3>
              <p className="text-textSoft text-lg mb-2">
                السبت - الخميس: 8:00 ص - 10:00 م <br /> الجمعة: 2:00 م - 10:00 م
              </p>
              <motion.p
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-green-600 font-bold text-lg"
              >
                طوارئ 24/7
              </motion.p>
            </div>
          </motion.div>

          {/* Emergency Card */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-primary to-secondary text-white rounded-2xl shadow-lg p-6 flex items-start gap-4"
          >
            <div className="bg-white text-primary p-4 rounded-full text-xl">
              <FaExclamationTriangle />
            </div>
            <div>
              <h3 className="font-bold text-2xl mb-2">حالات الطوارئ</h3>
              <p className="text-white/90 text-lg mb-3">
                في حالة الطوارئ الطبية
              </p>
              <motion.p
                whileHover={{ scale: 1.1 }}
                className="font-bold text-2xl mt-2 bg-white text-primary px-4 py-2 rounded-full inline-block"
              >
                اتصل على: <span className="underline">997</span>
              </motion.p>
            </div>
          </motion.div>
        </div>

        {/* === Right Contact Form === */}
        <motion.div
          variants={itemVariants}
          className="flex-1 bg-white rounded-2xl shadow-xl p-8 border border-borderLight"
        >
          <h3 className="text-2xl font-bold text-primary mb-8 text-center">
            أرسل لنا رسالة
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="text"
              placeholder="أدخل اسمك الكامل"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="border border-borderLight rounded-xl p-4 text-textMain bg-lightBg focus:outline-none focus:ring-2 focus:ring-primary text-lg"
              required
            />
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="tel"
              placeholder="05xxxxxxxx"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="border border-borderLight rounded-xl p-4 text-textMain bg-lightBg focus:outline-none focus:ring-2 focus:ring-primary text-lg"
              required
            />
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="border border-borderLight rounded-xl p-4 text-textMain bg-lightBg focus:outline-none focus:ring-2 focus:ring-primary text-lg"
              required
            />
            <motion.select
              whileFocus={{ scale: 1.02 }}
              value={formData.inquiryType}
              onChange={(e) =>
                setFormData({ ...formData, inquiryType: e.target.value })
              }
              className="border border-borderLight rounded-xl p-4 text-textMain bg-lightBg focus:outline-none focus:ring-2 focus:ring-primary text-lg"
            >
              <option>نوع الاستفسار</option>
              <option>حجز موعد</option>
              <option>خدمة طبية</option>
              <option>استفسار عام</option>
            </motion.select>
            <motion.textarea
              whileFocus={{ scale: 1.02 }}
              rows="5"
              placeholder="اكتب رسالتك هنا..."
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              className="border border-borderLight rounded-xl p-4 text-textMain bg-lightBg focus:outline-none focus:ring-2 focus:ring-primary text-lg resize-none"
              required
            ></motion.textarea>

            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-2 bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 text-lg disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <FaPaperPlane className="text-xl" /> إرسال الرسالة
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>

      {/* === Map Placeholder === */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-16 w-full max-w-6xl"
      >
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-primary mb-4">
            الموقع على الخريطة
          </h3>
          <div className="h-64 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">📍</div>
              <p className="text-textMain text-lg">شارع الملك فهد، الرياض</p>
              <p className="text-textSoft">
                اضغط للوصول إلى الموقع على خرائط جوجل
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Contact;
