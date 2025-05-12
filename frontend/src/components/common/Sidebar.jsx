

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import CampusLoopLogo from "../../logo/CampusLoop.png";
import { MdHomeFilled } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import { IoSearch } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { BsChatDots } from "react-icons/bs";
import { PiStudentDuotone } from "react-icons/pi";
import { BiLogOut } from "react-icons/bi";
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
      queryClient.clear(); // clear all cache
	  window.location.href = "/login";
      toast.success("Logged out");
    },
    onError: () => toast.error("Logout failed"),
  });

  return (
    <div className='md:flex-[2_2_0] w-18 max-w-52'>
      <div className='sticky top-0 left-0 h-screen flex flex-col border-r border-gray-700 w-20 md:w-full'>
        <Link to='/' className='flex justify-center md:justify-start'>
          <img src={CampusLoopLogo} alt='Campus Loop Logo' className='w-60 mb-4' />
        </Link>

       

        <ul className='flex flex-col gap-3 mt-4'>
          <li className='flex justify-center md:justify-start'>
            <Link
              to='/'
              className='flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
            >
              <MdHomeFilled className='w-8 h-8' />
              <span className='text-lg hidden md:block'>Home</span>
            </Link>
          </li>
          <li className='flex justify-center md:justify-start'>
  <Link
    to='/search'
    className='flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
  >
    <IoSearch className='w-6 h-6' />
    <span className='text-lg hidden md:block'>Search</span>
  </Link>
</li>

          <li className='flex justify-center md:justify-start'>
            <Link
              to='/notifications'
              className='flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
            >
              <IoNotifications className='w-6 h-6' />
              <span className='text-lg hidden md:block'>Notifications</span>
            </Link>
          </li>
        
          <li className='flex justify-center md:justify-start'>
            <Link
              to='/chat'
              className='flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
            >
              <BsChatDots className='w-6 h-6' />
              <span className='text-lg hidden md:block'>Chat</span>
            </Link>
          </li>
          {user?.isAvailableForMentorship ? (
            <li className='flex justify-center md:justify-start'>
              <Link
                to={`/mentor/${user._id}`}
                className='flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
              >
                <PiStudentDuotone className='w-6 h-6' />
                <span className='text-lg hidden md:block'>Mentor Page</span>
              </Link>
            </li>
          ) : (
            <li className='flex justify-center md:justify-start'>
              <Link
                to='/mentorship'
                className='flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
              >
                <PiStudentDuotone className='w-6 h-6' />
                <span className='text-lg hidden md:block'>Mentorship</span>
              </Link>
            </li>
          )}
            <li className='flex justify-center md:justify-start'>
            <Link
              to={`/profile/${user?.username}`}
              className='flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
            >
              <FaUser className='w-6 h-6' />
              <span className='text-lg hidden md:block'>Profile</span>
            </Link>
          </li>
          <li className='flex justify-center md:justify-start'>
            <button
              onClick={logout}
              className='flex gap-3 items-center text-red-500 hover:bg-red-950 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
            >
              <BiLogOut className='w-6 h-6' />
              <span className='text-lg hidden md:block'>Logout</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
