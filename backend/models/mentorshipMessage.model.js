import mongoose from "mongoose";

const mentorshipMessageSchema = new mongoose.Schema({
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MentorshipChat",
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const MentorshipMessage = mongoose.model("MentorshipMessage", mentorshipMessageSchema);
export default MentorshipMessage;
