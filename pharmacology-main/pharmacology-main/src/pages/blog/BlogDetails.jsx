import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, ArrowRight, PlayCircle } from "lucide-react";
import { assets } from "../../assets/assets";
import AnimatedText from "../../components/common/AnimatedContent";
import CTA from "../../components/home/CTA";
import api from "../../api/axios.config";

const BlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    api
      .get(`/api/v1/blogs/${id}`)
      .then((res) => {
        if (res.data.success) setBlog(res.data.data?.blog || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#9b61db] border-t-transparent" />
      </div>
    );

  if (!blog)
    return (
      <div className="min-h-screen flex items-center justify-center text-white flex-col gap-4">
        <p>المقال غير موجود</p>
        <button
          onClick={() => navigate("/blogs")}
          className="underline text-[#9b61db]"
        >
          العودة للمقالات
        </button>
      </div>
    );

  return (
    <>
      <div className="mt-40 my-12 px-4 sm:px-6 lg:px-6 min-h-screen" dir="rtl">
        <div className="max-w-7xl mx-auto">
          <AnimatedText delay={0.1}>
            <button
              onClick={() => navigate("/blogs")}
              className="flex items-center gap-2 text-white font-medium mb-8 hover:gap-3 transition-all"
            >
              <ArrowRight size={20} /> العودة للمقالات
            </button>
          </AnimatedText>

          {/* Header */}
          <div className="text-right mb-10">
            <AnimatedText delay={0.2}>
              <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight text-white">
                {blog.title}
              </h1>
            </AnimatedText>
            <AnimatedText delay={0.3}>
              <div className="flex flex-col md:flex-row md:items-center gap-6 text-textSoft text-sm md:text-base">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-textSoft" />
                  <span>تاريخ النشر: {blog.meta1 || "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border-2 border-white/20">
                    <img
                      src={assets.profile}
                      alt="د. أحمد الخطيب"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span>بواسطة د. أحمد الخطيب</span>
                </div>
              </div>
            </AnimatedText>
          </div>

          {/* Hero image */}
          <AnimatedText delay={0.4}>
            <div className="w-full h-[300px] md:h-[600px] rounded-3xl overflow-hidden mb-16 shadow-2xl border-4 border-white/10">
              <img
                src={blog.image || assets.header1}
                alt={blog.title}
                className="w-full h-full object-cover md:object-contain object-center"
              />
            </div>
          </AnimatedText>

          {/* Content */}
          <div className="mb-20">
            <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 md:p-10">
              <pre className="text-white/90 leading-[2] text-base md:text-2xl whitespace-pre-wrap break-words">
                {blog.content}
              </pre>
            </div>
          </div>

          {/* YouTube */}
          <AnimatedText delay={0.6}>
            <div className="bg-white/5 shadow-xl rounded-[2.5rem] p-6 md:p-10 flex flex-col md:flex-row gap-10 items-center border border-white/10 mb-20">
              <div className="w-full md:w-1/2 text-right">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2 justify-start">
                  <PlayCircle className="text-[#8b5cf6]" size={28} /> خاتمة
                  المقال
                </h3>
                <p className="text-textSoft text-lg leading-relaxed">
                  شاهد هذا الفيديو من قناة د. أحمد الخطيب الرسمية للحصول على شرح
                  مفصل وعملي حول هذا الموضوع.
                </p>
              </div>
              <div className="w-full md:w-1/2 aspect-video rounded-2xl overflow-hidden shadow-lg border-4 border-white/10 bg-gray-900">
                {blog.youtubeId ? (
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${blog.youtubeId}`}
                    title={blog.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
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
        <CTA />
      </AnimatedText>
    </>
  );
};

export default BlogDetails;
