import React from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import AnimatedText from "../common/AnimatedContent";

// بيانات الفيديوهات بالعربي
const videoData = [
  {
    id: "v1",
    videoId: "Eva5kJJ_wAc",
    title: "مشروبات رمضان قررت تفضح نفسها😅 مين هيفيدك فعلاً ومين المغشوش اللي بيسرق صحتك بدون ما تحس؟",
    thumbnail: "https://img.youtube.com/vi/Eva5kJJ_wAc/maxresdefault.jpg",
    date: "قبل دقيقتين",
  },
  {
    id: "v2",
    videoId: "WDcpOkyKOnk",
    title: "لو عاوز تخس فعلاً في رمضان وتغير صحتك 🌙 جدول إفطار وسحور كامل.",
    thumbnail: "https://img.youtube.com/vi/WDcpOkyKOnk/hqdefault.jpg",
    date: "قبل 5 دقائق",
  },
  {
    id: "v3",
    videoId: "kADFG4zjQWA",
    title: "حوار ساخن مع سوسن",
    thumbnail: "https://img.youtube.com/vi/kADFG4zjQWA/hqdefault.jpg",
    date: "قبل 10 دقائق",
  },
  {
    id: "v4",
    videoId: "5_k6SmSGG4I",
    title: "قابلت أهم أعضاء طفلي وصدموني☹️ كل واحد عرفني أكتر حاجة بتتعبه وتعطل شغله..",
    thumbnail: "https://img.youtube.com/vi/5_k6SmSGG4I/hqdefault.jpg",
    date: "قبل أسبوع",
  },
  {
    id: "v5",
    videoId: "1U-xTt0nVQk",
    title: "قابلت كل الفيتامينات 🫡 كشفت مين أفضل فيتامين فعلاً ومين كذاب وفقط دعاية قذرة!",
    thumbnail: "https://img.youtube.com/vi/1U-xTt0nVQk/hqdefault.jpg",
    date: "قبل أسبوعين",
  },
];

const LatestVideos = () => {
  const mainVideo = videoData[0];
  const sideVideos = videoData.slice(1);

  const openVideo = (id) => window.open(`https://www.youtube.com/watch?v=${id}`, "_blank");

  return (
   <AnimatedText delay={0.1}>
     <section className="py-16 px-4 md:px-10 max-w-7xl mx-auto" dir="rtl">
      
      <h2 className="text-3xl md:text-4xl  tracking-widest mb-8 uppercase text-right">
        أحدث الفيديوهات
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* === الفيديو الرئيسي الكبير === */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 relative group cursor-pointer"
          onClick={() => openVideo(mainVideo.videoId)}
        >
          <div className="relative rounded-xl overflow-hidden shadow-xl aspect-video bg-gray-200">
            <img
              src={mainVideo.thumbnail}
              alt={mainVideo.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-all flex items-center justify-center">
              <div className="w-14 h-14 bg-[#ff0000] rounded-full flex items-center justify-center text-white shadow-lg">
                <Play fill="white" size={28} />
              </div>
            </div>
          </div>
          <h3 className="mt-4 text-xl font-boldleading-tight text-right">
            {mainVideo.title}
          </h3>
          <p className="text-gray-400 text-sm mt-2 text-right">{mainVideo.date}</p>
        </motion.div>

        {/* === قائمة الفيديوهات الجانبية === */}
        <div className="flex flex-col gap-8">
          {sideVideos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex gap-4 cursor-pointer group"
              onClick={() => openVideo(video.videoId)}
            >
              <div className="w-28 h-20 md:w-36 md:h-24 flex-shrink-0 rounded-lg overflow-hidden shadow-sm bg-gray-100">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="flex flex-col justify-center text-right">
                <h4 className="text-sm font-bold line-clamp-2 leading-snug mb-2 group-hover:text-[#a98cec] transition-colors">
                  {video.title}
                </h4>
                <p className="text-xs text-gray-400 font-medium">{video.date}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
   </AnimatedText>
  );
};

export default LatestVideos;