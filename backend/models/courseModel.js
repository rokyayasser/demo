const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  title_ar: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  videoUrl: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    required: true,
  },
  isPreview: {
    type: Boolean,
    default: false,
  },
  promotionalVideo: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    title_ar: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    description_ar: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    category_ar: {
      type: String,
      required: true,
    },
    instructor: {
      type: String,
      required: true,
    },
    instructor_ar: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },
    discountPrice: {
      type: Number,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    promotionalVideo: {
      type: String,
    },
    totalDuration: {
      type: String,
      default: "0 ساعة",
    },
    totalLessons: {
      type: Number,
      default: 0,
    },
    level: {
      type: String,
      enum: ["مبتدئ", "متوسط", "متقدم"],
      default: "مبتدئ",
    },
    language: {
      type: String,
      default: "العربية",
    },
    features: {
      type: [String],
      default: [],
    },
    requirements: {
      type: [String],
      default: [],
    },
    whatYouWillLearn: {
      type: [String],
      default: [],
    },
    lessons: [lessonSchema],
    isPublished: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    studentsEnrolled: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

courseSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const courseModel =
  mongoose.models.course || mongoose.model("course", courseSchema);

module.exports = courseModel;
