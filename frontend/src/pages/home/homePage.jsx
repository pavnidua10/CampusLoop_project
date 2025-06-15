import { useState } from "react";
import Posts from "../../components/common/Posts";
import CreatePost from "./CreatePost";
import { useAuth } from "../../Context/AuthContext";

const HomePage = () => {
  const [feedType, setFeedType] = useState("explore");
  const authUser = useAuth();

  // Prepare tabs
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
    <div
      className="
        w-full
        md:flex-[4_4_0]
        md:mr-auto
        border-r border-gray-700
        min-h-screen
        bg-black
        px-2
        md:px-8
        pb-4
        box-border
      "
    >
      {/* Header Tabs */}
      <div
        className="
          flex w-full overflow-x-auto border-b border-gray-700
          scrollbar-thin scrollbar-thumb-gray-700
          bg-black
        "
      >
        {tabs.map((tab) => (
          <div
            key={tab.value}
            onClick={() => setFeedType(tab.value)}
            className={`
              flex justify-center items-center
              flex-shrink-0
              min-w-[110px] md:min-w-0
              p-3 md:px-6
              transition duration-300 cursor-pointer
              relative hover:bg-secondary
              text-sm md:text-base
              ${feedType === tab.value ? "font-semibold text-primary" : "text-gray-300"}
            `}
            style={{ userSelect: "none" }}
          >
            {tab.label}
            {feedType === tab.value && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-primary"></div>
            )}
          </div>
        ))}
      </div>

      {/* Create Post */}
      <div className="mt-4 md:mt-6">
        <CreatePost />
      </div>

      {/* Posts Section */}
      <div className="mt-4 md:mt-8">
        <Posts
          feedType={feedType}
          username={authUser?.username}
          userId={authUser?._id}
          college={authUser?.college}
          course={authUser?.course}
          isMentor={authUser?.isMentor}
        />
      </div>
    </div>
  );
};

export default HomePage;



