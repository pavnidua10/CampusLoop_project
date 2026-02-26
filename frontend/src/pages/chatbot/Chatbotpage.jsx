import { useState, useRef, useEffect } from "react";
import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { IoCloseSharp } from "react-icons/io5";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuth } from "../../Context/AuthContext";
import { API_URL } from "../../config";
const ChatbotPage = () => {
  const { authUser } = useAuth();

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi 👋 I'm CampusLoop AI. How can I help you today?",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

const { mutate } = useMutation({
  mutationFn: async (message) => {
    const res = await fetch(`${API_URL}/api/chatbot/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",   // ✅ because you're using cookies
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    return data.reply;
  },

  onSuccess: (data) => {
    setMessages((prev) => [...prev, { role: "bot", content: data }]);
    setLoading(false);
  },

  onError: () => {
    toast.error("Something went wrong");
    setLoading(false);
  },
});


  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    mutate(input);
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 text-white">

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900">
        <div>
          <h1 className="text-lg font-semibold">CampusLoop AI</h1>
          <p className="text-xs text-gray-400">
            Logged in as {authUser?.username}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                msg.role === "user"
                  ? "bg-blue-600 rounded-br-none"
                  : "bg-gray-800 rounded-bl-none"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <p className="text-gray-400 text-sm animate-pulse">
            CampusLoop AI is typing...
          </p>
        )}

        <div ref={bottomRef}></div>
      </div>

      {/* Input Section */}
      <div className="p-4 border-t border-gray-800 bg-gray-900">

        <div className="flex items-center gap-3 bg-gray-800 p-3 rounded-xl">

          {/* Image Icon */}
          <CiImageOn size={22} className="cursor-pointer text-gray-400 hover:text-white" />

          {/* Emoji Icon */}
          <BsEmojiSmileFill size={18} className="cursor-pointer text-gray-400 hover:text-white" />

          {/* Input */}
          <input
            type="text"
            placeholder="Ask something..."
            className="flex-1 bg-transparent outline-none text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />

          {/* Send Button */}
          <button
            onClick={handleSend}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded-lg text-sm"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;
