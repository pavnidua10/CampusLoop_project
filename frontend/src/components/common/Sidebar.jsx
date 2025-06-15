import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import CampusLoopLogo from "../../logo/CampusLoop.png";
import {
  MdHomeFilled,
  IoNotifications,
  IoSearch,
  FaUser,
  BsChatDots,
  PiStudentDuotone,
  BiLogOut,
} from "react-icons/all"; 

import { useAuth } from "../../Context/AuthContext";
import { API_URL } from "../../config";

const Sidebar = () => {
  const queryClient = useQueryClient();
  const { user, setUser } = useAuth();

  const { mutate: logout } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/api/auth/logout`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Logout failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      setUser(null);
      queryClient.clear();
      window.location.href = "/login";
      toast.success("Logged out");
    },
    onError: () => toast.error("Logout failed"),
  });

  return (
    <div className="h-full w-full px-4 py-6">
      <div className="flex flex-col items-start space-y-6">
      
        <Link to="/" className="w-full flex justify-center md:justify-start">
          <img
            src={CampusLoopLogo}
            alt="Campus Loop Logo"
            className="w-44 md:w-60 object-contain"
          />
        </Link>

  
        <nav className="w-full space-y-3">
          <SidebarItem to="/" icon={<MdHomeFilled />} label="Home" />
          <SidebarItem to="/search" icon={<IoSearch />} label="Search" />
          <SidebarItem to="/notifications" icon={<IoNotifications />} label="Notifications" />
          <SidebarItem to="/chat" icon={<BsChatDots />} label="Chat" />

          {user?.isAvailableForMentorship ? (
            <SidebarItem
              to={`/mentor/${user._id}`}
              icon={<PiStudentDuotone />}
              label="Mentor Page"
            />
          ) : (
            <SidebarItem to="/mentorship" icon={<PiStudentDuotone />} label="Mentorship" />
          )}

          <SidebarItem
            to={`/profile/${user?.username}`}
            icon={<FaUser />}
            label="Profile"
          />

          {/* Logout */}
          <button
            onClick={logout}
            className="flex items-center gap-3 text-red-500 hover:bg-red-900 w-full px-3 py-2 rounded-full transition-all"
          >
            <BiLogOut className="w-6 h-6" />
            <span className="text-md hidden md:block">Logout</span>
          </button>
        </nav>
      </div>
    </div>
  );
};


const SidebarItem = ({ to, icon, label }) => (
  <Link
    to={to}
    className="flex items-center gap-3 hover:bg-stone-900 w-full px-3 py-2 rounded-full transition-all"
  >
    <span className="w-6 h-6">{icon}</span>
    <span className="text-md hidden md:block">{label}</span>
  </Link>
);

export default Sidebar;
