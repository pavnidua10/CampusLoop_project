import express from "express";
import multer from "multer";
import { protectRoute } from "../middleware/protectRoute.js";
import { generatePdfAI } from "../controllers/pdf_ai.controller.js";
 

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
});
 
const router = express.Router();

router.post("/generate", protectRoute, upload.single("pdf"), generatePdfAI);
 
export default router;