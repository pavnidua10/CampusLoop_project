import GroupChat from '../models/chat.model.js';

import Message from '../models/message.model.js';


export const createGroupChat = async (req, res) => {
  const { name, userIds } = req.body;
  if (!name || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ message: "Invalid data" });
  }

  try {
    const groupChat = await GroupChat.create({
      name,
      users: [...userIds, req.user._id],
      admin: req.user._id,
    });
    res.status(201).json(groupChat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getGroupChats = async (req, res) => {
  try {
    const groups = await GroupChat.find({ users: req.user._id }).populate("users", "username fullName").populate("admin", "username");
    res.status(200).json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const sendGroupMessage = async (req, res) => {
  const { groupId, content } = req.body;
  try {
    const message = await Message.create({
      sender: req.user._id,
      content,
      chat: groupId,
      isGroup: true
    });

    const groupChat = await GroupChat.findByIdAndUpdate(
      groupId,
      { $push: { messages: message._id } },
      { new: true }
    ).populate("messages");

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getGroupMessages = async (req, res) => {
  const { groupId } = req.params;
  try {
    const group = await GroupChat.findById(groupId).populate({
      path: "messages",
      populate: { path: "sender", select: "username fullName" },
    });
    if (!group) return res.status(404).json({ message: "Group not found" });
    res.status(200).json(group.messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};