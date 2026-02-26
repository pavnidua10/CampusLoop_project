import Resource from "../models/resource.model.js";
import Task from "../models/task.model.js";
import Chat from "../models/chat.model.js";
import { uploadToCloudinary } from "../lib/utils/multer.js";

//
// ==============================
// RESOURCE CONTROLLERS
// ==============================
//

export const uploadResource = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { chatId } = req.body;

    if (!chatId) {
      return res.status(400).json({ message: "chatId is required" });
    }

    // Verify chat exists
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Verify user is part of chat
    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Verify mentor
    if (!req.user.isAvailableForMentorship) {
      return res.status(403).json({ message: "Only mentors can upload resources" });
    }

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


export const getResourcesForChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const resources = await Resource.find({ chatId })
      .populate("mentor", "username fullName profileImg")
      .sort({ createdAt: -1 });

    res.status(200).json(resources);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch resources" });
  }
};


//
// ==============================
// TASK CONTROLLERS
// ==============================
//

export const getTasks = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const tasks = await Task.find({ chatId })
      .populate("assignedBy", "username fullName profileImg")
      .sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks" });
  }
};


export const createTask = async (req, res) => {
  try {
    const { chatId, text, dueDate } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Task text is required" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const task = await Task.create({
      chatId,
      text,
      dueDate,
      assignedBy: req.user._id,
    });

    const populatedTask = await task.populate(
      "assignedBy",
      "username fullName profileImg"
    );

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: "Error creating task" });
  }
};


export const toggleTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const chat = await Chat.findById(task.chatId);

    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    task.completed = !task.completed;
    await task.save();

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Error updating task" });
  }
};


export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const chat = await Chat.findById(task.chatId);

    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting task" });
  }
};
