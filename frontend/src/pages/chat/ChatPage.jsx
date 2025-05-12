import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../Context/AuthContext";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import io from "socket.io-client";
import { API_URL } from "../../config";
const socket = io(import.meta.env.VITE_BACKEND_URL || "https://campusloop-project.onrender.com"|| "http://localhost:10000");

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

  // Fetch conversations and suggested users
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

        // If no conversations, fetch suggested users
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

  // Fetch messages and handle socket
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
        if (!prev.some(msg => msg._id === data.message._id)) {
          return [...prev, data.message];
        }
        return prev;
      });
    };

    socket.on("receive-normal-message", handleMessage);
    return () => socket.off("receive-normal-message", handleMessage);
  }, [chatId, token]);

  // Send message
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

  const openChat = (id, user) => navigate(`/chat/${id}`, { state: user });

  // Helper for message time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Sidebar with conversations and suggested users
  const Sidebar = () => (
    <div className="w-1/4 border-r bg-white p-4 overflow-y-auto flex flex-col h-full">
      <h2 className="text-black text-lg font-bold mb-6 tracking-wide">Chats</h2>
      {conversations.length === 0 ? (
        <div>
          <p className="text-gray-600 mb-4">No chats yet.</p>
          {suggestedUsers.length > 0 && (
            <div>
              <h3 className="text-gray-800 font-semibold mb-2">People you may want to chat with</h3>
              <div className="space-y-3">
                {suggestedUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center bg-gray-50 p-3 rounded-lg shadow-sm hover:bg-blue-50 transition"
                  >
                    <img
                      src={user.profileImg || "/avatar-placeholder.png"}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full object-cover mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{user.fullName}</div>
                      <div className="text-xs text-gray-500">{user.username || user.email}</div>
                    </div>
                    <button
                      className="ml-3 px-3 py-1 bg-blue-600 text-white rounded-full text-xs hover:bg-blue-700 transition"
                      onClick={() => openChat(user.chatId || "new", user)}
                    >
                      Start Chat
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((user) => (
            <div
              key={user.chatId}
              onClick={() => openChat(user.chatId, user)}
              className={`flex items-center p-2 rounded-lg cursor-pointer hover:bg-blue-50 transition ${
                chatId === user.chatId ? "bg-blue-100 font-semibold shadow" : ""
              }`}
            >
              <img
                src={user.profileImg || "/avatar-placeholder.png"}
                alt="Avatar"
                className="w-9 h-9 rounded-full object-cover mr-3"
              />
              <span className="truncate">{user.fullName || "Unknown User"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Main render
  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <Sidebar />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col justify-between p-0 md:p-4">
        {/* Chat Header */}
        {chatId && (
          <div className="flex items-center px-4 py-3 bg-white border-b shadow-sm rounded-t-lg">
            <img
              src={
                conversations.find((c) => c.chatId === chatId)?.profileImg ||
                "/avatar-placeholder.png"
              }
              alt="User"
              className="w-10 h-10 rounded-full object-cover mr-3"
            />
            <span className="font-semibold text-gray-900 text-lg">
              {conversations.find((c) => c.chatId === chatId)?.fullName || "Chat"}
            </span>
          </div>
        )}

        {/* Messages */}
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
                        className={`relative px-4 py-2 rounded-2xl shadow max-w-xs md:max-w-sm break-words min-w-[100px] ${
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

        {/* Input */}
        {chatId && (
          <div className="px-2 md:px-8 py-4 bg-white border-t rounded-b-lg shadow-md sticky bottom-0 z-10">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1 px-4 py-2 border border-gray-300 text-black rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                placeholder="Type your message..."
              />
              <button
                onClick={sendMessage}
                className="px-6 py-2 bg-blue-600 text-white rounded-full font-semibold shadow hover:bg-blue-700 transition"
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
