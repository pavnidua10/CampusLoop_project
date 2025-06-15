import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { API_URL } from "../../config";
import { IoSettingsOutline } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const NotificationPage = () => {
	const queryClient = useQueryClient();

	const { data: notifications, isLoading } = useQuery({
		queryKey: ["notifications"],
		queryFn: async () => {
			try {
				const res = await fetch(`${API_URL}/api/notifications`);
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
				return data;
			} catch (error) {
				throw new Error(error.message);
			}
		},
	});

	const { mutate: deleteNotifications } = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch(`${API_URL}/api/notifications`, {
					method: "DELETE",
				});
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
				return data;
			} catch (error) {
				throw new Error(error.message);
			}
		},
		onSuccess: () => {
			toast.success("Notifications deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	return (
		<div className='flex-[4_4_0] border-l border-r border-gray-700 min-h-screen px-2 sm:px-4'>
			{/* Header */}
			<div className='flex justify-between items-center py-4 border-b border-gray-700'>
				<p className='font-bold text-lg sm:text-xl'>Notifications</p>
				<div className='dropdown dropdown-end'>
					<div tabIndex={0} role='button' className='m-1'>
						<IoSettingsOutline className='w-5 h-5 sm:w-6 sm:h-6' />
					</div>
					<ul
						tabIndex={0}
						className='dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-44 sm:w-52'
					>
						<li>
							<a onClick={deleteNotifications}>Delete all notifications</a>
						</li>
					</ul>
				</div>
			</div>

			{/* Loading */}
			{isLoading && (
				<div className='flex justify-center h-full items-center'>
					<LoadingSpinner size='lg' />
				</div>
			)}

			{/* No notifications */}
			{notifications?.length === 0 && (
				<div className='text-center p-4 font-bold'>No notifications 🤔</div>
			)}

			{/* Notifications list */}
			{notifications?.map((notification) => (
				<div className='border-b border-gray-700' key={notification._id}>
					<div className='flex items-start sm:items-center gap-3 sm:gap-4 p-3 flex-wrap sm:flex-nowrap'>
						{/* Icon */}
						{notification.type === "follow" && (
							<FaUser className='w-6 h-6 sm:w-7 sm:h-7 text-primary' />
						)}
						{notification.type === "like" && (
							<FaHeart className='w-6 h-6 sm:w-7 sm:h-7 text-red-500' />
						)}

						{/* Avatar + Text */}
						<Link
							to={`/profile/${notification.from.username}`}
							className='flex items-center gap-2 flex-wrap sm:flex-nowrap'
						>
							<div className='avatar'>
								<div className='w-8 sm:w-9 rounded-full'>
									<img
										src={
											notification.from.profileImg ||
											"/avatar-placeholder.png"
										}
										alt='avatar'
									/>
								</div>
							</div>
							<div className='flex gap-1 flex-wrap text-sm sm:text-base'>
								<span className='font-bold'>
									@{notification.from.username}
								</span>
								{notification.type === "follow"
									? "followed you"
									: "liked your post"}
							</div>
						</Link>
					</div>
				</div>
			))}
		</div>
	);
};

export default NotificationPage;
