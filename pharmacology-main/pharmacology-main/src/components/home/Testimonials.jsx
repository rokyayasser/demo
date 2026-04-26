import React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import AnimatedText from "../common/AnimatedContent";

const testimonials = [
  {
    id: 1,
    name: "أحمد محمود",
    role: "برنامج التغذية العلاجية",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    content:
      "التجربة كانت ممتازة. لاحظت تحسن واضح في صحتي ومستوى الطاقة بعد الالتزام بالخطة الغذائية.",
  },
  {
    id: 2,
    name: "سارة علي",
    role: "برنامج إنقاص الوزن",
    image: "https://randomuser.me/api/portraits/women/45.jpg",
    content:
      "الخطة كانت سهلة التطبيق والنتائج ظهرت بسرعة. المتابعة المستمرة كانت دافع كبير للاستمرار.",
  },
  {
    id: 3,
    name: "محمد خالد",
    role: "تحسين نمط الحياة",
    image: "https://randomuser.me/api/portraits/men/65.jpg",
    content:
      "الدعم والنصائح العملية ساعدوني أغير عاداتي الغذائية بشكل صحي ومستدام.",
  },
  {
    id: 4,
    name: "ريم عبد الله",
    role: "برنامج التغذية المتوازنة",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    content:
      "البرنامج فعلاً فرق معايا. حسيت بتحسن كبير في النشاط والتركيز.",
  },
];

const Card = ({ item }) => (
  <motion.div
    className="bg-white backdrop-blur-lg border border-gray-100 rounded-[28px] p-4 md:p-8 shadow-xl max-w-[280px]  md:max-w-[480px] mx-4 flex flex-col text-right"
  >
    <Quote className="text-[#130348]   " size={26} />

    <div className="flex gap-1 mb-4 justify-end">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={18} fill="#FFD700" color="#FFD700" />
      ))}
    </div>

    <p className="text-gray-600 leading-relaxed mb-6">{item.content}</p>

    <div className="flex items-center gap-4 mt-auto justify-end">
      <div>
        <p className="font-bold text-[#130348] ">{item.name}</p>
        <p className="text-sm text-gray-700">{item.role}</p>
      </div>

      <img
        src={item.image}
        alt={item.name}
        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
      />
    </div>
  </motion.div>
);

const Row = ({ direction = "left", duration = 30 }) => {
  const items = [...testimonials, ...testimonials];

  return (
    <div className="overflow-hidden ">
      <motion.div
        className="flex w-max"
        animate={{
          x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"],
        }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: duration,
        }}
      >
        {items.map((item, i) => (
          <Card key={i} item={item} />
        ))}
      </motion.div>
    </div>
  );
};

const Testimonials = () => {
  return (
    <AnimatedText delay={0.1}>

<section className="py-16 px-4 md:px-10 text-right"  >
      <div className="max-w-7xl mx-auto " dir="rtl" >
        <AnimatedText delay={0.2} >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 ">
          آراء العملاء
        </h2>
        </AnimatedText>

        <AnimatedText delay={0.3} >
            <p className="  text-right my-4 mb-10 ">
          تجارب حقيقية من عملائنا الذين التزموا بالبرامج الغذائية
          وحققوا نتائج ملموسة في صحتهم ونمط حياتهم.
        </p>
        </AnimatedText>
      </div>

    
      
      <AnimatedText delay={0.4}>
        <div className="space-y-10  md:mb-10">
        <Row direction="left" duration={30} />
        <Row direction="right" duration={35} />
     
      </div>
      </AnimatedText>

    </section>

    </AnimatedText>
  );
};

export default Testimonials;