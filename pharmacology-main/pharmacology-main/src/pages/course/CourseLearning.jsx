// pages/CourseLearning.jsx - Completely rewritten
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  CheckCircle,
  Award,
  ArrowRight,
  ExternalLink,
  Play,
  Lock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api from "../../api/axios.config";

// Load YouTube IFrame API
const loadYouTubeAPI = () => {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve(window.YT);
      return;
    }
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    window.onYouTubeIframeAPIReady = () => resolve(window.YT);
  });
};

// Extract playlist ID and video IDs from YouTube URL
const extractYouTubeInfo = async (playlistUrl) => {
  if (!playlistUrl) return { playlistId: null, videoIds: [], error: null };

  try {
    // Extract playlist ID from URL
    const url = new URL(playlistUrl);
    let playlistId = url.searchParams.get("list");
    let videoId = url.searchParams.get("v");

    if (!playlistId) {
      // Try to extract from path
      const pathMatch = playlistUrl.match(/\/playlist\/([^/?]+)/);
      if (pathMatch) playlistId = pathMatch[1];
    }

    if (!playlistId) {
      // If no playlist, try single video
      if (videoId) {
        return {
          playlistId: null,
          videoIds: [videoId],
          error: null,
        };
      }
      return {
        playlistId: null,
        videoIds: [],
        error: "No playlist or video found",
      };
    }

    // For now, return playlistId - we'll get videos via API
    return { playlistId, videoIds: [], error: null };
  } catch (error) {
    console.error("Error parsing YouTube URL:", error);
    return { playlistId: null, videoIds: [], error: error.message };
  }
};

