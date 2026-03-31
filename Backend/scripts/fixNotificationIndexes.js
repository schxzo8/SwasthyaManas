require("dotenv").config();
const mongoose = require("mongoose");

async function fixNotificationIndexes() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    
    const db = mongoose.connection.db;
    const notificationsCollection = db.collection("notifications");

    console.log("Dropping old indexes...");
    try {
      await notificationsCollection.dropIndex("user_1_type_1_meta.requestId_1");
      console.log("✓ Dropped user_1_type_1_meta.requestId_1");
    } catch (e) {
      console.log("  (Index not found, that's ok)");
    }

    try {
      await notificationsCollection.dropIndex("user_1_type_1_meta.appointmentId_1");
      console.log("✓ Dropped user_1_type_1_meta.appointmentId_1");
    } catch (e) {
      console.log("  (Index not found, that's ok)");
    }

    // Remove duplicate notifications with null appointmentId
    console.log("\nRemoving duplicate notifications with null meta fields...");
    
    // For each (user, type) combo with null requestId/appointmentId, keep only the newest one
    const pipeline = [
      {
        $match: {
          $or: [
            { "meta.requestId": null },
            { "meta.appointmentId": null }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: { user: "$user", type: "$type" },
          keep: { $first: "$_id" },
          all: { $push: "$_id" }
        }
      },
      {
        $project: {
          remove: {
            $filter: {
              input: "$all",
              as: "id",
              cond: { $ne: ["$$id", "$keep"] }
            }
          }
        }
      }
    ];

    const groups = await notificationsCollection.aggregate(pipeline).toArray();
    let removedCount = 0;

    for (const group of groups) {
      if (group.remove.length > 0) {
        const result = await notificationsCollection.deleteMany({
          _id: { $in: group.remove }
        });
        removedCount += result.deletedCount;
      }
    }

    console.log(`✓ Removed ${removedCount} duplicate notifications`);

    // Now recreate the sparse unique indexes
    console.log("\nCreating new sparse unique indexes...");
    
    await notificationsCollection.createIndex(
      { user: 1, type: 1, "meta.requestId": 1 },
      { unique: true, sparse: true, background: true }
    );
    console.log("✓ Created user_1_type_1_meta.requestId_1 (sparse, unique)");

    await notificationsCollection.createIndex(
      { user: 1, type: 1, "meta.appointmentId": 1 },
      { unique: true, sparse: true, background: true }
    );
    console.log("✓ Created user_1_type_1_meta.appointmentId_1 (sparse, unique)");

    console.log("\n✅ Notification indexes fixed successfully!");
    
  } catch (error) {
    console.error("❌ Error fixing indexes:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

fixNotificationIndexes();
