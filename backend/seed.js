// seed.js
require("dotenv").config();
const mongoose = require("mongoose");

// ─── Connect ─────────────────────────────────────────────────────────────────
async function connect() {
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.DB_NAME,
  });
  console.log("✅ Connected to MongoDB");
}

// ─── Models ───────────────────────────────────────────────────────────────────
const Course = require("./src/models/Course");
const Product = require("./src/models/Product");
const MedicalService = require("./src/models/MedicalService");

// ─── Seed Data ────────────────────────────────────────────────────────────────

const coursesData = [
  {
    title: "Therapeutic Nutrition Course",
    title_ar: "كورسات التغذية الصحية مع د. أحمد الخطيب",
    description:
      "Learn the fundamentals of proper nutrition, meal planning, and building a healthy lifestyle.",
    description_ar:
      "تعلم أسس التغذية السليمة، تنظيم الوجبات، وبناء نمط حياة صحي بخطوات سهلة وتطبيق عملي من المنزل.",
    category: "تغذية",
    image:
      "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=600&auto=format&fit=crop",
    price: 450,
    duration: "40 ساعة",
    totalLessons: 20,
    instructor: "د. أحمد الخطيب",
    tags: ["شهادة معتمدة", "أونلاين", "مبتدئ"],
    features: [
      { text: "برنامج صحي عملي", iconName: "heart" },
      { text: "مرونة في التعلم", iconName: "calendar" },
      { text: "متابعة عبر الإيميل", iconName: "mail" },
      { text: "شهادة معتمدة", iconName: "award" },
    ],
    timeline: [
      "التسجيل في الكورس",
      "استلام الدروس عبر الإيميل",
      "تطبيق البرنامج الغذائي",
      "الحصول على الشهادة",
    ],
    note: "بعد الاشتراك سيتم إرسال رابط الكورس على بريدك الإلكتروني.",
    available: true,
  },
];

const productsData = [
  {
    title: "Insulin Sensitivity Support Supplement",
    title_ar: "مكمل دعم حساسية الإنسولين",
    subtitle:
      "تركيبة مدروسة لدعم التوازن الهرموني وتحسين استجابة الجسم للإنسولين.",
    subtitle_ar:
      "تركيبة مدروسة لدعم التوازن الهرموني وتحسين استجابة الجسم للإنسولين.",
    description:
      "Advanced formula to support hormonal balance and improve insulin response.",
    description_ar:
      "تُعد مقاومة الإنسولين من أكثر المشكلات الصحية انتشاراً في العصر الحديث، وهي سبب رئيسي في زيادة الوزن وصعوبة فقدانه.",
    category: "مكملات غذائية",
    image:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600&auto=format&fit=crop",
    price: 450,
    dosage: "يُنصح بتناول كبسولة واحدة يومياً بعد وجبة الإفطار.",
    ingredients:
      "يحتوي على مزيج من الكروميوم، مستخلص القرفة، حمض الألفا ليبويك.",
    warnings: "يُمنع استخدامه للحوامل والمرضعات بدون استشارة طبية.",
    weeklyDiscount: "10%",
    monthlyDiscount: "20%",
    stock: 100,
    available: true,
    featured: true,
    meta: { rating: 4.9, reviewCount: 24 },
  },
  {
    title: "Japanese Matcha Tea",
    title_ar: "شاي الماتشا الياباني",
    subtitle: "شاي ماتشا عضوي 100%، لزيادة معدل الحرق وتحسين مستويات الطاقة.",
    subtitle_ar:
      "شاي ماتشا عضوي 100%، لزيادة معدل الحرق وتحسين مستويات الطاقة.",
    description:
      "100% organic matcha tea, rich in antioxidants to boost metabolism.",
    description_ar:
      "شاي ماتشا عضوي 100%، غني بمضادات الأكسدة لزيادة معدل الحرق وتحسين مستويات الطاقة والتركيز بشكل طبيعي.",
    category: "شاي ومشروبات",
    image:
      "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=600&auto=format&fit=crop",
    price: 220,
    dosage:
      "ملعقة صغيرة تُمزج مع الماء الساخن أو الحليب النباتي مرة إلى مرتين يومياً.",
    ingredients:
      "أوراق الشاي الأخضر الياباني (الماتشا) العضوية المطحونة بنسبة 100%.",
    warnings:
      "يحتوي على الكافيين الطبيعي. يُنصح بعدم تناوله قبل النوم بـ 4 ساعات.",
    weeklyDiscount: "5%",
    monthlyDiscount: "15%",
    stock: 200,
    available: true,
    featured: false,
    meta: { rating: 4.7, reviewCount: 18 },
  },
  {
    title: "Complete Plant Protein",
    title_ar: "بروتين نباتي متكامل",
    subtitle: "مزيج من البروتين النباتي المعزول، مثالي لدعم الاستشفاء العضلي.",
    subtitle_ar:
      "مزيج من البروتين النباتي المعزول، مثالي لدعم الاستشفاء العضلي.",
    description: "Blend of isolated plant protein, ideal for muscle recovery.",
    description_ar:
      "مزيج من البروتين النباتي المعزول، مثالي للرياضيين والنباتيين لدعم الاستشفاء العضلي.",
    category: "بروتين",
    image:
      "https://images.unsplash.com/photo-1585236034176-b601f01c221e?q=80&w=600&auto=format&fit=crop",
    price: 350,
    dosage:
      "مكيال واحد (30 جم) يُخلط مع 250 مل من الماء أو حليب اللوز بعد التمرين.",
    ingredients:
      "بروتين البازلاء، بروتين الأرز البني، مستخلص الفانيليا الطبيعي، ستيفيا.",
    warnings:
      "تأكد من شرب كميات كافية من الماء يومياً عند تناول المكملات البروتينية.",
    weeklyDiscount: "10%",
    monthlyDiscount: "25%",
    stock: 80,
    available: true,
    featured: true,
    meta: { rating: 4.8, reviewCount: 31 },
  },
];

