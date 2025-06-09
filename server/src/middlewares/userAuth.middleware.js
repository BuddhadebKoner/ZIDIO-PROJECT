import { clerkClient } from "@clerk/express";

export const userAuth = async (req, res, next) => {
   try {
      // console.log('UserAuth middleware - Headers:', req.headers);
      // console.log('UserAuth middleware - Auth object:', req.auth);
      
      // Check for userId from Clerk middleware
      let userId = req.auth?.userId;

      // If no userId from Clerk middleware, try to extract from Authorization header
      if (!userId) {
         const authHeader = req.headers.authorization;
         console.log('UserAuth middleware - Authorization header:', authHeader);
         
         if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            console.log('UserAuth middleware - Extracted token:', token ? 'Present' : 'Not present');
            
            try {
               // Verify the token with Clerk
               const session = await clerkClient.verifyToken(token);
               userId = session.sub;
               console.log('UserAuth middleware - Token verified, userId:', userId);
            } catch (tokenError) {
               console.error('UserAuth middleware - Token verification failed:', tokenError);
               return res.status(401).json({
                  success: false,
                  message: "Invalid token"
               });
            }
         }
      }

      if (!userId) {
         console.log('UserAuth middleware - No userId found');
         return res.status(401).json({
            success: false,
            message: "Unauthorized: Authentication required"
         });
      }

      // console.log('UserAuth middleware - Attempting to get user with ID:', userId);
      const response = await clerkClient.users.getUser(userId);
      // console.log('UserAuth middleware - Clerk response:', response.id);

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