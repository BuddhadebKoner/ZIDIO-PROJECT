import { createContext, useContext, useState, useEffect } from "react";
import { isAuthenticated } from "../lib/api/auth.api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
   const [currentUser, setCurrentUser] = useState(null);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState(null);
   const [isAuth, setIsAuth] = useState(false);

   // Function to fetch user data
   const fetchUserData = async () => {
      setIsLoading(true);
      try {
         const response = await isAuthenticated();

         if (response?.success && response.user) {
            setCurrentUser(response.user);
            setIsAuth(true);
            setError(null);
         } else {
            setCurrentUser(null);
            setIsAuth(false);
            setError(response?.message || "Authentication failed");
         }
      } catch (err) {
         console.error("Error fetching user data:", err);
         setError("Failed to verify authentication");
         setCurrentUser(null);
         setIsAuth(false);
      } finally {
         setIsLoading(false);
      }
   };

   useEffect(() => {
      // Call isAuthenticated when the user first lands on the website
      fetchUserData();
   }, []);

   const refreshUserData = async () => {
      await fetchUserData();
   };

   // Derived state from user data
   const cartItemsCount = currentUser?.cart?.length || 0;
   const wishlistItemsCount = currentUser?.wishlist?.length || 0;
   const hasNotifications = currentUser?.notifications?.length > 0;

   const authValues = {
      isAuthenticated: isAuth,
      isLoading,
      error,
      currentUser,
      cartItemsCount,
      wishlistItemsCount,
      hasNotifications,
      refreshUserData,
      logout: () => {
         setCurrentUser(null);
         setIsAuth(false);
      }
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