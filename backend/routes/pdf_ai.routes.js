import express from "express";
import multer from "multer";
import { generateFromPDF } from "../controllers/pdf_ai.controller.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/generate", upload.single("pdf"), generateFromPDF);

export default router;
