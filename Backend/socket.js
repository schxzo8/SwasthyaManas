const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000", "http://localhost:5173"],
      credentials: true,
    },
  });

  // AUTH MIDDLEWARE
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token"));

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

      // normalize fields
      socket.userId = String(decoded.id);
      socket.role = decoded.role;

      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("✅ socket connected:", socket.id, "user:", socket.userId);

    // personal room
    socket.join(`user_${socket.userId}`);
    console.log("✅ joined room:", `user_${socket.userId}`);

    // role room
    socket.join(`role_${socket.role}`);

    socket.on("join_consultation", (consultationId) => {
      if (!consultationId) return;
      socket.join(`consultation_${consultationId}`);
    });

    socket.on("chat:send", ({ consultationId, text }) => {
      if (!consultationId || !text) return;

      const payload = {
        consultationId,
        text: text.trim(),
        senderId: socket.userId,
        senderRole: socket.role,
        createdAt: new Date().toISOString(),
      };

      io.to(`consultation_${consultationId}`).emit("chat:new", payload);
    });

    socket.on("disconnect", (reason) => {
      console.log("socket disconnected:", socket.id, reason);
    });
  });

  return io;
}

module.exports = { initSocket };