const medicalServicesData = [
  {
    title: "Online Consultation",
    title_ar: "استشارة أونلاين",
    category: "استشارات طبية",
    category_ar: "استشارات طبية",
    description:
      "استشارة طبية احترافية عبر الإنترنت من منزلك. احصل على نصائح الخبراء وخطط علاجية مخصصة.",
    image:
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=600&auto=format&fit=crop",
    features: [
      "جلسة فيديو مباشرة عبر الإنترنت",
      "تقييم شامل للحالة الصحية",
      "توصيات غذائية مخصصة",
      "خطة عمل واضحة ومحددة",
      "متابعة عبر الرسائل لمدة أسبوع",
    ],
    fees: 170,
    duration: "45 دقيقة",
    available: true,
    meta: {
      views: 0,
      bookings: 0,
      rating: 0,
    },
  },
  {
    title: "Comprehensive Nutrition Plan",
    title_ar: "متابعة غذائية شاملة",
    category: "تغذية علاجية",
    category_ar: "تغذية علاجية",
    description:
      "برنامج متكامل لتطوير نمط الحياة الصحي، مقدم بواسطة أفضل خبراء التغذية، مع جداول مرنة تناسب يومك.",
    image:
      "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=600&auto=format&fit=crop",
    features: [
      "خطة غذائية مخصصة",
      "متابعة أسبوعية",
      "تعديلات حسب التقدم",
      "دعم عبر الواتساب",
    ],
    fees: 250,
    duration: "60 دقيقة",
    available: true,
    meta: {
      views: 0,
      bookings: 0,
      rating: 0,
    },
  },
  {
    title: "Sports Nutrition Plan",
    title_ar: "خطة تغذية رياضية",
    category: "تغذية رياضية",
    category_ar: "تغذية رياضية",
    description:
      "توجيه مخصص للرياضيين لرفع الكفاءة البدنية وزيادة الكتلة العضلية بأحدث الأساليب المعتمدة دولياً.",
    image:
      "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=600&auto=format&fit=crop",
    features: [
      "تحليل الاحتياجات الغذائية",
      "خطة قبل وبعد التمرين",
      "توصيات للمكملات",
      "متابعة الأداء",
    ],
    fees: 200,
    duration: "50 دقيقة",
    available: true,
    meta: {
      views: 0,
      bookings: 0,
      rating: 0,
    },
  },
  {
    title: "Advanced Online Consultation",
    title_ar: "استشارة أونلاين متقدمة",
    category: "استشارات طبية",
    category_ar: "استشارات طبية",
    description:
      "استشارة متخصصة لحالتك الصحية مع خطة علاجية شاملة ومتابعة لمدة أسبوع.",
    image:
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=600&auto=format&fit=crop",
    features: [
      "جلسة فيديو مباشرة",
      "تقييم شامل",
      "خطة علاجية",
      "متابعة لمدة أسبوع",
    ],
    fees: 170,
    duration: "45 دقيقة",
    available: true,
    meta: {
      views: 0,
      bookings: 0,
      rating: 0,
    },
  },
  {
    title: "Weight Loss Consultation",
    title_ar: "استشارة تخسيس",
    category: "تغذية علاجية",
    category_ar: "تغذية علاجية",
    description:
      "جلسة فردية لتقييم الحالة ووضع خطة مبدئية لنزول الوزن بطريقة صحية وآمنة تماماً.",
    image:
      "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=600&auto=format&fit=crop",
    features: [
      "تقييم الحالة الصحية",
      "قياسات الجسم",
      "خطة غذائية أسبوعية",
      "متابعة النتائج",
    ],
    fees: 200,
    duration: "55 دقيقة",
    available: true,
    meta: {
      views: 0,
      bookings: 0,
      rating: 0,
    },
  },
  {
    title: "Therapeutic Nutrition",
    title_ar: "تغذية علاجية متخصصة",
    category: "تغذية علاجية",
    category_ar: "تغذية علاجية",
    description:
      "تغذية علاجية متخصصة للأمراض المزمنة مثل السكري وارتفاع ضغط الدم واضطرابات الجهاز الهضمي.",
    image:
      "https://images.unsplash.com/photo-1585236034176-b601f01c221e?q=80&w=600&auto=format&fit=crop",
    features: [
      "تقييم الحالة الطبية",
      "خطة غذائية علاجية",
      "مراقبة المؤشرات الحيوية",
      "تعديلات دورية",
    ],
    fees: 280,
    duration: "70 دقيقة",
    available: true,
    meta: {
      views: 0,
      bookings: 0,
      rating: 0,
    },
  },
];

