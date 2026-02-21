// scripts/removeCategoryField.js
require("dotenv").config();
const mongoose = require("mongoose");
const Content = require("../models/Content");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected");

  const res = await Content.updateMany({}, { $unset: { category: "" } });
  console.log("✅ Unset category on:", res.modifiedCount);

  await mongoose.disconnect();
  console.log("✅ Done");
})();
