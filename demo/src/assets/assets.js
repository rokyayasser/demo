import profile_pic from "./profile_pic.png";
import dropdown_icon from "./dropdown_icon.svg";
import menu_icon from "./menu_icon.svg";
import cross_icon from "./cross_icon.png";
import header_img from "./header_img.jpg";

import verified_icon from "./verified_icon.svg";
import srvs1 from "./img1.png";
import srvs2 from "./img2.png";
import srvs3 from "./img3.png";
import srvs4 from "./img4.png";
import srvs5 from "./img5.png";
import srvs6 from "./img6.png";

export const assets = {
  profile_pic,
  menu_icon,
  cross_icon,
  dropdown_icon,
  header_img,
  verified_icon,
  srvs1,
  srvs2,
  srvs3,
  srvs4,
  srvs5,
  srvs6,
};

export const Medicalservices = [
  {
    _id: "1",
    title: "خدمات التغذية",
    category: "nutrition",
    category_ar: "التغذية",
    description: "تشخيص وعلاج جميع أمراض القلب والأوعية",
    image: srvs1,
    features: [
      "تقييم الحالة الغذائية",
      "وضع خطط غذائية شخصية",
      "متابعة فقدان أو زيادة الوزن",
    ],
    fees: 150,
  },
  {
    _id: "2",
    title: "الأمراض المزمنة",
    category: "chronic-diseases",
    category_ar: "الأمراض المزمنة",
    description: "نقدم رعاية شاملة للمرضى الذين يعانون من أمراض مزمنة",
    image: srvs2,
    features: [
      "علاج السكري وارتفاع الضغط",
      "خطة غذائية ونمط حياة صحي",
      "متابعة وتحليل مستمر",
    ],
    fees: 150,
  },
  {
    _id: "3",
    title: "أمراض القلب",
    category: "cardiology",
    category_ar: "أمراض القلب",
    description: "فريق متخصص لعلاج ومتابعة مشاكل القلب",
    image: srvs3,
    features: [
      "فحوصات شاملة للقلب",
      "تخطيط القلب والموجات الصوتية",
      "برامج الوقاية من أمراض القلب",
    ],
    fees: 150,
  },
  {
    _id: "4",
    title: "أمراض النساء والولادة",
    category: "gynecology",
    category_ar: "أمراض النساء والولادة",
    description: "رعاية طبية متكاملة للنساء من جميع الأعمار",
    image: srvs4,
    features: ["متابعة الحمل والولادة", "تنظيم الأسرة", "علاج أمراض النساء"],
    fees: 150,
  },
  {
    _id: "5",
    title: "طب الأطفال",
    category: "pediatrics",
    category_ar: "طب الأطفال",
    description: "نقدم خدمات طبية متخصصة للأطفال لضمان صحتهم",
    image: srvs5,
    features: [
      "التطعيمات الأساسية",
      "متابعة النمو والتطور",
      "علاج أمراض الطفولة",
    ],
    fees: 150,
  },
  {
    _id: "6",
    title: "طب العيون",
    category: "ophthalmology",
    category_ar: "طب العيون",
    description: "تشخيص وعلاج جميع مشاكل العين",
    image: srvs6,
    features: [
      "فحص النظر والقرنية",
      "علاج الالتهابات والحساسية",
      "عمليات الليزك وإزالة المياه البيضاء",
    ],
    fees: 150,
  },
  {
    _id: "7",
    title: "طب العظام",
    category: "orthopedics",
    category_ar: "طب العظام",
    description: "تشخيص وعلاج جميع مشاكل العظام",
    image: srvs2,
    features: [
      "فحص وتشخيص أمراض العظام",
      "علاج الالتهابات والإصابات",
      "إجراء العمليات الجراحية للعظام",
    ],
    fees: 150,
  },
  {
    _id: "8",
    title: "طب الأعصاب",
    category: "neurology",
    category_ar: "طب الأعصاب",
    description: "تشخيص وعلاج جميع مشاكل الأعصاب",
    image: srvs2,
    features: [
      "تشخيص أمراض الجهاز العصبي",
      "علاج الصداع المزمن والصرع",
      "تأهيل مرضى الشلل",
    ],
    fees: 150,
  },
  {
    _id: "9",
    title: "العلاج الطبيعي",
    category: "physiotherapy",
    category_ar: "العلاج الطبيعي",
    description: "تشخيص وعلاج جميع مشاكل الحركة والتأهيل",
    image: srvs2,
    features: [
      "إعادة التأهيل بعد الإصابات",
      "علاج مشاكل المفاصل والعضلات",
      "برامج علاجية مخصصة",
    ],
    fees: 150,
  },
  {
    _id: "10",
    title: "الطب البديل",
    category: "alternative-medicine",
    category_ar: "الطب البديل",
    description: "تشخيص وعلاج باستخدام الطب البديل",
    image: srvs2,
    features: ["العلاج بالأعشاب", "العلاج بالحجامة", "الوخز بالإبر"],
    fees: 150,
  },
];
