
import express from "express";


import {  accessOrCreateChat,
    getUserChats,
    sendMessage,
    getMessages,
getConversations} from "../controllers/message.controller.js";
    
import { protectRoute } from "../middleware/protectRoute.js";
const router = express.Router();
router.post("/access-chat", protectRoute, accessOrCreateChat);
router.get("/my-chats", protectRoute, getUserChats);
router.post("/send-message", protectRoute, sendMessage);
router.get("/get-messages", protectRoute, getMessages);
router.get("/conversations", protectRoute, getConversations);


export default router;

