const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

function initSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: ["http://localhost:3000"],
            credentials: true
        },
    });

    // Auth middleware (JWT)
    io.use((socket,next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token) return next(new Error("No token:"));

            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            socket.user = decoded;
            next();
        } catch (err) {
            next(new Error("Invalid token:"));
        }
    });

    io.on("connection", (socket) => {
        const userId = socket.user.userId || socket.user.id || socket.user._id;
        console.log(`User connected: ${userId} (socket id: ${socket.id})`);
        const role = socket.user.role;

        // 1) personal room for direct notifications
        socket.join(`user_${userId}`);
        console.log("✅ joined room:", `user_${userId}`);

        // 2) role room (opt)
        socket.join(`role_${role}`);

        // Join a consultation room (user + expert both join)
        socket.on("join_consultation", (consultationId) => {
            if (!consultationId) return;
            socket.join(`consultation_${consultationId}`);
        });

        // Send a message to a consultation room
        socket.on("chat:send", async ({consultationId, text }) => {
            if (!consultationId || !text) return;

            const payload = {
                consultationId,
                text: text.trim(),
                senderId: userId,
                senderRole: role,
                createdAt: new Date().toISOString(),
            };

            // Broadcast to both user & expert in that consultation
            io.to(`consultation_${consultationId}`).emit("chat:new", payload);
        });

        socket.on("disconnect", () => {});
    });
    return io;
}

module.exports = { initSocket };