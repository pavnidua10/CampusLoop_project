import OpenAI from "openai";
import Chatbot from "../models/chatbot.model.js";

export const askChatbot = async (req, res) => {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { message } = req.body;
    const userId = req.user._id;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    let chat = await Chatbot.findOne({ user: userId });

    if (!chat) {
      chat = await Chatbot.create({
        user: userId,
        messages: [],
      });
    }

    chat.messages.push({
      role: "user",
      content: message,
    });

    const aiMessages = [
      {
        role: "system",
        content:
          "You are CampusLoop AI, a helpful university assistant helping students with mentorship, study guidance, tasks, and career advice.",
      },
      ...chat.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: aiMessages,
    });

    const reply = completion.choices[0].message.content;

    chat.messages.push({
      role: "assistant",
      content: reply,
    });

    await chat.save();

    res.status(200).json({ reply });
  } catch (error) {
  console.error("FULL CHATBOT ERROR:", error);
  res.status(500).json({ error: error.message });
}
};

export const clearChat = async (req, res) => {
  try {
    await Chatbot.findOneAndDelete({ user: req.user._id });
    res.status(200).json({ message: "Chat cleared" });
  } catch (error) {
    res.status(500).json({ error: "Failed to clear chat" });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const chat = await Chatbot.findOne({ user: req.user._id });
    res.status(200).json(chat?.messages || []);
  } catch (error) {
    res.status(500).json({ error: "Failed to load history" });
  }
};
