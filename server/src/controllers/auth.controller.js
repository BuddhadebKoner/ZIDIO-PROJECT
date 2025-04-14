import { clerkClient } from "@clerk/express";
import { User } from "../models/user.model.js";

// Move avatars array outside the function for better efficiency
export const avatars = [
   {
      id: 1,
      name: 'IM',
      url: 'https://res.cloudinary.com/db4jch8sj/image/upload/v1744524375/IM_tjtzqd.png',
   },
   {
      id: 2,
      name: 'BW',
      url: 'https://res.cloudinary.com/db4jch8sj/image/upload/v1744524380/BW_z9m0rt.png',
   },
   {
      id: 3,
      name: 'CA',
      url: 'https://res.cloudinary.com/db4jch8sj/image/upload/v1744524377/CA_ti8tsm.png',
   },
   {
      id: 4,
      name: 'SM',
      url: 'https://res.cloudinary.com/db4jch8sj/image/upload/v1744524376/SM_m3yerj.png',
   },
];

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
            avatar: randomAvatar.url,
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