import { useEffect, useState } from "react";
import { useAuth } from "../../Context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import io from "socket.io-client";

const socket = io(import.meta.env.VITE_BACKEND_URL||"https://campusloop-project.onrender.com");

const MentorshipChatInterface = () => {
  const { user } = useAuth();
  const { id } = useParams(); // chatId
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [mentorProfile, setMentorProfile] = useState(null);

  // Connect socket and join room
  useEffect(() => {
    if (!id || !user?._id) return;

    socket.emit("join-chat", id);
    console.log("Joined chat room:", id);

    return () => {
      socket.off("receive-mentorship-message");
    };
  }, [id, user?._id]);

  // ✅ Fix: Listen for new messages and normalize sender
  useEffect(() => {
    const handleReceiveMessage = (newMsg) => {
      const formattedMsg = {
        ...newMsg,
        sender: typeof newMsg.sender === "string" ? { _id: newMsg.sender } : newMsg.sender,
      };

      console.log("New message received via socket:", formattedMsg);
      setMessages((prev) => [...prev, formattedMsg]);
    };

    socket.on("receive-mentorship-message", handleReceiveMessage);

    return () => {
      socket.off("receive-mentorship-message", handleReceiveMessage);
    };
  }, []);

  // Fetch mentor profile
  useEffect(() => {
    const fetchMentorProfile = async () => {
      if (!user?.username) return;

      try {
        const res = await fetch(`/api/users/profile/${user.username}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to fetch mentor");

        setMentorProfile(data.assignedMentor);
      } catch (error) {
        console.error("Error fetching mentor profile:", error.message);
      }
    };

    fetchMentorProfile();
  }, [user?.username]);

  // Initial fetch of all chat messages
  const { data: chatMessages, refetch } = useQuery({
    queryKey: ["mentorshipChatMessages", id],
    queryFn: async () => {
      const res = await fetch(`/api/mentorship-chats/messages/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch messages");
      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (chatMessages) setMessages(chatMessages);
  }, [chatMessages]);

  // Send message to server via API + Socket
  const sendMessage = async () => {
    if (!message.trim() || !mentorProfile?.username) return;

    try {
      const res = await fetch("/api/mentorship-chats/message", {
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

      // Emit message to socket
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
    <div className="flex flex-col w-full h-[600px] max-w-4xl mx-auto border rounded-3xl p-6 shadow-2xl bg-gradient-to-br from-[#f6f1f1] to-[#e3e6f0]">
      {/* Mentor Profile */}
      {mentorProfile && (
        <div className="flex items-center gap-4 mb-6 border-b pb-4">
          <img
            src={mentorProfile.profileImg || "/avatar-placeholder.png"}
            alt="Mentor"
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-300 shadow"
          />
          <div>
            <h2 className="text-xl font-bold text-gray-800">{mentorProfile.fullName}</h2>
            <p className="text-sm text-gray-600">@{mentorProfile.username}</p>
            <p className="text-sm text-gray-500">{mentorProfile.bio}</p>
          </div>
        </div>
      )}

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-2 py-4 bg-white rounded-2xl border shadow-inner">
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
                className={`px-4 py-2 min-w-[60px] max-w-[80%] break-words text-base rounded-xl ${
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

      {/* Message input */}
      <div className="mt-4 flex items-center gap-3">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 rounded-full border text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-5 py-2 rounded-full hover:bg-blue-600 transition-all"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default MentorshipChatInterface;



