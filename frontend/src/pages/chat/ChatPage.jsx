import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../Context/AuthContext";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import io from "socket.io-client";
import { API_URL } from "../../config";

const socket = io(
  import.meta.env.VITE_BACKEND_URL ||
  "https://campusloop-project.onrender.com" ||
  "http://localhost:5000"
);

const ChatPage = () => {
  const { token, userId } = useAuth();
  const { chatId } = useParams();
  const location = useLocation();
  const chatUserFromState = location.state;
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const scrollRef = useRef();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch(`${API_URL}/api/message/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (
          chatUserFromState &&
          !data.find((conv) => conv.chatId === chatUserFromState.chatId)
        ) {
          data.push(chatUserFromState);
        }
        setConversations(data || []);
        localStorage.removeItem("chatUser");

        if (!data || data.length === 0) {
          const sugRes = await fetch(`${API_URL}/api/user/suggested`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const sugData = await sugRes.json();
          setSuggestedUsers(sugData || []);
        }
      } catch (err) {
        console.error("Error fetching conversations:", err);
      }
    };

    fetchConversations();
  }, [token, chatId]);

  useEffect(() => {
    if (!chatId) return;
    socket.emit("join chat", chatId);

    const fetchMessages = async () => {
      try {
        const res = await fetch(`${API_URL}/api/message/get-messages?chatId=${chatId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();

    const handleMessage = (data) => {
      setMessages((prev) => {
        if (!prev.some((msg) => msg._id === data.message._id)) {
          return [...prev, data.message];
        }
        return prev;
      });
    };

    socket.on("receive-normal-message", handleMessage);
    return () => socket.off("receive-normal-message", handleMessage);
  }, [chatId, token]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const tempMessage = {
      _id: Date.now(),
      content: input,
      sender: { _id: userId },
      createdAt: new Date(),
      isTemp: true,
    };

    try {
      setMessages((prev) => [...prev, tempMessage]);
      setInput("");

      const res = await fetch(`${API_URL}/api/message/send-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ chatId, content: input }),
      });

      const data = await res.json();
      setMessages((prev) =>
        prev.map((msg) => (msg.isTemp ? { ...data, sender: { _id: userId } } : msg))
      );
      socket.emit("send message", { ...data, chatId });
    } catch (err) {
      setMessages((prev) => prev.filter((msg) => msg._id !== tempMessage._id));
      console.error("Error sending message:", err);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: messages.length > 5 ? "smooth" : "auto" });
  }, [messages.length]);

  const openChat = (id, user) => navigate(`/chat/${id}`, { state: user });

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? ""
      : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="hidden md:block w-full md:w-1/4 border-r bg-white p-4 overflow-y-auto">
        {/* Sidebar content */}
      </div>

      <div className="flex-1 flex flex-col justify-between">
        {chatId && (
          <div className="flex items-center px-4 py-3 bg-white border-b shadow-sm">
            <img
              src={
                conversations.find((c) => c.chatId === chatId)?.profileImg ||
                "/avatar-placeholder.png"
              }
              className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover mr-3"
              alt="User"
            />
            <span className="text-base md:text-lg font-semibold text-gray-900">
              {conversations.find((c) => c.chatId === chatId)?.fullName || "Chat"}
            </span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-2 md:px-8 py-4 space-y-3 bg-transparent">
          {chatId ? (
            messages.length > 0 ? (
              messages.map((msg, idx) => {
                const senderId = msg.sender && msg.sender._id ? msg.sender._id : msg.sender;
                const isMe = senderId === userId;
                return (
                  <div
                    key={msg._id || idx}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                      <img
                        src={msg.sender?.profileImg || "/avatar-placeholder.png"}
                        alt="User Avatar"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div
                        className={`relative px-4 py-2 rounded-2xl shadow break-words max-w-[80%] sm:max-w-[70%] md:max-w-sm min-w-[100px] ${
                          isMe
                            ? "bg-blue-600 text-white rounded-br-none"
                            : "bg-gray-200 text-gray-900 rounded-bl-none"
                        }`}
                      >
                        <div>{msg.content}</div>
                        <span className="absolute text-xs text-gray-400 right-2 bottom-1">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-sm text-gray-500 text-center mt-10">No messages yet.</div>
            )
          ) : (
            <div className="flex items-center justify-center h-full text-gray-600 text-lg font-medium">
              Select a chat to start messaging
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {chatId && (
          <div className="px-2 md:px-6 py-3 bg-white border-t shadow-md sticky bottom-0 z-10">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1 px-4 py-2 border rounded-full text-sm md:text-base bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type your message..."
              />
              <button
                onClick={sendMessage}
                className="px-4 md:px-6 py-2 text-sm md:text-base bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 transition"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;