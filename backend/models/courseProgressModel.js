const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "course",
      required: true,
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    videoProgress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    lastPosition: {
      type: Number,
      default: 0,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    timeSpent: {
      type: Number,
      default: 0,
    },
    notes: [
      {
        timestamp: {
          type: Number,
          required: true,
        },
        note: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// مركب فريد
progressSchema.index({ userId: 1, courseId: 1, lessonId: 1 }, { unique: true });

const progressModel =
  mongoose.models.progress || mongoose.model("progress", progressSchema);

module.exports = progressModel;
