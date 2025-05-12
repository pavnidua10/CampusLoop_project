

import { Link } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuth } from "../../Context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import useFollow from "../../hooks/useFollow";
import { API_URL } from "../../config";

const RightPanel = () => {
  const queryClient = useQueryClient();
  const { user, setUser } = useAuth();
  const { follow, isPending } = useFollow();

  const { data: suggestedUsers, isLoading, isError, error } = useQuery({
    queryKey: ["suggestedUsers"],
    queryFn: async () => {
      try {
        const res = await fetch(`${API_URL}/api/users/suggested`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch suggested users");
        }

        return data;
      } catch (err) {
        throw new Error(err.message || "Something went wrong");
      }
    },
    retry: false,
  });

 
  if (isError) {
    return (
      <div className="hidden lg:block my-4 mx-2 w-72">
        <div className="bg-white/10 backdrop-blur-md p-5 rounded-xl shadow-md sticky top-4 border border-white/10 text-red-400">
          <p className="font-bold text-lg text-white mb-2">Subscribe To:</p>
          <p className="text-sm">Error: {error.message}</p>
        </div>
      </div>
    );
  }

  if (suggestedUsers?.length === 0) return <div className="md:w-64 w-0" />;

  return (
    <div className="hidden lg:block my-4 mx-2 w-72">
      <div className="bg-white/10 backdrop-blur-md p-5 rounded-xl shadow-md sticky top-4 border border-white/10">
        <p className="font-bold text-lg text-white mb-1">Subscribe To:</p>
        <p className="text-sm text-gray-400 mb-4">
          People you may connect with 💫
        </p>

        <div className="flex flex-col gap-4">
          {isLoading ? (
            <>
              <RightPanelSkeleton />
              <RightPanelSkeleton />
              <RightPanelSkeleton />
            </>
          ) : (
            suggestedUsers?.map((user) => (
              <Link
                to={`/profile/${user.username}`}
                className="flex items-center justify-between hover:bg-white/5 p-2 rounded-md transition"
                key={user._id}
              >
                <div className="flex gap-3 items-center">
                  <div className="avatar">
                    <div className="w-10 h-10 rounded-full ring ring-purple-500 ring-offset-base-100 ring-offset-2">
                      <img
                        src={user.profileImg || "/avatar-placeholder.png"}
                        alt="User avatar"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-white truncate w-28">
                      {user.fullName}
                    </span>
                    <span className="text-xs text-gray-400">
                      @{user.username}
                    </span>
                  </div>
                </div>

                <button
                  className="btn btn-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:brightness-110 rounded-full px-4"
                  onClick={(e) => {
                    e.preventDefault();
                    follow(user._id);
                  }}
                >
                  {isPending ? <LoadingSpinner size="sm" /> : "Follow"}
                </button>
              </Link>
            ))
          )}
        </div>
      </div>

     
    </div>
  );
};

export default RightPanel;

