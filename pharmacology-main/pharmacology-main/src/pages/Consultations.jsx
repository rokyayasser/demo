/* eslint-disable no-unused-vars */
import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, Star, Search } from "lucide-react";
import { FiClock } from "react-icons/fi";
import { MedicalContext } from "../context/MedicalContext";
import AnimatedText from "../components/common/AnimatedContent";
import AppointmentModal from "../components/appointment/AppointmentModal";
import { getUsdToEgpRate, toUsd } from "../utils/currency.service";

const Consultations = () => {
  const navigate = useNavigate();
  const { Medicalservices, loading, getMedicalServices } =
    useContext(MedicalContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [usdRate, setUsdRate] = useState(null);

  useEffect(() => {
    getUsdToEgpRate().then(setUsdRate);
  }, []);
  useEffect(() => {
    getMedicalServices();
  }, [getMedicalServices]);

  const filteredData = searchTerm
    ? Medicalservices.filter(
        (s) =>
          (s.title_ar || s.title || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (s.description || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      )
    : Medicalservices;

  const handleOpenModal = (service) => {
    if (!service.available) return;
    setSelectedService({
      _id: service._id,
      id: service._id,
      title: service.title_ar || service.title,
      category: service.category_ar || service.category,
      fees: service.fees,
      duration: service.duration || "30 دقيقة",
      features: service.features || [],
      description: service.description || "",
      available: service.available,
    });
    setIsModalOpen(true);
  };

  const cardHoverVariants = {
    hover: {
      y: -8,
      boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="mt-40 my-12 px-4 sm:px-6 lg:px-10" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-right">
          <AnimatedText delay={0.1}>
            <div className="text-xs md:text-sm text-secondary mb-3 flex items-center justify-start gap-1">
              <span
                className="text-secondary font-medium cursor-pointer"
                onClick={() => navigate("/")}
              >
                الرئيسية
              </span>
              <span>/</span>
              <span>الاستشارات</span>
            </div>
          </AnimatedText>
          <AnimatedText delay={0.2}>
            <h1 className="text-2xl md:text-4xl font-bold mb-4">
              الاستشارات في التغذيه الصحيحه :
            </h1>
          </AnimatedText>
          <AnimatedText delay={0.3}>
            <p className="text-sm md:text-base leading-relaxed max-w-4xl">
              استشارة متخصصة مبنية على حالتك الصحية وأهدافك، بخطة عملية تناسب
              نمط حياتك وتضمن نتائج مستدامة.
            </p>
          </AnimatedText>
        </div>

        {/* Search */}
        <div className="mb-10 max-w-md">
          <AnimatedText delay={0.4}>
            <div className="relative">
              <Search
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="ابحث عن استشارة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-12 pl-4 py-3 border border-gray-200 rounded-xl
                  focus:ring-2 focus:ring-[#9b61db] focus:border-transparent
                  text-right bg-gray-50/50 outline-none"
              />
            </div>
          </AnimatedText>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#9b61db] border-t-transparent" />
          </div>
        )}

        {/* Cards grid — same pattern as Blogs */}
        {!loading && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredData.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <p className="text-gray-500 text-lg">
                  {searchTerm
                    ? "لم يتم العثور على استشارات تطابق بحثك."
                    : "لا توجد استشارات متاحة حالياً."}
                </p>
              </div>
            ) : (
              filteredData.map((service) => (
                <motion.div
                  key={service._id}
                  variants={cardHoverVariants}
                  whileHover="hover"
                >
                  <AnimatedText delay={0.3}>
                    <div
                      className={`bg-white rounded-2xl overflow-hidden border border-white/10
                        shadow-md hover:shadow-xl transition-all flex flex-col
                        ${service.available ? "cursor-pointer" : "opacity-70 cursor-not-allowed"}`}
                      onClick={() =>
                        service.available && handleOpenModal(service)
                      }
                    >
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden bg-gray-100 shrink-0">
                        {service.image ? (
                          <img
                            src={service.image}
                            alt={service.title_ar || service.title}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center
                            bg-gradient-to-br from-[#2d1b5a] to-[#9b61db] text-4xl"
                          >
                            🩺
                          </div>
                        )}
                        <span
                          className="absolute top-3 right-3 bg-[#2d1b5a] text-white
                          text-xs font-bold px-3 py-1 rounded-full"
                        >
                          {service.category_ar || service.category}
                        </span>
                        {!service.available && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="bg-red-500 text-white text-sm font-bold px-4 py-1.5 rounded-full">
                              غير متاح
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Body */}
                      <div className="p-5 flex flex-col flex-1 gap-3">
                        <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2">
                          {service.title_ar || service.title}
                        </h3>
                        <p className="text-gray-500 text-sm line-clamp-2 flex-1 leading-relaxed">
                          {service.description}
                        </p>

                        {/* Meta row */}
                        <div
                          className="flex items-center justify-between text-xs text-gray-400
                          border-t border-gray-100 pt-3"
                        >
                          <div className="flex items-center gap-1">
                            <FiClock className="w-3.5 h-3.5" />
                            <span>{service.duration || "30 دقيقة"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                            <span>
                              {service.category_ar || service.category}
                            </span>
                          </div>
                        </div>

                        {/* Price in USD */}
                        <p className="font-extrabold text-lg text-[#2d1b5a]">
                          {usdRate ? toUsd(service.fees, usdRate) : "..."}
                        </p>

                        {/* Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            service.available && handleOpenModal(service);
                          }}
                          disabled={!service.available}
                          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                            text-sm font-bold transition-all mt-auto
                            ${
                              service.available
                                ? "bg-gradient-to-r from-[#2d1b5a] to-[#9b61db] text-white hover:shadow-lg hover:shadow-[#9b61db]/30"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                        >
                          <CalendarDays className="w-4 h-4" />
                          {service.available ? "احجز الآن" : "غير متاح"}
                        </button>
                      </div>
                    </div>
                  </AnimatedText>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>

      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedService(null);
        }}
        serviceInfo={selectedService}
      />
    </div>
  );
};

export default Consultations;
