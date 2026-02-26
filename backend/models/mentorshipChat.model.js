import mongoose from "mongoose";

const mentorshipChatSchema = new mongoose.Schema({
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  mentee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, { timestamps: true });

const MentorshipChat = mongoose.model("MentorshipChat", mentorshipChatSchema);
export default MentorshipChat;
