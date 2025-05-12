import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { API_URL } from "../config";
const useUpdateUserProfile=()=>{
    const queryClient=useQueryClient()
    const{mutateAsync:updateProfile,isPending:isUpdatingProfile}=useMutation({
    mutationFn:async(formData)=>{
        try{
          const res=await fetch(`${API_URL}/api/users/update`,{
            method:"POST",
            headers:{
                "Content-Type":"application/json",
            },
            body:JSON.stringify(formData)
          });

          if(!res.ok) throw new Error(data.error);
          const data=await res.json();
        
          return data;
        }catch(error){
            throw new Error(error.message);
        }
    },
    onSuccess:()=>{
        toast.success("profile updated successfully")
        Promise.all([
            queryClient.invalidateQueries({queryKey:["authUser"]}),
            queryClient.invalidateQueries({queryKey:["userProfile"]})
        ])
    },
    onError:(error)=>{
        toast.error(error.message)
    }
})
  return {updateProfile,isUpdatingProfile};

}

export default useUpdateUserProfile;