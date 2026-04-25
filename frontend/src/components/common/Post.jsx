import { FaRegComment, FaHeart, FaTrash } from "react-icons/fa";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";
import { formatPostDate } from "../../utils/date";
import { useAuth } from "../../Context/AuthContext";
import { API_URL } from "../../config";

const Post = ({ post, feedType, username, userId }) => {
  const [comment, setComment] = useState("");
  const { user: authUser } = useAuth();

  const queryClient = useQueryClient();
 const [showComments, setShowComments] = useState(false);

  const postOwner = post.user;
  const isMyPost = authUser._id === postOwner._id;

  const isLiked = post.likes.some(
    (like) => like === authUser._id || like?._id === authUser._id
  );

  const formattedDate = formatPostDate(post.createdAt);

  /* ================= DELETE ================= */
  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/api/posts/${post._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["posts", feedType, username, userId],
      });
    },
  });

const { mutate: likePost, isPending: isLiking } = useMutation({
  mutationFn: async () => {
    const res = await fetch(`${API_URL}/api/posts/like/${post._id}`, {
      method: "POST",
      credentials: "include",
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data; // full updatedPost
  },

  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ["posts", feedType, username, userId],
    });
  },

  onError: (err) => {
    toast.error(err.message);
  },
});


  /* ================= COMMENT ================= */
  const { mutate: commentPost, isPending: isCommenting } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/api/posts/comment/${post._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text: comment }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({
        queryKey: ["posts", feedType, username, userId],
      });
    },
  });

  return (
    <>
      <div className="bg-gray-200 dark:bg-base-200 rounded-xl p-5 mb-4 shadow hover:shadow-md transition">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex gap-3 items-center">
            <Link to={`/profile/${postOwner.username}`}>
              <img
                src={postOwner.profileImg || "/avatar-placeholder.png"}
                className="w-10 h-10 rounded-full object-cover"
                alt=""
              />
            </Link>

            <div>
              <div className="font-semibold text-black text-sm">
                {postOwner.fullName}
              </div>
              <div className="text-xs text-gray-500">
                @{postOwner.username} · {formattedDate}
              </div>
            </div>
          </div>

          {isMyPost && (
            <button
              onClick={() => deletePost()}
              className="text-gray-400 hover:text-red-500 transition"
            >
              {isDeleting ? (
                <LoadingSpinner size="sm" />
              ) : (
                <FaTrash size={14} />
              )}
            </button>
          )}
        </div>

        {/* TEXT */}
        {post.text && (
          <p className="mb-3 text-black text-sm leading-relaxed">
            {post.text}
          </p>
        )}

        {/* IMAGE */}
        {post.img && (
          <img
            src={post.img}
            className="rounded-lg mb-3 max-h-96 object-contain border"
            alt=""
          />
        )}

        {/* ACTIONS */}
        <div className="flex justify-center gap-10 border-t pt-3">
<button
  onClick={() => setShowComments(true)}

className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition" > <FaRegComment size={16} /> <span>{post.comments.length}</span> </button>
       {showComments && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl flex flex-col max-h-[80vh]">

      {/* HEADER */}
      <div className="flex justify-between items-center px-5 py-4 border-b">
        <h3 className="font-semibold text-black text-lg">Comments</h3>
        <button
          onClick={() => setShowComments(false)}
          className="text-gray-400 hover:text-red-500 text-xl"
        >
          ×
        </button>
      </div>

      {/* COMMENTS LIST */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {post.comments.length === 0 && (
          <div className="text-gray-400 text-sm text-center mt-10">
            No comments yet.
          </div>
        )}

     {post.comments?.map((c) => (
  <div key={c._id} className="flex gap-3 items-start">

    <img
      src={c.user?.profileImg || "/avatar-placeholder.png"}
      className="w-9 h-9 rounded-full object-cover"
      alt=""
    />

    <div className="flex flex-col bg-gray-50 px-4 py-3 rounded-xl w-full">

      {/* Name Row */}
      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold text-black">
          {c.user?.fullName || "User"}
        </span>
        <span className="text-gray-400 text-xs">
          @{c.user?.username}
        </span>
      </div>

      {/* Comment Text */}
      <p className="text-sm text-gray-700 mt-1 leading-relaxed">
        {c.text}
      </p>

    </div>
  </div>
))}

      </div>

      {/* INPUT */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!comment.trim()) return;
          commentPost();
        }}
        className="flex gap-2 px-4 text-black py-3 border-t"
      >
        <input
          type="text"
          placeholder="Write a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          type="submit"
          disabled={isCommenting}
          className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-600 transition disabled:opacity-50"
        >
          Post
        </button>
      </form>

    </div>
  </div>
)}

          {/* LIKE */}
          <button
            onClick={() => likePost()}
            className="flex items-center gap-2 transition active:scale-95"
          >
            {isLiking ? (
              <LoadingSpinner size="sm" />
            ) : (
              <FaHeart
                size={16}
                className={`transition ${
                  isLiked
                    ? "text-red-500 scale-110"
                    : "text-gray-400 hover:text-red-400"
                }`}
              />
            )}
            <span
              className={`${
                isLiked ? "text-red-500 font-medium" : "text-gray-500"
              }`}
            >
              {post.likes.length}
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Post;
