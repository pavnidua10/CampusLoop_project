
import express from "express";
import {
  createGroupChat,
  getGroupChats,
  sendGroupMessage,
  getGroupMessages,
} from "../controllers/chat.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();
router.post("/create", protectRoute, createGroupChat);
router.get("/my-groups", protectRoute, getGroupChats);
router.post("/message", protectRoute, sendGroupMessage);
router.get("/messages/:groupId", protectRoute, getGroupMessages);

export default router;