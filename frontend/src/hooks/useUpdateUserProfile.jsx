import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { API_URL } from "../config";

const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: updateProfile, isLoading: isUpdatingProfile } = useMutation({
    mutationFn: async (formData) => {
      try {
        const res = await fetch(`${API_URL}/api/users/update`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
          credentials: "include",
        });

        const data = await res.json(); // parse JSON first

        if (!res.ok) {
          throw new Error(data.error || "Failed to update profile");
        }

        return data;
      } catch (error) {
        throw new Error(error.message || "Something went wrong");
      }
    },
    onSuccess: async () => {
      toast.success("Profile updated successfully");

      // Invalidate relevant queries to refetch updated data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["authUser"] }),
        queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
      ]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  return { updateProfile, isUpdatingProfile };
};

export default useUpdateUserProfile;
