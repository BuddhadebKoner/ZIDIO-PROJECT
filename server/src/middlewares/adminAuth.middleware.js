import { clerkClient } from "@clerk/express";

export const adminAuth = async (req, res, next) => {
   try {
      const userId = req.auth.userId;

      if (!userId) {
         return res.status(401).json({ success: false, message: "User ID is required" });
      }

      const response = await clerkClient.users.getUser(userId);

      if (response.publicMetadata.role !== 'admin') {
         return res.status(403).json({ success: false, message: "You are not authorized" });
      }

      // Store userId in request for use in controllers
      req.userId = userId;
      next();

   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
}