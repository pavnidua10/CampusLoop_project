import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegHeart } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";
import { formatPostDate } from "../../utils/date";
import { useAuth } from "../../Context/AuthContext";
import { API_URL } from "../../config";

const Post = ({ post }) => {
	const [comment, setComment] = useState("");
	const authUser = useAuth();
	const queryClient = useQueryClient();

	const postOwner = post.user;
	const isMyPost = authUser._id === post.user._id;
	const formattedDate = formatPostDate(post.createdAt);


	const [localLiked, setLocalLiked] = useState(post.likes.includes(authUser._id));
	const [likesCount, setLikesCount] = useState(post.likes.length);

	const { mutate: deletePost, isPending: isDeleting } = useMutation({
		mutationFn: async () => {
			const res = await fetch(`${API_URL}/api/posts/${post._id}`, {
				method: "DELETE",
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Something went wrong");
			return data;
		},
		onSuccess: () => {
			toast.success("Post deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		},
	});

	const { mutate: likePost, isPending: isLiking } = useMutation({
		mutationFn: async () => {
			const res = await fetch(`${API_URL}/api/posts/like/${post._id}`, {
				method: "POST",
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Something went wrong");
			return data;
		},
		onSuccess: (updatedLikes) => {
			setLocalLiked(updatedLikes.includes(authUser._id));
			setLikesCount(updatedLikes.length);

			queryClient.setQueryData(["posts"], (oldData) => {
				if (!oldData) return [];
				return oldData.map((p) =>
					p._id === post._id ? { ...p, likes: updatedLikes } : p
				);
			});
		},
		onError: (error) => toast.error(error.message),
	});

	const { mutate: commentPost, isPending: isCommenting } = useMutation({
		mutationFn: async () => {
			const res = await fetch(`${API_URL}/api/posts/comment/${post._id}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ text: comment }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Something went wrong");
			return data;
		},
		onSuccess: () => {
			toast.success("Comment posted successfully");
			setComment("");
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		},
		onError: (error) => toast.error(error.message),
	});

	return (
		<div className='flex gap-2 items-start p-4 border-b border-gray-700'>
			<div className='avatar'>
				<Link to={`/profile/${postOwner.username}`} className='w-8 rounded-full overflow-hidden'>
					<img src={postOwner.profileImg || "/avatar-placeholder.png"} />
				</Link>
			</div>
			<div className='flex flex-col flex-1'>
				<div className='flex gap-2 items-center'>
					<Link to={`/profile/${postOwner.username}`} className='font-bold'>
						{postOwner.fullName}
					</Link>
					<span className='text-gray-700 flex gap-1 text-sm'>
						<Link to={`/profile/${postOwner.username}`}>@{postOwner.username}</Link>
						<span>·</span>
						<span>{formattedDate}</span>
					</span>
					{isMyPost && (
						<span className='flex justify-end flex-1'>
							{!isDeleting ? (
								<FaTrash
									className='cursor-pointer hover:text-red-500'
									onClick={() => deletePost()}
								/>
							) : (
								<LoadingSpinner size='sm' />
							)}
						</span>
					)}
				</div>

				<div className='flex flex-col gap-3 overflow-hidden'>
					<span>{post.text}</span>
					{post.img && (
						<img
							src={post.img}
							className='h-80 object-contain rounded-lg border border-gray-700'
							alt=''
						/>
					)}
				</div>

				<div className='flex justify-between mt-3'>
					<div className='flex gap-4 items-center w-2/3 justify-between'>
						{/* Comment */}
						<div
							className='flex gap-1 items-center cursor-pointer group'
							onClick={() => document.getElementById("comments_modal" + post._id).showModal()}
						>
							<FaRegComment className='w-4 h-4 text-slate-500 group-hover:text-sky-400' />
							<span className='text-sm text-slate-500 group-hover:text-sky-400'>
								{post.comments.length}
							</span>
						</div>

						{/* Comment Modal */}
						<dialog id={`comments_modal${post._id}`} className='modal border-none outline-none'>
							<div className='modal-box rounded border border-gray-600'>
								<h3 className='font-bold text-lg mb-4'>COMMENTS</h3>
								<div className='flex flex-col gap-3 max-h-60 overflow-auto'>
									{post.comments.length === 0 ? (
										<p className='text-sm text-slate-500'>
											No comments yet 🤔 Be the first one 😉
										</p>
									) : (
										post.comments.map((comment) => (
											<div key={comment._id} className='flex gap-2 items-start'>
												<div className='avatar'>
													<div className='w-8 rounded-full'>
														<img src={comment.user.profileImg || "/avatar-placeholder.png"} />
													</div>
												</div>
												<div className='flex flex-col'>
													<div className='flex items-center gap-1'>
														<span className='font-bold'>{comment.user.fullName}</span>
														<span className='text-gray-700 text-sm'>
															@{comment.user.username}
														</span>
													</div>
													<div className='text-sm'>{comment.text}</div>
												</div>
											</div>
										))
									)}
								</div>
								<form
									className='flex gap-2 items-center mt-4 border-t border-gray-600 pt-2'
									onSubmit={(e) => {
										e.preventDefault();
										if (!isCommenting) commentPost();
									}}
								>
									<textarea
										className='textarea w-full p-1 rounded text-md resize-none border focus:outline-none border-gray-800'
										placeholder='Add a comment...'
										value={comment}
										onChange={(e) => setComment(e.target.value)}
									/>
									<button className='btn btn-primary rounded-full btn-sm text-white px-4'>
										{isCommenting ? <LoadingSpinner size='md' /> : "Post"}
									</button>
								</form>
							</div>
							<form method='dialog' className='modal-backdrop'>
								<button className='outline-none'>close</button>
							</form>
						</dialog>

						{/* Repost */}
						<div className='flex gap-1 items-center group cursor-pointer'>
							<BiRepost className='w-6 h-6 text-slate-500 group-hover:text-green-500' />
							<span className='text-sm text-slate-500 group-hover:text-green-500'>0</span>
						</div>

						{/* Like */}
						<div
							className='flex gap-1 items-center group cursor-pointer'
							onClick={() => {
								if (!isLiking) likePost();
							}}
						>
							{isLiking ? (
								<LoadingSpinner size='sm' />
							) : (
								<FaRegHeart
									className={`w-4 h-4 transition-colors duration-150 ${
										localLiked ? "text-red-500" : "text-slate-500 group-hover:text-pink-500"
									}`}
								/>
							)}
							<span
								className={`transition-all duration-150 text-sm ${
									localLiked ? "text-red-500 scale-110" : "text-slate-500"
								}`}
							>
								{likesCount}
							</span>
						</div>
					</div>

					{/* Bookmark */}
					<div className='flex w-1/3 justify-end gap-2 items-center'>
						<FaRegBookmark className='w-4 h-4 text-slate-500 cursor-pointer' />
					</div>
				</div>
			</div>
		</div>
	);
};

export default Post;
