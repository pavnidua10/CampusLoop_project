import Resource from "../models/resource.model.js";
import Task from "../models/task.model.js";
import MentorshipChat from "../models/mentorshipChat.model.js";
import { uploadToCloudinary } from "../lib/utils/multer.js";

// Helper: verify user is a participant of a MentorshipChat
const verifyParticipant = async (chatId, userId) => {
  const chat = await MentorshipChat.findById(chatId);
  if (!chat) return null;
  const isMentor = chat.mentor.toString() === userId.toString();
  const isMentee = chat.mentee.toString() === userId.toString();
  if (!isMentor && !isMentee) return null;
  return { chat, isMentor, isMentee };
};

// POST /api/mentorResources/upload-resource
export const uploadResource = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const { chatId } = req.body;
    if (!chatId) return res.status(400).json({ message: "chatId is required" });

    const result = await verifyParticipant(chatId, req.user._id);
    if (!result) return res.status(403).json({ message: "Unauthorized or chat not found" });
    if (!result.isMentor) return res.status(403).json({ message: "Only mentors can upload resources" });

    const fileUrl = await uploadToCloudinary(req.file.path);
    const resource = await Resource.create({
      mentor: req.user._id,
      chatId,
      fileUrl,
      fileName: req.file.originalname,
    });

    res.status(201).json(resource);
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Upload failed" });
  }
};

// GET /api/mentorResources/chat/:chatId/resources — mentee OR mentor views resources for a chat
export const getResourcesForChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    const result = await verifyParticipant(chatId, req.user._id);
    if (!result) return res.status(403).json({ message: "Unauthorized or chat not found" });

    const resources = await Resource.find({ chatId })
      .populate("mentor", "username fullName profileImg")
      .sort({ createdAt: -1 });

    res.status(200).json(resources);
  } catch (err) {
    console.error("Resource fetch error:", err);
    res.status(500).json({ message: "Could not fetch resources" });
  }
};

// GET /api/mentorResources/:chatId — get tasks for a chat
export const getTasks = async (req, res) => {
  try {
    const { chatId } = req.params;

    const result = await verifyParticipant(chatId, req.user._id);
    if (!result) return res.status(403).json({ message: "Unauthorized or chat not found" });

    const tasks = await Task.find({ chatId })
      .populate("assignedBy", "username fullName profileImg")
      .sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Task fetch error:", error);
    res.status(500).json({ message: "Error fetching tasks" });
  }
};

// POST /api/mentorResources — create a task
export const createTask = async (req, res) => {
  try {
    const { chatId, text, dueDate } = req.body;
    if (!text) return res.status(400).json({ message: "Task text is required" });

    const result = await verifyParticipant(chatId, req.user._id);
    if (!result) return res.status(403).json({ message: "Unauthorized or chat not found" });
    if (!result.isMentor) return res.status(403).json({ message: "Only mentors can create tasks" });

    const task = await Task.create({ chatId, text, dueDate, assignedBy: req.user._id });
    const populatedTask = await task.populate("assignedBy", "username fullName profileImg");

    res.status(201).json(populatedTask);
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({ message: "Error creating task" });
  }
};

// PATCH /api/mentorResources/:id — toggle task (both mentor & mentee allowed)
export const toggleTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const result = await verifyParticipant(task.chatId, req.user._id);
    if (!result) return res.status(403).json({ message: "Unauthorized" });

    task.completed = !task.completed;
    await task.save();
    res.status(200).json(task);
  } catch (error) {
    console.error("Toggle task error:", error);
    res.status(500).json({ message: "Error updating task" });
  }
};

// DELETE /api/mentorResources/:id — only mentor can delete
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const result = await verifyParticipant(task.chatId, req.user._id);
    if (!result) return res.status(403).json({ message: "Unauthorized" });
    if (!result.isMentor) return res.status(403).json({ message: "Only mentors can delete tasks" });

    await Task.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Task deleted" });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ message: "Error deleting task" });
  }
};

// GET /api/mentorResources/my-resources — mentor's all uploads (across all chats)
export const getMyResources = async (req, res) => {
  try {
    const resources = await Resource.find({ mentor: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(resources);
  } catch (err) {
    console.error("Fetch resources error:", err);
    res.status(500).json({ message: "Failed to fetch resources" });
  }
};