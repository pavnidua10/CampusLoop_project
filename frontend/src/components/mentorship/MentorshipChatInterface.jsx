
import { useEffect, useState,useRef } from "react";
import { useAuth } from "../../Context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { socket } from "../../socket";
import { useParams, useNavigate } from "react-router-dom";


import { API_URL } from "../../config";

const MentorshipChatInterface = () => {
  const { user } = useAuth();
  const { id } = useParams();
const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [mentorProfile, setMentorProfile] = useState(null);
const bottomRef = useRef(null);

   console.log("USER from AuthContext:", user); // check logged-in user
  console.log("CHAT ID from useParams:", id);  // check if chatId is correct
  // 🔹 Join mentorship chat room
  useEffect(() => {
    if (!id || !user?._id) return;
    socket.emit("join chat", id);
    
  return () => {
    socket.emit("leave chat", id);
  };
  }, [id, user?._id]);

useEffect(() => {
  const handleReceiveMessage = (newMsg) => {
    setMessages((prev) => [
      ...prev,
      {
        _id: newMsg._id,
        text: newMsg.text,
        sender: { _id: newMsg.sender },
        createdAt: newMsg.createdAt,
      },
    ]);
  };

  socket.on("receive-mentorship-message", handleReceiveMessage);
  return () =>
    socket.off("receive-mentorship-message", handleReceiveMessage);
}, []);

  useEffect(() => {
    const fetchMentorProfile = async () => {
      if (!user?.username) return;

      try {
        const res = await fetch(
          `${API_URL}/api/users/profile/${user.username}`,{credentials: "include"}
        );
        const data = await res.json();

        if (!res.ok)
          throw new Error(data.error || "Failed to fetch mentor");

        setMentorProfile(data.assignedMentor);
      } catch (error) {
        console.error("Error fetching mentor profile:", error.message);
      }
    };

    fetchMentorProfile();
  }, [user?.username]);

  // 🔹 Fetch old chat messages
  const { data: chatMessages } = useQuery({
    queryKey: ["mentorshipChatMessages", id],
    queryFn: async () => {
      const res = await fetch(
        `${API_URL}/api/mentorship-chats/messages/${id}`,{credentials: "include"}
      );
      const data = await res.json();

      if (!res.ok)
        throw new Error(data.error || "Failed to fetch messages");

      return data;
    },
    enabled: !!id,
  });

useEffect(() => {
  if (chatMessages && messages.length === 0) {
    setMessages(chatMessages);
  }
}, [chatMessages]);


const sendMessage = async () => {
  if (!message.trim() || !mentorProfile?.username) return;

  const optimisticMessage = {
    _id: Date.now(),
    text: message,
    sender: { _id: user._id },
    createdAt: new Date(),
  };

  // ✅ Show message instantly
  setMessages((prev) => [...prev, optimisticMessage]);
  setMessage("");

  try {
    const res = await fetch(`${API_URL}/api/mentorship-chats/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        message,
        sender: user._id,
        receiver: mentorProfile.username,
        chatId: id,
      }),
    });

    if (!res.ok) throw new Error("Failed to save message");

    // ✅ Emit EXACTLY what backend expects
    socket.emit("send-mentorship-message", {
      chatId: id,
      message: message,
      senderId: user._id,
    });
  } catch (err) {
    console.error("Send message error:", err.message);
  }
};

useEffect(() => {
  bottomRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]);

return (
  <div className="flex flex-col min-h-screen bg-gray-900 text-white">

    {/* 🔹 HEADER */}
    <div className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700 shadow-md">
      
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/mentorship")}
          className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-lg transition"
        >
          ← Back
        </button>

        {mentorProfile && (
          <div className="flex items-center gap-3">
            <img
              src={mentorProfile.profileImg || "/avatar-placeholder.png"}
              alt="Mentor"
              className="w-10 h-10 rounded-full object-cover border border-gray-500"
            />
            <div>
              <h2 className="font-semibold">
                {mentorProfile.fullName}
              </h2>
              <p className="text-xs text-gray-400">
                @{mentorProfile.username}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* 🔹 CHAT MESSAGES */}
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
      {messages.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">
          No messages yet
        </p>
      ) : (
        messages.map((msg, idx) => {
          const isMine = msg.sender._id === user._id;

          return (
            <div
              key={idx}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-md text-sm sm:text-base ${
                  isMine
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-700 text-gray-200 rounded-bl-none"
                }`}
              >
                <p>{msg.text?.trim() || <i>(Empty message)</i>}</p>
                <p className="text-[10px] mt-1 opacity-60 text-right">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })
      )}
      <div ref={bottomRef} />
    </div>

    {/* 🔹 INPUT BAR */}
    <div className="px-6 py-4 bg-gray-800 border-t border-gray-700">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />

        <button
          onClick={sendMessage}
          className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-full transition font-medium"
        >
          Send
        </button>
      </div>
    </div>
  </div>
);
};
export default MentorshipChatInterface;
