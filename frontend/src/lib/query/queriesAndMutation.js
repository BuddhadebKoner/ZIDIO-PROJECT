import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isAuthenticated } from "../api/auth.api";
import { QUERY_KEYS } from "./queryKeys";
import { useUser } from "@clerk/clerk-react";
import { getAddAddress, getUpdateAddress, getUpdateAvatar, getUpdateUser } from "../api/user.api";
import { toast } from "react-toastify";
import { addProduct } from "../api/admin.api";
import { getAllCollections } from "../api/collection.api";

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

// add address
export const useAddAddress = () => {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: (address) => getAddAddress(address),
      onSuccess: () => {
         queryClient.invalidateQueries([QUERY_KEYS.AUTH.IS_AUTHENTICATED]);
         toast.success("Address added successfully!");
      },
      onError: (error) => {
         const errorMessage = error?.response?.data?.message || "Error adding address";
         toast.error(errorMessage, {
            position: toast.POSITION.TOP_RIGHT,
         });
      },
   });
}

// update address
export const useUpdateAddress = () => {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: (address) => getUpdateAddress(address),
      onSuccess: () => {
         queryClient.invalidateQueries([QUERY_KEYS.AUTH.IS_AUTHENTICATED]);
         toast.success("Address updated successfully!");
      },
      onError: (error) => {
         const errorMessage = error?.response?.data?.message || "Error updating address";
         toast.error(errorMessage, {
            position: toast.POSITION.TOP_RIGHT,
         });
      },
   });
}


// add prodct
export const useAddProduct = () => {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: (product) => addProduct(product),
      onSuccess: () => {
         queryClient.invalidateQueries([QUERY_KEYS.PRODUCTS.GET_PRODUCTS]);
      },
      onError: (error) => {
         const errorMessage = error?.response?.data?.message || "Error adding product";
         toast.error(errorMessage, {
            position: toast.POSITION.TOP_RIGHT,
         });
      },
   });
}

// get all collections
export const useGetAllCollections = (limit = 5) => {
   return useInfiniteQuery({
      queryKey: [QUERY_KEYS.COLLECTIONS.GET_ALL_COLLECTIONS],
      queryFn: ({ pageParam = 1 }) => getAllCollections(pageParam, limit),
      getNextPageParam: (lastPage) => {
         if (lastPage.currentPage < lastPage.totalPages) {
            return lastPage.currentPage + 1;
         }
         return undefined;
      },
      refetchOnWindowFocus: false,
   });
}