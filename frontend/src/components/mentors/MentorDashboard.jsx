import React, { useEffect, useState, useCallback } from "react";
import { API_URL } from "../../config";

const AVATAR_COLORS = [
  { bg: "bg-blue-100", text: "text-blue-800" },
  { bg: "bg-green-100", text: "text-green-800" },
  { bg: "bg-purple-100", text: "text-purple-800" },
  { bg: "bg-amber-100", text: "text-amber-800" },
  { bg: "bg-pink-100", text: "text-pink-800" },
];

function initials(name = "") {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function avatarColor(index) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

export default function MentorDashboard({ mentorId }) {
  const [mentees, setMentees] = useState([]);
  const [loadingMentees, setLoadingMentees] = useState(true);

  const [selectedMentee, setSelectedMentee] = useState(null);
  const [activeTab, setActiveTab] = useState("tasks");

  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [myResources, setMyResources] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [toast, setToast] = useState(null);

  const apiFetch = useCallback(async (url, opts = {}) => {
    const res = await fetch(url, { credentials: "include", ...opts });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || res.statusText);
    return data;
  }, []);

  const showToast = useCallback((msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    if (!mentorId) return;

    const fetchMentees = async () => {
      try {
        const data = await apiFetch(`${API_URL}/api/mentor/${mentorId}/getmentees`);
        const list = data.mentees || [];
        setMentees(list);
        if (list.length > 0) handleSelectMentee(list[0]);
      } catch (err) {
        console.error("Failed to fetch mentees", err);
      } finally {
        setLoadingMentees(false);
      }
    };

    const fetchMyResources = async () => {
      try {
        const data = await apiFetch(`${API_URL}/api/mentorResources/my-resources`);
        setMyResources(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch resources", err);
      }
    };

    fetchMentees();
    fetchMyResources();
  }, [mentorId]);

  const handleSelectMentee = async (mentee) => {
    setSelectedMentee(mentee);
    setActiveTab("tasks");
    setTasks([]);
    setLoadingTasks(true);
    try {
      const data = await apiFetch(`${API_URL}/api/mentorResources/${mentee.chatId}`);
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.trim() || !selectedMentee) return;
    try {
      const task = await apiFetch(`${API_URL}/api/mentorResources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: selectedMentee.chatId,
          text: newTask.trim(),
          dueDate: dueDate || undefined,
        }),
      });
      setTasks((prev) => [...prev, task]);
      setNewTask("");
      setDueDate("");
    } catch (err) {
      showToast("Failed to create task", "error");
    }
  };

  const handleToggleTask = async (id) => {
    try {
      const updated = await apiFetch(`${API_URL}/api/mentorResources/${id}`, {
        method: "PATCH",
      });
      setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
    } catch (err) {
      showToast("Failed to update task", "error");
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await apiFetch(`${API_URL}/api/mentorResources/${id}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      showToast("Failed to delete task", "error");
    }
  };

  const handleFileUpload = async () => {
    if (!file) return showToast("Select a file first", "warn");
    if (!selectedMentee) return showToast("Select a mentee first", "warn");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("chatId", selectedMentee.chatId);

    setUploading(true);
    try {
      const data = await apiFetch(`${API_URL}/api/mentorResources/upload-resource`, {
        method: "POST",
        body: formData,
      });
      setMyResources((prev) => [data, ...prev]);
      setFile(null);
      document.getElementById("fileInput").value = "";
      showToast("Resource uploaded!", "success");
    } catch (err) {
      showToast(err.message || "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const pendingCount = tasks.filter((t) => !t.completed).length;
  const selectedIndex = mentees.findIndex((m) => m._id === selectedMentee?._id);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* ── SIDEBAR ── */}
      <aside className="w-64 flex flex-col bg-white border-r border-gray-200 flex-shrink-0">
        <div className="px-4 pt-5 pb-3 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Your Mentees
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingMentees ? (
            <p className="text-sm text-gray-400 px-4 py-4">Loading…</p>
          ) : mentees.length === 0 ? (
            <p className="text-sm text-gray-400 px-4 py-4">No mentees yet.</p>
          ) : (
            mentees.map((mentee, i) => {
              const color = avatarColor(i);
              const isActive = selectedMentee?._id === mentee._id;
              return (
                <button
                  key={mentee._id}
                  onClick={() => handleSelectMentee(mentee)}
                  className={`w-full flex items-center gap-3 text-left border-b border-gray-100 transition-colors ${
                    isActive
                      ? "bg-blue-50 border-l-4 border-l-blue-500 px-3 py-3"
                      : "px-4 py-3 hover:bg-gray-50"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 overflow-hidden ${color.bg} ${color.text}`}
                  >
                    {mentee.profileImg ? (
                      <img
                        src={mentee.profileImg}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      initials(mentee.fullName)
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {mentee.fullName}
                    </p>
                    <p className="text-xs text-gray-400 truncate">@{mentee.username}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* ── MAIN PANEL ── */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Toast */}
        {toast && (
          <div
            className={`absolute top-4 right-4 z-50 px-4 py-2 rounded-lg text-sm shadow-sm font-medium ${
              toast.type === "error"
                ? "bg-red-50 text-red-700"
                : toast.type === "success"
                ? "bg-green-50 text-green-700"
                : toast.type === "warn"
                ? "bg-amber-50 text-amber-700"
                : "bg-blue-50 text-blue-700"
            }`}
          >
            {toast.msg}
          </div>
        )}

        {!selectedMentee ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="opacity-25">
              <circle cx="24" cy="16" r="8" stroke="currentColor" strokeWidth="2" />
              <path d="M8 40c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p className="text-sm">Select a mentee to get started</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold overflow-hidden ${avatarColor(selectedIndex).bg} ${avatarColor(selectedIndex).text}`}
              >
                {selectedMentee.profileImg ? (
                  <img src={selectedMentee.profileImg} alt="" className="w-full h-full object-cover" />
                ) : (
                  initials(selectedMentee.fullName)
                )}
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  {selectedMentee.fullName}
                </h2>
                <p className="text-xs text-gray-400">@{selectedMentee.username}</p>
              </div>
              {pendingCount > 0 && (
                <span className="ml-auto text-xs bg-blue-100 text-blue-700 font-medium px-2.5 py-1 rounded-full">
                  {pendingCount} pending
                </span>
              )}
            </div>

            {/* Tabs */}
            <div className="bg-white border-b border-gray-200 flex">
              {["tasks", "resources"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                    activeTab === tab
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                  {tab === "tasks" && tasks.length > 0 && (
                    <span className="ml-1.5 text-xs bg-gray-100 text-gray-500 rounded-full px-1.5 py-0.5">
                      {tasks.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* TASKS */}
              {activeTab === "tasks" && (
                <div className="max-w-2xl">
                  <div className="flex gap-2 mb-6">
                    <input
                      type="text"
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleCreateTask()}
                      placeholder="Add a task for this mentee…"
                      className="flex-1 text-sm border text-black border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="text-sm border text-black border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                    <button
                      onClick={handleCreateTask}
                      className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                      Add
                    </button>
                  </div>

                  {loadingTasks ? (
                    <p className="text-sm text-gray-400">Loading tasks…</p>
                  ) : tasks.length === 0 ? (
                    <p className="text-sm text-gray-400">No tasks yet. Add one above.</p>
                  ) : (
                    <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                      {tasks.map((task) => (
                        <div key={task._id} className="flex items-center gap-3 px-4 py-3">
                          <button
                            onClick={() => handleToggleTask(task._id)}
                            className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                              task.completed
                                ? "bg-green-400 border-green-400"
                                : "border-gray-300 hover:border-green-400"
                            }`}
                          >
                            {task.completed && (
                              <svg width="10" height="10" viewBox="0 0 10 10">
                                <polyline points="1.5,5 3.5,7.5 8.5,2" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                              </svg>
                            )}
                          </button>

                          <span
                            onClick={() => handleToggleTask(task._id)}
                            className={`flex-1 text-sm cursor-pointer select-none ${
                              task.completed ? "line-through text-gray-400" : "text-gray-800"
                            }`}
                          >
                            {task.text}
                          </span>

                          {task.dueDate && (
                            <span className="text-xs text-gray-400 flex-shrink-0">
                              {new Date(task.dueDate).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          )}

                          <button
                            onClick={() => handleDeleteTask(task._id)}
                            className="text-xs text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors flex-shrink-0"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* RESOURCES */}
              {activeTab === "resources" && (
                <div className="max-w-2xl">
                  <div className="flex gap-2 mb-6">
                    <input
                      id="fileInput"
                      type="file"
                      onChange={(e) => setFile(e.target.files[0])}
                      className="flex-1 text-sm border text-black border-gray-200 rounded-lg px-3 py-2 file:mr-3 file:text-xs file:border-0 file:bg-gray-100 file:text-gray-600 file:rounded file:px-2 file:py-1"
                    />
                    <button
                      onClick={handleFileUpload}
                      disabled={uploading}
                      className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50"
                    >
                      {uploading ? "Uploading…" : "Upload"}
                    </button>
                  </div>

                  {myResources.length === 0 ? (
                    <p className="text-sm text-gray-400">No resources uploaded yet.</p>
                  ) : (
                    <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                      {myResources.map((r) => (
                        <div key={r._id} className="flex items-center gap-3 px-4 py-3">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 text-gray-400">
                            <rect x="2" y="1" width="10" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                            <line x1="4.5" y1="5" x2="9.5" y2="5" stroke="currentColor" strokeWidth="1" />
                            <line x1="4.5" y1="7.5" x2="9.5" y2="7.5" stroke="currentColor" strokeWidth="1" />
                            <line x1="4.5" y1="10" x2="7.5" y2="10" stroke="currentColor" strokeWidth="1" />
                          </svg>
                          <a
                            href={r.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex-1 truncate"
                          >
                            {r.fileName}
                          </a>
                          {r.createdAt && (
                            <span className="text-xs text-gray-400 flex-shrink-0">
                              {new Date(r.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}