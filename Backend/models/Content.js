const mongoose = require("mongoose");

const MENTAL_HEALTH_TOPICS = [
  "Anxiety",
  "Depression",
  "Stress",
  "Panic Attacks",
  "Social Anxiety",
  "OCD",
  "PTSD / Trauma",
  "ADHD",
  "Bipolar Disorder",
  "Sleep / Insomnia",
  "Anger Management",
  "Relationship Issues",
  "Grief / Loss",
  "Addiction / Substance Use",
  "Self-esteem / Confidence",
];

const contentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },

    // NEW
    contentType: {
      type: String,
      enum: ["page", "resource", "blog", "mental_health"],
      required: true,
      index: true,
      default: "resource",
    },

    // only for contentType="page"
    pageType: {
      type: String,
      enum: ["about", "services", "faq", "meditation"],
      default: null,
      index: true,
      required: function () {
        return this.contentType === "page";
      },
    },

    // only for contentType="mental_health"
    topic: {
      type: String,
      enum: MENTAL_HEALTH_TOPICS,
      default: null,
      index: true,
      required: function () {
        return this.contentType === "mental_health";
      },
    },

    // keep old field for now if you want backward compatibility
    category: {
      type: String,
      default: null,
    },

    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Content", contentSchema);
