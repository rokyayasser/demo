import React from "react";
import { Video, RefreshCw, Salad } from "lucide-react";
import AnimatedText from "../common/AnimatedContent";
import Button from "../common/Button";

const features = [
  {
    id: 1,
    icon: Video,
    title: "الاستشارات عبر الإنترنت",
    desc: "استشارات افتراضية عبر مكالمة فيديو من راحة منزلك مع د. أحمد الخطيب مباشرةً",
    gradient: "from-[#2d1b5a] to-[#4c2885]",
    iconBg: "bg-[#9b61db]/20",
    iconColor: "text-[#c4a0f5]",
    border: "border-[#9b61db]/20",
  },
  {
    id: 2,
    icon: RefreshCw,
    title: "متابعة دورية",
    desc: "مراجعة منتظمة لمراقبة تقدمك وتوجيه مسارك الصحي بشكل مستمر ومنظم",
    gradient: "from-[#1a3a6e] to-[#2d5aa8]",
    iconBg: "bg-blue-400/20",
    iconColor: "text-blue-300",
    border: "border-blue-400/20",
  },
  {
    id: 3,
    icon: Salad,
    title: "خطة تغذية شخصية",
    desc: "بيانات غذائية مخصصة مصممة خصيصاً لاحتياجاتك وأهدافك الصحية",
    gradient: "from-[#1a4a2e] to-[#2d7a4a]",
    iconBg: "bg-emerald-400/20",
    iconColor: "text-emerald-300",
    border: "border-emerald-400/20",
  },
];

const WhyChooseUs = () => {
  return (
    <section className="py-16 px-4 md:px-10" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <AnimatedText delay={0.1}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ليه تختار دكتور أحمد الخطيب؟
            </h2>
          </AnimatedText>
          <AnimatedText delay={0.2}>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
              نقدم لك أفضل الاستشارات التغذوية والمتابعات الصحية المخصصة لنظام
              حياتك
            </p>
          </AnimatedText>
        </div>

        {/* Three cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {features.map(
            (
              {
                id,
                icon: IconComponent,
                title,
                desc,
                gradient,
                iconBg,
                iconColor,
                border,
              },
              index,
            ) => (
              <AnimatedText key={id} delay={0.3 + index * 0.12}>
                <div
                  className={`relative overflow-hidden rounded-2xl border ${border}
                  bg-gradient-to-br ${gradient}
                  p-7 flex flex-col gap-5 h-full
                  transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-black/30`}
                >
                  {/* Decorative glow circle */}
                  <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full bg-white/5 blur-2xl pointer-events-none" />

                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}
                  >
                    <IconComponent className={`w-6 h-6 ${iconColor}`} />
                  </div>

                  {/* Text */}
                  <div>
                    <h3 className="text-white font-bold text-xl mb-2 leading-snug">
                      {title}
                    </h3>
                    <p className="text-white/65 text-sm leading-relaxed">
                      {desc}
                    </p>
                  </div>

                  {/* Bottom accent line */}
                  <div
                    className={`h-0.5 w-12 rounded-full ${iconColor} opacity-40 mt-auto`}
                  />
                </div>
              </AnimatedText>
            ),
          )}
        </div>

        {/* Single CTA */}
        <AnimatedText delay={0.65}>
          <div className="flex justify-center">
            <Button to="/consultations" className="px-12 py-3 text-base">
              احجز موعدك الآن
            </Button>
          </div>
        </AnimatedText>
      </div>
    </section>
  );
};

export default WhyChooseUs;