// ─── Run ──────────────────────────────────────────────────────────────────────

async function seed() {
  await connect();

  // Courses
  const existingCourses = await Course.countDocuments();
  if (existingCourses === 0) {
    await Course.insertMany(coursesData);
    console.log(`✅ Seeded ${coursesData.length} courses`);
  } else {
    console.log(`ℹ️  Courses already exist (${existingCourses}), skipping`);
  }

  // Products
  const existingProducts = await Product.countDocuments();
  if (existingProducts === 0) {
    await Product.insertMany(productsData);
    console.log(`✅ Seeded ${productsData.length} products`);
  } else {
    console.log(`ℹ️  Products already exist (${existingProducts}), skipping`);
  }

  // Medical Services (Consultations)
  const existingMedicalServices = await MedicalService.countDocuments();
  if (existingMedicalServices === 0) {
    await MedicalService.insertMany(medicalServicesData);
    console.log(
      `✅ Seeded ${medicalServicesData.length} medical services (consultations)`,
    );

    // Log the seeded services
    console.log("\n📋 Medical Services seeded:");
    console.log("=".repeat(50));
    medicalServicesData.forEach((service, index) => {
      console.log(`${index + 1}. ${service.title_ar}`);
      console.log(`   Price: ${service.fees} EGP`);
      console.log(`   Duration: ${service.duration}`);
      console.log(`   Category: ${service.category_ar}`);
      console.log("-".repeat(30));
    });
  } else {
    console.log(
      `ℹ️  Medical services already exist (${existingMedicalServices}), skipping`,
    );
  }

  await mongoose.disconnect();
  console.log("\n✅ Done — disconnected");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});
