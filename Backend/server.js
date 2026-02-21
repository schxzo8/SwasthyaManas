// server.js (or index.js)
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { initSocket } = require("./socket");
const cookieParser = require("cookie-parser");
require("dotenv").config();

// Routes
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const contentRoutes = require("./routes/contentRoutes");
const assessmentRoutes = require("./routes/assessmentRoutes");
const assessmentTemplateRoutes = require("./routes/assessmentTemplateRoutes");
const expertRoutes = require("./routes/expertRoutes");
const consultationRoutes = require("./routes/consultationRoutes");
const availabilityRoutes = require("./routes/availabilityRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const slotRoutes = require("./routes/slotRoutes");

const app = express();

app.use(cookieParser());
// ✅ CORS (better)
app.use(
  cors({
    origin: [process.env.CLIENT_ORIGIN || "http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json());

// Create ONE http server
const server = http.createServer(app);

// Attach socket.io to that server
const io = initSocket(server);

// Make io available to controllers via req.app.get("io")
app.set("io", io);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/assessment-templates", assessmentTemplateRoutes);
app.use("/api/experts", expertRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/slots", slotRoutes)

app.get("/", (req, res) => res.send("SwasthyaManas API running..."));

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    // ✅ Start ONLY the http server (not app.listen)
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => console.error("MongoDB connection failed:", error));
