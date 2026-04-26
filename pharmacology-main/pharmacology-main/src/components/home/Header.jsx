import React, { useState, useEffect } from "react";
import { FaInstagram, FaFacebookF, FaYoutube, FaTiktok } from "react-icons/fa";
import { FaCalendarDays, FaChevronRight, FaChevronLeft } from "react-icons/fa6";
import img1 from '../../assets/1.webp';
import img2 from "../../assets/2.webp";
import img3 from "../../assets/3.webp";
import img4 from "../../assets/4.webp";
import img5 from "../../assets/5.webp";
import img6 from "../../assets/6.webp";
import img7 from "../../assets/7.webp";
import img8 from "../../assets/8.webp";

import Button from "../common/Button";

// تحديث هيكل البيانات لدعم الصور والفيديوهات، وفصل الموبايل عن الديسكتوب
const initialData = [
  {
    id: 1,
    // Desktop Media (e.g., Video)
    desktop: { url: img1, type: "img" },
    // Mobile Media (e.g., Image specifically for phone)
    mobile: { url: img5, type: "img" },
    title: "ما بين الدواء والغذاء قصة.. سأحكيها لك.",
    des: "استشارات متخصصة ودورات معتمدة في التغذية السريرية وعلم الأدوية من نخبة الخبراء في المجال.",
  },
  {
    id: 2,
    desktop: { url: img2, type: "image" },
    mobile: { url: img6, type: "image" }, 
    title: "صحتك تبدأ من غذائك",
    des: "برامج غذائية مصممة خصيصاً لتناسب احتياجاتك الصحية وأهدافك الشخصية بخطوات علمية مدروسة.",
  },
  {
    id: 3,
    desktop: { url: img3, type: "image" },
    mobile: { url: img7, type: "image" },
    title: "الرعاية المتكاملة لحياتك",
    des: "نقدم لك استشارات شاملة تجمع بين الطب الحديث وأسلوب الحياة الصحي لضمان أفضل النتائج.",
  },
  {
    id: 4,
    desktop: { url: img4, type: "image" },
    mobile: { url: img8, type: "image" },
    title: "خطتك الدوائية بأمان",
    des: "تقييم شامل لأدويتك ومكملاتك الغذائية لتجنب التفاعلات الضارة وتحقيق أقصى استفادة.",
  },
];

