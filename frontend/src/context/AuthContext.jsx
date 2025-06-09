import { createContext, useContext } from "react";
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { useIsAuthenticated } from "../lib/query/queriesAndMutation";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
   // fetch current user from clerk
   const { isLoaded, user } = useUser();
   const { getToken } = useClerkAuth();

   const {
      data: authData,
      isLoading: queryLoading,
      isError: queryError,
      error: queryErrorData,
      refetch: refetchAuth,
   } = useIsAuthenticated(user && isLoaded, getToken);

   // Derived state from query results
   const isLoading = !isLoaded || queryLoading;
   const isAuth = authData?.success && !!authData?.user;
   const currentUser = authData?.user || null;
   const error = queryError
      ? (queryErrorData?.response?.data?.message ||
         queryErrorData?.message ||
         "Authentication failed")
      : (!isAuth && authData?.message ? authData.message : null);

   const refreshUserData = async () => {
      try {
         const result = await refetchAuth();
         return result;
      } catch (err) {
         console.error("Error refreshing user data:", err);
         throw err;
      }
   };

   const cartItemsCount = currentUser?.cart?.length || 0;
   const wishlistItemsCount = currentUser?.wishlist?.length || 0;
   const hasNotifications = currentUser?.notifications?.length > 0;
   const isAdmin = currentUser?.role === "admin";

   const authValues = {
      isAuthenticated: isAuth,
      isLoading,
      error,
      currentUser,
      cartItemsCount,
      wishlistItemsCount,
      hasNotifications,
      refreshUserData,
      isAdmin,
      user,
      getToken,
   };

   return <AuthContext.Provider value={authValues}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
   const context = useContext(AuthContext);
   if (!context) {
      throw new Error("useAuth must be used within an AuthProvider");
   }
   return context;
};