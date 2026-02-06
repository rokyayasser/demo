import React from "react";
import {
  Facebook,
  Instagram,
  Linkedin,
  MapPin,
  Mail,
  Phone,
  Youtube,
} from "lucide-react";
import { FaTiktok } from "react-icons/fa";

const Footer = () => {
  return (
    <footer
      dir="rtl"
      className="bg-white text-right text-textMain border-t border-borderLight pt-12"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-10">
        {/* --- Column 1 --- */}
        <div>
          <div className="flex items-center justify-start gap-3 mb-4">
            <div className="bg-gradient-to-tr from-secondary to-primary p-2 rounded-lg">
              <img
                src="https://img.icons8.com/ios-filled/50/ffffff/heart-with-pulse.png"
                alt="Logo"
                className="w-5 h-5"
              />
            </div>
            <h2 className="text-lg font-semibold text-primary">الخطيب فارما</h2>
          </div>
          <p className="text-sm leading-relaxed mb-5 text-textSoft">
            نحن نقدم أفضل الخدمات الطبية بأحدث التقنيات والمعدات الطبية
            المتطورة، مع فريق من الأطباء المتخصصين لضمان حصولكم على أفضل رعاية
            صحية.
          </p>
          <div className="flex justify-start gap-3 mt-4">
            <a
              href="https://www.facebook.com/AhmedElkhaateeb"
              className="bg-primary text-white p-2 rounded-full hover:bg-secondary transition"
            >
              <Facebook size={16} />
            </a>
            <a
              href="https://www.instagram.com/drahmedelkhateeb"
              className="bg-accent text-primary p-2 rounded-full hover:bg-secondary hover:text-white transition"
            >
              <Instagram size={16} />
            </a>
            <a
              href="https://www.youtube.com/@Dr_Ahmed_elkhateeb"
              className="bg-secondary text-white p-2 rounded-full hover:bg-primary transition"
            >
              <Youtube size={16} />
            </a>
            <a
              href="https://www.tiktok.com/@drahmedelkhateeb"
              className="bg-secondary text-white p-2 rounded-full hover:bg-primary transition"
            >
              <FaTiktok size={16} />
            </a>
          </div>
        </div>

        {/* --- Column 2 --- */}
        <div>
          <h3 className="text-base font-semibold mb-4 text-primary flex items-center justify-start gap-2">
            خدماتنا الطبية
            <img
              src="https://img.icons8.com/external-flatart-icons-outline-flatarticons/64/228BE6/external-healthcare-health-and-medicine-flatart-icons-outline-flatarticons.png"
              alt=""
              className="w-5"
            />
          </h3>
          <ul className="space-y-2 text-sm text-textSoft">
            <li className="hover:text-primary cursor-pointer transition">
              طب الأسرة والطب العام
            </li>
            <li className="hover:text-primary cursor-pointer transition">
              طب الأطفال
            </li>
            <li className="hover:text-primary cursor-pointer transition">
              طب النساء والولادة
            </li>
            <li className="hover:text-primary cursor-pointer transition">
              طب القلب والأوعية الدموية
            </li>
            <li className="hover:text-primary cursor-pointer transition">
              طب العيون
            </li>
            <li className="hover:text-primary cursor-pointer transition">
              طب الأسنان
            </li>
          </ul>
        </div>

        {/* --- Column 3 --- */}
        <div>
          <h3 className="text-base font-semibold mb-4 text-primary flex items-center justify-start gap-2">
            روابط مهمة
            <img
              src="https://img.icons8.com/ios/50/16a34a/link.png"
              alt=""
              className="w-5"
            />
          </h3>
          <ul className="space-y-2 text-sm text-textSoft">
            <li className="hover:text-primary cursor-pointer transition">
              عن العيادة
            </li>
            <li className="hover:text-primary cursor-pointer transition">
              فريق الأطباء
            </li>
            <li className="hover:text-primary cursor-pointer transition">
              حجز موعد
            </li>
            <li className="hover:text-primary cursor-pointer transition">
              التأمين الطبي
            </li>
            <li className="hover:text-primary cursor-pointer transition">
              المقالات الطبية
            </li>
            <li className="hover:text-primary cursor-pointer transition">
              اتصل بنا
            </li>
          </ul>
        </div>

        {/* --- Column 4 --- */}
        <div>
          <h3 className="text-base font-semibold mb-4 text-primary flex items-center justify-start gap-2">
            تواصل معنا
            <img
              src="https://img.icons8.com/ios-filled/50/16a34a/phone-disconnected.png"
              alt=""
              className="w-5"
            />
          </h3>
          <ul className="space-y-3 text-sm text-textSoft">
            <li className="flex items-center justify-start gap-2">
              شارع الملك فهد، حي السليمانية، <br /> الرياض، المملكة العربية
              السعودية
              <MapPin size={16} className="text-secondary" />
            </li>
            <li className="flex items-center justify-start gap-2">
              +966 11 123 4567 <Phone size={16} className="text-secondary" />
            </li>
            <li className="flex items-center justify-start gap-2">
              info@clinic-shifa.com{" "}
              <Mail size={16} className="text-secondary" />
            </li>
            <li className="text-textSoft text-xs mt-2 leading-relaxed">
              السبت - الخميس: 8:00 ص - 10:00 م <br />
              الجمعة: 2:00 م - 10:00 م
            </li>
          </ul>
        </div>
      </div>

      {/* --- Bottom Copyright --- */}
      <div className="border-t border-borderLight mt-6 py-4 text-xs text-center text-textSoft">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 max-w-7xl mx-auto px-6 md:px-10">
          <p>© 2024 الخطيب فارما. جميع الحقوق محفوظة </p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-primary transition">
              سياسة الخصوصية
            </a>
            <a href="#" className="hover:text-primary transition">
              شروط الاستخدام
            </a>
            <a href="#" className="hover:text-primary transition">
              سياسة ملفات تعريف الارتباط
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
