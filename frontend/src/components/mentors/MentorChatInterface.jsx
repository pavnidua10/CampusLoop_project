import { useState } from "react";
import { useAuth } from "../../Context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { FaUser } from "react-icons/fa";
import MenteeChat from "./MenteeChat";
import { API_URL } from "../../config";

const MentorChatInterface = ({ mentorId }) => {
  const { user } = useAuth();
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [selectedChatId, setSelectedChatId] = useState(null);

  const { data: mentees, isLoading, error } = useQuery({
    queryKey: ["mentees", mentorId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/mentor/${mentorId}/mentees`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load mentees");
      return data.mentees;
    },
    enabled: !!mentorId,
  });

  const handleSelectMentee = async (mentee) => {
    setSelectedMentee(mentee);
    try {
      if (!user || !user._id) {
        console.log("User not loaded or missing _id");
        return;
      }
      const res = await fetch(`${API_URL}/api/mentorship-chats/access`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,  
        },
        body: JSON.stringify({
          mentorId: user._id,  
          menteeId: mentee._id,  
        }),
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to initiate chat");
  
      setSelectedChatId(data.chat._id);
    } catch (err) {
      console.error("Failed to access chat:", err.message);
    }
  };
  

  if (isLoading) return <div>Loading mentees...</div>;
  if (error) return <div>Error loading mentees</div>;

  return (
    <div className="flex w-full h-[600px] max-w-6xl mx-auto border rounded-3xl p-6 shadow-2xl bg-gradient-to-br from-[#f6f1f1] to-[#e3e6f0]">
      {/* Mentee List Section */}
      <div className="w-1/4 bg-gray-700 p-4 rounded-lg">
        <h2 className="text-xl text-white mb-4">Mentees</h2>
        <div className="space-y-2">
          {mentees?.length > 0 ? (
            mentees.map((mentee) => (
              <div
                key={mentee._id}
                className="flex items-center space-x-2 hover:bg-stone-600 p-2 rounded-md cursor-pointer"
                onClick={() => handleSelectMentee(mentee)}
              >
                <FaUser className="w-8 h-8 text-white" />
                <div className="text-white">{mentee.fullName}</div>
              </div>
            ))
          ) : (
            <div className="text-white">No mentees found.</div>
          )}
        </div>
      </div>

      {/* Chat Interface Section */}
      <div className="w-3/4 p-4">
        {selectedMentee && selectedChatId ? (
          <MenteeChat mentee={selectedMentee} chatId={selectedChatId} />
        ) : (
          <div className="text-center text-gray-600">
            Select a mentee to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorChatInterface;

