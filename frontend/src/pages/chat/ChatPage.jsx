import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../Context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { socket } from "../../socket";
import { API_URL } from "../../config";

const ChatPage = () => {
  const { token, userId } = useAuth();
  const { chatId } = useParams();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [showSidebar, setShowSidebar] = useState(!chatId); // show sidebar by default on mobile if no chat selected

  const scrollRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    if (!socket.connected) socket.connect();
    return () => { socket.off("receive-normal-message"); };
  }, []);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch(`${API_URL}/api/message/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        const data = await res.json();
        setConversations(Array.isArray(data) ? data : []);
        if (!data || data.length === 0) {
          const sugRes = await fetch(`${API_URL}/api/user/suggested`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setSuggestedUsers(await sugRes.json());
        }
      } catch (err) { console.error(err); }
    };
    fetchConversations();
  }, [token]);

  useEffect(() => {
    if (!chatId) return;
    setShowSidebar(false); // hide sidebar when chat opens on mobile
    socket.emit("join chat", chatId);

    const fetchMessages = async () => {
      const res = await fetch(`${API_URL}/api/message/get-messages?chatId=${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    };
    fetchMessages();

    socket.on("receive-normal-message", (data) => {
      setMessages((prev) => {
        if (!Array.isArray(prev)) return [data.message];
        if (prev.some((m) => m._id === data.message._id)) return prev;
        return [...prev, data.message];
      });
    });

    return () => { socket.emit("leave chat", chatId); };
  }, [chatId, token]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const tempMsg = {
      _id: Date.now(),
      content: input,
      sender: { _id: userId },
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, tempMsg]);
    setInput("");

    try {
      const res = await fetch(`${API_URL}/api/message/send-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ chatId, content: tempMsg.content }),
        credentials: "include",
      });
      if (!res.ok) return;
      const data = await res.json();
      socket.emit("send message", { ...data, chatId });
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: messages.length > 5 ? "smooth" : "auto" });
  }, [messages.length]);

  const openChat = (id) => {
    navigate(`/chat/${id}`);
    setShowSidebar(false);
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "" : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const activeChat = conversations.find((c) => c.chatId === chatId);

  const initials = (name) => name ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";

  return (
    <div className="flex h-screen bg-[#0f0f13] text-white overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        .msg-in { background: #1e1e28; color: #e8e8f0; }
        .msg-out { background: #3b5bdb; color: #fff; }
        .chat-item:hover { background: rgba(255,255,255,0.05); }
        .chat-item.active { background: rgba(59,91,219,0.15); border-left: 3px solid #3b5bdb; }
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .input-area { background: #1a1a24; border: 1px solid rgba(255,255,255,0.08); }
        .input-area:focus { outline: none; border-color: #3b5bdb; }
        .send-btn { background: #3b5bdb; }
        .send-btn:hover { background: #4c6ef5; }
        .send-btn:active { transform: scale(0.96); }
        @media (max-width: 767px) {
          .sidebar-panel { position: fixed; inset: 0; z-index: 50; background: #0f0f13; transform: translateX(-100%); transition: transform 0.25s ease; }
          .sidebar-panel.open { transform: translateX(0); }
          .chat-area { position: fixed; inset: 0; z-index: 40; background: #0f0f13; display: flex; flex-direction: column; }
        }
      `}</style>

      {/* SIDEBAR */}
      <div className={`sidebar-panel md:relative md:transform-none md:flex md:flex-col md:w-72 md:border-r md:border-white/5 ${showSidebar ? "open" : ""}`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h1 className="text-lg font-semibold tracking-tight">Messages</h1>
          <button className="md:hidden text-white/50 hover:text-white p-1" onClick={() => setShowSidebar(false)}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Search bar */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-white/30 flex-shrink-0">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <input className="bg-transparent text-sm text-white/70 placeholder-white/30 w-full focus:outline-none" placeholder="Search conversations..." />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto custom-scroll">
          {conversations.length === 0 ? (
            <p className="text-white/30 text-sm px-5 py-4">No conversations yet</p>
          ) : (
            conversations.map((chat) => (
              <div
                key={chat.chatId}
                onClick={() => openChat(chat.chatId)}
                className={`chat-item flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-l-3 ${chat.chatId === chatId ? "active" : "border-l-transparent"}`}
                style={{ borderLeftWidth: "3px", borderLeftColor: chat.chatId === chatId ? "#3b5bdb" : "transparent" }}
              >
                {chat.profileImg ? (
                  <img src={chat.profileImg} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    {initials(chat.fullName)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white/90 truncate">{chat.fullName}</p>
                  <p className="text-xs text-white/40 truncate">@{chat.username}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="chat-area flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-[#0f0f13]/80 backdrop-blur-sm flex-shrink-0">
          {/* Back button on mobile */}
          <button
            className="md:hidden text-white/50 hover:text-white mr-1 p-1 -ml-1"
            onClick={() => { setShowSidebar(true); navigate("/chat"); }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12 4L6 10l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Show sidebar toggle on desktop when no chat */}
          {!chatId && (
            <button className="md:hidden text-white/50 hover:text-white p-1" onClick={() => setShowSidebar(true)}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}

          {chatId && activeChat ? (
            <>
              {activeChat.profileImg ? (
                <img src={activeChat.profileImg} alt="" className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-semibold">
                  {initials(activeChat.fullName)}
                </div>
              )}
              <div>
                <p className="font-semibold text-sm text-white/90">{activeChat.fullName}</p>
                <p className="text-xs text-white/40">@{activeChat.username}</p>
              </div>
            </>
          ) : (
            <p className="text-white/40 text-sm">Select a conversation</p>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto custom-scroll px-4 py-4 space-y-2">
          {chatId ? (
            messages.length > 0 ? (
              messages.map((msg, idx) => {
                const senderId = msg.sender && msg.sender._id ? msg.sender._id : msg.sender;
                const isMe = senderId === userId;
                return (
                  <div key={msg._id || idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl flex flex-col gap-0.5 ${isMe ? "msg-out rounded-br-sm" : "msg-in rounded-bl-sm"}`}>
                      <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                      <span className={`text-[10px] self-end ${isMe ? "text-white/60" : "text-white/30"}`}>
                        {formatTime(msg.timestamp || msg.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-white/20">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <path d="M8 8h24v20H22l-6 6v-6H8V8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
                <p className="text-sm">No messages yet — say hello!</p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-white/20">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path d="M10 10h28v24H26l-8 8v-8H10V10z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
              <p className="text-sm">Select a chat to start messaging</p>
              <button className="md:hidden text-sm text-indigo-400 underline" onClick={() => setShowSidebar(true)}>
                Browse conversations
              </button>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input */}
        {chatId && (
          <div className="px-4 py-3 border-t border-white/5 flex-shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                className="flex-1 input-area rounded-2xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none transition-colors"
                placeholder="Type a message…"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="send-btn rounded-2xl px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M16 9L2 2l4 7-4 7 14-7z" fill="currentColor"/>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;