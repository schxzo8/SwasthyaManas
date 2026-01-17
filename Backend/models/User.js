const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["user", "expert", "admin"],
      default: "user"
    },

    // Optional but HIGHLY recommended for experts
    expertise: {
      type: String,
      required: function() {
        return this.role === "expert";
      },
    },

    isVerified: {
      type: Boolean,
      default: false
    },

    emailVerificationToken: String,

    failedLoginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
