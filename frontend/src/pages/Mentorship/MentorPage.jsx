import { useState } from "react";
import { useParams } from "react-router-dom"; 
import MentorDashboard from "../../components/mentors/MentorDashboard";
import MentorChatInterface from "../../components/mentors/MentorChatInterface";
import MentorQnA from "../../components/mentors/MentorQna";
import { useAuth } from "../../Context/AuthContext";
const MentorPage = () => {
  const { user } = useAuth(); 
  const mentorId = user?._id;
  console.log("mentorId:", mentorId);
  const [activeTab, setActiveTab] = useState("dashboard"); 
 

  return (
    <div className="flex flex-col min-h-screen">
      {/* Tab navigation */}
      <div className="flex space-x-4 bg-gray-800 text-white py-2 px-4">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex-1 py-2 text-center ${activeTab === "dashboard" ? "bg-stone-900" : "hover:bg-stone-700"}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 py-2 text-center ${activeTab === "chat" ? "bg-stone-900" : "hover:bg-stone-700"}`}
        >
          Chat
        </button>
        <button
          onClick={() => setActiveTab("qna")}
          className={`flex-1 py-2 text-center ${activeTab === "qna" ? "bg-stone-900" : "hover:bg-stone-700"}`}
        >
          Q&A
        </button>
      </div>

      {/* Active Tab Content */}
      <div className="flex-1 bg-gray-800 p-4">
        {activeTab === "dashboard" && <MentorDashboard mentorId={mentorId} />}
        {activeTab === "chat" && <MentorChatInterface mentorId={mentorId} />}
        {activeTab === "qna" && <MentorQnA mentorId={mentorId} />}
      </div>
    </div>
  );
};

export default MentorPage;
