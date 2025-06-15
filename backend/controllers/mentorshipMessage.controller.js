import MentorshipMessage from "../models/mentorshipMessage.model.js";


  export const sendMessage = async (req, res) => {
    const { chatId, message } = req.body;
    const senderId = req.user._id; 
    console.log("Incoming message body:", req.body);
  
    if (!message || !chatId) {
      return res.status(400).json({ error: "Message text and chatId are required" });
    }
  
    try {
      const newMessage = await MentorshipMessage.create({
        chat: chatId,
        sender: senderId,
        text: message,
      });
  
      res.status(201).json({ message: newMessage });
    } catch (error) {
      console.error("Error sending message:", error.message);
      res.status(500).json({ error: "Failed to send message" });
    }
  };

export const getMessages = async (req, res) => {
  const { chatId } = req.params;

  try {
    const messages = await MentorshipMessage.find({ chat: chatId })
      .populate("sender", "name email") // Optional: limit what you return
      .sort({ createdAt: 1 }); // Sort messages by time (old to new)

    if (!messages || messages.length === 0) {
      return res.status(404).json({ message: "No messages found for this chat." });
    }

    return res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({ message: "Something went wrong while fetching messages." });
  }
};
