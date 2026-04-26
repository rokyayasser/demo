import React from "react";
import { FaCalendarDays } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { assets } from "../../assets/assets";
// استيراد مكون الأنيميشن (تأكد من مطابقة المسار واسم المكون في مشروعك)
import AnimatedText from "../common/AnimatedContent";
import Button from "../common/Button";

const WhyChooseUs = () => {
  const features = [
    {
      id: 1,
      title: "الاستشارات عبر الانترنت",
      desc: "الاستشارات الافتراضيه عبر مكالمه فيديو كول أثناء جودك في المنزل.",
      image: assets.consultation,
    },
    {
      id: 2,
      title: "متابعه دوريه",
      desc: "مراجعه منظمه لمراقبه التقدم و توجه المسار العلاجي .",
      image: assets.schedule,
    },
    {
      id: 3,
      title: "خطه تغذيه شخصيه.",
      desc: "بيانات غذائيه مخصصه مصنوعه خصيصا لاحتياجك.",
      image: assets.diet,
    },
  ];

  return (
    <section className="py-16 px-4 md:px-10" dir="rtl">
      <div className="max-w-7xl mx-auto">

        {/* === Section Header === */}
        <div className="text-center md:text-right mb-12">
          <AnimatedText delay={0.1}>
            <h2 className="text-3xl md:text-4xl font-bold  mb-4">
              ليه تختار دكتور أحمد الخطيب:
            </h2>
          </AnimatedText>

          <AnimatedText delay={0.2}>
            <p className="text-lg  font-medium max-w-2xl">
              نحن نقدم تجارب تعليمية واستشارية استثنائية تجمع بين الخبرة العملية والمعرفة الأكاديمية
            </p>
          </AnimatedText>
        </div>

        {/* === Cards Grid === */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <AnimatedText key={feature.id} delay={0.3 + index * 0.1}>
              <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col justify-between h-full transition-transform duration-300 hover:-translate-y-1 hover:shadow-md border border-gray-100">

                {/* Top part: Text (Right) and Image (Left) */}
                <div className="flex justify-between items-start gap-4 mb-8">
                  {/* Text Content */}
                  <div className="flex flex-col text-right w-2/3">
                    <h3 className="text-xl font-bold gradient-text mb-3 leading-tight">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed font-medium">
                      {feature.desc}
                    </p>
                  </div>

                  {/* Illustration */}
                  <div className="w-1/3 flex justify-center items-center">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full max-w-[80px] object-contain drop-shadow-sm"
                    />
                  </div>
                </div>

                {/* Bottom part: Button */}
                  <Button to={'/consultations'} className="w-full ">

                    أحجز موعدك
                  </Button>
              </div>
            </AnimatedText>
          ))}
        </div>

      </div>
    </section>
  );
};

export default WhyChooseUs;