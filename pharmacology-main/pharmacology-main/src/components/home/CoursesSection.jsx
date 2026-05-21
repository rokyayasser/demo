// components/home/CoursesSection.jsx
import React, { useContext, useEffect } from "react";
import { FiClock, FiCalendar, FiMonitor } from "react-icons/fi";
import { Link } from "react-router-dom";
import { CourseContext } from "../../context/CourseContext";
import Carousel from "../common/Carousel";
import AnimatedText from "../common/AnimatedContent";
import { FEATURES } from "../../config/features";
import { getUsdToEgpRate, toUsd } from "../../utils/currency.service";

const CoursesSection = () => {
  const [usdRate, setUsdRate] = React.useState(null);
  React.useEffect(() => {
    getUsdToEgpRate().then(setUsdRate);
  }, []);
  const { courses, getAllCourses, isLoading } = useContext(CourseContext);

  // ── Hide section entirely when coming soon ────────────────────────────────
  if (FEATURES.COURSES_COMING_SOON) return null;

  // Trigger fetch if courses haven't loaded yet
  useEffect(() => {
    if (courses.length === 0) getAllCourses();
  }, []);

  /** Map a Course document → Carousel card shape */
  const carouselData = courses
    .filter((c) => c.available !== false)
    .slice(0, 8)
    .map((c) => ({
      id: c._id,
      _id: c._id,
      image: c.image,
      title: c.title_ar || c.title,
      desc: c.description_ar || c.description || "",
      price: usdRate ? toUsd(c.price, usdRate) : "...",
      meta1: c.duration || "10 ساعات",
      meta2: c.instructor || "أونلاين",
    }));

  return (
    <section className="py-16 px-4 md:px-10" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
          <div className="text-right">
            <AnimatedText delay={0.1}>
              <h1 className="text-3xl md:text-4xl font-bold">الكورسات</h1>
            </AnimatedText>
            <AnimatedText delay={0.2}>
              <p className="text-lg font-medium my-6">
                نشاركك أحدث الكورسات والنصائح الطبية والغذائية الموثوقة ..
              </p>
            </AnimatedText>
            <AnimatedText delay={0.4}>
              <Link
                to="/courses"
                className="text-[#cad5e4] font-bold text-lg hover:underline mb-1 inline-block"
              >
                مشاهدة كل الكورسات
              </Link>
            </AnimatedText>
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#9b61db] border-t-transparent" />
          </div>
        )}

        {!isLoading && carouselData.length > 0 && (
          <AnimatedText delay={0.6}>
            <Carousel
              data={carouselData}
              Meta1Icon={FiClock}
              Meta2Icon={FiMonitor}
              ButtonIcon={FiCalendar}
              buttonText="اشترك الآن"
              gradientColor="from-[#1e4b8f]"
              to="/courses/:id"
            />
          </AnimatedText>
        )}

        {!isLoading && carouselData.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            لا توجد كورسات متاحة حالياً
          </div>
        )}
      </div>
    </section>
  );
};

export default CoursesSection;
