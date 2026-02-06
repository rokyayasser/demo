const courseModel = require("../models/courseModel.js");
const enrollmentModel = require("../models/enrollmentModel.js");
const progressModel = require("../models/courseProgressModel.js");
const paymentModel = require("../models/coursePaymentModel.js");
const userModel = require("../models/userModel.js");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");

// إنشاء دورة جديدة (للمسؤول)
const createCourse = async (req, res) => {
  try {
    console.log("=== CREATING NEW COURSE ===");
    console.log("Request Body:", req.body);
    console.log("Files received:", req.files);

    // Debug files structure
    if (req.files) {
      Object.keys(req.files).forEach((key) => {
        const fileArray = req.files[key];
        console.log(`File field '${key}':`, {
          count: fileArray?.length || 0,
          files: fileArray?.map((f) => ({
            originalname: f.originalname,
            mimetype: f.mimetype,
            size: f.size,
            hasBuffer: !!f.buffer,
            bufferSize: f.buffer?.length || 0,
          })),
        });
      });
    }

    const {
      title,
      title_ar,
      description,
      description_ar,
      category,
      category_ar,
      instructor,
      instructor_ar,
      instructorBio,
      instructorBio_ar,
      price,
      discountPrice,
      level,
      language,
      isPublished,
      isFeatured,
      features,
      requirements,
      whatYouWillLearn,
    } = req.body;

    // Check for required fields
    if (!title || !title_ar || !category || !category_ar || !price) {
      return res.json({
        success: false,
        message: "الرجاء إدخال جميع الحقول المطلوبة: العنوان، التصنيف، والسعر",
      });
    }

    // Handle file uploads directly to Cloudinary
    let thumbnailUrl = "";
    let promotionalVideoUrl = "";

    // Check if thumbnail exists
    if (
      !req.files ||
      !req.files.thumbnail ||
      req.files.thumbnail.length === 0
    ) {
      return res.json({
        success: false,
        message: "يجب رفع صورة مصغرة للدورة",
      });
    }

    // Upload thumbnail to Cloudinary
    console.log("Uploading thumbnail to Cloudinary...");
    const thumbnailFile = req.files.thumbnail[0];

    if (!thumbnailFile || !thumbnailFile.buffer) {
      return res.json({
        success: false,
        message: "خطأ في ملف الصورة المصغرة",
      });
    }

    try {
      const thumbnailUpload = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "courses/thumbnails",
            resource_type: "image",
            transformation: [
              { width: 800, height: 450, crop: "fill" },
              { quality: "auto" },
            ],
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary thumbnail upload error:", error);
              reject(error);
            } else {
              console.log("✅ Cloudinary thumbnail upload success");
              resolve(result);
            }
          }
        );

        // Write buffer to stream
        uploadStream.end(thumbnailFile.buffer);
      });

      thumbnailUrl = thumbnailUpload.secure_url;
      console.log("✅ Thumbnail uploaded to Cloudinary:", thumbnailUrl);
    } catch (uploadError) {
      console.error("❌ Thumbnail upload error:", uploadError);
      return res.json({
        success: false,
        message: "فشل في رفع الصورة: " + uploadError.message,
      });
    }

    // Upload promotional video (optional)
    if (req.files.promotionalVideo && req.files.promotionalVideo.length > 0) {
      try {
        console.log("Uploading promotional video to Cloudinary...");
        const videoFile = req.files.promotionalVideo[0];

        if (!videoFile.buffer) {
          console.warn("⚠️ No buffer found for video file");
        } else {
          const videoUpload = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: "courses/videos",
                resource_type: "video",
                chunk_size: 6000000,
              },
              (error, result) => {
                if (error) {
                  console.error("Cloudinary video upload error:", error);
                  reject(error);
                } else {
                  console.log("✅ Cloudinary video upload success");
                  resolve(result);
                }
              }
            );

            uploadStream.end(videoFile.buffer);
          });

          promotionalVideoUrl = videoUpload.secure_url;
          console.log("✅ Video uploaded to Cloudinary:", promotionalVideoUrl);
        }
      } catch (videoError) {
        console.warn(
          "⚠️ Video upload failed (continuing without video):",
          videoError.message
        );
        // Continue without video - it's optional
      }
    }

    // Parse arrays
    const parseArrayData = (data) => {
      if (!data) return [];

      try {
        // Try to parse as JSON first
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [data];
      } catch (e) {
        // If not JSON, split by newlines
        if (typeof data === "string") {
          return data
            .split("\n")
            .map((item) => item.trim())
            .filter((item) => item.length > 0);
        }
        // If already an array, return as is
        return Array.isArray(data) ? data : [data];
      }
    };

    const parsedFeatures = parseArrayData(features);
    const parsedRequirements = parseArrayData(requirements);
    const parsedWhatYouWillLearn = parseArrayData(whatYouWillLearn);

    // Parse boolean values
    const isPublishedBool =
      isPublished === "true" || isPublished === true || false;
    const isFeaturedBool =
      isFeatured === "true" || isFeatured === true || false;

    // Create course object
    const courseData = {
      title: title.trim(),
      title_ar: title_ar.trim(),
      description: (description || "").trim(),
      description_ar: (description_ar || "").trim(),
      category: category.trim(),
      category_ar: category_ar.trim(),
      instructor: (instructor || "").trim(),
      instructor_ar: (instructor_ar || "").trim(),
      instructorBio: (instructorBio || "").trim(),
      instructorBio_ar: (instructorBio_ar || "").trim(),
      price: parseFloat(price) || 0,
      discountPrice: discountPrice ? parseFloat(discountPrice) : null,
      level: (level || "مبتدئ").trim(),
      language: (language || "العربية").trim(),
      isPublished: isPublishedBool,
      isFeatured: isFeaturedBool,
      features: parsedFeatures,
      requirements: parsedRequirements,
      whatYouWillLearn: parsedWhatYouWillLearn,
      thumbnail: thumbnailUrl,
      promotionalVideo: promotionalVideoUrl,
      studentsEnrolled: 0,
      rating: 0,
      totalLessons: 0,
      totalDuration: "00:00",
      lessons: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log("Course data to save:", {
      title: courseData.title,
      title_ar: courseData.title_ar,
      price: courseData.price,
      hasThumbnail: !!courseData.thumbnail,
      hasPromoVideo: !!courseData.promotionalVideo,
    });

    const newCourse = new courseModel(courseData);
    await newCourse.save();

    console.log("✅ Course created successfully in database");
    console.log("Course ID:", newCourse._id);

    res.json({
      success: true,
      message: "تم إنشاء الدورة بنجاح",
      course: {
        _id: newCourse._id,
        title: newCourse.title,
        title_ar: newCourse.title_ar,
        thumbnail: newCourse.thumbnail,
        price: newCourse.price,
        category: newCourse.category,
      },
    });
  } catch (error) {
    console.error("❌ Error creating course:", error);
    console.error("Error stack:", error.stack);

    res.status(500).json({
      success: false,
      message: "حدث خطأ في إنشاء الدورة: " + error.message,
      error:
        process.env.NODE_ENV === "development" ? error.toString() : undefined,
    });
  }
};

