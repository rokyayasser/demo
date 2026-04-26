/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Briefcase, Globe, HeartPulse, Award, ArrowDown, Activity, Lightbulb, Leaf, Scale, Quote, Heart, Target, User, Apple, Beaker, ShieldCheck, X, ArrowLeft } from "lucide-react";
import { assets } from "../assets/assets"; // تأكد من مسار الصور
import AnimatedText from "../components/common/AnimatedContent";
import Button from "../components/common/Button";
import SocialSection from "../components/home/SocialSection";
import CTA from "../components/home/CTA";

// (Timeline Data)
const timelineData = [
  {
    id: 1,
    year: "2006",
    title: "بكالوريوس الصيدلة",
    subtitle: "جامعة أسيوط",
    desc: "التخرج بدرجة البكالوريوس في العلوم الصيدلانية وبداية الرحلة في عالم الطب والدواء.",
    image: assets.header1,
    icon: <GraduationCap size={24} />,
  },
  {
    id: 2,
    year: "2006-2008",
    title: "بداية الممارسة المهنية",
    subtitle: "مصر",
    desc: "العمل كصيدلي في مصر واكتساب الخبرة العملية الأولى.",
    image: assets.header2,
    icon: <Briefcase size={24} />,
  },
  {
    id: 3,
    year: "2008-2015",
    title: "التوسع الإقليمي",
    subtitle: "دول الخليج",
    desc: "العمل في مجال الصيدلة بدول الخليج والتعرف على أنظمة صحية مختلفة.",
    image: assets.header3,
    icon: <Globe size={24} />,
  },
  {
    id: 4,
    year: "2015-2018",
    title: "مندوب طبي",
    subtitle: "شركات أدوية عالمية",
    desc: "فهم عميق لآلية عمل الأدوية والجسم من خلال العمل مع كبرى شركات الأدوية.",
    image: assets.header4,
    icon: <Activity size={24} />,
  },
  {
    id: 5,
    year: "2018-2020",
    title: "التخصص في الطب الشمولي",
    subtitle: "التغذية العلاجية",
    desc: "التركيز على البيوكيمياء وكيفية تفاعل الجسم مع الغذاء والدواء لمعالجة الجذور.",
    image: assets.header1,
    icon: <HeartPulse size={24} />,
  },
  {
    id: 6,
    year: "2020-2025",
    title: "المؤثر الرقمي ورائد التغذية",
    subtitle: "التغذية العلاجية",
    desc: "نشر الوعي الصحي لملايين المتابعين وتغيير حياة آلاف المرضى للأفضل.",
    image: assets.header2,
    icon: <Award size={24} />,
  },
];


// (Certificates Data)

const certificatesData = [
  {
    id: 1,
    title: "SCOPE Certified",
    subtitle: "World Obesity Federation",
    desc: "اعتماد دولي في إدارة السمنة وعلاجها وفق أحدث المعايير العالمية.",
    image: assets.certeficate1,
    icon: <Award size={18} />,
  },
  {
    id: 2,
    title: "Weight Management",
    subtitle: "Emory University",
    desc: "برنامج متخصص في إدارة الوزن من إحدى أعرق الجامعات الأمريكية.",
    image: assets.certeficate2,
    icon: <Scale size={18} />,
  },
  {
    id: 3,
    title: "Food & Health",
    subtitle: "Stanford University",
    desc: "شهادة في العلاقة بين الغذاء والصحة من جامعة ستانفورد العالمية.",
    image: assets.certeficate1,
    icon: <Apple size={18} />,
  },
  {
    id: 4,
    title: "Clinical Nutrition",
    subtitle: "Mediance Academy",
    desc: "دبلوم متخصص في التغذية الإكلينيكية وتطبيقاتها العلاجية.",
    image: assets.certeficate2,
    icon: <Beaker size={18} />,
  },
  {
    id: 5,
    title: "Total Nutrition Diploma",
    subtitle: "ONE Training Academy",
    desc: "دبلوم شامل في التغذية الكاملة يغطي جميع جوانب الصحة الغذائية.",
    image: assets.certeficate1,
    icon: <Heart size={18} />,
  },
  {
    id: 6,
    title: "Florida Academy Certifications",
    subtitle: "Florida Academy",
    desc: "شهادات متعددة في التغذية والصحة الشاملة من أكاديمية فلوريدا.",
    image: assets.certeficate2,
    icon: <ShieldCheck size={18} />,
  },
  {
    id: 7,
    title: "Holistic Nutrition",
    subtitle: "School of Natural Health Sciences",
    desc: "تخصص في التغذية الشاملة والطب الطبيعي من مدرسة العلوم الصحية.",
    image: assets.certeficate1,
    icon: <Leaf size={18} />,
  },
  {
    id: 8,
    title: "بكالوريوس الصيدلة",
    subtitle: "جامعة أسيوط",
    desc: "الأساس العلمي الأكاديمي الذي بنى عليه الدكتور أحمد مسيرته المهنية.",
    image: assets.certeficate2,
    icon: <GraduationCap size={18} />,
  }
];



