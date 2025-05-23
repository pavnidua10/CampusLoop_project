import { useMutation,useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { API_URL } from "../config";
const useFollow=()=>{
    const queryClient=useQueryClient();
    const {mutate:follow,isPending}=useMutation({
        mutationFn:async(userId)=>{
            try{
            const res=await fetch(`${API_URL}/api/users/follow/${userId}`,{
                method:"POST",
            })
				const data=await res.json();
				if(!res.ok){
					throw new Error(data.error||"something went wrong")
				}
				return;
			}catch(error){
				throw new Error(error.message);
			}
		},
		onSuccess:()=>{
            Promise.all([
			queryClient.invalidateQueries({queryKey:["suggestedUsers"]}),
            queryClient.invalidateQueries({queryKey:["authUsers"]}), //follow to unfollow 
        ])
		},
        onError:(error)=>{
            toast.error(error.message)
        }
    })
    return {follow,isPending};
}
export default useFollow;