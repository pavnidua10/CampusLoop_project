import Groq from "groq-sdk";
import Chatbot from "../models/chatbot.model.js";

export const askChatbot = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GROQ_API_KEY is missing or empty" });
    }

    const groq = new Groq({ apiKey });

    let chat = await Chatbot.findOne({ user: userId });

    if (!chat) {
      chat = await Chatbot.create({
        user: userId,
        messages: [],
      });
    }

    chat.messages.push({
      role: "user",
      content: message.trim(),
    });

    const aiMessages = [
      {
        role: "system",
        content:
          "You are CampusLoop AI, a helpful university assistant helping students with mentorship, study guidance, assignments, productivity, career advice, internships, and student support. Keep answers clear, practical, and student-friendly.",
      },
      ...chat.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: aiMessages,
      temperature: 0.7,
      max_completion_tokens: 1024,
    });

    const reply = completion.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return res.status(500).json({ error: "Empty response from AI" });
    }

    chat.messages.push({
      role: "assistant",
      content: reply,
    });

    await chat.save();

    res.status(200).json({ reply });
  } catch (error) {
    console.error("FULL CHATBOT ERROR:", error);
    res.status(500).json({ error: error.message || "Chatbot failed" });
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