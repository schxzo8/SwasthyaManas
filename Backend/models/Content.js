const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    body: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: ["about", "services", "faq", "meditation" , "blog", "resource"],
      required: true,
    },

    published: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Content", contentSchema);
