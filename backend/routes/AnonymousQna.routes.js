import express from 'express';
import {  askQuestion, getQuestions, answerQuestion,getMyQna} from '../controllers/anonymousQna.controller.js';
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();



// Routes for QnA
router.post("/ask", protectRoute, askQuestion); // Mentees ask questions
router.get("/questions", protectRoute, getQuestions); // Mentors view questions
router.post("/answer", protectRoute, answerQuestion); // Mentors answer questions
router.get("/my-questions", protectRoute, getMyQna); 
export default router;

