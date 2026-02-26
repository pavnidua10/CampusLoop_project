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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, img }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }
      return data;
    },
    onSuccess: () => {
      setText("");
      setImg(null);
      toast.success("Post created successfully");
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

  return (
    <div className="flex gap-4 border-b border-base-content/30 py-4 px-4 md:px-6">
      {/* Avatar */}
      <div className="avatar">
        <div className="w-10 h-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
          <img src={authUser.profileImg || "/avatar-placeholder.png"} />
        </div>
      </div>

      {/* Post Form */}
      <form onSubmit={handleSubmit} className="flex flex-col w-full gap-3">
        {/* Text Area */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share some meaningful insights"
          className="textarea textarea-bordered w-full min-h-[80px] focus:outline-none bg-base-200 text-white placeholder:text-gray-400 resize-none"
        />

        {/* Preview Image */}
        {img && (
          <div className="relative max-w-xs mx-auto rounded overflow-hidden">
            <IoCloseSharp
              className="absolute top-2 right-2 text-white bg-black/60 rounded-full w-5 h-5 cursor-pointer z-10"
              onClick={() => {
                setImg(null);
                imgRef.current.value = null;
              }}
            />
            <img src={img} className="w-full h-64 object-contain rounded-lg border border-gray-700" />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between border-t pt-3 border-base-content/30">
          <div className="flex gap-3">
            <CiImageOn
              className="w-6 h-6 text-primary cursor-pointer"
              onClick={() => imgRef.current.click()}
            />
            <BsEmojiSmileFill className="w-5 h-5 text-yellow-400 cursor-pointer" />
          </div>

          <input type="file" accept="image/*" hidden ref={imgRef} onChange={handleImgChange} />

          <button
            type="submit"
            className="btn btn-sm md:btn-md btn-primary rounded-full px-6 text-white"
          >
            {isPending ? "Posting..." : "Post"}
          </button>
        </div>

        {isError && <p className="text-red-500 text-sm">{error.message}</p>}
      </form>
    </div>
  );
};

export default CreatePost;
