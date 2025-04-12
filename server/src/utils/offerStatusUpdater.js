import cron from "node-cron";
import { Offer } from "../models/offer.model";

cron.schedule("* * * * *", async () => { 
  const now = new Date();

  try {
    // Activate ongoing offers
    await Offer.updateMany(
      { startDate: { $lte: now }, endDate: { $gte: now } },
      { $set: { isActive: true } }
    );

    // Deactivate expired or upcoming offers
    await Offer.updateMany(
      {
        $or: [
          { startDate: { $gt: now } },
          { endDate: { $lt: now } }
        ]
      },
      { $set: { isActive: false } }
    );

    console.log(`[CRON] Offer status updated at ${now.toISOString()}`);
  } catch (error) {
    console.error("[CRON] Error updating offer status:", error);
  }
});
