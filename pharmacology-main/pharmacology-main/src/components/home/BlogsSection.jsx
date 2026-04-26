import React from "react";
import { FiCalendar, FiClock } from "react-icons/fi"; 
import { FaBookOpen } from "react-icons/fa6"; 
import { blogsData } from "../data"; 
import Carousel from "../common/Carousel";
import AnimatedText from "../common/AnimatedContent"; // استيراد المكون
import { Link } from "react-router-dom";

const BlogsSection = () => {
  return (
     <section className="py-16 px-4 md:px-10" dir="rtl">
      <div className="max-w-7xl mx-auto">
        
        {/* === الجزء العلوي (العناوين) === */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
          <div className="text-right">
            
            <AnimatedText delay={0.1}>
              <h2 className="text-xl md:text-3xl font-bold">
                تصفح أحدث :
              </h2>
            </AnimatedText>

             <AnimatedText delay={0.2}>
              <h3 className="text-3xl md:text-4xl font-bold my-4">
                المقالات والمدونة
              </h3>
            </AnimatedText>

            <AnimatedText delay={0.3}>
              <p className="text-lg font-medium my-4">
                نشاركك أحدث المقالات والنصائح الطبية والغذائية الموثوقة ..
              </p>
            </AnimatedText>

           

            <AnimatedText delay={0.4}>
              <Link
                to="/blogs" 
                className="text-[#cad5e4] font-bold text-lg hover:underline mb-1 inline-block"
              >
                مشاهدة كل المقالات
              </Link>
            </AnimatedText>
          </div>
        </div>

        {/* === الكاروسيل مع أنيميشن عند الظهور === */}
        <AnimatedText delay={0.6}>
          <Carousel 
            data={blogsData}
            Meta1Icon={FiCalendar}
            Meta2Icon={FiClock}
            ButtonIcon={FaBookOpen}
            buttonText="اقرأ المقال"
            gradientColor="from-[#2d3748]"
            to={'/blogs/:id'}
          />
        </AnimatedText>
        
      </div>
    </section>
  );
};

export default BlogsSection;