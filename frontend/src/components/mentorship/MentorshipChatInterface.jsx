import { useEffect, useState } from "react";
import { useAuth } from "../../Context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import { API_URL } from "../../config";

const socket = io(import.meta.env.VITE_BACKEND_URL || "https://campusloop-project.onrender.com" || "http://localhost:5000");

const MentorshipChatInterface = () => {
  const { user } = useAuth();
  const { id } = useParams(); 
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [mentorProfile, setMentorProfile] = useState(null);

  useEffect(() => {
    if (!id || !user?._id) return;
    socket.emit("join-chat", id);
    return () => {
      socket.off("receive-mentorship-message");
    };
  }, [id, user?._id]);

  useEffect(() => {
    const handleReceiveMessage = (newMsg) => {
      const formattedMsg = {
        ...newMsg,
        sender: typeof newMsg.sender === "string" ? { _id: newMsg.sender } : newMsg.sender,
      };
      setMessages((prev) => [...prev, formattedMsg]);
    };

    socket.on("receive-mentorship-message", handleReceiveMessage);
    return () => {
      socket.off("receive-mentorship-message", handleReceiveMessage);
    };
  }, []);

  useEffect(() => {
    const fetchMentorProfile = async () => {
      if (!user?.username) return;
      try {
        const res = await fetch(`${API_URL}/api/users/profile/${user.username}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch mentor");
        setMentorProfile(data.assignedMentor);
      } catch (error) {
        console.error("Error fetching mentor profile:", error.message);
      }
    };
    fetchMentorProfile();
  }, [user?.username]);

  const { data: chatMessages } = useQuery({
    queryKey: ["mentorshipChatMessages", id],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/mentorship-chats/messages/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch messages");
      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (chatMessages) setMessages(chatMessages);
  }, [chatMessages]);

  const sendMessage = async () => {
    if (!message.trim() || !mentorProfile?.username) return;

    try {
      const res = await fetch(`${API_URL}/api/mentorship-chats/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          sender: user._id,
          receiver: mentorProfile.username,
          chatId: id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send message");

      socket.emit("send-mentorship-message", {
        chatId: id,
        message: data.message.text,
        senderId: user._id,
      });

      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error.message);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto h-screen md:h-[90vh] p-4 sm:p-6">
      {/* Mentor Profile */}
      {mentorProfile && (
        <div className="flex items-center gap-4 mb-4 sm:mb-6 border-b pb-3">
          <img
            src={mentorProfile.profileImg || "/avatar-placeholder.png"}
            alt="Mentor"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-gray-300"
          />
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">{mentorProfile.fullName}</h2>
            <p className="text-sm text-gray-600">@{mentorProfile.username}</p>
            <p className="text-xs sm:text-sm text-gray-500">{mentorProfile.bio}</p>
          </div>
        </div>
      )}

      {/* Chat Box */}
      <div className="flex-1 overflow-y-auto bg-white rounded-xl border p-3 sm:p-4 shadow-inner">
        {messages.length === 0 ? (
          <p className="text-center text-gray-400">No messages yet</p>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-3 flex ${
                msg.sender._id === user._id ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 text-sm sm:text-base min-w-[60px] max-w-[80%] break-words rounded-xl ${
                  msg.sender._id === user._id
                    ? "bg-blue-100 text-blue-900"
                    : "bg-pink-100 text-pink-900"
                } shadow`}
              >
                {msg.text?.trim() || <i>(Empty message)</i>}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Section */}
      <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="w-full px-4 py-2 text-sm sm:text-base border rounded-full shadow focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <button
          onClick={sendMessage}
          className="w-full sm:w-auto bg-blue-500 text-white px-5 py-2 rounded-full hover:bg-blue-600 transition-all"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default MentorshipChatInterface;
