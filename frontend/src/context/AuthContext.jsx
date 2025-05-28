import { createContext, useContext, useState, useEffect } from "react";
import { useUser } from '@clerk/clerk-react';
import { isAuthenticated } from "../lib/api/auth.api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
   const [currentUser, setCurrentUser] = useState(null);
   const [error, setError] = useState(null);
   const [isAuth, setIsAuth] = useState(false);
   const [isLoading, setIsLoading] = useState(true);

   // fetch current user from clerk
   const { isLoaded, user } = useUser();

   const checkAuthentication = async () => {
      setIsLoading(true);
      try {
         if (user && isLoaded) {
            const authResult = await isAuthenticated();

            if (authResult.success && authResult.user) {
               setCurrentUser(authResult.user);
               setIsAuth(true);
               setError(null);
            } else {
               setCurrentUser(null);
               setIsAuth(false);
               setError(authResult?.message || "Authentication failed");
            }
         } else {
            setCurrentUser(null);
            setIsAuth(false);
         }
      } catch (err) {
         console.error("Authentication error:", err);
         setError("Failed to authenticate user");
         setIsAuth(false);
         setCurrentUser(null);
      } finally {
         setIsLoading(false);
      }
   };

   // New function that refreshes data without changing loading state
   const silentRefresh = async () => {
      try {
         if (user && isLoaded) {
            const authResult = await isAuthenticated();

            if (authResult.success && authResult.user) {
               setCurrentUser(authResult.user);
               setIsAuth(true);
               setError(null);
            } else {
               setCurrentUser(null);
               setIsAuth(false);
               setError(authResult?.message || "Authentication failed");
            }
         } else {
            setCurrentUser(null);
            setIsAuth(false);
         }
      } catch (err) {
         console.error("Authentication error:", err);
         setError("Failed to authenticate user");
         setIsAuth(false);
         setCurrentUser(null);
      }
   };

   useEffect(() => {
      if (isLoaded) {
         checkAuthentication();
      }
   }, [user, isLoaded]);

   const refreshUserData = () => {
      return silentRefresh();
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