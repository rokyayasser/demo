/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, ChevronLeft, BookOpen, Clock, User } from "lucide-react"; // Added Clock and User
import { assets } from "../../assets/assets";
import { blogsData } from "../../components/data"; 
import AnimatedText from "../../components/common/AnimatedContent";
import Card from "../../components/common/Card"; // Import the Card
import Button from "../../components/common/Button";
import CTA from "../../components/home/CTA";

const Blogs = () => {
  const navigate = useNavigate();
  const [blogs] = useState(blogsData);

  const cardHoverVariants = {
    hover: {
      y: -8,
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="min-h-screen " dir="rtl">
      
      {/* ==================== Hero Section ====================== */}
      <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        <img
          src={assets.header1}
          alt="Dr. Ahmed Alkhatib"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#121212]"></div>

        <div className="relative flex flex-col items-center mt-20 z-10 text-center px-4 max-w-4xl">
          <AnimatedText delay={0.1}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl  mb-6 drop-shadow-lg">
              مقالات د. أحمد الخطيب
            </h1>
          </AnimatedText>
          
          <AnimatedText delay={0.2}>
            <p className="text-lg md:text-xl  mb-8 leading-relaxed font-medium">
              محتوى علمي مبسط يساعدك على فهم جسمك، تحسين نمط حياتك، واتخاذ قرارات صحية صحيحة.
            </p>
          </AnimatedText>

          <AnimatedText delay={0.3}>
            <Button
              to={'/consultations'}
              className="px-20 py-4"
            >
              <div
               className=" flex items-center justify-center gap-2 mx-auto "

              >
                <CalendarDays size={20} />
              أحجز موعدك
              </div>
            </Button>
          </AnimatedText>
        </div>
      </div>

      {/* ==================== Articles Grid ===================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 mt-16 ">
        
        <div className="mb-12 text-right">
          <AnimatedText delay={0.1}>
            <h2 className="text-2xl md:text-3xl  mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 gradient-secondary rounded-full inline-block"></span>
              مقالات علمية مبسطة بلغة واضحة :
            </h2>
          </AnimatedText>
          <AnimatedText delay={0.2}>
            <p className="text-sm md:text-base leading-relaxed max-w-4xl pr-4">
              محتوى طبي موثوق يقدمه د. أحمد الخطيب لشرح أحدث المفاهيم في التغذية العلاجية بأسلوب سهل ومبسط.
            </p>
          </AnimatedText>
        </div>

        {/* === Grid Cards === */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-8 justify-items-center mb-20">
          {blogs.map((blog, index) => (
            <AnimatedText key={blog.id || index} delay={0.3 }>
              <motion.div
                variants={cardHoverVariants}
                whileHover="hover"
                className="w-full flex justify-center"
              >
                <Card
                  item={{
                    image: blog.image,
                    title: blog.title,
                    desc: blog.content,
                    price: blog.category , 
                    meta1: blog.meta1,             
                    meta2: blog.meta2,        
                  }}
                  Meta1Icon={Clock}
                  Meta2Icon={User}
                  ButtonIcon={ChevronLeft}
                  buttonText="إقرأ المقال كاملاً"
                                                   
                  to={`/blogs/${blog.id}`}
                />
              </motion.div>
            </AnimatedText>
          ))}
        </div>

       
      </div>
    </div>
  );
};

export default Blogs;