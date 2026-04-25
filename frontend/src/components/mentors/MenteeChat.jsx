import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../Context/AuthContext";
import { socket } from "../../socket";
import { API_URL } from "../../config";

const MenteeChat = ({ mentee, chatId }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    if (!chatId || !user?._id) return;
    socket.emit("join chat", chatId);
  }, [chatId, user?._id]);

  useEffect(() => {
    const handleReceiveMessage = (newMsg) => {
      const formattedMsg = {
        ...newMsg,
        sender: typeof newMsg.sender === "string" ? { _id: newMsg.sender } : newMsg.sender,
      };
      if (formattedMsg.sender?._id !== user._id) {
        setMessages((prev) => [...prev, formattedMsg]);
      }
    };
    socket.on("receive-mentorship-message", handleReceiveMessage);
    return () => { socket.off("receive-mentorship-message", handleReceiveMessage); };
  }, [user._id]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`${API_URL}/api/mentorship-chats/messages/${chatId}`, { credentials: "include" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load messages");
        setMessages(data);
      } catch (error) { console.error("Fetch messages error:", error.message); }
    };
    if (chatId) fetchMessages();
  }, [chatId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSendMessage = async () => {
    if (!message.trim() || isSending) return;
    setIsSending(true);
    try {
      const res = await fetch(`${API_URL}/api/mentorship-chats/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, sender: user._id, receiver: mentee.username, chatId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Send message failed");
      socket.emit("send-mentorship-message", { chatId, message: data.message.text, senderId: user._id });
      setMessages((prev) => [...prev, { ...data.message, sender: { _id: user._id } }]);
      setMessage("");
    } catch (error) { console.error("Send message error:", error.message); }
    finally { setIsSending(false); }
  };

  const formatTime = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    return isNaN(d) ? "" : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-full bg-[#0f0f13]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        .custom-scroll::-webkit-scrollbar { width: 3px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
        .msg-send { background: #3b5bdb; color: #fff; }
        .msg-recv { background: #1e1e2e; color: #d4d4e8; }
        .chat-input { background: #1a1a24; border: 1px solid rgba(255,255,255,0.08); color: white; }
        .chat-input:focus { outline: none; border-color: #3b5bdb; }
        .chat-input::placeholder { color: rgba(255,255,255,0.25); }
      `}</style>

      {/* Desktop header (mobile header is handled by parent) */}
      <div className="hidden md:flex items-center gap-3 px-5 py-4 border-b border-white/5 flex-shrink-0">
        {mentee.profileImg ? (
          <img src={mentee.profileImg} alt="" className="w-9 h-9 rounded-full object-cover" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-xs font-semibold text-white">
            {mentee.fullName?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-white/90">{mentee.fullName}</p>
          <p className="text-xs text-white/40">@{mentee.username}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scroll px-4 py-4 space-y-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-white/20">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M8 8h24v20H22l-6 6v-6H8V8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
            <p className="text-sm">No messages yet</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender?._id === user._id;
            return (
              <div key={idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl flex flex-col gap-0.5 ${isMe ? "msg-send rounded-br-sm" : "msg-recv rounded-bl-sm"}`}>
                  <p className="text-sm leading-relaxed break-words">
                    {msg.text || <i className="opacity-50">Empty message</i>}
                  </p>
                  <span className={`text-[10px] self-end ${isMe ? "text-white/60" : "text-white/30"}`}>
                    {formatTime(msg.createdAt || msg.timestamp)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-white/5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
            placeholder="Type a message…"
            className="flex-1 chat-input rounded-2xl px-4 py-2.5 text-sm transition-colors"
          />
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() || isSending}
            className="w-10 h-10 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            {isSending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M14 8L2 2l3.5 6L2 14 14 8z" fill="white"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenteeChat;