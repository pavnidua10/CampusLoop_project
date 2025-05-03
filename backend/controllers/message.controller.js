import UserChat from '../models/message.model.js';
import mongoose from "mongoose";

export const accessOrCreateChat = async (req, res) => {
  const { userId } = req.body;
  const currentUserId = req.user._id;

  try {
   
    let chat = await UserChat.findOne({
      users: { $all: [userId, currentUserId] }
    }).populate("users", "-password");

    if (!chat) {
      chat = await UserChat.create({ users: [userId, currentUserId] , messages: [], });
    }

    res.status(200).json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const sendMessage = async (req, res) => {
  const { chatId, content } = req.body;

  try {
    const chat = await UserChat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    // Construct new message object with the sender info
    const newMessage = {
      sender: req.user._id,
      content,
      timestamp: new Date(),
    };

    // Push the new message to the chat
    chat.messages.push(newMessage);
    await chat.save();

    // Populate the sender field of the last message after saving
    await chat.populate("messages.sender", "fullName username");

    // Get the last message from the messages array after population
    const savedMessage = chat.messages[chat.messages.length - 1];

    // Ensure the response is always an object with sender as an object
    res.status(200).json({
      _id: savedMessage._id,
      content: savedMessage.content,
      sender: savedMessage.sender, // Populated object
      timestamp: savedMessage.timestamp,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getMessages = async (req, res) => {
  const chatId = req.query.chatId;
  console.log("chatId backend", chatId);
  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    return res.status(400).json({ message: "Invalid or missing Chat ID" });
  }
  if (mongoose.Types.ObjectId.isValid(chatId)) {
    console.log("VALID CHAT ID")
  }
  if (!chatId) {
    return res.status(400).json({ message: "Chat ID is required" });
  }

  try {
    const chat = await UserChat.findById(chatId)
    .populate("users", "-password")
    .populate("messages.sender", "fullName username");
    console.log("Chat found?", chat);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    return res.status(200).json(chat.messages || []);
  } catch (err) {
    console.error("Error fetching messages:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};





export const getUserChats = async (req, res) => {
  try {
    const chats = await UserChat.find({ users: req.user._id })
      .populate("users", "-password")
      .sort({ updatedAt: -1 });

    res.status(200).json(chats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




export const getConversations = async (req, res) => {
  try {
    console.log("User ID from token:", req.user._id);
    const chats = await UserChat.find({ users: req.user._id })
      .populate("users", "-password")
      .sort({ updatedAt: -1 });

    const results = chats.map((chat) => {
      const otherUser = chat.users.find(
        (user) => user._id.toString() !== req.user._id.toString()
      );
      return {
        _id: otherUser._id,
        fullName: otherUser.fullName,
        chatId: chat._id,
      };
    });

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

