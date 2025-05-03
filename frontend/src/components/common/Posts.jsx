import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

const Posts = ({ feedType, username, userId, college, course, isMentor }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  // Use prop values if available, otherwise fallback to user data from localStorage
  const collegeValue = college || user?.college;
  const courseValue = course || user?.course;

  const getPostEndpoint = () => {
    switch (feedType) {
      case "explore":
        return "/api/posts/all";
      case "circle":
        return "/api/posts/following";
      case "college":
        return collegeValue ? `/api/posts/college/${collegeValue}` : null;
      case "course":
        return courseValue ? `/api/posts/course/${courseValue}` : null;
      case "mentor":
        return "/api/posts/mentor";
      case "posts":
        return `/api/posts/user/${username}`;
      case "likes":
        return `/api/posts/likes/${userId}`;
      default:
        return "/api/posts/all";
    }
  };

  const POST_ENDPOINT = getPostEndpoint();

  const { data: posts, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["posts", feedType, username, userId],
    queryFn: async () => {
      const res = await fetch(POST_ENDPOINT);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }
      return data;
    },
    enabled: !!POST_ENDPOINT, // Only run query if endpoint is valid
  });

  useEffect(() => {
    refetch();
  }, [feedType, refetch]);

  return (
    <>
      {(isLoading || isRefetching) && (
        <div className='flex flex-col justify-center'>
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}

      {!isLoading && !isRefetching && posts && (
        <div>
          {posts?.length > 0 ? (
            posts.map((post) => <Post key={post._id} post={post} />)
          ) : (
            <p className='text-center my-4 text-sm text-gray-400'>
              No posts in this tab!
            </p>
          )}
        </div>
      )}
    </>
  );
};

export default Posts;
