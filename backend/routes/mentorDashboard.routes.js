
import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  uploadResource,
  getResourcesForChat,
  getTasks,
  createTask,
  toggleTask,
  deleteTask,
  getMyResources,
} from "../controllers/mentorDashboard.controller.js";
import { upload } from "../lib/utils/multer.js";

const router = express.Router();

// ⚠️  ORDER MATTERS — static routes must come BEFORE dynamic /:param routes

// Static routes first
router.get("/my-resources", protectRoute, getMyResources);
router.post("/upload-resource", protectRoute, upload.single("file"), uploadResource);
router.post("/", protectRoute, createTask);

// NEW: mentee-accessible resource fetch for a specific chat
router.get("/chat/:chatId/resources", protectRoute, getResourcesForChat);

// Dynamic routes last (otherwise /my-resources and /upload-resource get swallowed by /:chatId)
router.get("/:chatId", protectRoute, getTasks);
router.patch("/:id", protectRoute, toggleTask);
router.delete("/:id", protectRoute, deleteTask);

export default router;