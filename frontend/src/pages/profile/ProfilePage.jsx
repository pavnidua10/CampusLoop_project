import { useEffect, useRef, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import Posts from "../../components/common/Posts";
import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton";
import EditProfileModal from "./EditProfileModal";
import { API_URL } from "../../config";
import { FaArrowLeft } from "react-icons/fa6";
import { MdEdit } from "react-icons/md";
import { useQuery } from "@tanstack/react-query";
import { formatMemberSinceDate } from "../../utils/date";
import useFollow from "../../hooks/useFollow";
import useUpdateUserProfile from "../../hooks/useUpdateUserProfile";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { username } = useParams();
  const { user: loggedInUser } = useAuth();

  const [coverImg, setCoverImg] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const [feedType, setFeedType] = useState("posts");

  const coverImgRef = useRef(null);
  const profileImgRef = useRef(null);

  const { follow, isPending } = useFollow();

  const { data: user, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["userProfile", username],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/users/profile/${username}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
  });

  const { isUpdatingProfile, updateProfile } = useUpdateUserProfile();

  const isMyProfile = loggedInUser?._id === user?._id;
  const memberSinceDate = formatMemberSinceDate(user?.createdAt);
 const isFollowing = (user?.followers ?? []).includes(loggedInUser?._id);


  const handleImgChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (type === "cover") setCoverImg(reader.result);
      if (type === "profile") setProfileImg(reader.result);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    refetch();
  }, [username, refetch]);

  if (isLoading || isRefetching) return <ProfileHeaderSkeleton />;
  if (!user) return <p className="text-center mt-10">User not found</p>;

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* ---------- TOP HEADER ---------- */}
      <div className="flex items-center gap-6 px-6 py-4 border-b border-gray-800">
        <Link to="/">
          <FaArrowLeft className="w-4 h-4 text-gray-400 hover:text-white" />
        </Link>
        <div>
          <h2 className="font-bold text-lg">{user.fullName}</h2>
        </div>
      </div>

      {/* ---------- COVER ---------- */}
      <div className="relative">
        <img
          src={coverImg || user.coverImg || "/cover.png"}
          className="h-60 w-full object-cover brightness-75"
          alt="cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 to-transparent" />

        {isMyProfile && (
          <div
            className="absolute top-4 right-4 bg-black/50 p-2 rounded-full cursor-pointer"
            onClick={() => coverImgRef.current.click()}
          >
            <MdEdit />
          </div>
        )}

        <input
          hidden
          type="file"
          ref={coverImgRef}
          onChange={(e) => handleImgChange(e, "cover")}
        />
        <input
          hidden
          type="file"
          ref={profileImgRef}
          onChange={(e) => handleImgChange(e, "profile")}
        />

        {/* ---------- PROFILE IMAGE ---------- */}
        <div className="absolute -bottom-16 left-6">
          <div className="relative">
            <img
              src={profileImg || user.profileImg || "/avatar-placeholder.png"}
              className="w-32 h-32 rounded-full border-4 border-gray-950 object-cover"
            />

            {isMyProfile && (
              <div
                className="absolute bottom-2 right-2 bg-purple-600 p-2 rounded-full cursor-pointer"
                onClick={() => profileImgRef.current.click()}
              >
                <MdEdit className="text-white w-4 h-4" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---------- ACTION BUTTONS ---------- */}
      <div className="flex justify-end px-6 mt-20 gap-3">

        {isMyProfile && <EditProfileModal authUser={loggedInUser} />}

        {!isMyProfile && (
          <>
       <button
  onClick={() => follow(user._id)}
  disabled={isPending}
  className={`px-5 py-2 rounded-full text-sm transition ${
    isFollowing
      ? "bg-gray-800 border border-gray-700 text-white hover:bg-red-600 hover:border-red-600"
      : "bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:opacity-90"
  }`}
>
  {isPending
    ? "Loading..."
    : isFollowing
    ? "Unfollow"
    : "Follow"}
</button>


            <button
              className="px-5 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-sm"
              onClick={async () => {
                const res = await fetch(`${API_URL}/api/message/access-chat`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ userId: user._id }),
                  credentials: "include",
                });
                const data = await res.json();
                navigate(`/chat/${data._id}`);
              }}
            >
              Message
            </button>
          </>
        )}

        {(coverImg || profileImg) && (
          <button
            className="px-5 py-2 rounded-full bg-green-600 text-sm"
            onClick={async () => {
              await updateProfile({ coverImg, profileImg });
              setCoverImg(null);
              setProfileImg(null);
            }}
          >
            {isUpdatingProfile ? "Updating..." : "Update"}
          </button>
        )}
      </div>

      {/* ---------- PROFILE INFO ---------- */}
      <div className="mt-10 px-6 max-w-4xl">

        <h2 className="text-2xl font-bold">{user.fullName}</h2>
        <p className="text-gray-400">@{user.username}</p>

        {user.bio && (
          <p className="mt-3 text-gray-300 text-sm">{user.bio}</p>
        )}

        {/* Academic Card */}
        <div className="mt-5 bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-2">

          {user.collegeName && (
            <p className="text-sm text-gray-300">
              🎓 {user.collegeName}
            </p>
          )}

          {user.course && (
            <p className="text-sm text-gray-300">
              📘 {user.course.toUpperCase()}
            </p>
          )}

          {user.batchYear && (
            <p className="text-sm text-gray-300">
              🎓 Batch of {user.batchYear}
            </p>
          )}

          {user.userRole && (
            <p className="text-sm text-gray-300">
              🏷 {user.userRole}
            </p>
          )}

          {user.isAvailableForMentorship && (
            <span className="mt-2 inline-block bg-green-600/20 text-green-400 text-xs px-3 py-1 rounded-full w-fit">
              Available for Mentorship
            </span>
          )}
        </div>

        {/* Joined + Followers */}
        <div className="flex flex-wrap gap-6 mt-5 text-sm text-gray-400">
          <span>📅 {memberSinceDate}</span>
          <span>
            <strong className="text-white">
              {user.following?.length ?? 0}
            </strong>{" "}
            Following
          </span>
          <span>
            <strong className="text-white">
              {user.followers?.length ?? 0}
            </strong>{" "}
            Followers
          </span>
        </div>
      </div>

      {/* ---------- TABS ---------- */}
      <div className="flex mt-8 border-b border-gray-800">
        <button
          onClick={() => setFeedType("posts")}
          className={`flex-1 py-4 text-center ${
            feedType === "posts"
              ? "border-b-2 border-purple-500 text-white"
              : "text-gray-400"
          }`}
        >
          Posts
        </button>

        <button
          onClick={() => setFeedType("likes")}
          className={`flex-1 py-4 text-center ${
            feedType === "likes"
              ? "border-b-2 border-purple-500 text-white"
              : "text-gray-400"
          }`}
        >
          Likes
        </button>
      </div>

      <Posts
        feedType={feedType}
        username={username}
        userId={user._id}
      />
    </div>
  );
};

export default ProfilePage;
