import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { askChatbot,clearChat,getChatHistory } from "../controllers/chatbot.controller.js";

const router = express.Router();

router.post("/ask", protectRoute, askChatbot);
router.delete("/clear", protectRoute, clearChat);
router.get("/history", protectRoute, getChatHistory);

export default router;
