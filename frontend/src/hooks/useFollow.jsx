import { useMutation,useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { API_URL } from "../config";
const useFollow = () => {
  const queryClient = useQueryClient();

  const { mutate: follow, isPending } = useMutation({
    mutationFn: async (userId) => {
      const res = await fetch(`${API_URL}/api/users/follow/${userId}`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] });
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });

  return { follow, isPending };
};


export default useFollow;