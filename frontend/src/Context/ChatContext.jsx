import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const ChatContext = createContext();
export const useChatContext = () => useContext(ChatContext);

export const ChatContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const user = useAuth(); // Access authenticated user

  useEffect(() => {
    if (user) {
      // Initialize socket connection when user is available
      const socketInstance = io("http://localhost:5000", { withCredentials: true });
      setSocket(socketInstance);

      socketInstance.emit("join", user._id); // Join chat room with user ID

      socketInstance.on("newMessage", (newMessage) => {
        // Update messages on receiving a new message
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      });

      // Cleanup the socket connection when the component unmounts or user changes
      return () => {
        socketInstance.close();
      };
    }
  }, [user]); // Re-run the effect when `user` changes

  return (
    <ChatContext.Provider value={{ socket, messages, setMessages }}>
      {children}
    </ChatContext.Provider>
  );
};

