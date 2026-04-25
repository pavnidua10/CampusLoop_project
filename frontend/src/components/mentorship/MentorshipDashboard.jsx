import React, { useEffect, useState, useCallback } from "react";
import { API_URL } from "../../config";

export default function MentorshipDashboard() {
  const [mentor, setMentor] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("tasks");

  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);

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

  // 1. Fetch mentor info + chatId
  useEffect(() => {
    const fetchMentorInfo = async () => {
      try {
        // Uses the new /api/mentee/my-mentor endpoint
        const data = await apiFetch(`${API_URL}/api/mentor/mentee/my-mentor`);
        setMentor(data.mentor || null);
        setChatId(data.chatId || null);
      } catch (err) {
        console.error("Failed to fetch mentor info", err);
        showToast("Could not load mentor info", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchMentorInfo();
  }, []);

  // 2. Load tasks when chatId is known
  useEffect(() => {
    if (!chatId) return;
    const fetchTasks = async () => {
      setLoadingTasks(true);
      try {
        // GET /api/mentorResources/:chatId
        const data = await apiFetch(`${API_URL}/api/mentorResources/${chatId}`);
        setTasks(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch tasks", err);
        showToast("Could not load tasks", "error");
      } finally {
        setLoadingTasks(false);
      }
    };
    fetchTasks();
  }, [chatId]);

  // 3. Load resources when resources tab is opened
  useEffect(() => {
    if (!chatId || activeTab !== "resources") return;
    const fetchResources = async () => {
      setLoadingResources(true);
      try {
        // GET /api/mentorResources/chat/:chatId/resources (new route)
        const data = await apiFetch(`${API_URL}/api/mentorResources/chat/${chatId}/resources`);
        setResources(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch resources", err);
        showToast("Could not load resources", "error");
      } finally {
        setLoadingResources(false);
      }
    };
    fetchResources();
  }, [chatId, activeTab]);

  // Toggle task (mentee CAN toggle their own tasks)
  const handleToggleTask = async (id) => {
    try {
      // PATCH /api/mentorResources/:id
      const updated = await apiFetch(`${API_URL}/api/mentorResources/${id}`, {
        method: "PATCH",
      });
      setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
    } catch (err) {
      showToast("Failed to update task", "error");
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  const initials = (name = "") =>
    name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── SIDEBAR: Mentor info ── */}
      <aside className="w-64 flex flex-col bg-white border-r border-gray-200 flex-shrink-0">
        <div className="px-4 pt-5 pb-3 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Your Mentor
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!mentor ? (
            <div className="px-4 py-6 flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-300">
                  <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M4 20c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="text-sm text-gray-400">No mentor assigned yet</p>
            </div>
          ) : (
            <div className="px-4 py-4">
              {/* Mentor card */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                {mentor.profileImg ? (
                  <img src={mentor.profileImg} alt="" className="w-11 h-11 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-semibold text-white flex-shrink-0">
                    {initials(mentor.fullName)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{mentor.fullName}</p>
                  <p className="text-xs text-gray-500 truncate">@{mentor.username}</p>
                </div>
              </div>

              {mentor.bio && (
                <p className="text-xs text-gray-500 mt-3 leading-relaxed px-1">{mentor.bio}</p>
              )}

              {/* Progress summary */}
              {chatId && tasks.length > 0 && (
                <div className="mt-5">
                  <div className="flex justify-between items-center mb-1.5">
                    <p className="text-xs font-medium text-gray-500">Task Progress</p>
                    <p className="text-xs font-semibold text-blue-600">{progressPercent}%</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">
                    {completedCount} of {tasks.length} completed
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* ── MAIN PANEL ── */}
      <main className="flex-1 flex flex-col overflow-hidden relative">

        {/* Toast */}
        {toast && (
          <div className={`absolute top-4 right-4 z-50 px-4 py-2 rounded-lg text-sm shadow-sm font-medium ${
            toast.type === "error" ? "bg-red-50 text-red-700"
            : toast.type === "success" ? "bg-green-50 text-green-700"
            : toast.type === "warn" ? "bg-amber-50 text-amber-700"
            : "bg-blue-50 text-blue-700"
          }`}>
            {toast.msg}
          </div>
        )}

        {!mentor || !chatId ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="opacity-25">
              <circle cx="24" cy="16" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 40c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <p className="text-sm">
              {!mentor ? "You haven't been assigned a mentor yet." : "Chat not set up yet."}
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
              {mentor.profileImg ? (
                <img src={mentor.profileImg} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-semibold text-white">
                  {initials(mentor.fullName)}
                </div>
              )}
              <div>
                <h2 className="text-base font-semibold text-gray-900">{mentor.fullName}</h2>
                <p className="text-xs text-gray-400">@{mentor.username} · Your Mentor</p>
              </div>

              {/* Pending tasks badge */}
              {tasks.filter((t) => !t.completed).length > 0 && (
                <span className="ml-auto text-xs bg-orange-100 text-orange-700 font-medium px-2.5 py-1 rounded-full">
                  {tasks.filter((t) => !t.completed).length} pending
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

              {/* TASKS TAB */}
              {activeTab === "tasks" && (
                <div className="max-w-2xl">
                  <p className="text-xs text-gray-400 mb-4">
                    Click a task to mark it as complete. Your mentor can see your progress.
                  </p>

                  {loadingTasks ? (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin" />
                      Loading tasks…
                    </div>
                  ) : tasks.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-12 text-gray-300">
                      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                        <rect x="8" y="6" width="24" height="28" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M14 16h12M14 22h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <p className="text-sm">No tasks assigned yet.</p>
                    </div>
                  ) : (
                    <>
                      {/* Progress bar */}
                      <div className="mb-5 p-4 bg-white rounded-xl border border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                          <span className="text-sm font-semibold text-blue-600">{progressPercent}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1.5">
                          {completedCount} of {tasks.length} tasks completed
                        </p>
                      </div>

                      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                        {tasks.map((task) => (
                          <div key={task._id} className="flex items-center gap-3 px-4 py-3">
                            {/* Toggle button */}
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
                                  <polyline points="1.5,5 3.5,7.5 8.5,2" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
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
                              <span className={`text-xs flex-shrink-0 px-2 py-0.5 rounded-full ${
                                !task.completed && new Date(task.dueDate) < new Date()
                                  ? "bg-red-50 text-red-500"
                                  : "text-gray-400"
                              }`}>
                                {new Date(task.dueDate).toLocaleDateString("en-IN", {
                                  day: "numeric", month: "short",
                                })}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* RESOURCES TAB */}
              {activeTab === "resources" && (
                <div className="max-w-2xl">
                  <p className="text-xs text-gray-400 mb-4">
                    Resources shared by your mentor.
                  </p>

                  {loadingResources ? (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin" />
                      Loading resources…
                    </div>
                  ) : resources.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-12 text-gray-300">
                      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                        <rect x="8" y="4" width="20" height="26" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M14 12h8M14 18h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        <path d="M26 22l6 6M26 28l6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <p className="text-sm">No resources shared yet.</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                      {resources.map((r) => (
                        <div key={r._id} className="flex items-center gap-3 px-4 py-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-blue-500">
                              <rect x="2" y="1" width="10" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                              <line x1="4.5" y1="5" x2="9.5" y2="5" stroke="currentColor" strokeWidth="1"/>
                              <line x1="4.5" y1="7.5" x2="9.5" y2="7.5" stroke="currentColor" strokeWidth="1"/>
                              <line x1="4.5" y1="10" x2="7.5" y2="10" stroke="currentColor" strokeWidth="1"/>
                            </svg>
                          </div>
                          <a
                            href={r.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex-1 truncate font-medium"
                          >
                            {r.fileName}
                          </a>
                          {r.createdAt && (
                            <span className="text-xs text-gray-400 flex-shrink-0">
                              {new Date(r.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric", month: "short",
                              })}
                            </span>
                          )}
                          <a
                            href={r.fileUrl}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-blue-500 transition-colors flex-shrink-0"
                            title="Download"
                          >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M7 2v7M4 7l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M2 11h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                            </svg>
                          </a>
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