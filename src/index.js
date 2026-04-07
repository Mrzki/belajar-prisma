import "./utils/redis.js";
import "./workers/email.worker.js";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log(`Client terhubung: ${socket.id}`);

  socket.on("join", (userId) => {
    socket.join(`user:${userId}`);
    console.log(`User ${userId} bergabung ke room user:${userId}`);
  });

  socket.on("disconnect", () => {
    console.log(`Client terputus: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
