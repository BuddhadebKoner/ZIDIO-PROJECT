import { getAuth } from "@clerk/express";

export const userAuth = async (req, res, next) => {
   try {
      const { userId } = getAuth(req);

      // if (!userId) {
      //    return res.status(401).json({
      //       success: false,
      //       message: "Unauthorized: Authentication required"
      //    });
      // }

      // Store userId in request for use in controllers  
      req.userId = userId;
      next();
   } catch (error) {
      console.error("Authentication middleware error:", error);
      return res.status(401).json({
         success: false,
         message: "Authentication failed"
      });
   }
};