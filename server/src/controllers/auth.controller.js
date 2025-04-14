import { clerkClient } from "@clerk/express";
import { User } from "../models/user.model.js";
import { avatars } from "../constant.js";


export const isAuthenticated = async (req, res) => {
   try {
      const userId = req.userId;

      let user = await User.findOne({ clerkId: userId });

      const clerkUser = await clerkClient.users.getUser(userId);
      
      // console.log("Clerk User:", clerkUser.publicMetadata);
      const isClerkAdmin = clerkUser.publicMetadata && clerkUser.publicMetadata.role === 'admin';

      if (user) {
         if (isClerkAdmin && user.role !== 'admin') {
            user.role = 'admin';
            await user.save();
         }
         
         // User exists, return user data
         return res.status(200).json({
            success: true,
            message: "User is authenticated",
            user
         });
      } else {
         const fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
         const email = clerkUser.emailAddresses[0]?.emailAddress;

         if (!email) {
            return res.status(400).json({
               success: false,
               message: "Email is required",
               isNewUser: true
            });
         }

         const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

         user = new User({
            clerkId: userId,
            fullName,
            email,
            role: isClerkAdmin ? "admin" : "user", 
            avatar: randomAvatar.name,
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
      return res.status(500).json({
         success: false,
         message: "Internal server error",
         error: error.message
      });
   }
};