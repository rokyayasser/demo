/* eslint-disable no-unused-vars */
import React, { useState, useContext } from "react";
import { FiClock, FiMonitor, FiCalendar } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { MedicalContext } from "../../context/MedicalContext";
import Carousel from "../common/Carousel";
import AnimatedText from "../common/AnimatedContent";
import { Link } from "react-router-dom";
import AppointmentModal from "../appointment/AppointmentModal";

/**
 * ConsultationsSection — Home page section.
 * Reads real medical services from MedicalContext instead of hardcoded data.js.
 */
const ConsultationsSection = () => {
  const { Medicalservices, loading } = useContext(MedicalContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  /** Map a MedicalService document → shape the Carousel card expects */
  const toCarouselItem = (service) => ({
    id: service._id,
    _id: service._id,
    image: service.image,
    title: service.title_ar || service.title,
    desc: service.description || "",
    price: `${service.fees} جنيه`,
    meta1: service.duration || "30 دقيقة",
    meta2: service.category_ar || service.category || "",
    // Keep the full service so the modal gets it
    _service: service,
  });

  const carouselData = Medicalservices.filter((s) => s.available) // only show available services
    .slice(0, 8) // max 8 in the carousel
    .map(toCarouselItem);

  const handleOpenModal = (item) => {
    // item is the carousel item; retrieve the original service from _service
    const service = item._service;
    if (!service) return;

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

  return (
    <section className="py-16 px-4 md:px-10" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
          <div className="text-right">
            <AnimatedText delay={0.1}>
              <h2 className="text-3xl md:text-4xl font-bold">الاستشارات</h2>
            </AnimatedText>
            <AnimatedText delay={0.2}>
              <p className="text-lg font-medium my-6">
                نشاركك أحدث الاستشارات والنصائح الطبية والغذائية الموثوقة ..
              </p>
            </AnimatedText>
            <AnimatedText delay={0.3}>
              <Link
                to="/consultations"
                className="text-[#cad5e4] font-bold text-lg hover:underline inline-block"
              >
                مشاهدة كل الاستشارات
              </Link>
            </AnimatedText>
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#9b61db] border-t-transparent" />
          </div>
        )}

        {/* Carousel — only render when we have data */}
        {!loading && carouselData.length > 0 && (
          <AnimatedText delay={0.4}>
            <Carousel
              data={carouselData}
              Meta1Icon={FiClock}
              Meta2Icon={FiMonitor}
              ButtonIcon={FiCalendar}
              buttonText="أحجز موعدك"
              gradientColor="from-[#3a4417]"
              onClick={handleOpenModal}
            />
          </AnimatedText>
        )}

        {/* Empty state */}
        {!loading && carouselData.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            لا توجد استشارات متاحة حالياً
          </div>
        )}

        <AppointmentModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedService(null);
          }}
          serviceInfo={selectedService}
        />
      </div>
    </section>
  );
};

export default ConsultationsSection;
