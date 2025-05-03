
import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { uploadResource, getMentorResources, getResourcesForMentee } from "../controllers/mentorDashboard.controller.js";
import { upload } from "../lib/utils/multer.js";

const router = express.Router();

router.post("/upload-resource", protectRoute, upload.single("file"), uploadResource);
router.get("/my-resources", protectRoute, getMentorResources);
router.get("/resources", protectRoute, getResourcesForMentee);

export default router;