const About = () => {
  // للنزول السلس إلى قسم الخط الزمني
  const scrollToTimeline = () => {
    const timelineSection = document.getElementById("timeline-section");
    if (timelineSection) {
      timelineSection.scrollIntoView({ behavior: "smooth" });
    }
  };


  // --- ضع هذا الـ State في بداية مكون About ---
  const [selectedCert, setSelectedCert] = useState(null);


  // لمنع التمرير (Scroll) في الصفحة الخلفية عندما تكون النافذة المنبثقة مفتوحة
  useEffect(() => {
    if (selectedCert) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedCert]);


  return (
    // استخدام لون الخلفية البنفسجي الداكن كما في التصميم
    <div className=" mt-40 my-12 min-h-screen   font-sans overflow-hidden" dir="rtl">
      {/* ================= Hero Section ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 mb-32">
        <div className="flex flex-col lg:flex-row items-center gap-16">

          {/* Right Text Content */}
          <div className="w-full lg:w-1/2 text-right">
            <AnimatedText delay={0.1}>
              <div className="inline-block bg-white/20 text-gray-300 px-6 py-2 rounded-full text-sm font-medium mb-6 border border-white/5">
                أخصائي تغذية علاجية وطب شمولي
              </div>
            </AnimatedText>

            <AnimatedText delay={0.2}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                من هو دكتور <br /> أحمد الخطيب؟
              </h1>
            </AnimatedText>

            <AnimatedText delay={0.3}>
              <p className="text-gray-300 text-lg leading-loose mb-10 max-w-lg opacity-90">
                صيدلي وأخصائي تغذية علاجية متخصص في الطب الشمولي. <br />
                رحلتي بدأت في الصيدلة، لكن مهمتي أصبحت فهم جذور الصحة – وليس فقط علاج الأعراض. أؤمن بأن الصحة الحقيقية تبدأ من تغيير نمط الحياة.
              </p>
            </AnimatedText>

            <AnimatedText delay={0.4}>
              <Button
                onClick={scrollToTimeline}

              >
                <div className="flex items-center justify-center gap-3 ">
                  تعرف على رحلتي
                  <ArrowDown size={20} className="animate-bounce" />
                </div>
              </Button>
            </AnimatedText>
          </div>

          {/* Left Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-1/2"
          >
            <div className="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
              {/* صورة الدكتور في الـ Hero */}
              <img
                src={assets.header1}
                alt="د. أحمد الخطيب"
                className="w-full h-auto object-cover aspect-[4/3]"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#13072e]/50 to-transparent pointer-events-none"></div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ================= Timeline Section ================= */}
      <div id="timeline-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 relative">

        {/* الخط العمودي المركزي (للشاشات الكبيرة) */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/10 -translate-x-1/2"></div>

        <div className="space-y-20 md:space-y-32">
          {timelineData.map((item, index) => (
            <div key={item.id} className="relative flex flex-col md:flex-row items-center justify-between w-full">

              {/* === العمود الأيمن في الـ Grid (الصور) === */}
              {/* يظهر على اليمين بصرياً بسبب dir="rtl" */}
              <div className="w-full md:w-[45%] flex justify-end md:justify-start mb-8 md:mb-0">
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className="w-full max-w-sm rounded-[2rem] overflow-hidden border-2 border-white/5 shadow-xl hidden md:block"
                >
                  <img src={item.image} alt={item.title} className="w-full h-48 lg:h-56 object-cover" />
                </motion.div>
              </div>

              {/* === المركز (الأيقونة والتاريخ) === */}
              <div className="absolute left-8 md:left-1/2 md:-translate-x-1/2 flex flex-col items-center z-10">
                <span className="text-gray-400 text-sm font-bold mb-3 bg-[#13072e] px-2">{item.year}</span>
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  className="w-14 h-14 rounded-full bg-[#8349c7] flex items-center justify-center text-white border-4 border-[#13072e] shadow-[0_0_15px_rgba(131,73,199,0.5)]"
                >
                  {item.icon}
                </motion.div>
              </div>

              {/* === العمود الأيسر في الـ Grid (الكروت البيضاء) === */}
              {/* الخط في الموبايل يكون على اليسار، لذا نعطي padding يمين للكارت في الموبايل */}
              <div className="w-full md:w-[45%] pl-20 md:pl-0 flex justify-start md:justify-end">
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className="bg-white rounded-2xl p-6 md:p-8 w-full shadow-lg hover:shadow-xl transition-shadow relative"
                >
                  {/* السهم الصغير الذي يشير للأيقونة (Desktop Only) */}
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-6 bg-white rotate-45 -translate-y-1/2"></div>

                  <h3 className="text-xl md:text-2xl font-bold gradient-text mb-1">
                    {item.title}
                  </h3>
                  <p className="text-[#340d60] font-medium text-sm md:text-base mb-4">
                    {item.subtitle}
                  </p>
                  <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                    {item.desc}
                  </p>
                </motion.div>
              </div>

            </div>
          ))}
        </div>
      </div>


      {/* ================= (Turning Point) ================= */}
      <div className="relative w-full py-24 mt-20 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">

          {/* Header */}
          <div className="flex flex-col items-center text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white mb-6 shadow-lg border border-white/20"
            >
              <Lightbulb size={24} />
            </motion.div>

            <AnimatedText delay={0.1}>
              <h2 className="text-3xl md:text-5xl f mb-4">نقطة التحول</h2>
            </AnimatedText>

            <AnimatedText delay={0.2}>
              <p className="text-lg md:text-xl max-w-2xl opacity-90">
                أدركت أن الدواء وحده ليس الحل الجذري. الشفاء الحقيقي يبدأ من تغيير نمط الحياة.
              </p>
            </AnimatedText>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                title: "التغذية العلاجية",
                desc: "التحول نحو الغذاء كدواء حقيقي يعالج الجذور لا الأعراض",
                icon: <Leaf size={24} />
              },
              {
                title: "الطب الشمولي",
                desc: "دراسة الشفاء الشامل الذي يجمع بين الجسم والعقل والبيئة",
                icon: <HeartPulse size={24} />
              },
              {
                title: "توازن الحياة",
                desc: "الإيمان العميق بأن التوازن الغذائي هو أساس الصحة المستدامة",
                icon: <Scale size={24} />
              }
            ].map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + (index * 0.1) }}
                className="bg-[#e4ddef] rounded-2xl p-8 flex flex-col items-center text-center shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-white/70 flex items-center justify-center text-[#2d1b5a] mb-6 shadow-sm">
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold gradient-text mb-3">{card.title}</h3>
                <p className="text-[#432570] font-medium leading-relaxed text-sm md:text-base">
                  {card.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Quote Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="bg-white/70 rounded-3xl py-10 px-8 md:px-16 flex items-center justify-between relative overflow-hidden shadow-2xl"
          >
            {/* علامة تنصيص يمين */}
            <Quote className="text-[#6B3FA0] opacity-40 rotate-180 absolute right-0 top-4" size={50} />

            <h3 className="text-2xl md:text-4xl font-bold gradient-text text-center w-full z-10 relative">
              الصحة الحقيقية تبدأ من كيفية عيشنا
            </h3>

            {/* علامة تنصيص يسار */}
            <Quote className="text-[#6B3FA0] opacity-40 absolute left-0 bottom-4" size={50} />
          </motion.div>

        </div>
      </div>


      {/* =================(Social Section) ================= */}

      <AnimatedText delay={0.1}>
        <SocialSection />
      </AnimatedText>



      {/* =================(Mission Statement) ================= */}
      <div className="">
        <div className=" px-4 sm:px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl md:rounded-[2.5rem] shadow-2xl p-10 md:p-16 flex flex-col items-center text-center relative overflow-hidden"
          >
            {/* الأيقونة العلوية (القلب) */}
            <div className="w-20 h-20 rounded-full bg-[#f5f0ff] border-2 border-[#d9c7f2] flex items-center justify-center text-[#2d1b5a] mb-8 shadow-sm">
              <Heart size={36} />
            </div>

            {/* النص الرئيسي */}
            <AnimatedText delay={0.2}>
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold gradient-text leading-[1.6] mb-16 max-w-4xl">
                نحن لا نعالج أعراضاً، بل نبني إنساناً جديداً بصحة أقوى من خلال تغيير أساسيات الحياة
              </h2>
            </AnimatedText>

            {/* المميزات السفلية الثلاثة */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 w-full">
              {[
                { text: "علاج الجذور لا الأعراض", icon: <Target size={22} /> },
                { text: "الغذاء هو الدواء الأول", icon: <Leaf size={22} /> },
                { text: "بناء إنسان صحي متكامل", icon: <User size={22} /> },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + (index * 0.1) }}
                  className="flex items-center gap-4"
                >
                  <div className="p-3 rounded-xl bg-[#f5f0ff] border border-[#d9c7f2] text-[#2d1b5a] flex items-center justify-center shadow-sm">
                    {item.icon}
                  </div>
                  <span className="text-[#2d1b5a] font-bold text-lg md:text-xl">
                    {item.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>



      {/* ================= Certificates ================= */}
      {/* ================= قسم الشهادات المعتمدة ================= */}
      <div className="w-full py-20  relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">

          {/* عنوان القسم */}
          <div className="text-right mb-12">
            <AnimatedText delay={0.1}>
              <h2 className="text-3xl md:text-5xl font-bold  mb-4">
                الشهادات المعتمدة
              </h2>
            </AnimatedText>
            <AnimatedText delay={0.2}>
              <p className="text-lg md:text-xl font-medium">
                اعتمادات دولية ومسيرة علمية مستمرة لتقديم أفضل رعاية.
              </p>
            </AnimatedText>
          </div>

          {/* شبكة الشهادات (Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {certificatesData.map((cert, index) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedCert(cert)} // فتح النافذة عند الضغط على الكارت
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col border border-gray-100 group cursor-pointer"
              >

                <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                  <img
                    src={cert.image}
                    alt={cert.title}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white to-transparent"></div>

                  <div className="absolute bottom-3 right-3 bg-[#432570] text-white p-2.5 rounded-xl shadow-lg">
                    {cert.icon}
                  </div>
                </div>

                {/* الجزء السفلي: النصوص */}
                <div className="p-6 flex flex-col flex-grow text-right">
                  <h3 className="text-[#2d1b5a] font-bold text-lg mb-1">{cert.title}</h3>
                  <p className="text-[#9b61db] text-sm font-medium mb-3">{cert.subtitle}</p>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-grow line-clamp-2">
                    {cert.desc}
                  </p>

                  <button className="flex items-center gap-2 text-[#432570] font-bold text-sm group-hover:text-[#9b61db] transition-colors w-full justify-start mt-auto pointer-events-none">
                    <ArrowLeft size={16} />
                    اضغط للعرض
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ================= (Modal) ================= */}
        <AnimatePresence>
          {selectedCert && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0a051d]/80 backdrop-blur-sm"
              onClick={() => setSelectedCert(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                className="relative bg-white rounded-3xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl"
                onClick={(e) => e.stopPropagation()} // منع الإغلاق عند الضغط داخل النافذة
                dir="rtl"
              >

                {/* رأس النافذة (Header) */}
                <div className="flex items-center justify-between p-5 md:p-6 border-b border-gray-100 bg-white z-10">
                  <div className="flex items-center gap-4">
                    <div className="bg-[#f4f0f8] text-[#432570] p-3 rounded-xl hidden sm:block">
                      {selectedCert.icon}
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-[#2d1b5a]">{selectedCert.title}</h3>
                      <p className="text-[#9b61db] text-sm font-medium">{selectedCert.subtitle}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedCert(null)}
                    className="p-2.5 bg-gray-50 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* محتوى النافذة (الصورة) */}
                <div className="p-4 md:p-8 overflow-y-auto flex-grow bg-[#fcfcfc] flex flex-col items-center">
                  <img
                    src={selectedCert.image}
                    alt={selectedCert.title}
                    className="w-full max-h-[60vh] object-contain rounded-xl shadow-sm border border-gray-200"
                  />
                  <p className="text-gray-600 text-center mt-6 max-w-2xl leading-relaxed text-lg">
                    {selectedCert.desc}
                  </p>
                </div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>



      {/* ================= (CTA) ================= */}

      <CTA />


    </div>
  );
};

export default About;