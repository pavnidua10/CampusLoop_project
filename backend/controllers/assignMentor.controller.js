import User from '../models/user.model.js';
import MentorshipChat from '../models/mentorshipChat.model.js';

export const assignMentor = async (req, res) => {
  const { studentUsername, mentorId } = req.body;
  console.log("Assigning mentor ID:", mentorId, "to student:", studentUsername);

  try {
    // Find the student and mentor
    const student = await User.findOne({ username: studentUsername });
    const mentor = await User.findById(mentorId);

    if (!student || !mentor) {
      return res.status(404).json({ message: 'Student or Mentor not found' });
    }

    // Check if the mentor is available for mentorship
    if (!mentor.isAvailableForMentorship) {
      return res.status(400).json({ message: 'Mentor is not available for mentorship' });
    }

    // Check if student already has a mentor assigned
    if (student.assignedMentor) {
      return res.status(400).json({ message: 'Student already has a mentor assigned' });
    }

    // Create a new mentorship chat
    const newChat = new MentorshipChat({
      mentor: mentor._id,
      mentee: student._id,
      messages: [],
    });

    const savedChat = await newChat.save();

    // Update student fields
    student.assignedMentor = mentor._id;
    student.assignedMentorChatId = savedChat._id;
    await student.save();

    // Update mentor field: add this student to mentor’s assigned mentees
    mentor.assignedMentees.push(student._id);
    if (student._id.toString() === mentor._id.toString()) {
      return res.status(400).json({ message: 'Mentor cannot be assigned to themselves' });
    }
    
    await mentor.save();

    return res.status(200).json({ message: 'Mentor assigned successfully!', chatId: savedChat._id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};
export const getAssignedMentees = async (req, res) => {
  const { mentorId } = req.params;

  try {
    const mentor = await User.findById(mentorId)
      .populate('assignedMentees', 'username fullName profileImg bio assignedMentorChatId') // you can select specific fields

    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    return res.status(200).json({ mentees: mentor.assignedMentees });
  } catch (error) {
    console.error("Error fetching mentees:", error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


export const getMentees = async (req, res) => {
  try {
    const { mentorId } = req.params;

    // Find all mentorship chats where this user is the mentor
    const chats = await MentorshipChat.find({ mentor: mentorId })
      .populate("mentee", "username fullName profileImg _id");

    if (!chats || chats.length === 0) {
      return res.status(200).json({ mentees: [] });
    }

    // Shape each mentee with chatId attached
    const mentees = chats
      .filter((c) => c.mentee) // guard against deleted users
      .map((c) => ({
        _id: c.mentee._id,
        username: c.mentee.username,
        fullName: c.mentee.fullName,
        profileImg: c.mentee.profileImg,
        chatId: c._id, // ← MentorshipChat._id used for tasks & resources
      }));

    res.status(200).json({ mentees });
  } catch (err) {
    console.error("getMentees error:", err);
    res.status(500).json({ message: "Error fetching mentees" });
  }
};

// GET /api/mentee/my-mentor — mentee gets their mentor info + chatId
export const getMyMentor = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("assignedMentor", "username fullName profileImg bio")
      .populate("assignedMentorChatId");

    if (!user.assignedMentor) {
      return res.status(200).json({ mentor: null, chatId: null });
    }

    res.status(200).json({
      mentor: user.assignedMentor,
      chatId: user.assignedMentorChatId?._id || null,
    });
  } catch (err) {
    console.error("getMyMentor error:", err);
    res.status(500).json({ message: "Error fetching mentor info" });
  }
};