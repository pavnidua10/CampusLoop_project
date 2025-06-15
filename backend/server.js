import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

import connectMongoDB from "./db/connectMongoDB.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import messageRoutes from "./routes/message.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import mentorshipChatRoutes from "./routes/mentorship.routes.js";
import mentorshipMessageRoutes from "./routes/mentorshipMessage.routes.js";
import assignMentorRoutes from "./routes/assignedMentor.routes.js";
import MentorshipMessage from "./models/mentorshipMessage.model.js"; 
import AnonymousQna from "./routes/AnonymousQna.routes.js"
import mentorDashboardRoutes from "./routes/mentorDashboard.routes.js"


dotenv.config({ path: './backend/.env' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  'https://campusloop-project.onrender.com'
];

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/mentorship-chats", mentorshipChatRoutes);
app.use("/api/mentorship-chats", mentorshipMessageRoutes);
app.use("/api/mentor", assignMentorRoutes);
app.use("/api/qna",AnonymousQna)
app.use("/api/mentorResources", mentorDashboardRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

let onlineUsers = {};

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("join", (userId) => {
    onlineUsers[userId] = socket.id;
    console.log(`User ${userId} connected: ${socket.id}`);
  });

  socket.on("join chat", (chatId) => { 
    socket.join(chatId);
    console.log(`User joined chat room: ${chatId}`);
  });

  socket.on("send-mentorship-message", async ({ chatId, message, senderId }) => {
    try {
      const newMessage = await MentorshipMessage.create({
        chat: chatId,
        sender: senderId,
        text: message,
      });

      io.to(chatId).emit("receive-mentorship-message", {
        _id: newMessage._id,
        chat: newMessage.chat,
        sender: newMessage.sender,
        text: newMessage.text,
        createdAt: newMessage.createdAt,
      });
    } catch (error) {
      console.error("Error saving mentorship message:", error.message);
    }
  });

  socket.on("send-normal-message", async ({ chatId, message, senderId }) => {
    try {
      const chat = await UserChat.findById(chatId);
      if (!chat) {
        console.log(`Chat ${chatId} not found`);
        return;
      }
      const newMessage = {
        sender: senderId, 
        content: message, 
      };
      chat.messages.push(newMessage);
      await chat.save();
      await chat.populate("messages.sender", "fullName username");
      const savedMessage = chat.messages[chat.messages.length - 1];
      io.to(chatId).emit("receive-normal-message", {
        chatId: chatId,
        message: savedMessage,
      });
    } catch (error) {
      console.error("Error saving normal message:", error.message);
    }
  });

  socket.on("disconnect", () => {
    const disconnectedUser = Object.keys(onlineUsers).find(
      (key) => onlineUsers[key] === socket.id
    );
    if (disconnectedUser) {
      delete onlineUsers[disconnectedUser];
      console.log(`User ${disconnectedUser} disconnected`);
      socket.leaveAll();  
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectMongoDB();
});
