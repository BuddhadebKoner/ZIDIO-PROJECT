import { Webhook } from "svix";
import { User } from "../models/user.model.js";

export const clerkWebhook = async (req, res) => {
   try {
      const whook = new Webhook(process.env.CLERK_SECRET_KEY);
      await whook.verify(JSON.stringify(req.body), {
         "svix-id": req.headers["svix-id"],
         "svix-timestamp": req.headers["svix-timestamp"],
         "svix-signature": req.headers["svix-signature"]
      })
      const { data, type } = req.body;

      switch (type) {
         case "user.created": {
            const userData = {
               clerkId: data.id,
               email: data.email_addresses[0].email_address,
               fullName: data.first_name + " " + data.last_name,
               avatar: data.image_url || "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg",
            }
            await User.create(userData);
            res.json({})

            break;
         }
         case "user.updated": {
            const userData = {
               email: data.email_addresses[0].email_address,
               fullName: data.first_name + " " + data.last_name,
               avatar: data.image_url || "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg",
            }
            await User.findOneAndUpdate({ clerkId: data.id }, userData);
            res.json({})
            break;
         }
         case "user.deleted": {
            await User.findOneAndDelete({ clerkId: data.id });
            res.json({})
            break;
         }

         default:
            break;
      }
   } catch (error) {
      res.json({ success: false, message: error.message })
   }
};