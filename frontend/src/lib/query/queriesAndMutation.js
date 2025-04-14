import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isAuthenticated } from "../api/auth.api";
import { QUERY_KEYS } from "./queryKeys";
import { useUser } from "@clerk/clerk-react";
import { getUpdateAvatar, getUpdateUser } from "../api/user.api";
import { toast } from "react-toastify";

export const useIsAuthenticated = () => {
   const { user } = useUser();
   const clerkId = user?.id;

   return useQuery({
      queryKey: [QUERY_KEYS.AUTH.IS_AUTHENTICATED],
      queryFn: () => isAuthenticated(),
      enabled: !!clerkId,
   });
};

// Updated to use mutation for avatar update
export const useUpdateAvatar = () => {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: (avatarName) => getUpdateAvatar(avatarName),
      onSuccess: () => {
         queryClient.invalidateQueries([QUERY_KEYS.AUTH.IS_AUTHENTICATED]);
      },
   });
}

// update user deatils
export const useUpdateUserDetails = () => {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: (updateProfile) => getUpdateUser(updateProfile),
      onSuccess: () => {
         queryClient.invalidateQueries([QUERY_KEYS.AUTH.IS_AUTHENTICATED]);
         toast.success("Profile updated successfully!");
      },
      onError: (error) => {
         const errorMessage = error?.response?.data?.message || "Error updating user details";
         toast.error(errorMessage, {
            position: toast.POSITION.TOP_RIGHT,
         });
      },
   });
};