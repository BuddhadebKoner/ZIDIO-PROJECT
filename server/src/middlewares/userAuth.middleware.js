import { clerkClient } from "@clerk/express";

export const userAuth = async (req, res, next) => {
   try {
      console.log('UserAuth middleware - Headers:', req.headers);
      console.log('UserAuth middleware - Auth object:', req.auth);
      
      const userId = req.auth?.userId;

      if (!userId) {
         console.log('UserAuth middleware - No userId found');
         return res.status(401).json({
            success: false,
            message: "Unauthorized: Authentication required"
         });
      }

      console.log('UserAuth middleware - Attempting to get user with ID:', userId);
      const response = await clerkClient.users.getUser(userId);
      console.log('UserAuth middleware - Clerk response:', response.id);

      // Store userId in request for use in controllers  
      req.userId = response.id;
      next();
   } catch (error) {
      console.error("Authentication middleware error:", error);
      return res.status(401).json({
         success: false,
         message: "Authentication failed"
      });
   }
};