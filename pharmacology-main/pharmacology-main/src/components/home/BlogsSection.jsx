import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiCalendar, FiClock } from "react-icons/fi";
import { FaBookOpen } from "react-icons/fa6";
import Carousel from "../common/Carousel";
import AnimatedText from "../common/AnimatedContent";
import api from "../../api/axios.config";

const BlogsSection = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/v1/blogs?limit=6")
      .then((res) => {
        if (res.data.success) {
          const blogList = res.data.data?.blogs || res.data.blogs || [];
          setBlogs(blogList);
        }
      })
      .catch((err) => console.error("Failed to fetch blogs:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-16 px-4 md:px-10" dir="rtl">
        <div className="max-w-7xl mx-auto flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#9b61db] border-t-transparent" />
        </div>
      </section>
    );
  }

  if (!blogs.length) return null;

  // Transform blog data to match Carousel expected shape
  const carouselItems = blogs.map((blog) => ({
    id: blog._id,
    image: blog.image,
    title: blog.title,
    desc: blog.content,
    price: blog.category, // show category as "price" in carousel
    meta1: blog.meta1, // e.g. "3 يناير 2025"
    meta2: blog.meta2, // e.g. "7 دقائق قراءة"
  }));

  return (
    <section className="py-16 px-4 md:px-10" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
          <div className="text-right">
            <AnimatedText delay={0.1}>
              <h2 className="text-xl md:text-3xl font-bold">تصفح أحدث :</h2>
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

        {/* Dynamic Carousel */}
        <AnimatedText delay={0.6}>
          <Carousel
            data={carouselItems}
            Meta1Icon={FiCalendar}
            Meta2Icon={FiClock}
            ButtonIcon={FaBookOpen}
            buttonText="اقرأ المقال"
            gradientColor="from-[#2d3748]"
            to={"/blogs/:id"} // will be replaced with actual blog id inside Carousel
          />
        </AnimatedText>
      </div>
    </section>
  );
};

export default BlogsSection;
