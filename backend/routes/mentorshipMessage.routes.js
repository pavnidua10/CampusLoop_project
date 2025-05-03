import express from "express";
import { sendMessage, getMessages } from "../controllers/mentorshipMessage.controller.js";

import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/message", protectRoute, sendMessage);
router.get("/messages/:chatId", protectRoute, getMessages);

export default router;

