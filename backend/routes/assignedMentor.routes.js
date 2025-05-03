
import express from 'express';
import { assignMentor,getAssignedMentees } from '../controllers/assignMentor.controller.js';

const router = express.Router();

router.post('/assign', assignMentor); // POST request to assign mentor
router.get('/:mentorId/mentees', getAssignedMentees);

export default router;
