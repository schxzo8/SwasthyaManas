require("dotenv").config();
const mongoose = require("mongoose");
const Assessment = require("../models/Assessment");

const OPTIONS = [
  { label: "Not at all", value: 0 },
  { label: "Several days", value: 1 },
  { label: "More than half the days", value: 2 },
  { label: "Nearly every day", value: 3 },
];

const PHQ9 = {
  name: "PHQ-9",
  description:
    "Over the last 2 weeks, how often have you been bothered by any of the following problems?",
  maxScore: 27,
  questions: [
    { text: "Little interest or pleasure in doing things", options: OPTIONS },
    { text: "Feeling down, depressed, or hopeless", options: OPTIONS },
    { text: "Trouble falling or staying asleep, or sleeping too much", options: OPTIONS },
    { text: "Feeling tired or having little energy", options: OPTIONS },
    { text: "Poor appetite or overeating", options: OPTIONS },
    {
      text:
        "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
      options: OPTIONS,
    },
    {
      text:
        "Trouble concentrating on things, such as reading the newspaper or watching television",
      options: OPTIONS,
    },
    {
      text:
        "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual",
      options: OPTIONS,
    },
    {
      text: "Thoughts that you would be better off dead or of hurting yourself in some way",
      options: OPTIONS,
    },
  ],
};

const GAD7 = {
  name: "GAD-7",
  description:
    "Over the last 2 weeks, how often have you been bothered by the following problems?",
  maxScore: 21,
  questions: [
    { text: "Feeling nervous, anxious, or on edge", options: OPTIONS },
    { text: "Not being able to stop or control worrying", options: OPTIONS },
    { text: "Worrying too much about different things", options: OPTIONS },
    { text: "Trouble relaxing", options: OPTIONS },
    { text: "Being so restless that it is hard to sit still", options: OPTIONS },
    { text: "Becoming easily annoyed or irritable", options: OPTIONS },
    { text: "Feeling afraid, as if something awful might happen", options: OPTIONS },
  ],
};


async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Seed PHQ-9
    await Assessment.updateOne(
      { name: "PHQ-9" },
      { $set: PHQ9 },
      { upsert: true }
    );

    console.log("✅ PHQ-9 seeded successfully");

    // Seed GAD-7
    await Assessment.updateOne(
      { name: "GAD-7" },
      { $set: GAD7 },
      { upsert: true }
    );

    console.log("✅ GAD-7 seeded successfully");

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
}


run();