const Header = () => {
  const [items, setItems] = useState(initialData);

  const handleNext = () => {
    setItems((prevItems) => [...prevItems.slice(1), prevItems[0]]);
  };

  const handlePrev = () => {
    setItems((prevItems) => [
      prevItems[prevItems.length - 1],
      ...prevItems.slice(0, prevItems.length - 1),
    ]);
  };

  useEffect(() => {
    const autoPlayInterval = setInterval(() => {
      setItems((prevItems) => [...prevItems.slice(1), prevItems[0]]);
    }, 6000);

    return () => clearInterval(autoPlayInterval);
  }, []);

  const handleItemClick = (index) => {
    if (index === 1) return;

    setItems((prevItems) => {
      if (index === 0) {
        return [
          prevItems[prevItems.length - 1],
          ...prevItems.slice(0, prevItems.length - 1),
        ];
      }
      const shifts = index - 1;
      return [...prevItems.slice(shifts), ...prevItems.slice(0, shifts)];
    });
  };

  const handleDotClick = (targetId) => {
    const currentIndex = items.findIndex((item) => item.id === targetId);
    if (currentIndex === 1) return;

    setItems((prevItems) => {
      let shifts = currentIndex - 1;
      if (shifts < 0) shifts = prevItems.length + shifts;
      return [...prevItems.slice(shifts), ...prevItems.slice(0, shifts)];
    });
  };

  // دالة مساعدة لعمل Render للميديا (فيديو أو صورة)
  const renderMedia = (mediaObj, visibilityClass) => {
    if (!mediaObj) return null;

    if (mediaObj.type === "video") {
      return (
        <video
          src={mediaObj.url}
          autoPlay
          loop
          muted
          playsInline
          className={`absolute inset-0 w-full h-full object-cover z-0 ${visibilityClass}`}
        />
      );
    }

    return (
      <img
        src={mediaObj.url}
        alt="Carousel background"
        className={`absolute inset-0 w-full h-full object-cover z-0 ${visibilityClass}`}
      />
    );
  };

  return (
    <header className="relative w-full h-screen overflow-hidden bg-gray-900 text-white" dir="rtl">
      {/* Social Media Sidebar */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-6 border-r border-gray-400/50 pr-6 hidden md:flex">
        <a href="https://www.facebook.com/DrAhmedElkhaateeb" target="_blank" rel="noreferrer" className="text-xl hover:text-blue-400 transition-colors"><FaFacebookF /></a>
        <a href="https://www.instagram.com/drahmedelkhateeb" target="_blank" rel="noreferrer" className="text-xl hover:text-pink-400 transition-colors"><FaInstagram /></a>
        <a href="https://www.youtube.com/@Dr_Ahmed_elkhateeb" target="_blank" rel="noreferrer" className="text-xl hover:text-red-600 transition-colors"><FaYoutube /></a>
        <a href="https://tiktok.com/@drahmedelkhateeb" target="_blank" rel="noreferrer" className="text-xl hover:text-black transition-colors"><FaTiktok /></a>
      </div>

      {/* Carousel Container */}
      <div className="absolute inset-0 w-full h-full">
        {items.map((item, index) => (
          <div
            key={item.id}
            onClick={() => handleItemClick(index)}
            className={` carousel-item shadow-2xl overflow-hidden transition-all duration-700 ease-in-out ${
              index !== 1 ? "cursor-pointer hover:brightness-110" : ""
            }`}
          >
            {/* Desktop Media (Hidden on Mobile) */}
            {renderMedia(item.desktop, "hidden md:block")}

            {/* Mobile Media (Hidden on Desktop) */}
            {renderMedia(item.mobile, "block md:hidden")}

            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-l from-black/80 to-black/20 z-10 pointer-events-none"></div>

            {/* Content Area */}
            <div className="carousel-content absolute top-5/7 md:top-1/2 right-[5%] md:right-[10%] w-[90%] md:w-full max-w-[600px] -translate-y-1/2 text-right z-20">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4 md:mb-6 text-white drop-shadow-lg pointer-events-none">
                {item.title}
              </h1>
              <p className="text-base md:text-xl text-gray-200 mb-6 md:mb-8 leading-relaxed pointer-events-none">
                {item.des}
              </p>
              <div className="pointer-events-auto w-fit">
                <Button to={'/consultations'} className="cursor-pointer">
                  ابدأ رحلتك الصحيه الان
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="absolute bottom-2 md:bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl">
        <Button onClick={handlePrev} className="w-10 h-10 flex items-center justify-center bg-white text-black rounded-full hover:scale-110 transition-transform">
          <FaChevronRight />
        </Button>
        <div className="flex gap-2">
          {initialData.map((dataItem) => {
            const isActive = items[1]?.id === dataItem.id;
            return (
              <span
                key={dataItem.id}
                onClick={() => handleDotClick(dataItem.id)}
                className={`h-2 rounded-full transition-all duration-500 cursor-pointer hover:bg-white ${
                  isActive ? "w-6 bg-white" : "w-2 bg-white/50"
                }`}
              ></span>
            );
          })}
        </div>
        <Button onClick={handleNext} className="w-10 h-10 flex items-center justify-center bg-white text-black rounded-full hover:scale-110 transition-transform">
          <FaChevronLeft />
        </Button>
      </div>

      {/* CSS for Carousel Logic */}
      <style dangerouslySetInnerHTML={{__html: `
        .carousel-item {
          position: absolute;
          width: 260px;
          height: 200px;
          border-radius: 16px;
          display: inline-block;
          top: 60%;
          box-shadow: 0 10px 20px rgba(0,0,0,0.3);
        }

        /* Active full-screen slides */
        .carousel-item:nth-child(1),
        .carousel-item:nth-child(2) {
          top: 0;
          left: 0;
          transform: translate(0, 0);
          border-radius: 0;
          width: 100%;
          height: 100%;
          box-shadow: none;
        }

        /* Thumbnails positioned on the bottom left */
        .carousel-item:nth-child(3) { left: 5%; }
        .carousel-item:nth-child(4) { left: calc(5% + 280px); }
        .carousel-item:nth-child(5) { left: calc(5% + 560px); }
        .carousel-item:nth-child(n + 6) { left: calc(5% + 840px); opacity: 0; }

        @media (max-width: 768px) {
          .carousel-item:nth-child(n + 3) {
            display: none !important;
          }
        }

        .carousel-content { display: none; }
        .carousel-item:nth-child(2) .carousel-content { display: block; }

        @keyframes fadeInRtl {
          from { opacity: 0; transform: translateY(30px); filter: blur(5px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }

        .carousel-item:nth-child(2) .carousel-content h1 { opacity: 0; animation: fadeInRtl 0.6s ease-out 0.4s 1 forwards; }
        .carousel-item:nth-child(2) .carousel-content p { opacity: 0; animation: fadeInRtl 0.6s ease-out 0.6s 1 forwards; }
        .carousel-item:nth-child(2) .carousel-content .pointer-events-auto { opacity: 0; animation: fadeInRtl 0.6s ease-out 0.8s 1 forwards; }
      `}} />
    </header>
  );
};

export default Header;