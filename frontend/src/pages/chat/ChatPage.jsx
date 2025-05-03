
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../Context/AuthContext";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import io from "socket.io-client";

const socket = io(import.meta.env.VITE_BACKEND_URL||"http://localhost:5000");

const ChatPage = () => {
  const { token, userId } = useAuth(); // Use userId from context
  const { chatId } = useParams();
  const location = useLocation();
  const chatUserFromState = location.state;
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch("/api/message/conversations", {
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
        const res = await fetch(`/api/message/get-messages?chatId=${chatId}`, {
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
        if (!prev.some(msg => msg._id === data.message._id)) {
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
      isTemp: true
    };

    try {
      setMessages((prev) => [...prev, tempMessage]);
      setInput("");
      
      const res = await fetch("/api/message/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ chatId, content: input }),
      });

      const data = await res.json();
      
      setMessages((prev) => 
        prev.map(msg => msg.isTemp ? { ...data, sender: { _id: userId } } : msg)
      );
      
      socket.emit("send message", { ...data, chatId });

    } catch (err) {
      setMessages((prev) => 
        prev.filter(msg => msg._id !== tempMessage._id)
      );
      console.error("Error sending message:", err);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({
      behavior: messages.length > 5 ? "smooth" : "auto"
    });
  }, [messages.length]);

  const openChat = (id) => navigate(`/chat/${id}`);

  if (!chatId) {
    return (
      <div className="flex h-screen bg-gray-100">
        <div className="w-1/4 border-r bg-white p-4 overflow-y-auto">
          <h2 className="text-black text-lg font-semibold mb-4">Chats</h2>
          {conversations.length === 0 ? (
            <p className="text-sm text-black">No chats yet.</p>
          ) : (
            conversations.map((user) => (
              <div
                key={user.chatId}
                onClick={() => openChat(user.chatId)}
                className={`text-black p-2 rounded cursor-pointer hover:bg-gray-200 mb-2 ${
                  chatId === user.chatId ? "bg-gray-300 font-medium" : ""
                }`}
              >
                {user.fullName || "Unknown User"}
              </div>
            ))
          )}
        </div>

        <div className="flex-1 flex items-center justify-center text-black">
          Select a chat to start messaging
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 border-r bg-white p-4 overflow-y-auto">
        <h2 className="text-black text-lg font-semibold mb-4">Chats</h2>
        {conversations.length === 0 ? (
          <p className="text-sm text-black">No chats yet.</p>
        ) : (
          conversations.map((user) => (
            <div
              key={user.chatId}
              onClick={() => openChat(user.chatId)}
              className={`text-black p-2 rounded cursor-pointer hover:bg-gray-200 mb-2 ${
                chatId === user.chatId ? "bg-gray-300 font-medium" : ""
              }`}
            >
              {user.fullName || "Unknown User"}
            </div>
          ))
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col justify-between p-4">
        <div className="flex-1 overflow-y-auto space-y-2">
          {messages.length > 0 ? (
            messages.map((msg, idx) => {
              // Robust sender id extraction
              const senderId = msg.sender && msg.sender._id ? msg.sender._id : msg.sender;
              return (
                <div
                  key={msg._id || idx}
                  className={`flex ${senderId === userId ? "justify-end" : "justify-start"}`}
                >
                  <div className="flex items-start gap-2">
                    {/* Profile Picture */}
                    <img
                      src={msg.sender?.profileImg || "/avatar-placeholder.png"}
                      alt="User Avatar"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div
                      className={`px-4 py-2 rounded-xl max-w-xs md:max-w-sm break-words min-w-[120px] ${
                        senderId === userId
                          ? "bg-blue-600 text-white"
                          : "bg-gray-300 text-black"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-sm text-black">No messages yet.</div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input */}
        <div className="mt-4 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 px-4 py-2 border border-gray-300 text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message..."
          />
          <button
            onClick={sendMessage}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
