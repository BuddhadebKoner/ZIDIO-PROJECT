import { createContext, useContext, useState, useEffect } from "react";
import { useUser } from '@clerk/clerk-react';
import { useIsAuthenticated } from "../lib/query/queriesAndMutation";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
   const [currentUser, setCurrentUser] = useState(null);
   const [error, setError] = useState(null);
   const [isAuth, setIsAuth] = useState(false);

   // fetch current user from clerk
   const { isLoaded, user } = useUser();

   const {
      data: authData,
      isLoading,
      refetch: refreshUserData
   } = useIsAuthenticated();

   useEffect(() => {
      if (authData) {
         if (authData.success && authData.user) {
            setCurrentUser(authData.user);
            setIsAuth(true);
            setError(null);
         } else {
            setCurrentUser(null);
            setIsAuth(false);
            setError(authData?.message || "Authentication failed");
         }
      }
   }, [authData, user, isLoaded, useUser, children]);

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