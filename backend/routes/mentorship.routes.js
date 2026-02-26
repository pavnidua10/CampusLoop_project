
import express from "express";
import {
  getAvailableMentors,
  createMentorshipChat,
  accessMentorshipChat,
} from "../controllers/mentorship.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";


const router = express.Router();

router.get("/mentors",protectRoute,  getAvailableMentors);
router.post("/create", protectRoute,createMentorshipChat);
router.post("/access",protectRoute, accessMentorshipChat);

export default router;


