import { useState } from "react";
import { useAuth } from "../../Context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import MenteeChat from "./MenteeChat";
import { API_URL } from "../../config";

const MentorChatInterface = ({ mentorId }) => {
  const { user } = useAuth();
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [showList, setShowList] = useState(true); // mobile: show list or chat

  const { data: mentees, isLoading, error } = useQuery({
    queryKey: ["mentees", mentorId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/mentor/${mentorId}/mentees`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load mentees");
      return data.mentees;
    },
    enabled: !!mentorId,
  });

  const handleSelectMentee = async (mentee) => {
    setSelectedMentee(mentee);
    setShowList(false); // switch to chat view on mobile
    try {
      if (!user?._id) return;
      const res = await fetch(`${API_URL}/api/mentorship-chats/access`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ mentorId: user._id, menteeId: mentee._id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to initiate chat");
      setSelectedChatId(data.chat._id);
    } catch (err) {
      console.error("Failed to access chat:", err.message);
    }
  };

  const initials = (name) => name ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";

  const COLORS = ["from-violet-500 to-purple-700", "from-blue-500 to-indigo-600", "from-emerald-500 to-teal-600", "from-rose-500 to-pink-600", "from-amber-500 to-orange-600"];

  if (isLoading) return (
    <div className="flex items-center justify-center h-64 text-white/40" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Loading mentees…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-64 text-red-400 text-sm">
      Failed to load mentees
    </div>
  );

  return (
    <div className="h-[calc(100vh-80px)] md:h-[680px] flex rounded-2xl overflow-hidden bg-[#0f0f13] border border-white/5 shadow-2xl" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        .mentee-item { transition: background 0.15s; }
        .mentee-item:hover { background: rgba(255,255,255,0.05); }
        .mentee-item.selected { background: rgba(99,102,241,0.15); border-left: 3px solid #6366f1; }
        .custom-scroll::-webkit-scrollbar { width: 3px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
      `}</style>

      {/* Mentee list */}
      <div className={`
        w-full md:w-72 flex flex-col border-r border-white/5 bg-[#13131a] flex-shrink-0
        ${!showList ? "hidden md:flex" : "flex"}
      `}>
        <div className="px-5 py-4 border-b border-white/5">
          <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-1">Mentor Chat</p>
          <h2 className="text-lg font-semibold text-white">Your Mentees</h2>
        </div>

        <div className="flex-1 overflow-y-auto custom-scroll py-2">
          {!mentees?.length ? (
            <p className="text-white/30 text-sm px-5 py-4">No mentees yet</p>
          ) : (
            mentees.map((mentee, i) => (
              <div
                key={mentee._id}
                onClick={() => handleSelectMentee(mentee)}
                className={`mentee-item flex items-center gap-3 px-4 py-3 cursor-pointer ${selectedMentee?._id === mentee._id ? "selected" : ""}`}
                style={{ borderLeftWidth: "3px", borderLeftColor: selectedMentee?._id === mentee._id ? "#6366f1" : "transparent" }}
              >
                {mentee.profileImg ? (
                  <img src={mentee.profileImg} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${COLORS[i % COLORS.length]} flex items-center justify-center text-xs font-semibold text-white flex-shrink-0`}>
                    {initials(mentee.fullName)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white/90 truncate">{mentee.fullName}</p>
                  <p className="text-xs text-white/40 truncate">@{mentee.username}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className={`flex-1 flex flex-col min-w-0 ${showList && !selectedMentee ? "hidden md:flex" : "flex"}`}>
        {/* Mobile back button */}
        {selectedMentee && (
          <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-[#0f0f13]">
            <button onClick={() => setShowList(true)} className="text-white/50 hover:text-white p-1 -ml-1">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12 4L6 10l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <p className="text-sm font-medium text-white/80">{selectedMentee.fullName}</p>
          </div>
        )}

        {selectedMentee && selectedChatId ? (
          <MenteeChat mentee={selectedMentee} chatId={selectedChatId} />
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 gap-3 text-white/20">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="16" r="7" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 38c0-7.732 6.268-14 14-14s14 6.268 14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <p className="text-sm">Select a mentee to start chatting</p>
            <button className="md:hidden text-sm text-indigo-400 underline" onClick={() => setShowList(true)}>
              View mentees
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorChatInterface;