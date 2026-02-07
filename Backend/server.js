const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Routes 
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const contentRoutes = require("./routes/contentRoutes");
const assessmentRoutes = require("./routes/assessmentRoutes");
const assessmentTemplateRoutes = require("./routes/assessmentTemplateRoutes");
const expertRoutes = require("./routes/expertRoutes");
const consultationRoutes = require("./routes/consultationRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/assessment-templates", assessmentTemplateRoutes);
app.use("/api/experts", expertRoutes);
app.use("/api/consultations", consultationRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("SwasthyaManas API running...");
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });
