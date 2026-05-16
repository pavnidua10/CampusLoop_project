import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { useRef, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuth } from "../../Context/AuthContext";

const CreatePost = () => {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const imgRef = useRef(null);
  const authUser = useAuth();
  const queryClient = useQueryClient();

  const { mutate: createPost, isError, isPending, error } = useMutation({
    mutationFn: async ({ text, img }) => {
      const res = await fetch("/api/posts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, img }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      return data;
    },
    onSuccess: () => {
      setText(""); setImg(null);
      toast.success("Post shared!");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createPost({ text, img });
  };

  const handleImgChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImg(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const charCount = text.length;
  const maxChars = 500;
  const charPercent = Math.min((charCount / maxChars) * 100, 100);
  const circumference = 2 * Math.PI * 10;
  const strokeDashoffset = circumference - (charPercent / 100) * circumference;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

        .create-post-wrap {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 12px;
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.2s;
        }
        .create-post-wrap:focus-within {
          border-color: rgba(99,102,241,0.25);
          box-shadow: 0 0 0 1px rgba(99,102,241,0.08);
        }

        .create-post-top {
          display: flex;
          gap: 14px;
          align-items: flex-start;
        }

        .cp-avatar {
          width: 40px; height: 40px;
          border-radius: 50%; object-fit: cover;
          border: 2px solid rgba(99,102,241,0.35);
          flex-shrink: 0;
        }

        .cp-textarea-wrap { flex: 1; }

        .cp-textarea {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          color: #e2e8f0;
          font-size: 0.925rem;
          font-family: 'DM Sans', sans-serif;
          resize: none;
          line-height: 1.6;
          min-height: 72px;
          padding: 0;
        }
        .cp-textarea::placeholder { color: #334155; }

        .cp-img-preview {
          position: relative;
          margin-top: 12px;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(0,0,0,0.2);
        }
        .cp-img-preview img {
          width: 100%; max-height: 280px;
          object-fit: contain; display: block;
        }
        .cp-img-remove {
          position: absolute; top: 8px; right: 8px;
          background: rgba(0,0,0,0.6);
          border: none; cursor: pointer;
          color: white;
          width: 28px; height: 28px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s;
          backdrop-filter: blur(4px);
        }
        .cp-img-remove:hover { background: rgba(239,68,68,0.8); }

        .cp-divider {
          height: 1px;
          background: rgba(255,255,255,0.05);
          margin: 14px 0;
        }

        .cp-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .cp-tools { display: flex; gap: 4px; align-items: center; }
        .cp-tool-btn {
          background: none; border: none; cursor: pointer;
          padding: 7px 9px;
          border-radius: 8px;
          display: flex; align-items: center;
          transition: background 0.2s;
          color: #475569;
        }
        .cp-tool-btn:hover { background: rgba(255,255,255,0.06); color: #818cf8; }

        .cp-right { display: flex; align-items: center; gap: 12px; }

        .char-ring { position: relative; display: flex; align-items: center; justify-content: center; }
        .char-ring svg { transform: rotate(-90deg); }
        .char-ring-text {
          position: absolute;
          font-size: 9px;
          color: #475569;
          font-weight: 600;
        }
        .char-ring-text.warn { color: #f59e0b; }
        .char-ring-text.over { color: #f87171; }

        .cp-submit {
          padding: 8px 20px;
          border-radius: 20px;
          border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          transition: all 0.2s ease;
          letter-spacing: 0.02em;
        }
        .cp-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(99,102,241,0.35);
        }
        .cp-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .cp-error {
          margin-top: 10px;
          font-size: 0.78rem; color: #f87171;
          padding: 8px 12px;
          background: rgba(248,113,113,0.08);
          border: 1px solid rgba(248,113,113,0.15);
          border-radius: 8px;
        }
      `}</style>

      <div className="create-post-wrap">
        <div className="create-post-top">
          <img src={authUser.profileImg || "/avatar-placeholder.png"} className="cp-avatar" alt="" />

          <div className="cp-textarea-wrap">
            <textarea
              className="cp-textarea"
              placeholder="Share something with your campus..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={maxChars}
              rows={3}
            />

            {img && (
              <div className="cp-img-preview">
                <img src={img} alt="preview" />
                <button className="cp-img-remove" onClick={() => { setImg(null); imgRef.current.value = null; }}>
                  <IoCloseSharp size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="cp-divider" />

        <div className="cp-bottom">
          <div className="cp-tools">
            <button className="cp-tool-btn" type="button" onClick={() => imgRef.current.click()} title="Add image">
              <CiImageOn size={20} />
            </button>
            <button className="cp-tool-btn" type="button" title="Add emoji">
              <BsEmojiSmileFill size={16} style={{ color: "#f59e0b" }} />
            </button>
          </div>

          <input type="file" accept="image/*" hidden ref={imgRef} onChange={handleImgChange} />

          <div className="cp-right">
            {charCount > 0 && (
              <div className="char-ring">
                <svg width="28" height="28" viewBox="0 0 28 28">
                  <circle cx="14" cy="14" r="10" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2.5" />
                  <circle
                    cx="14" cy="14" r="10"
                    fill="none"
                    stroke={charPercent >= 100 ? "#f87171" : charPercent >= 80 ? "#f59e0b" : "#6366f1"}
                    strokeWidth="2.5"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.2s, stroke 0.2s" }}
                  />
                </svg>
                {charCount >= maxChars * 0.8 && (
                  <span className={`char-ring-text ${charPercent >= 100 ? "over" : "warn"}`}>
                    {maxChars - charCount}
                  </span>
                )}
              </div>
            )}

            <button
              className="cp-submit"
              onClick={handleSubmit}
              disabled={isPending || (!text.trim() && !img)}
            >
              {isPending ? "Posting..." : "Post"}
            </button>
          </div>
        </div>

        {isError && <p className="cp-error">{error.message}</p>}
      </div>
    </>
  );
};

export default CreatePost;