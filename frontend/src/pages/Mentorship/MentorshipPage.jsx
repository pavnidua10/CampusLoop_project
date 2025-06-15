import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../Context/AuthContext";
import MentorCard from "../../components/mentorship/AssignMentor";
import MentorshipDashboard from "../../components/mentorship/MentorshipDashboard";
import AnonymousQNA from "../../components/mentorship/AnonymousQna";
import { API_URL } from "../../config";
import { useQueryClient } from "@tanstack/react-query";
const MentorshipPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user } = useAuth();
  const username = user?.username;
  const queryClient = useQueryClient();
  // Get user profile
  const { data: userProfile, isLoading: isUserLoading, error: userError } = useQuery({
    queryKey: ["userProfile", username],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/users/profile/${username}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error fetching user profile");
      return data;
    },
    enabled: !!username,
  });

  // Get list of available mentors
  const { data: mentors = [], isLoading: isMentorsLoading, error: mentorsError } = useQuery({
    queryKey: ["availableMentors"],
    queryFn: async () => {
      const res = await fetch("/api/mentorship-chats/mentors");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error fetching mentors");
      return data;
    },
  });

  const handleMentorSelect = async (mentorId) => {
    const studentUsername = user?.username;
    try {
      const response = await fetch(`${API_URL}/api/mentor/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentUsername, mentorId }),
      });
  
      if (response.ok) {
        await queryClient.invalidateQueries(["userProfile", studentUsername]); // React Query will now refetch the updated profile
      } else {
        throw new Error("Failed to assign mentor");
      }
    } catch (error) {
      console.error(error.message);
    }
  };
  

  if (isUserLoading) return <p><div className='flex justify-center h-full items-center'>
              <LoadingSpinner size='lg' />
            </div></p>;

  if (userError) return <p>Error: {userError.message}</p>;
  if (!userProfile) return <p>No user profile found.</p>;
  console.log("Mentor Chat ID (whole):", userProfile.assignedMentorChatId);
  console.log("Mentor Chat ID (_id):", userProfile?.assignedMentorChatId?._id);
  return (
    <div className="p-6">
      {userProfile.assignedMentor ? (
        <>
          <div className="tabs mb-4">
            <button
              className={`tab tab-bordered ${activeTab === "dashboard" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              Dashboard
            </button>

            {userProfile?.assignedMentorChatId?._id && (
  <Link
    to={`${API_URL}/mentorship/chat/${userProfile.assignedMentorChatId?._id}`}
    className="tab tab-bordered"
  >
    Chat
  </Link>
)}

            <button
              className={`tab tab-bordered ${activeTab === "anonymous" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("anonymous")}
            >
              Q&A
            </button>

            
          </div>

          {activeTab === "dashboard" && <MentorshipDashboard />}
          {activeTab === "anonymous" && <AnonymousQNA />}
         
        </>
      ) : (
        <div className="mentor-selection">
          <h3 className="text-xl font-semibold mb-4">Select a Mentor</h3>
          {isMentorsLoading ? (
            <p>Loading mentors...</p>
          ) : mentorsError ? (
            <p>Error: {mentorsError.message}</p>
          ) : mentors.length === 0 ? (
            <p>No mentors available at the moment.</p>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {mentors.map((mentor) => (
                <MentorCard
                  key={mentor._id}
                  mentor={mentor}
                  onSelect={handleMentorSelect}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MentorshipPage;
