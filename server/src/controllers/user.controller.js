import { avatars } from "../constant.js";
import { User } from "../models/user.model.js";

export const updateAvatar = async (req, res) => {
   try {
      const userId = req.userId;

      // take the avatar from the body
      const { avatar } = req.body;
      if (!avatar) {
         return res.status(400).json({
            success: false,
            message: "Avatar is required"
         });
      }

      let user = await User.findOne({ clerkId: userId });
      if (!user) {
         return res.status(404).json({
            success: false,
            message: "User not found"
         });
      }

      // check avatar is in the avatars array
      const avatarExists = avatars.find(item => item.name === avatar);
      if (!avatarExists) {
         return res.status(400).json({
            success: false,
            message: "Avatar not found"
         });
      }

      // update the user avatar
      user.avatar = avatar;
      await user.save();

      return res.status(200).json({
         success: true,
         message: "Avatar updated successfully",
      });

   } catch (error) {
      return res.status(500).json({
         success: false,
         message: "Internal server error",
         error: error.message
      });
   }
};


export const updateUserDetails = async (req, res) => {
   try {
      const userId = req.userId;
      let user = await User.findOne({ clerkId: userId });
      if (!user) {
         return res.status(404).json({
            success: false,
            message: "User not found"
         });
      }

      const { fullName, phone } = req.body;
      if (!fullName && !phone) {
         return res.status(400).json({
            success: false,
            message: "Fullname or phone number is required to update"
         });
      }

      if (!user.profileUpdates) {
         user.profileUpdates = [];
      }

      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      user.profileUpdates = user.profileUpdates.filter(timestamp => new Date(timestamp) > twentyFourHoursAgo);

      if (user.profileUpdates.length >= 3) {
         return res.status(429).json({
            success: false,
            message: "Profile update limit reached. Please try again later."
         });
      }

      if (fullName) {
         user.fullName = fullName;
      }
      if (phone) {
         user.phone = phone;
      }

      user.profileUpdates.push(now);

      await user.save();

      return res.status(200).json({
         success: true,
         message: "User updated successfully",
      });
   } catch (error) {
      return res.status(500).json({
         success: false,
         message: "Internal server error",
         error: error.message
      });
   }
}
