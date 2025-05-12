import { useEffect, useState } from "react";
import { useAuth } from "../../Context/AuthContext";
import io from "socket.io-client";
import { API_URL } from "../../config";

const socket = io(import.meta.env.VITE_BACKEND_URL||"https://campusloop-project.onrender.com"|| "http://localhost:10000");

const MenteeChat = ({ mentee, chatId }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false); 

  
  useEffect(() => {
    if (!chatId || !user?._id) return;

    socket.emit("join-chat", chatId);
    console.log("Joined chat room:", chatId);

    return () => {
      socket.emit("leave-chat", chatId);
      socket.off("receive-mentorship-message");
    };
  }, [chatId, user?._id]);

 
  useEffect(() => {
    const handleReceiveMessage = (newMsg) => {
      const formattedMsg = {
        ...newMsg,
        sender:
          typeof newMsg.sender === "string"
            ? { _id: newMsg.sender }
            : newMsg.sender,
      };

  
      if (newMsg.sender?._id !== user._id) {
        setMessages((prev) => [...prev, formattedMsg]);
      }
    };

    socket.on("receive-mentorship-message", handleReceiveMessage);

    return () => {
      socket.off("receive-mentorship-message", handleReceiveMessage);
    };
  }, [user._id]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`${API_URL}/api/mentorship-chats/messages/${chatId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load messages");

        setMessages(data);
      } catch (error) {
        console.error("Fetch messages error:", error.message);
      }
    };

    if (chatId) fetchMessages();
  }, [chatId]);


  const handleSendMessage = async () => {
    if (!message.trim() || isSending) return;

    setIsSending(true); 

    try {
      const res = await fetch(`${API_URL}/api/mentorship-chats/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          sender: user._id,
          receiver: mentee.username,
          chatId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Send message failed");


      socket.emit("send-mentorship-message", {
        chatId,
        message: data.message.text,
        senderId: user._id,
      });

      setMessages((prev) => [
        ...prev,
        { ...data.message, sender: { _id: user._id } },
      ]);
      setMessage(""); 
    } catch (error) {
      console.error("Send message error:", error.message);
    } finally {
      setIsSending(false); 
    }
  };

  return (
    <div className="flex flex-col h-full p-1 bg-white">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Chat with {mentee.fullName}
      </h2>

      <div className="flex-1 overflow-y-auto px-4 py-2 bg-white rounded-2xl border shadow-lg h-[500px]"> {/* Increased height here */}
        {messages.length === 0 ? (
          <p className="text-center text-gray-400">No messages yet</p>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-3 flex ${
                msg.sender?._id === user._id ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-5 py-3 min-w-[70px] max-w-[85%] break-words text-base rounded-xl ${
                  msg.sender?._id === user._id
                    ? "bg-blue-100 text-blue-900"
                    : "bg-pink-100 text-pink-900"
                } shadow`}
              >
                {msg.text || <i>(Empty message)</i>}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Field */}
      <div className="mt-5 flex items-center gap-4">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-5 py-3 rounded-full border text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-lg"
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition-all shadow-md"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default MenteeChat;




