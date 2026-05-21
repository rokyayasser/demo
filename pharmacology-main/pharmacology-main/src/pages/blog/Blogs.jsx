import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, ChevronLeft, Clock, User } from "lucide-react";
import { FiCalendar, FiClock } from "react-icons/fi";
import { FaBookOpen } from "react-icons/fa6";
import { assets } from "../../assets/assets";
import AnimatedText from "../../components/common/AnimatedContent";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import CTA from "../../components/home/CTA";
import api from "../../api/axios.config";

const CATEGORIES = [
  "الكل",
  "تغذية علاجية",
  "مقال طبي",
  "أمراض مزمنة",
  "صحة عامة",
];

const Blogs = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("الكل");

  const load = (cat) => {
    setLoading(true);
    const params =
      cat && cat !== "الكل"
        ? `?category=${encodeURIComponent(cat)}&limit=50`
        : "?limit=50";
    api
      .get(`/api/v1/blogs${params}`)
      .then((res) => {
        if (res.data.success) setBlogs(res.data.data?.blogs || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(category);
  }, [category]);

  // Transform blog data to match Card component props
  const mapBlogToCardItem = (blog) => ({
    _id: blog._id,
    image: blog.image,
    title: blog.title,
    desc: blog.content,
    price: blog.category, // used as category badge
    meta1: blog.meta1, // date
    meta2: blog.meta2, // read time
  });

  // Card hover animation (same as Consultations)
  const cardHoverVariants = {
    hover: {
      y: -8,
      boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Hero section unchanged */}
      <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        <img
          src={assets.header1}
          alt="Dr. Ahmed Alkhatib"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#121212]" />
        <div className="relative flex flex-col items-center mt-20 z-10 text-center px-4 max-w-4xl">
          <AnimatedText delay={0.1}>
            <h1 className="text-4xl md:text-6xl mb-6 drop-shadow-lg">
              مقالات د. أحمد الخطيب
            </h1>
          </AnimatedText>
          <AnimatedText delay={0.2}>
            <p className="text-lg md:text-xl mb-8 leading-relaxed font-medium">
              محتوى علمي مبسط يساعدك على فهم جسمك وتحسين نمط حياتك واتخاذ قرارات
              صحية صحيحة.
            </p>
          </AnimatedText>
          <AnimatedText delay={0.3}>
            <Button to="/consultations" className="px-20 py-4">
              <div className="flex items-center justify-center gap-2">
                <CalendarDays size={20} /> احجز موعدك
              </div>
            </Button>
          </AnimatedText>
        </div>
      </div>

      {/* Blog list */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 mt-16 mb-20">
        {/* Header with categories */}
        <div className="mb-10 text-right">
          <AnimatedText delay={0.1}>
            <h2 className="text-2xl md:text-3xl mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 gradient-secondary rounded-full inline-block" />
              مقالات علمية مبسطة بلغة واضحة:
            </h2>
          </AnimatedText>

          <AnimatedText delay={0.2}>
            <div className="flex flex-wrap gap-2 mt-4">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all
                    ${
                      category === cat
                        ? "bg-[#9b61db] text-white"
                        : "bg-white/10 text-gray-400 hover:bg-white/20"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </AnimatedText>
        </div>

        {/* Loading & empty states */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#9b61db] border-t-transparent" />
          </div>
        ) : !blogs.length ? (
          <div className="col-span-full text-center py-20 text-gray-400">
            <p>لا توجد مقالات في هذا التصنيف</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <motion.div
                key={blog._id}
                variants={cardHoverVariants}
                whileHover="hover"
              >
                <AnimatedText delay={0.3}>
                  <Card
                    item={mapBlogToCardItem(blog)}
                    Meta1Icon={FiCalendar}
                    Meta2Icon={FiClock}
                    ButtonIcon={FaBookOpen}
                    buttonText="إقرأ المقال كاملاً"
                    to={`/blogs/${blog._id}`}
                  />
                </AnimatedText>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatedText delay={0.2}>
        <CTA />
      </AnimatedText>
    </div>
  );
};

export default Blogs;
