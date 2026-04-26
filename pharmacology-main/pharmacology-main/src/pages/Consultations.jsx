/* eslint-disable no-unused-vars */
import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, Star, Search } from "lucide-react";
import { MedicalContext } from "../context/MedicalContext";
import AnimatedText from "../components/common/AnimatedContent";
import Card from "../components/common/Card";
import AppointmentModal from "../components/appointment/AppointmentModal";

const Consultations = () => {
  const navigate = useNavigate();
  const { Medicalservices, loading, getMedicalServices } =
    useContext(MedicalContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // If the context hasn't loaded yet (e.g. user navigated directly to /consultations),
  // trigger a fetch. getMedicalServices guards against duplicate calls internally.
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
      boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
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
                className="w-full pr-12 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1e4b8f] focus:border-transparent text-right bg-gray-50/50 outline-none"
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

        {/* Cards grid */}
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
                  className="relative"
                >
                  <AnimatedText delay={0.3}>
                    <Card
                      item={{
                        image: service.image,
                        title: service.title_ar || service.title,
                        desc: service.description,
                        price: `${service.fees} جنيه`,
                        meta1: service.duration || "30 دقيقة",
                        meta2: service.category_ar || service.category,
                      }}
                      Meta1Icon={CalendarDays}
                      Meta2Icon={Star}
                      buttonText={service.available ? "احجز الآن" : "غير متاح"}
                      onClick={
                        service.available
                          ? () => handleOpenModal(service)
                          : undefined
                      }
                    />
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
