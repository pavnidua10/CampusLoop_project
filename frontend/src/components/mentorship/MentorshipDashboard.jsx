import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { API_URL } from "../../config";

const MentorshipDashboard = () => {
  const { chatId } = useParams();
  const { token } = useAuth();

  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [resources, setResources] = useState([]);
  const [tasks, setTasks] = useState([]);
const [mentorName, setMentorName] = useState("");

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
          credentials: "include",
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Error fetching messages");
        setMessages(data);
      } catch (error) {
        console.error(error.message);
      }
    };

    // ✅ NEW — Fetch Tasks
    const fetchTasks = async () => {
      try {
        const res = await fetch(`${API_URL}/api/mentorResources/${chatId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        const data = await res.json();
        if (res.ok) setTasks(data);
      } catch (err) {
        console.error("Task fetch error:", err);
      }
    };

    // ✅ NEW — Fetch Resources
    const fetchResources = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/mentorResources/resources?chatId=${chatId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          }
        );

        const data = await res.json();
        if (res.ok) setResources(data);
      } catch (err) {
        console.error("Resource fetch error:", err);
      }
    };

    if (chatId) {
      fetchMessages();
      fetchTasks();
      fetchResources();
      fetchMentorInfo(); 
    }
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

  // ✅ NEW — Toggle task completion (mentee allowed)
  const toggleTask = async (taskId) => {
    try {
      const res = await fetch(`${API_URL}/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      const updated = await res.json();
      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) => (t._id === taskId ? updated : t))
        );
      }
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };
  // ✅ NEW — Fetch Mentor Info
const fetchMentorInfo = async () => {
  try {
    const res = await fetch(`${API_URL}/api/mentorship/chat/${chatId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    const data = await res.json();
    if (res.ok) {
      setMentorName(data.mentor?.username); 
      // adjust if your backend sends different field
    }
  } catch (err) {
    console.error("Mentor fetch error:", err);
  }
};


  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent =
    tasks.length === 0 ? 0 : (completedCount / tasks.length) * 100;

  return (
    <div className="flex flex-col p-6 space-y-6 bg-gray-900 min-h-screen text-white">
      {/* Overview */}
      <div className="bg-gray-800 p-4 rounded-xl">
        <h2 className="text-xl font-bold mb-2">Mentorship Overview</h2>
       <p>
  You are connected with mentor{" "}
  <span className="font-semibold text-accent">
    {mentorName || "Loading..."}
  </span>
</p>

      </div>

      {/* ✅ UPDATED Progress Tracker (now real tasks) */}
      <div className="bg-gray-800 p-4 rounded-xl">
        <h2 className="text-xl font-bold mb-4">Progress Tracker</h2>

        {tasks.length === 0 ? (
          <p className="text-gray-400">No tasks assigned yet.</p>
        ) : (
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li
                key={task._id}
                className={`cursor-pointer ${
                  task.completed ? "line-through text-gray-400" : ""
                }`}
                onClick={() => toggleTask(task._id)}
              >
                {task.completed ? "✅" : "⬜️"} {task.text}
              </li>
            ))}
          </ul>
        )}

        <progress
          className="progress progress-accent mt-4 w-full"
          value={progressPercent}
          max="100"
        ></progress>

        <p className="text-sm mt-2 text-gray-400">
          {completedCount} of {tasks.length} completed
        </p>
      </div>

      {/* ✅ CONNECTED Resources */}
      <div className="bg-gray-800 p-4 rounded-xl">
        <h2 className="text-xl font-bold mb-2">Mentor Resources</h2>

        {resources.length === 0 ? (
          <p>No resources available.</p>
        ) : (
          <ul className="list-disc pl-5 space-y-1">
            {resources.map((resource) => (
              <li key={resource._id}>
                <a
                  href={resource.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link link-accent"
                >
                  {resource.fileName}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MentorshipDashboard;