// Fetch playlist videos using YouTube API (requires API key)
const fetchPlaylistVideos = async (playlistId, apiKey) => {
  if (!playlistId || !apiKey) return [];

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}`,
    );
    const data = await response.json();

    if (data.items) {
      return data.items.map((item, index) => ({
        id: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        index: index,
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching playlist:", error);
    return [];
  }
};

export default function CourseLearning() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [progress, setProgress] = useState(0);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [playlistVideos, setPlaylistVideos] = useState([]);
  const [loadingPlaylist, setLoadingPlaylist] = useState(false);

  const playerRef = useRef(null);
  const playerReadyRef = useRef(false);
  const latestRef = useRef({ completedLessons: [], currentLesson: 0 });

  // Keep ref updated
  useEffect(() => {
    latestRef.current = { completedLessons, currentLesson };
  }, [completedLessons, currentLesson]);

  // Load course data
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/api/v1/courses/learn/${id}`);
        if (res.data.success) {
          const d = res.data.data;
          const saved = d.enrollment.completedLessons || [];
          setData(d);
          setCompletedLessons(saved);
          setProgress(d.enrollment.progress || 0);
          setCurrentLesson(0);

          // Extract playlist info
          if (d.course.playlistUrl) {
            await loadPlaylistVideos(d.course.playlistUrl);
          }
        } else {
          toast.error(res.data.message || "لا يمكن الوصول");
          navigate("/courses");
        }
      } catch (err) {
        toast.error(
          err.response?.status === 403 ? "يجب الاشتراك أولاً" : "حدث خطأ",
        );
        navigate("/courses");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Load playlist videos
  const loadPlaylistVideos = async (playlistUrl) => {
    setLoadingPlaylist(true);
    try {
      const { playlistId, videoIds, error } =
        await extractYouTubeInfo(playlistUrl);

      if (playlistId) {
        // Try to fetch with YouTube API key from env
        const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
        if (apiKey) {
          const videos = await fetchPlaylistVideos(playlistId, apiKey);
          if (videos.length > 0) {
            setPlaylistVideos(videos);
          } else {
            // Fallback: just use playlist ID
            setPlaylistVideos([
              { id: playlistId, title: "Playlist", index: 0 },
            ]);
          }
        } else {
          // No API key, just use playlist ID
          setPlaylistVideos([
            { id: playlistId, title: "Playlist Videos", index: 0 },
          ]);
        }
      } else if (videoIds && videoIds.length > 0) {
        setPlaylistVideos(
          videoIds.map((id, idx) => ({
            id,
            title: `Video ${idx + 1}`,
            index: idx,
          })),
        );
      }
    } catch (error) {
      console.error("Error loading playlist:", error);
    } finally {
      setLoadingPlaylist(false);
    }
  };

  // Initialize YouTube player
  const initPlayer = useCallback(async () => {
    if (!playlistVideos.length || !playlistVideos[currentLesson]) return;

    const YT = await loadYouTubeAPI();
    const videoId = playlistVideos[currentLesson]?.id;
    if (!videoId) return;

    if (playerRef.current && typeof playerRef.current.destroy === "function") {
      playerRef.current.destroy();
    }

    playerRef.current = new YT.Player("youtube-player", {
      height: "100%",
      width: "100%",
      videoId: videoId,
      playerVars: {
        playsinline: 1,
        rel: 0,
        modestbranding: 1,
        controls: 1,
        disablekb: 0,
        fs: 1,
      },
      events: {
        onReady: () => {
          playerReadyRef.current = true;
          console.log("Player ready");
        },
        onStateChange: (event) => {
          // Video ended (state = 0)
          if (event.data === 0) {
            console.log("Video ended, marking complete");
            markCurrentLessonComplete();
          }
        },
        onError: (error) => {
          console.error("YouTube player error:", error);
        },
      },
    });
  }, [playlistVideos, currentLesson]);

  // Re-initialize player when current lesson changes
  useEffect(() => {
    if (playlistVideos.length > 0 && !loadingPlaylist) {
      initPlayer();
    }
  }, [playlistVideos, currentLesson, loadingPlaylist, initPlayer]);

  // Mark current lesson as complete
  const markCurrentLessonComplete = useCallback(async () => {
    const { completedLessons: cl, currentLesson: currLesson } =
      latestRef.current;
    const lessonId = `lesson-${currLesson}`;
    const totalLessons =
      data?.course?.totalLessons || playlistVideos.length || 1;

    if (cl.includes(lessonId)) return;
    if (currLesson >= totalLessons) return;

    const updated = [...cl, lessonId];
    const newProgress = Math.min(
      100,
      Math.round((updated.length / totalLessons) * 100),
    );

    setCompletedLessons(updated);
    setProgress(newProgress);

    toast.success(
      `✅ الدرس ${currLesson + 1} من ${totalLessons} مكتمل — ${newProgress}%`,
    );

    // Save to backend
    try {
      await api.put("/api/v1/courses/progress", {
        courseId: id,
        progress: newProgress,
        completedLesson: lessonId,
      });

      // Auto-advance to next lesson
      if (currLesson + 1 < totalLessons) {
        setTimeout(() => {
          setCurrentLesson(currLesson + 1);
        }, 1500);
      }
    } catch (error) {
      console.error("Failed to save progress:", error);
    }
  }, [id, data]);

  // Manual mark complete
  const handleManualComplete = () => {
    const lessonId = `lesson-${currentLesson}`;
    if (completedLessons.includes(lessonId)) {
      toast.info("هذا الدرس مكتمل بالفعل");
      return;
    }
    markCurrentLessonComplete();
  };

  // Navigate to specific lesson
  const goToLesson = (index) => {
    if (
      index > currentLesson &&
      !completedLessons.includes(`lesson-${currentLesson}`)
    ) {
      toast.warning("يرجى إكمال الدرس الحالي أولاً");
      return;
    }
    setCurrentLesson(index);
  };

  // Complete course
  const handleCompleteCourse = async () => {
    if (progress < 100) {
      toast.error(`أكمل جميع الدروس أولاً (${progress}% مكتمل)`);
      return;
    }
    setCompleting(true);
    try {
      const res = await api.post("/api/v1/courses/complete", { courseId: id });
      if (res.data.success) {
        toast.success("🏆 مبروك! ستصلك شهادتك على بريدك الإلكتروني");
        setData((p) => ({
          ...p,
          enrollment: { ...p.enrollment, completedAt: new Date() },
        }));
      } else {
        toast.error(res.data.message || "حدث خطأ");
      }
    } catch {
      toast.error("حدث خطأ");
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#9b61db] border-t-transparent" />
      </div>
    );
  }

  if (!data) return null;

  const { course, enrollment } = data;
  const isCompleted = !!enrollment.completedAt;
  const canComplete = progress >= 100 && !isCompleted;
  const totalLessons = course.totalLessons || playlistVideos.length || 1;
  const currentVideo = playlistVideos[currentLesson];

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 md:px-10" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/my-courses")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-8"
        >
          <ArrowRight size={18} /> العودة لكورساتي
        </button>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-4xl font-bold text-white mb-2"
        >
          {course.title_ar || course.title}
        </motion.h1>
        <p className="text-gray-400 mb-8">{course.instructor}</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Player Section */}
          <div className="lg:col-span-2 space-y-4">
            <div
              className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black"
              style={{ aspectRatio: "16/9" }}
            >
              <div
                id="youtube-player"
                className="absolute inset-0 w-full h-full"
              />
              {loadingPlaylist && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#9b61db] border-t-transparent" />
                </div>
              )}
            </div>

            {/* Video Navigation */}
            {playlistVideos.length > 1 && (
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={() => goToLesson(currentLesson - 1)}
                  disabled={currentLesson === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    currentLesson === 0
                      ? "bg-white/5 text-gray-500 cursor-not-allowed"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  <ChevronRight size={18} /> السابق
                </button>
                <span className="text-gray-400 text-sm">
                  {currentLesson + 1} / {totalLessons}
                </span>
                <button
                  onClick={() => goToLesson(currentLesson + 1)}
                  disabled={
                    currentLesson + 1 >= totalLessons ||
                    !completedLessons.includes(`lesson-${currentLesson}`)
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    currentLesson + 1 >= totalLessons ||
                    !completedLessons.includes(`lesson-${currentLesson}`)
                      ? "bg-white/5 text-gray-500 cursor-not-allowed"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  التالي <ChevronLeft size={18} />
                </button>
              </div>
            )}

            {/* Current Video Title */}
            {currentVideo && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <p className="text-white text-sm font-medium">
                  {currentVideo.title}
                </p>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-between gap-3 bg-white/5 rounded-xl px-4 py-3">
              <span className="text-gray-400 text-xs">
                🎬 يتم تحديث تقدمك تلقائياً عند انتهاء كل فيديو
              </span>
              <button
                onClick={handleManualComplete}
                disabled={completedLessons.includes(`lesson-${currentLesson}`)}
                className="text-xs px-3 py-1.5 rounded-lg border border-[#9b61db]/50
                  text-[#9b61db] hover:bg-[#9b61db]/10 transition disabled:opacity-40"
              >
                {completedLessons.includes(`lesson-${currentLesson}`)
                  ? "✓ مكتمل"
                  : "تحديد الدرس كمكتمل"}
              </button>
              {course.playlistUrl && (
                <a
                  href={course.playlistUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-red-400 hover:text-red-300 text-xs"
                >
                  <ExternalLink size={12} /> YouTube
                </a>
              )}
            </div>

            {course.description_ar && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="font-bold text-white mb-2">عن الكورس</h3>
                <p className="text-gray-400 text-sm leading-loose">
                  {course.description_ar}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Progress */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-white">تقدمك</h3>
                <span className="text-[#9b61db] font-bold text-xl">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3 mb-3 overflow-hidden">
                <motion.div
                  className={`h-3 rounded-full ${progress === 100 ? "bg-green-500" : "bg-gradient-to-r from-[#6d28d9] to-[#9b61db]"}`}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
              <p className="text-gray-400 text-sm">
                {completedLessons.length} / {totalLessons} دروس مكتملة
              </p>
            </div>

            {/* Lessons List */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="font-bold text-white mb-4">
                الدروس ({totalLessons} درس)
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {Array.from({ length: totalLessons }, (_, i) => {
                  const isDone = completedLessons.includes(`lesson-${i}`);
                  const isCurrent = i === currentLesson;
                  const isLocked = i > currentLesson && !isDone;

                  return (
                    <button
                      key={i}
                      onClick={() => !isLocked && goToLesson(i)}
                      disabled={isLocked}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-right
                        ${isDone ? "bg-green-500/15 text-green-300" : ""}
                        ${isCurrent ? "bg-[#9b61db]/20 text-white ring-1 ring-[#9b61db]/40" : ""}
                        ${isLocked ? "text-gray-600 cursor-not-allowed" : "text-gray-400 hover:bg-white/10"}
                      `}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center
                        ${isDone ? "bg-green-500" : isCurrent ? "bg-[#9b61db]" : "bg-white/10"}`}
                      >
                        {isDone ? (
                          <CheckCircle className="w-4 h-4 text-white" />
                        ) : isLocked ? (
                          <Lock className="w-3 h-3 text-gray-500" />
                        ) : (
                          <span className="text-xs font-bold text-white">
                            {i + 1}
                          </span>
                        )}
                      </div>
                      <span className="flex-1">
                        {playlistVideos[i]?.title || `درس ${i + 1}`}
                      </span>
                      {isCurrent && (
                        <Play className="w-3.5 h-3.5 text-[#9b61db]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Complete Course Button */}
            {!isCompleted ? (
              <button
                onClick={handleCompleteCourse}
                disabled={!canComplete || completing}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
                  ${
                    canComplete
                      ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:shadow-lg"
                      : "bg-white/5 text-gray-500 cursor-not-allowed"
                  }`}
              >
                {completing ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Award className="w-5 h-5" /> إنهاء الكورس والحصول على
                    الشهادة
                  </>
                )}
              </button>
            ) : (
              <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5 text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-green-400 font-bold text-lg">
                  تم إتمام الكورس! 🎉
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  شهادتك أُرسلت على بريدك الإلكتروني
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
