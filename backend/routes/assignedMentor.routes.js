
import express from 'express';
import { assignMentor,getAssignedMentees,getMentees,getMyMentor } from '../controllers/assignMentor.controller.js';
import { protectRoute } from "../middleware/protectRoute.js";
const router = express.Router();

router.post('/assign', assignMentor); // POST request to assign mentor
router.get('/:mentorId/mentees', getAssignedMentees);
router.get("/:mentorId/getmentees", protectRoute, getMentees);
router.get("/mentee/my-mentor", protectRoute, getMyMentor);


export default router;

