import { clerkClient } from "@clerk/express";
import { User } from "../models/user.model.js";

export const isAuthenticated = async (req, res) => {
   try {
      const userId = req.userId;

      let user = await User.findOne({ clerkId: userId });

      const clerkUser = await clerkClient.users.getUser(userId);

      if (user) {
         // User exists, return user data
         return res.status(200).json({
            success: true,
            message: "User is authenticated",
            user
         });
      } else {
         const fullName = req.body?.fullName || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
         const email = req.body?.email || clerkUser.emailAddresses[0]?.emailAddress;

         // Validate required fields
         if (!fullName || fullName.length < 3) {
            return res.status(400).json({
               success: false,
               message: "Valid full name is required",
               isNewUser: true
            });
         }

         if (!email) {
            return res.status(400).json({
               success: false,
               message: "Email is required",
               isNewUser: true
            });
         }

         // Create new user
         user = new User({
            clerkId: userId,
            fullName,
            email,
         });

         // Save the new user
         await user.save();

         return res.status(201).json({
            success: true,
            message: "User created successfully",
            user
         });
      }
   } catch (error) {
      console.error("Authentication controller error:", error);

      // Check for specific error types
      if (error.name === 'ValidationError') {
         return res.status(400).json({
            success: false,
            message: "Validation Error",
            errors: error.errors
         });
      }

      if (error.code === 11000) {
         return res.status(409).json({
            success: false,
            message: "User with this email or phone already exists"
         });
      }

      return res.status(500).json({
         success: false,
         message: "Internal Server Error"
      });
   }
};