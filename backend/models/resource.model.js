import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema({
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  chatId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Chat",
  required: true,
},

});

export default mongoose.model("Resource", resourceSchema);
