import MentorshipChat from '../models/mentorshipChat.model.js';
import Message from '../models/message.model.js';
import User from '../models/user.model.js';


export const getAvailableMentors = async (req, res) => {
  try {
    const mentors = await User.find({ isAvailableForMentorship: true }).select("username fullName profileImg");
    res.status(200).json(mentors);
  } catch (error) {
    console.error("Error fetching available mentors:", error);
    res.status(500).json({ message: "Server error while fetching mentors" });
  }
};

export const createMentorshipChat = async (req, res) => {
  const { mentorId } = req.body;
  const menteeId = req.user._id;

  try {
   
    let existingChat = await MentorshipChat.findOne({
      mentor: mentorId,
      mentee: menteeId,
    });

    if (existingChat) {
      return res.status(200).json(existingChat); 
    }

   
    const chat = await MentorshipChat.create({
      mentor: mentorId,
      mentee: menteeId,
    });

    res.status(201).json(chat);
  } catch (error) {
    console.error("Error creating/accessing mentorship chat:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const accessMentorshipChat = async (req, res) => {
  const { mentorId, menteeId } = req.body;  

  const isMentor = req.user._id.toString() === mentorId;

  let chat;
  if (isMentor) {
   
    chat = await MentorshipChat.findOne({ mentor: mentorId, mentee: menteeId });
  } else {
  
    chat = await MentorshipChat.findOne({ mentor: menteeId, mentee: mentorId });
  }

  if (chat) return res.json({ chat });

 
  const newChat = await MentorshipChat.create({
    mentor: isMentor ? mentorId : menteeId,   
    mentee: isMentor ? menteeId : mentorId,   
  });

  res.status(201).json({ chat: newChat });
};


