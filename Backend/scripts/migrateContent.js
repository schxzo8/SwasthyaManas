require("dotenv").config();
const mongoose = require("mongoose");
const Content = require("../models/Content");

function mapOldCategory(category) {
  // pages
  if (["about", "services", "faq", "meditation"].includes(category)) {
    return { contentType: "page", pageType: category, topic: null };
  }

  // blog
  if (category === "blog") {
    return { contentType: "blog", pageType: null, topic: null };
  }

  // resource
  if (category === "resource") {
    return { contentType: "resource", pageType: null, topic: null };
  }

  // fallback
  return { contentType: "resource", pageType: null, topic: null };
}

async function run() {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error("❌ MONGO_URI missing in .env");
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");

  const all = await Content.find({});
  console.log(`Found ${all.length} content docs`);

  let updated = 0;
  let skipped = 0;

  for (const doc of all) {
    // ✅ idempotent: only migrate if new fields are missing
    if (doc.contentType) {
      skipped++;
      continue;
    }

    const mapped = mapOldCategory(doc.category);

    doc.contentType = mapped.contentType;
    doc.pageType = mapped.pageType;
    doc.topic = mapped.topic;

    await doc.save();
    updated++;
  }

  console.log("---- Migration Summary ----");
  console.log("Updated:", updated);
  console.log("Skipped:", skipped);

  await mongoose.disconnect();
  console.log("✅ Done");
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
