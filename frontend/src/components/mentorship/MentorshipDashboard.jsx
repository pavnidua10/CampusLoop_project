import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { API_URL } from "../../config";
const MentorshipDashboard = () => {
  const { chatId } = useParams();
  const { token, _id } = useAuth();
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [resources, setResources] = useState([]); // Added state for resources
  const scrollRef = useRef();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`${API_URL}/api/mentorship/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ chatId }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Error fetching messages");

        setMessages(data);
      } catch (error) {
        console.error(error.message);
      }
    };

    const fetchResources = async () => { // Added resource fetch function
      try {
        const res = await fetch(`${API_URL}/api/mentorResources/resources`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Error fetching resources");

        setResources(data); // Set the fetched resources to state
      } catch (error) {
        console.error(error.message);
      }
    };

    if (chatId) {
      fetchMessages();
    }
    fetchResources(); // Fetch resources on mount
  }, [chatId, token]);

  const sendMessage = async () => {
    if (!messageInput.trim()) return;

    try {
      const res = await fetch(`${API_URL}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ chatId, content: messageInput }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error sending message");

      setMessages((prev) => [...prev, data]);
      setMessageInput("");
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-900 min-h-screen text-white">
      {/* Overview */}
      <div className="bg-gray-800 p-4 rounded-xl">
        <h2 className="text-xl font-bold mb-2">Mentorship Overview</h2>
        <p>You are connected with mentor</p>
      </div>

      {/* Progress Tracker */}
      <div className="bg-gray-800 p-4 rounded-xl">
        <h2 className="text-xl font-bold mb-2">Progress Tracker</h2>
        <ul className="list-disc pl-5">
          <li>✅ First meeting done</li>
          <li>✅ Goals discussed</li>
          <li>⬜️ Mid-semester check-in</li>
        </ul>
        <progress className="progress progress-accent mt-2 w-full" value="60" max="100"></progress>
      </div>

      {/* Resources */}
      <div className="bg-gray-800 p-4 rounded-xl">
        <h2 className="text-xl font-bold mb-2">Mentor Resources</h2>
        {resources.length === 0 ? (
          <p>No resources available.</p>
        ) : (
          <ul className="list-disc pl-5">
            {resources.map((resource, index) => (
              <li key={index}>
                <a href={resource.link} className="link link-accent">{resource.name}</a>
              </li>
            ))}
          </ul>
        )}
      </div>


      
    </div>
  );
};

export default MentorshipDashboard;
