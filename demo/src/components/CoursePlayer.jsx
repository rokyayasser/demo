/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CourseContext } from "../context/CourseContext";
import { AppContext } from "../context/AppContext";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  Maximize,
  ChevronRight,
  CheckCircle,
  BookOpen,
  Clock,
  Menu,
  ChevronLeft,
  SkipBack,
  SkipForward,
  Settings,
  Download,
  MessageSquare,
  Flag,
} from "lucide-react";
import { toast } from "react-toastify";

const CoursePlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const { getCourseContent, updateLessonProgress, currentCourse } =
    useContext(CourseContext);
  const { token } = useContext(AppContext);

  const [courseContent, setCourseContent] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showNotes, setShowNotes] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (courseId && token) {
      loadCourseContent();
    }
  }, [courseId, token]);

  const loadCourseContent = async () => {
    try {
      setLoading(true);
      const response = await getCourseContent(courseId);
      if (response?.success) {
        setCourseContent(response);
      }
    } catch (error) {
      toast.error("فشل في تحميل محتوى الدورة");
    } finally {
      setLoading(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const dur = videoRef.current.duration;
      setCurrentTime(current);
      setDuration(dur);
      setProgress((current / dur) * 100);

      // تحديث التقدم التلقائي عند 90%
      if (current / dur > 0.9 && courseContent?.lessons?.[currentLesson]) {
        updateProgress(currentLesson, true);
      }
    }
  };

  const updateProgress = async (lessonIndex, isCompleted = false) => {
    try {
      const lesson = courseContent.lessons[lessonIndex];
      await updateLessonProgress(courseId, lesson._id, {
        videoProgress: progress,
        lastPosition: currentTime,
        isCompleted,
      });
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleSkipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, currentTime - 10);
    }
  };

  const handleSkipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(duration, currentTime + 10);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if (videoRef.current.webkitRequestFullscreen) {
        videoRef.current.webkitRequestFullscreen();
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleLessonSelect = (index) => {
    setCurrentLesson(index);
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.load();
      setTimeout(() => {
        videoRef.current.play();
      }, 100);
    }
    updateProgress(index);
  };

  const handleNextLesson = () => {
    if (currentLesson < courseContent.lessons.length - 1) {
      handleLessonSelect(currentLesson + 1);
    }
  };

  const handlePrevLesson = () => {
    if (currentLesson > 0) {
      handleLessonSelect(currentLesson - 1);
    }
  };

  const handleAddNote = () => {
    if (noteText.trim()) {
      // هنا يجب إضافة API لإضافة الملاحظات
      setNoteText("");
      toast.success("تم إضافة الملاحظة");
    }
  };

  if (loading || !courseContent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-textSoft text-lg">جاري تحميل محتوى الدورة...</p>
        </div>
      </div>
    );
  }

  const currentLessonData = courseContent.lessons[currentLesson];
  const isCompleted = currentLessonData.progress?.isCompleted;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 bg-gray-800">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 hover:bg-gray-700 rounded"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-bold truncate">
            {courseContent.courseTitle_ar}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/course/${courseId}`)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
          >
            العودة للدورة
          </button>
          <button className="p-2 hover:bg-gray-700 rounded">
            <Settings size={20} />
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Video Player */}
        <div className="flex-1">
          <div className="relative bg-black aspect-video">
            <video
              ref={videoRef}
              src={currentLessonData.videoUrl}
              className="w-full h-full"
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => {
                setIsPlaying(false);
                updateProgress(currentLesson, true);
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              autoPlay
            />

            {/* Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              {/* Progress Bar */}
              <div className="h-2 bg-gray-600 mb-4 cursor-pointer group">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${progress}%` }}
                />
                <div
                  className="h-4 -mt-2 cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const percent = (e.clientX - rect.left) / rect.width;
                    if (videoRef.current) {
                      videoRef.current.currentTime = percent * duration;
                    }
                  }}
                >
                  <div
                    className="w-4 h-4 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ marginLeft: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handlePlayPause}
                    className="p-2 hover:bg-white/10 rounded-full"
                  >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                  </button>

                  <button
                    onClick={handleSkipBackward}
                    className="p-2 hover:bg-white/10 rounded-full"
                  >
                    <SkipBack size={20} />
                  </button>

                  <button
                    onClick={handleSkipForward}
                    className="p-2 hover:bg-white/10 rounded-full"
                  >
                    <SkipForward size={20} />
                  </button>

                  <div className="flex items-center gap-2">
                    <Volume2 size={20} />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-24 accent-primary"
                    />
                  </div>

                  <span className="text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {/* Speed Control */}
                  <div className="relative group">
                    <button className="px-3 py-1 bg-white/10 rounded hover:bg-white/20">
                      {playbackSpeed}x
                    </button>
                    <div className="absolute bottom-full mb-2 right-0 bg-gray-800 rounded shadow-lg hidden group-hover:block">
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                        <button
                          key={speed}
                          onClick={() => handleSpeedChange(speed)}
                          className={`block w-full px-4 py-2 text-right hover:bg-gray-700 ${
                            playbackSpeed === speed ? "bg-primary" : ""
                          }`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handlePrevLesson}
                    disabled={currentLesson === 0}
                    className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    السابق
                  </button>
                  <button
                    onClick={handleNextLesson}
                    disabled={
                      currentLesson === courseContent.lessons.length - 1
                    }
                    className="px-4 py-2 bg-primary rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    التالي
                  </button>
                  <button
                    onClick={handleFullscreen}
                    className="p-2 hover:bg-white/10 rounded-full"
                  >
                    <Maximize size={24} />
                  </button>
                </div>
              </div>
            </div>

            {/* Lesson Title Overlay */}
            <div className="absolute top-4 left-4 right-4">
              <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">
                    {currentLessonData.title_ar}
                  </h2>
                  {isCompleted && (
                    <span className="flex items-center gap-2 text-green-400">
                      <CheckCircle size={20} />
                      مكتمل
                    </span>
                  )}
                </div>
                <p className="text-gray-300 mt-1">
                  {currentLessonData.description}
                </p>
              </div>
            </div>
          </div>

          {/* Lesson Actions */}
          <div className="p-6">
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setShowNotes(!showNotes)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  showNotes ? "bg-primary" : "bg-gray-800 hover:bg-gray-700"
                }`}
              >
                <MessageSquare size={20} />
                الملاحظات
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700">
                <Download size={20} />
                تحميل المواد
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700">
                <Flag size={20} />
                الإبلاغ عن مشكلة
              </button>
            </div>

            {/* Notes Section */}
            {showNotes && (
              <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-bold mb-4">ملاحظاتك</h3>
                <div className="mb-4">
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="اكتب ملاحظتك هنا..."
                    className="w-full px-4 py-3 bg-gray-900 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows={3}
                  />
                  <button
                    onClick={handleAddNote}
                    className="mt-2 px-4 py-2 bg-primary rounded-lg hover:bg-secondary"
                  >
                    إضافة ملاحظة
                  </button>
                </div>
                {/* قائمة الملاحظات */}
                <div className="space-y-3">{/* هنا ستظهر الملاحظات */}</div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        {showSidebar && (
          <div className="w-80 bg-gray-800 h-[calc(100vh-64px)] overflow-y-auto">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">محتوى الدورة</h3>
                <span className="text-sm text-gray-400">
                  {courseContent.totalProgress || 0}% مكتمل
                </span>
              </div>
              <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-green-500 h-full"
                  style={{ width: `${courseContent.totalProgress || 0}%` }}
                />
              </div>
            </div>

            <div className="p-2">
              {courseContent.lessons.map((lesson, index) => (
                <button
                  key={lesson._id || index}
                  onClick={() => handleLessonSelect(index)}
                  className={`w-full text-right p-3 rounded-lg mb-1 transition-colors ${
                    currentLesson === index
                      ? "bg-primary text-white"
                      : "hover:bg-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {lesson.progress?.isCompleted ? (
                        <CheckCircle
                          size={18}
                          className="text-green-400 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-gray-400 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium truncate">
                          {lesson.title_ar}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Clock size={14} />
                          <span>{lesson.duration}</span>
                          {lesson.isPreview && (
                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded">
                              معاينة
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {currentLesson === index && (
                      <ChevronLeft size={18} className="flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursePlayer;
