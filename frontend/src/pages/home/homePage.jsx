import { useState } from "react";
import Posts from "../../components/common/Posts";
import CreatePost from "./CreatePost";
import { useAuth } from "../../Context/AuthContext";

const HomePage = () => {
  const [feedType, setFeedType] = useState("explore");
  const authUser = useAuth();

  const tabs = [
    { label: "Explore", value: "explore" },
    { label: "My Circle", value: "circle" },
    { label: "CollegeLoop", value: "college" },
    { label: "CourseLoop", value: "course" },
  ];

  if (authUser?.isMentor) {
    tabs.push({ label: "Mentor Feed", value: "mentor" });
  }

  return (
    <div className='flex-[4_4_0] mr-auto border-r border-gray-700 min-h-screen'>
      {/* Header Tabs */}
      <div className='flex w-full overflow-x-auto border-b border-gray-700'>
        {tabs.map((tab) => (
          <div
            key={tab.value}
            onClick={() => setFeedType(tab.value)}
            className={`flex justify-center flex-1 p-3 transition duration-300 cursor-pointer relative hover:bg-secondary ${
              feedType === tab.value ? "font-semibold text-primary" : ""
            }`}
          >
            {tab.label}
            {feedType === tab.value && (
              <div className='absolute bottom-0 w-10 h-1 rounded-full bg-primary'></div>
            )}
          </div>
        ))}
      </div>

      {/* Create Post */}
      <CreatePost />

      {/* Posts Section */}
      <Posts
        feedType={feedType}
        username={authUser?.username}
        userId={authUser?._id}
        college={authUser?.college}
        course={authUser?.course}
        isMentor={authUser?.isMentor}
      />
    </div>
  );
};

export default HomePage;


