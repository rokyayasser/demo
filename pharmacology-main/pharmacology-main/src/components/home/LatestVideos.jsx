import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import AnimatedText from "../common/AnimatedContent";
import api from "../../api/axios.config"; // your axios instance

const LatestVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await api.get("/api/v1/youtube/latest");
        if (res.data.success) {
          setVideos(res.data.data);
        }
      } catch (error) {
        console.error("Failed to load videos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  if (loading)
    return <div className="text-center py-10">جاري تحميل الفيديوهات...</div>;
  if (!videos.length) return null;

  const mainVideo = videos[0];
  const sideVideos = videos.slice(1, 6); // max 5 side videos

  const openVideo = (id) =>
    window.open(`https://www.youtube.com/watch?v=${id}`, "_blank");

  return (
    <AnimatedText delay={0.1}>
      <section className="py-16 px-4 md:px-10 max-w-7xl mx-auto" dir="rtl">
        <h2 className="text-3xl md:text-4xl tracking-widest mb-8 uppercase text-right">
          أحدث الفيديوهات
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main video */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 relative group cursor-pointer"
            onClick={() => openVideo(mainVideo.id)}
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
            <h3 className="mt-4 text-xl font-bold leading-tight text-right line-clamp-2">
              {mainVideo.title}
            </h3>
            <p className="text-gray-400 text-sm mt-2 text-right">
              {mainVideo.date}
            </p>
          </motion.div>

          {/* Side videos */}
          <div className="flex flex-col gap-8">
            {sideVideos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4 cursor-pointer group"
                onClick={() => openVideo(video.id)}
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
                  <p className="text-xs text-gray-400 font-medium">
                    {video.date}
                  </p>
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
