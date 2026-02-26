
import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { uploadResource,getTasks,createTask,toggleTask,deleteTask } from "../controllers/mentorDashboard.controller.js";
import { upload } from "../lib/utils/multer.js";

const router = express.Router();
router.get("/:chatId", protectRoute, getTasks);

// Create a new task
router.post("/", protectRoute, createTask);

// Toggle task completion
router.patch("/:id", protectRoute, toggleTask);

// Delete a task
router.delete("/:id", protectRoute, deleteTask);
router.post("/upload-resource", protectRoute, upload.single("file"), uploadResource);
// router.get("/my-resources", protectRoute, getMentorResources);
// router.get("/resources", protectRoute, getResourcesForMentee);

export default router;
