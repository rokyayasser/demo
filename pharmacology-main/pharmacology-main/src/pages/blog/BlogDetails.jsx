import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, ArrowRight, PlayCircle } from "lucide-react";
import { assets } from "../../assets/assets";
import { blogsData } from "../../components/data";
import AnimatedText from "../../components/common/AnimatedContent";
import CTA from "../../components/home/CTA";

const BlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    // البحث عن المقال بناءً على الـ ID
    const foundBlog = blogsData.find((b) => String(b.id) === id || b._id === id);
    if (foundBlog) {
      setBlog(foundBlog);
    }
    window.scrollTo(0, 0);
  }, [id]);

  if (!blog) return <div className="min-h-screen flex items-center justify-center text-white">جاري التحميل...</div>;

  return (
    <>
      <div className="mt-40 my-12 px-4 sm:px-6 lg:px-6 min-h-screen" dir="rtl">
        <div className="max-w-7xl mx-auto">
          
          <AnimatedText delay={0.1}>
            <button 
              onClick={() => navigate("/blogs")}
              className="flex items-center gap-2 text-white font-medium mb-8 hover:gap-3 transition-all"
            >
              <ArrowRight size={20} />
              العودة للمقالات
            </button>
          </AnimatedText>

          {/* === رأس المقال (Header) === */}
          <div className="text-right mb-10">
            <AnimatedText delay={0.2}>
              <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight text-white">
                {blog.title}
              </h1>
            </AnimatedText>
            
            <AnimatedText delay={0.3}>
              <div className="flex flex-col md:flex-row  md:items-center gap-6 text-textSoft text-sm md:text-base">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-textSoft" />
                  <span>تاريخ النشر: {blog.meta1 || "10 يناير 2025"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border-2 border-white/20">
                     <img src={assets.profile} alt="د. أحمد الخطيب" className="w-full h-full object-cover" />
                  </div>
                  <span>بواسطة د. أحمد الخطيب</span>
                </div>
              </div>
            </AnimatedText>
          </div>

          {/* === الصورة الرئيسية (Hero Image) === */}
          <AnimatedText delay={0.4}>
            <div className="w-full h-[300px] md:h-[600px] rounded-3xl overflow-hidden mb-16 shadow-2xl border-4 border-white/10">
              <img 
                src={blog.image || assets.header1} 
                alt={blog.title} 
                className="w-full h-full object-cover md:object-contain object-center" 
              />
            </div>
          </AnimatedText>

          <div className="mb-20">
          <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 md:p-10">
            <pre className="text-white/90 leading-[2] text-base md:text-2xl whitespace-pre-wrap break-words">
              {blog.content}
            </pre>
          </div>
        </div>

          {/* === قسم الخاتمة مع فيديو اليوتيوب === */}
          <AnimatedText delay={0.6}>
            <div className="bg-white/5 shadow-xl rounded-[2.5rem] p-6 md:p-10 flex flex-col md:flex-row gap-10 items-center border border-white/10 mb-20">
              
              {/* نص الخاتمة */}
              <div className="w-full md:w-1/2 text-right">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2 justify-start">
                  <PlayCircle className="text-[#8b5cf6]" size={28} />
                  خاتمة المقال
                </h3>
                <p className="text-textSoft text-lg leading-relaxed">
                  شاهد هذا الفيديو من قناة **د. أحمد الخطيب** الرسمية للحصول على شرح مفصل وعملي حول هذا الموضوع.
                </p>
              </div>

              {/* فيديو اليوتيوب */}
              <div className="w-full md:w-1/2 aspect-video rounded-2xl overflow-hidden shadow-lg border-4 border-white/10 bg-gray-900">
                {blog.youtubeId ? (
                  <iframe
                    key={blog.id}
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${blog.youtubeId}`}
                    title={blog.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
                    الفيديو غير متوفر حالياً
                  </div>
                )}
              </div>

            </div>
          </AnimatedText>

        </div>
      </div>

      <AnimatedText delay={0.2}>
        <CTA/>
      </AnimatedText>
    </>
  );
};

export default BlogDetails;