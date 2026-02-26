import React, { useEffect, useState } from "react";
import { API_URL } from "../../config";

const MentorDashboard = ({ mentorId }) => {
  const [mentees, setMentees] = useState([]);
  const [resources, setResources] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);

  // TASK STATES
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  // ================= FETCH MENTEES =================
  useEffect(() => {
    const fetchMentees = async () => {
      try {
        if (!mentorId) return;

        const res = await fetch(
          `${API_URL}/api/mentor/${mentorId}/mentees`,
          { credentials: "include" }
        );

        const data = await res.json();
        setMentees(data.mentees);
      } catch (err) {
        console.error("Failed to fetch mentees", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchResources = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/mentorResources/my-resources`,
          { credentials: "include" }
        );

        const data = await res.json();
        setResources(data);
      } catch (err) {
        console.error("Failed to fetch resources", err);
      }
    };

    fetchMentees();
    fetchResources();
  }, [mentorId]);

  // ================= FETCH TASKS =================
  const fetchTasks = async (chatId) => {
    try {
      const res = await fetch(
        `${API_URL}/api/mentorResources/${chatId}`,
        { credentials: "include" }
      );
      const data = await res.json();
      setTasks(data);
      setSelectedChatId(chatId);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    }
  };

  // ================= CREATE TASK =================
  const handleCreateTask = async () => {
    if (!newTask.trim() || !selectedChatId) return;

    try {
      const res = await fetch(`${API_URL}/api/mentorResources`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: selectedChatId,
          text: newTask,
        }),
      });

      const data = await res.json();
      setTasks((prev) => [...prev, data]);
      setNewTask("");
    } catch (err) {
      console.error("Create task error", err);
    }
  };

  // ================= TOGGLE TASK =================
  const handleToggleTask = async (id) => {
    try {
      const res = await fetch(
        `${API_URL}/api/tasks/${id}`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const updated = await res.json();

      setTasks((prev) =>
        prev.map((t) => (t._id === id ? updated : t))
      );
    } catch (err) {
      console.error("Toggle error", err);
    }
  };

  // ================= DELETE TASK =================
  const handleDeleteTask = async (id) => {
    try {
      await fetch(`${API_URL}/api/tasks/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  // ================= UPLOAD RESOURCE =================
  const handleFileUpload = async () => {
    if (!file) return alert("Please select a file first.");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        `${API_URL}/api/mentorResources/upload-resource`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await res.json();
      setResources((prev) => [...prev, data]);
      setFile(null);
      alert("File uploaded successfully!");
    } catch (err) {
      console.error("Upload error", err);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6 space-y-10 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold">Your Mentees</h2>

      {mentees.length === 0 ? (
        <p>No mentees assigned yet.</p>
      ) : (
        <ul className="grid gap-4">
          {mentees.map((mentee) => (
            <li
              key={mentee._id}
              className="bg-white shadow p-4 rounded-xl cursor-pointer hover:bg-gray-50"
              onClick={() => fetchTasks(mentee.chatId)}
            >
              <div className="flex items-center gap-4">
                <img
                  src={mentee.profileImg || "/avatar-placeholder.png"}
                  alt="mentee"
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold">{mentee.fullName}</h3>
                  <p className="text-sm text-gray-500">@{mentee.username}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* ================= TASK SECTION ================= */}
      {selectedChatId && (
        <div className="bg-white shadow p-6 rounded-xl">
          <h3 className="text-xl font-semibold mb-4">Tasks</h3>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Enter new task..."
              className="input input-bordered w-full"
            />
            <button
              className="btn btn-primary"
              onClick={handleCreateTask}
            >
              Add
            </button>
          </div>

          {tasks.length === 0 ? (
            <p>No tasks yet.</p>
          ) : (
            <ul className="space-y-2">
              {tasks.map((task) => (
                <li
                  key={task._id}
                  className="flex justify-between items-center bg-gray-100 p-3 rounded"
                >
                  <span
                    onClick={() => handleToggleTask(task._id)}
                    className={`cursor-pointer ${
                      task.completed ? "line-through text-gray-400" : ""
                    }`}
                  >
                    {task.text}
                  </span>
                  <button
                    className="text-red-500 text-sm"
                    onClick={() => handleDeleteTask(task._id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ================= RESOURCE SECTION ================= */}
      <div className="bg-white shadow p-6 rounded-xl">
        <h3 className="text-xl font-semibold mb-4">Share a Resource</h3>

        <div className="flex gap-3 mb-4">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="file-input file-input-bordered w-full"
          />
          <button
            className="btn btn-accent"
            onClick={handleFileUpload}
          >
            Upload
          </button>
        </div>

        {resources.length === 0 ? (
          <p>No resources uploaded yet.</p>
        ) : (
          <ul className="space-y-2">
            {resources.map((r) => (
              <li key={r._id}>
                <a
                  href={r.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {r.fileName}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MentorDashboard;
