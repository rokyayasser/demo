import React from "react";
import { CalendarDays, BookOpen,  } from "lucide-react"; // Added Clock and User
import { assets } from "../../assets/assets";
import AnimatedText from "../common/AnimatedContent";
import Button from "../common/Button";

const CTA = () => {
  return (
     <section className="py-8 md:py-16 px-4 md:px-10 " dir="rtl">
      <AnimatedText >
          <div className="my-4 md:mt-20 max-w-7xl mx-auto relative bg-gradient-to-t from-[#1D014B] via-[#3A1F66] to-[#E4DFE6]  rounded-[2rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between shadow-sm border border-blue-50 ">
            <div className="w-1/1 text-center md:text-right z-10 relative">
              <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
                هل تحتاج إلى إرشاد متخصص لحالتك؟
              </h2>
              <p className=" font-medium mb-8 text-md md:text-2xl leading-relaxed max-w-xl">
                المقالات تمنحك المعرفة، لكن الاستشارة تمنحك خطة علاجية مخصصة لك.
              </p>
              
              <div className="flex  flex-col sm:flex-row gap-4 ">
                <Button 
                  to={'/consultations'}
                  className="w-full"
                >
                  أحجز موعدك
                </Button>
                
                <Button 
                 to={'/blogs'}
                 className="w-full"
                >
                  
                  تصفح المقالات
                </Button>
              </div>
            </div>

            <div className="hidden md:w-full mt-4 md:mt-0 md:flex justify-center md:justify-end z-10 ">
              <img 
                src={assets.blogBanner || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=400&auto=format&fit=crop"} 
                alt="Doctor" 
                className="absolute bottom-0 object-contain drop-shadow-2xl"
              />
            </div>

            <div className="absolute top-0 left-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </AnimatedText>
    </section>
  );
};

export default CTA;