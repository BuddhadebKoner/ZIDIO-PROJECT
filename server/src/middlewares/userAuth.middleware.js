import { clerkClient } from "@clerk/express";

export const userAuth = async (req, res, next) => {
   try {
      const userId = req.auth.userId;

      if (!userId) {
         return res.status(401).json({
            success: false,
            message: "Unauthorized: Authentication required"
         });
      }

      const response = await clerkClient.users.getUser(userId);

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