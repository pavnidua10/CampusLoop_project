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

  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/api/posts/${post._id}`, {
        method: "DELETE", credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", feedType, username, userId] });
    },
  });

  const { mutate: likePost, isPending: isLiking } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/api/posts/like/${post._id}`, {
        method: "POST", credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", feedType, username, userId] });
    },
    onError: (err) => toast.error(err.message),
  });

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
      queryClient.invalidateQueries({ queryKey: ["posts", feedType, username, userId] });
    },
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

        .post-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 12px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          font-family: 'DM Sans', sans-serif;
        }
        .post-card:hover {
          border-color: rgba(99,102,241,0.2);
          box-shadow: 0 4px 24px rgba(99,102,241,0.06);
        }

        .post-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 14px;
        }
        .post-author {
          display: flex;
          gap: 12px;
          align-items: center;
          text-decoration: none;
        }
        .post-avatar {
          width: 40px; height: 40px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(99,102,241,0.3);
          flex-shrink: 0;
        }
        .post-name {
          font-weight: 600;
          font-size: 0.9rem;
          color: #e2e8f0;
          display: block;
        }
        .post-meta {
          font-size: 0.75rem;
          color: #475569;
          margin-top: 1px;
        }

        .post-delete-btn {
          background: none; border: none; cursor: pointer;
          color: #334155; padding: 6px;
          border-radius: 8px;
          transition: all 0.2s;
          display: flex; align-items: center;
        }
        .post-delete-btn:hover { color: #f87171; background: rgba(248,113,113,0.08); }

        .post-text {
          font-size: 0.9rem;
          color: #cbd5e1;
          line-height: 1.65;
          margin-bottom: 14px;
          white-space: pre-wrap;
        }
        .post-img {
          width: 100%;
          max-height: 400px;
          object-fit: contain;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.06);
          margin-bottom: 14px;
          background: rgba(0,0,0,0.2);
        }

        .post-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          padding-top: 12px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .action-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 7px 14px;
          border-radius: 20px;
          border: none; background: none; cursor: pointer;
          font-size: 0.8rem; font-weight: 500;
          color: #475569;
          transition: all 0.2s ease;
          font-family: 'DM Sans', sans-serif;
        }
        .action-btn:hover {
          background: rgba(255,255,255,0.05);
          color: #94a3b8;
        }
        .action-btn.liked { color: #f87171; }
        .action-btn.liked:hover { background: rgba(248,113,113,0.08); }
        .action-btn:active { transform: scale(0.95); }

        /* COMMENT MODAL */
        .modal-backdrop {
          position: fixed; inset: 0; z-index: 50;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .modal-box {
          background: #0f172a;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          width: 100%; max-width: 520px;
          max-height: 80vh;
          display: flex; flex-direction: column;
          animation: slideUp 0.25s ease;
          box-shadow: 0 25px 80px rgba(0,0,0,0.5);
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .modal-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 18px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .modal-title { font-weight: 700; font-size: 1rem; color: #f1f5f9; }
        .modal-close {
          background: rgba(255,255,255,0.05);
          border: none; cursor: pointer;
          color: #64748b;
          width: 30px; height: 30px;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
          transition: all 0.2s;
        }
        .modal-close:hover { background: rgba(248,113,113,0.1); color: #f87171; }

        .modal-comments {
          flex: 1; overflow-y: auto; padding: 16px 20px;
          display: flex; flex-direction: column; gap: 14px;
        }
        .modal-comments::-webkit-scrollbar { width: 4px; }
        .modal-comments::-webkit-scrollbar-track { background: transparent; }
        .modal-comments::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

        .comment-item { display: flex; gap: 10px; align-items: flex-start; }
        .comment-avatar {
          width: 34px; height: 34px; border-radius: 50%; object-fit: cover;
          border: 1px solid rgba(99,102,241,0.2); flex-shrink: 0;
        }
        .comment-bubble {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 10px 14px;
          flex: 1;
        }
        .comment-author-row { display: flex; align-items: baseline; gap: 6px; margin-bottom: 4px; }
        .comment-name { font-weight: 600; font-size: 0.82rem; color: #e2e8f0; }
        .comment-handle { font-size: 0.72rem; color: #334155; }
        .comment-text { font-size: 0.85rem; color: #94a3b8; line-height: 1.5; }

        .empty-comments {
          text-align: center; padding: 40px 0;
          color: #334155; font-size: 0.85rem;
        }
        .empty-comments span { display: block; font-size: 28px; margin-bottom: 8px; }

        .modal-input-row {
          display: flex; gap: 10px;
          padding: 14px 20px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .comment-input {
          flex: 1;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 10px 16px;
          color: #f1f5f9;
          font-size: 0.85rem;
          outline: none;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
        }
        .comment-input:focus {
          border-color: #6366f1;
          background: rgba(99,102,241,0.06);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }
        .comment-input::placeholder { color: #334155; }
        .comment-submit {
          padding: 10px 18px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none; border-radius: 20px;
          color: white; font-size: 0.82rem; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
        }
        .comment-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(99,102,241,0.35);
        }
        .comment-submit:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <div className="post-card">
        {/* Header */}
        <div className="post-header">
          <Link to={`/profile/${postOwner.username}`} className="post-author">
            <img src={postOwner.profileImg || "/avatar-placeholder.png"} className="post-avatar" alt="" />
            <div>
              <span className="post-name">{postOwner.fullName}</span>
              <span className="post-meta">@{postOwner.username} · {formattedDate}</span>
            </div>
          </Link>

          {isMyPost && (
            <button className="post-delete-btn" onClick={() => deletePost()}>
              {isDeleting ? <LoadingSpinner size="sm" /> : <FaTrash size={13} />}
            </button>
          )}
        </div>

        {/* Content */}
        {post.text && <p className="post-text">{post.text}</p>}
        {post.img && <img src={post.img} className="post-img" alt="" />}

        {/* Actions */}
        <div className="post-actions">
          <button className="action-btn" onClick={() => setShowComments(true)}>
            <FaRegComment size={14} />
            <span>{post.comments.length}</span>
          </button>

          <button
            className={`action-btn ${isLiked ? "liked" : ""}`}
            onClick={() => likePost()}
          >
            {isLiking ? <LoadingSpinner size="sm" /> : <FaHeart size={14} />}
            <span>{post.likes.length}</span>
          </button>
        </div>
      </div>

      {/* Comments Modal */}
      {showComments && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setShowComments(false)}>
          <div className="modal-box">
            <div className="modal-header">
              <span className="modal-title">Comments · {post.comments.length}</span>
              <button className="modal-close" onClick={() => setShowComments(false)}>×</button>
            </div>

            <div className="modal-comments">
              {post.comments.length === 0 ? (
                <div className="empty-comments">
                  <span>💬</span>
                  No comments yet. Be the first!
                </div>
              ) : (
                post.comments.map((c) => (
                  <div key={c._id} className="comment-item">
                    <img src={c.user?.profileImg || "/avatar-placeholder.png"} className="comment-avatar" alt="" />
                    <div className="comment-bubble">
                      <div className="comment-author-row">
                        <span className="comment-name">{c.user?.fullName || "User"}</span>
                        <span className="comment-handle">@{c.user?.username}</span>
                      </div>
                      <p className="comment-text">{c.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form
              className="modal-input-row"
              onSubmit={(e) => { e.preventDefault(); if (!comment.trim()) return; commentPost(); }}
            >
              <input
                type="text"
                className="comment-input"
                placeholder="Write a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button type="submit" className="comment-submit" disabled={isCommenting}>
                {isCommenting ? "..." : "Post"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Post;