// إضافة درس للدورة
// In addLesson function, fix the Cloudinary upload code:

const addLesson = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, title_ar, description, duration, order, isPreview } =
      req.body;

    console.log(`=== ADDING LESSON TO COURSE: ${courseId} ===`);
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    console.log(
      "Files received:",
      req.files ? Object.keys(req.files) : "No files"
    );

    // Validate course exists
    const course = await courseModel.findById(courseId);
    if (!course) {
      return res.json({
        success: false,
        message: "الدورة غير موجودة",
      });
    }

    // Get files
    const videoFile = req.files?.video?.[0];
    const thumbnailFile = req.files?.thumbnail?.[0];

    // Validate video file
    if (!videoFile || !videoFile.buffer) {
      return res.json({
        success: false,
        message: "يجب رفع فيديو للدرس",
      });
    }

    console.log("Uploading lesson video to Cloudinary...");
    console.log("Video file size:", videoFile.size, "bytes");
    console.log("Video mimetype:", videoFile.mimetype);

    // Upload video to Cloudinary with better timeout handling
    let videoUpload;
    try {
      console.log("Starting Cloudinary upload with optimized settings...");

      videoUpload = await new Promise((resolve, reject) => {
        // Set a longer timeout for large files (10 minutes)
        const timeoutId = setTimeout(() => {
          reject(new Error("Upload timeout - الملف كبير جداً أو الاتصال بطيء"));
        }, 600000); // 10 minutes

        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: "video",
            folder: `courses/${courseId}/lessons`,
            chunk_size: 6000000, // 6MB chunks
            timeout: 600000, // 10 minutes
            eager_async: true, // Process asynchronously
            // Optimize upload
            quality: "auto",
            fetch_format: "auto",
          },
          (error, result) => {
            clearTimeout(timeoutId);

            if (error) {
              console.error("Cloudinary video upload error:", error);
              reject(error);
            } else {
              console.log("✅ Cloudinary video upload success");
              console.log("Video URL:", result.secure_url);
              console.log("Video duration:", result.duration);
              resolve(result);
            }
          }
        );

        // Write buffer to stream in chunks to avoid memory issues
        const chunkSize = 1024 * 1024; // 1MB chunks
        let offset = 0;

        const writeChunk = () => {
          if (offset < videoFile.buffer.length) {
            const chunk = videoFile.buffer.slice(offset, offset + chunkSize);
            uploadStream.write(chunk);
            offset += chunkSize;
            setImmediate(writeChunk); // Continue writing
          } else {
            uploadStream.end(); // Finish upload
          }
        };

        writeChunk(); // Start writing
      });

      console.log("✅ Video uploaded successfully:", videoUpload.secure_url);
    } catch (videoError) {
      console.error("❌ Video upload failed:", videoError);

      // Provide more helpful error message
      let errorMessage = "فشل في رفع الفيديو";
      if (
        videoError.message?.includes("timeout") ||
        videoError.http_code === 499
      ) {
        errorMessage =
          "انتهت مهلة الرفع. الملف كبير جداً أو الاتصال بطيء. حاول تقليل حجم الفيديو أو استخدام اتصال أسرع.";
      } else if (videoError.message?.includes("size")) {
        errorMessage = "حجم الفيديو كبير جداً. الرجاء استخدام فيديو أصغر.";
      } else {
        errorMessage =
          "فشل في رفع الفيديو: " + (videoError.message || "خطأ غير معروف");
      }

      return res.json({
        success: false,
        message: errorMessage,
      });
    }

    // Upload thumbnail (optional - use course thumbnail as fallback)
    let thumbnailUrl = course.thumbnail;

    if (thumbnailFile && thumbnailFile.buffer) {
      console.log("Uploading lesson thumbnail to Cloudinary...");
      try {
        const thumbnailUpload = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: "image",
              folder: `courses/${courseId}/thumbnails`,
              transformation: [
                { width: 800, height: 450, crop: "fill" },
                { quality: "auto" },
              ],
            },
            (error, result) => {
              if (error) {
                console.error("Cloudinary thumbnail upload error:", error);
                reject(error);
              } else {
                console.log("✅ Cloudinary thumbnail upload success");
                resolve(result);
              }
            }
          );

          uploadStream.end(thumbnailFile.buffer);
        });

        thumbnailUrl = thumbnailUpload.secure_url;
        console.log("✅ Lesson thumbnail uploaded:", thumbnailUrl);
      } catch (thumbnailError) {
        console.warn(
          "⚠️ Thumbnail upload failed, using course thumbnail:",
          thumbnailError.message
        );
        // Continue with course thumbnail
      }
    }

    // Create lesson data
    const lessonData = {
      _id: new mongoose.Types.ObjectId(),
      title: title || "درس جديد",
      title_ar: title_ar || "درس جديد",
      description: description || "",
      videoUrl: videoUpload.secure_url,
      duration: duration || "00:00",
      thumbnail: thumbnailUrl,
      order: parseInt(order) || (course.lessons?.length || 0) + 1,
      isPreview: isPreview === "true" || isPreview === true,
      createdAt: new Date(),
    };

    console.log("Lesson data prepared:", {
      title: lessonData.title,
      title_ar: lessonData.title_ar,
      hasVideoUrl: !!lessonData.videoUrl,
      hasThumbnail: !!lessonData.thumbnail,
      order: lessonData.order,
    });

    // Add lesson to course
    if (!course.lessons) {
      course.lessons = [];
    }
    course.lessons.push(lessonData);
    course.totalLessons = course.lessons.length;

    // Update total duration
    if (duration) {
      const totalMinutes = calculateTotalDuration(course.lessons);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      course.totalDuration =
        hours > 0 ? `${hours} ساعة ${minutes} دقيقة` : `${minutes} دقيقة`;
    }

    course.updatedAt = new Date();

    // Save course
    await course.save();

    console.log("✅ Lesson added successfully");

    res.json({
      success: true,
      message: "تم إضافة الدرس بنجاح",
      lesson: lessonData,
      course: {
        _id: course._id,
        title_ar: course.title_ar,
        totalLessons: course.totalLessons,
        totalDuration: course.totalDuration,
      },
    });
  } catch (error) {
    console.error("❌ Error adding lesson:", error);
    console.error("Error stack:", error.stack);

    res.json({
      success: false,
      message: "فشل في إضافة الدرس: " + error.message,
      error:
        process.env.NODE_ENV === "development" ? error.toString() : undefined,
    });
  }
};
// الحصول على جميع الدورات (عام)
const getAllCourses = async (req, res) => {
  try {
    const {
      category,
      level,
      isFeatured,
      search,
      page = 1,
      limit = 12,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = { isPublished: true };
    const skip = (page - 1) * limit;

    // تطبيق الفلاتر
    if (category) {
      query.category = category;
    }

    if (level) {
      query.level = level;
    }

    if (isFeatured === "true") {
      query.isFeatured = true;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { title_ar: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { description_ar: { $regex: search, $options: "i" } },
        { instructor: { $regex: search, $options: "i" } },
        { instructor_ar: { $regex: search, $options: "i" } },
      ];
    }

    // إعداد الترتيب
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    // الحصول على العدد الإجمالي والبيانات
    const totalCount = await courseModel.countDocuments(query);
    const courses = await courseModel
      .find(query)
      .select("-lessons -whatYouWillLearn -requirements")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    console.log(`✅ Retrieved ${courses.length} courses`);

    res.json({
      success: true,
      courses,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / limit),
      stats: {
        totalCourses: totalCount,
        featuredCourses: await courseModel.countDocuments({
          ...query,
          isFeatured: true,
        }),
      },
    });
  } catch (error) {
    console.error("❌ Error fetching courses:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// الحصول على تفاصيل دورة معينة
const getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.userId;

    console.log(`=== GETTING COURSE DETAILS: ${courseId} ===`);

    // البحث عن الدورة
    const course = await courseModel.findById(courseId);
    if (!course) {
      return res.json({
        success: false,
        message: "الدورة غير موجودة",
      });
    }

    let isEnrolled = false;
    let userProgress = null;
    let previewLessons = [];

    // التحقق من تسجيل المستخدم إذا كان مسجلاً
    if (userId) {
      // Check enrollment in multiple ways
      const enrollment = await enrollmentModel.findOne({
        userId,
        courseId,
        status: "completed",
      });

      // Also check user model
      const user = await userModel.findById(userId);
      const hasCourseInUserModel = user?.courses?.some(
        (c) => c.courseId && c.courseId.toString() === courseId
      );

      isEnrolled = !!enrollment || hasCourseInUserModel;

      // الحصول على تقدم المستخدم إذا كان مسجلاً
      if (isEnrolled) {
        userProgress = await progressModel.find({
          userId,
          courseId,
        });
      }
    }

    // إعداد دروس المعاينة للمستخدمين غير المسجلين
    if (!isEnrolled) {
      previewLessons = (course.lessons || [])
        .filter((lesson) => lesson.isPreview)
        .map((lesson) => ({
          _id: lesson._id,
          title: lesson.title,
          title_ar: lesson.title_ar,
          description: lesson.description,
          duration: lesson.duration,
          thumbnail: lesson.thumbnail,
          isPreview: lesson.isPreview,
        }));
    }

    // زيادة عدد المشاهدات
    course.views = (course.views || 0) + 1;
    await course.save();

    // تحضير البيانات للاستجابة
    const courseData = {
      ...course.toObject(),
      isEnrolled,
      previewLessons,
      userProgress,
      // Ensure promotionalVideo is included
      promotionalVideo: course.promotionalVideo || null,
    };

    // إخفاء فيديوهات الدروس للمستخدمين غير المسجلين
    if (!isEnrolled) {
      courseData.lessons = (courseData.lessons || []).map((lesson) => ({
        ...lesson,
        videoUrl: lesson.isPreview ? lesson.videoUrl : null,
      }));
    }

    console.log("Course data prepared:", {
      hasPromotionalVideo: !!courseData.promotionalVideo,
      totalLessons: courseData.lessons?.length || 0,
      isEnrolled,
    });

    res.json({
      success: true,
      course: courseData,
    });
  } catch (error) {
    console.error("❌ Error fetching course details:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// الحصول على دروس الدورة (للمستخدمين المسجلين فقط)
const getCourseLessons = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.userId;

    console.log(`=== GETTING COURSE LESSONS: ${courseId} ===`);

    // التحقق من تسجيل المستخدم
    const enrollment = await enrollmentModel.findOne({
      userId,
      courseId,
      status: "completed",
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "يجب شراء الدورة لمشاهدة الدروس",
      });
    }

    // البحث عن الدورة
    const course = await courseModel
      .findById(courseId)
      .select("lessons title title_ar");
    if (!course) {
      return res.json({
        success: false,
        message: "الدورة غير موجودة",
      });
    }

    // الحصول على تقدم المستخدم في كل درس
    const lessonsWithProgress = await Promise.all(
      course.lessons.map(async (lesson) => {
        const progress = await progressModel.findOne({
          userId,
          courseId,
          lessonId: lesson._id,
        });

        return {
          ...lesson.toObject(),
          progress: progress
            ? {
                videoProgress: progress.videoProgress,
                isCompleted: progress.isCompleted,
                lastPosition: progress.lastPosition,
                timeSpent: progress.timeSpent,
              }
            : null,
        };
      })
    );

    // تحديث آخر وقت دخول
    enrollment.lastAccessed = new Date();
    await enrollment.save();

    res.json({
      success: true,
      lessons: lessonsWithProgress,
      courseTitle: course.title,
      courseTitle_ar: course.title_ar,
      totalProgress: enrollment.totalProgress,
    });
  } catch (error) {
    console.error("❌ Error fetching course lessons:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// تحديث تقدم مشاهدة الدرس
const updateLessonProgress = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = req.userId;
    const { videoProgress, lastPosition, isCompleted } = req.body;

    console.log(`=== UPDATING LESSON PROGRESS: ${lessonId} ===`);

    // التحقق من تسجيل المستخدم
    const enrollment = await enrollmentModel.findOne({
      userId,
      courseId,
      status: "completed",
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "يجب شراء الدورة لمتابعة التقدم",
      });
    }

    // البحث عن الدورة والدرس
    const course = await courseModel.findById(courseId);
    const lesson = course.lessons.id(lessonId);
    if (!lesson) {
      return res.json({
        success: false,
        message: "الدرس غير موجود",
      });
    }

    // تحديث أو إنشاء تقدم الدرس
    let progress = await progressModel.findOne({
      userId,
      courseId,
      lessonId,
    });

    if (!progress) {
      progress = new progressModel({
        userId,
        courseId,
        lessonId,
      });
    }

    progress.videoProgress = videoProgress || progress.videoProgress;
    progress.lastPosition = lastPosition || progress.lastPosition;

    if (isCompleted && !progress.isCompleted) {
      progress.isCompleted = true;
      progress.completedAt = new Date();

      // إضافة الدرس للمكتملة في التسجيل
      if (
        !enrollment.completedLessons.some(
          (cl) => cl.lessonId.toString() === lessonId
        )
      ) {
        enrollment.completedLessons.push({
          lessonId,
          completedAt: new Date(),
          progress: 100,
        });
      }
    }

    // حساب الوقت المقضي (تقريبي)
    if (lastPosition && lastPosition > progress.lastPosition) {
      progress.timeSpent += Math.floor(
        (lastPosition - progress.lastPosition) / 1000
      );
    }

    await progress.save();

    // تحديث التقدم الإجمالي
    const totalLessons = course.lessons.length;
    const completedLessons = await progressModel.countDocuments({
      userId,
      courseId,
      isCompleted: true,
    });

    enrollment.totalProgress = Math.round(
      (completedLessons / totalLessons) * 100
    );
    enrollment.lastAccessed = new Date();
    await enrollment.save();

    console.log(`✅ Progress updated: ${enrollment.totalProgress}%`);

    res.json({
      success: true,
      progress: {
        videoProgress: progress.videoProgress,
        isCompleted: progress.isCompleted,
        totalProgress: enrollment.totalProgress,
        completedLessons,
        totalLessons,
      },
    });
  } catch (error) {
    console.error("❌ Error updating lesson progress:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// إضافة ملاحظة للدرس
const addLessonNote = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = req.userId;
    const { timestamp, note } = req.body;

    console.log(`=== ADDING NOTE TO LESSON: ${lessonId} ===`);

    // التحقق من تسجيل المستخدم
    const enrollment = await enrollmentModel.findOne({
      userId,
      courseId,
      status: "completed",
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "يجب شراء الدورة لإضافة ملاحظات",
      });
    }

    // البحث عن التقدم الحالي
    const progress = await progressModel.findOne({
      userId,
      courseId,
      lessonId,
    });

    if (!progress) {
      return res.json({
        success: false,
        message: "ابدأ بمشاهدة الدرس أولاً",
      });
    }

    // إضافة الملاحظة
    progress.notes.push({
      timestamp,
      note,
    });

    await progress.save();

    res.json({
      success: true,
      message: "تم إضافة الملاحظة بنجاح",
      note: {
        timestamp,
        note,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    console.error("❌ Error adding lesson note:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// تقييم الدورة
const rateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.userId;
    const { rating, review } = req.body;

    console.log(`=== RATING COURSE: ${courseId} ===`);

    // التحقق من صحة التقييم
    if (!rating || rating < 1 || rating > 5) {
      return res.json({
        success: false,
        message: "التقييم يجب أن يكون بين 1 و 5",
      });
    }

    // البحث عن الدورة
    const course = await courseModel.findById(courseId);
    if (!course) {
      return res.json({
        success: false,
        message: "الدورة غير موجودة",
      });
    }

    // التحقق من تسجيل المستخدم
    const enrollment = await enrollmentModel.findOne({
      userId,
      courseId,
      status: "completed",
    });

    if (!enrollment) {
      return res.json({
        success: false,
        message: "يجب شراء الدورة أولاً",
      });
    }

    // البحث عن التقييم السابق
    const existingRating = course.ratings.find(
      (r) => r.userId.toString() === userId
    );

    if (existingRating) {
      // تحديث التقييم الحالي
      existingRating.rating = rating;
      existingRating.review = review;
      existingRating.updatedAt = new Date();
    } else {
      // إضافة تقييم جديد
      course.ratings.push({
        userId,
        rating,
        review,
        createdAt: new Date(),
      });
      course.reviewsCount = (course.reviewsCount || 0) + 1;
    }

    // حساب متوسط التقييم
    const totalRatings = course.ratings.reduce((sum, r) => sum + r.rating, 0);
    course.rating = totalRatings / course.ratings.length;

    await course.save();

    console.log("✅ Course rated successfully");

    res.json({
      success: true,
      message: "تم إرسال تقييمك بنجاح",
      rating: course.rating,
    });
  } catch (error) {
    console.error("❌ Error rating course:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// الحصول على دورات المستخدم
const getUserCourses = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * limit;

    console.log(`=== GETTING USER COURSES: ${userId} ===`);

    // الحصول على تسجيلات المستخدم
    const enrollments = await enrollmentModel
      .find({ userId, status: "completed" })
      .populate(
        "courseId",
        "title title_ar thumbnail price discountPrice totalDuration totalLessons instructor_ar level"
      )
      .sort({ enrolledAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await enrollmentModel.countDocuments({
      userId,
      status: "completed",
    });

    // تحضير البيانات للاستجابة
    const courses = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = enrollment.courseId;
        const progress = await progressModel.find({
          userId,
          courseId: course._id,
        });

        const completedLessons = progress.filter((p) => p.isCompleted).length;
        const totalProgress =
          course.totalLessons > 0
            ? Math.round((completedLessons / course.totalLessons) * 100)
            : 0;

        return {
          ...course.toObject(),
          enrollmentId: enrollment._id,
          enrolledAt: enrollment.enrolledAt,
          totalProgress,
          lastAccessed: enrollment.lastAccessed,
          completedLessons,
        };
      })
    );

    res.json({
      success: true,
      courses,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / limit),
      stats: {
        totalEnrolled: totalCount,
        totalCompleted: await enrollmentModel.countDocuments({
          userId,
          status: "completed",
          totalProgress: 100,
        }),
      },
    });
  } catch (error) {
    console.error("❌ Error fetching user courses:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// تحديث الدورة (للمسؤول)
const updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const updateData = req.body;
    const thumbnailFile = req.files?.thumbnail?.[0];

    console.log(`=== UPDATING COURSE: ${courseId} ===`);
    console.log("Update data:", updateData);
    console.log("Has thumbnail file:", !!thumbnailFile);

    // Find the course
    const course = await courseModel.findById(courseId);
    if (!course) {
      return res.json({
        success: false,
        message: "الدورة غير موجودة",
      });
    }

    // Upload new thumbnail if provided
    if (thumbnailFile && thumbnailFile.buffer) {
      console.log("Uploading new thumbnail to Cloudinary...");
      try {
        // Delete old thumbnail from Cloudinary if exists
        if (course.thumbnail) {
          try {
            const oldPublicId = course.thumbnail.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(
              `courses/thumbnails/${oldPublicId}`
            );
            console.log("✅ Old thumbnail deleted from Cloudinary");
          } catch (deleteError) {
            console.warn(
              "Could not delete old thumbnail:",
              deleteError.message
            );
          }
        }

        // Upload new thumbnail directly to Cloudinary
        const thumbnailUpload = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "courses/thumbnails",
              resource_type: "image",
              transformation: [
                { width: 800, height: 450, crop: "fill" },
                { quality: "auto" },
              ],
            },
            (error, result) => {
              if (error) {
                console.error("Cloudinary thumbnail upload error:", error);
                reject(error);
              } else {
                console.log("✅ Cloudinary thumbnail upload success");
                resolve(result);
              }
            }
          );

          uploadStream.end(thumbnailFile.buffer);
        });

        updateData.thumbnail = thumbnailUpload.secure_url;
        console.log("✅ New thumbnail uploaded:", updateData.thumbnail);
      } catch (uploadError) {
        console.error("Thumbnail upload error:", uploadError);
        return res.json({
          success: false,
          message: "فشل في رفع الصورة: " + uploadError.message,
        });
      }
    }

    // Convert numeric values
    if (updateData.price) updateData.price = Number(updateData.price);
    if (updateData.discountPrice) {
      updateData.discountPrice = updateData.discountPrice
        ? Number(updateData.discountPrice)
        : null;
    }

    // Convert arrays from text to array
    try {
      if (updateData.features) {
        updateData.features =
          typeof updateData.features === "string"
            ? JSON.parse(updateData.features)
            : updateData.features;
      }
      if (updateData.requirements) {
        updateData.requirements =
          typeof updateData.requirements === "string"
            ? JSON.parse(updateData.requirements)
            : updateData.requirements;
      }
      if (updateData.whatYouWillLearn) {
        updateData.whatYouWillLearn =
          typeof updateData.whatYouWillLearn === "string"
            ? JSON.parse(updateData.whatYouWillLearn)
            : updateData.whatYouWillLearn;
      }
    } catch (parseError) {
      console.warn("Error parsing arrays, treating as raw text:", parseError);
      // Keep as is if parsing fails
    }

    // Update data
    Object.assign(course, updateData);
    course.updatedAt = new Date();

    await course.save();

    console.log("✅ Course updated successfully");

    res.json({
      success: true,
      message: "تم تحديث الدورة بنجاح",
      course,
    });
  } catch (error) {
    console.error("❌ Error updating course:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// حذف الدورة (للمسؤول)
const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    console.log(`=== DELETING COURSE: ${courseId} ===`);

    // البحث عن الدورة
    const course = await courseModel.findById(courseId);
    if (!course) {
      return res.json({
        success: false,
        message: "الدورة غير موجودة",
      });
    }

    // حذف جميع البيانات المرتبطة
    await enrollmentModel.deleteMany({ courseId });
    await progressModel.deleteMany({ courseId });
    await paymentModel.deleteMany({ courseId });

    // حذف الوسائط من Cloudinary
    try {
      // حذف الصورة المصغرة
      if (course.thumbnail) {
        const thumbnailPublicId = course.thumbnail
          .split("/")
          .pop()
          .split(".")[0];
        await cloudinary.uploader.destroy(
          `courses/thumbnails/${thumbnailPublicId}`
        );
        console.log("✅ Deleted thumbnail from Cloudinary");
      }

      // حذف فيديو الترويج
      if (course.promotionalVideo) {
        const videoPublicId = course.promotionalVideo
          .split("/")
          .pop()
          .split(".")[0];
        await cloudinary.uploader.destroy(`courses/videos/${videoPublicId}`, {
          resource_type: "video",
        });
        console.log("✅ Deleted promotional video from Cloudinary");
      }

      // حذف دروس الدورة
      for (const lesson of course.lessons) {
        if (lesson.videoUrl) {
          const lessonPublicId = lesson.videoUrl.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(
            `courses/${courseId}/lessons/${lessonPublicId}`,
            { resource_type: "video" }
          );
        }
      }
      console.log("✅ Deleted all lesson videos from Cloudinary");
    } catch (cloudinaryError) {
      console.warn(
        "⚠️ Could not delete media from Cloudinary:",
        cloudinaryError.message
      );
    }

    // حذف الدورة
    await courseModel.findByIdAndDelete(courseId);

    console.log("✅ Course deleted successfully");

    res.json({
      success: true,
      message: "تم حذف الدورة بنجاح",
    });
  } catch (error) {
    console.error("❌ Error deleting course:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// التحقق من تسجيل المستخدم
const checkEnrollmentStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.userId;

    console.log(
      `=== CHECKING ENROLLMENT STATUS: ${courseId} for user: ${userId} ===`
    );

    // Check enrollment in enrollment model
    const enrollment = await enrollmentModel.findOne({
      userId,
      courseId,
      status: "completed",
    });

    // Also check in user model courses array
    const user = await userModel.findById(userId);
    let hasCourseInUserModel = false;

    if (user && user.courses) {
      hasCourseInUserModel = user.courses.some(
        (course) => course.courseId && course.courseId.toString() === courseId
      );
    }

    const isEnrolled = !!enrollment || hasCourseInUserModel;

    console.log("Enrollment check results:", {
      enrollmentFound: !!enrollment,
      hasCourseInUserModel,
      isEnrolled,
    });

    res.json({
      success: true,
      isEnrolled,
      enrollment: enrollment || null,
      userHasCourse: hasCourseInUserModel,
    });
  } catch (error) {
    console.error("❌ Error checking enrollment:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// التحقق من تسجيل المستخدم - دالة أخرى متوافقة
const checkUserEnrollment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.userId;

    console.log(
      `=== CHECKING ENROLLMENT STATUS: ${courseId} for user: ${userId} ===`
    );

    // Check enrollment in enrollment model
    const enrollment = await enrollmentModel.findOne({
      userId,
      courseId,
      status: "completed",
    });

    // Also check user model
    const user = await userModel.findById(userId);
    let hasCourseInUserModel = false;

    if (user && user.courses) {
      hasCourseInUserModel = user.courses.some(
        (course) => course.courseId && course.courseId.toString() === courseId
      );
    }

    const isEnrolled = !!enrollment || hasCourseInUserModel;

    console.log("Enrollment check results:", {
      enrollmentFound: !!enrollment,
      hasCourseInUserModel,
      isEnrolled,
    });

    res.json({
      success: true,
      isEnrolled,
      enrollment: enrollment || null,
      userHasCourse: hasCourseInUserModel,
    });
  } catch (error) {
    console.error("❌ Error checking enrollment:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// دالة مساعدة لحساب المدة الإجمالية
const calculateTotalDuration = (lessons) => {
  let totalMinutes = 0;

  (lessons || []).forEach((lesson) => {
    if (lesson.duration) {
      const parts = lesson.duration.split(":");
      if (parts.length >= 2) {
        const minutes = parseInt(parts[0]) || 0;
        const seconds = parseInt(parts[1]) || 0;
        totalMinutes += minutes + seconds / 60;
      } else {
        const minutes = parseInt(lesson.duration) || 0;
        totalMinutes += minutes;
      }
    }
  });

  return Math.round(totalMinutes);
};

module.exports = {
  createCourse,
  addLesson,
  getAllCourses,
  getCourseDetails,
  getCourseLessons,
  updateLessonProgress,
  addLessonNote,
  rateCourse,
  getUserCourses,
  updateCourse,
  deleteCourse,
  checkEnrollmentStatus,
  checkUserEnrollment,
  calculateTotalDuration,
};
