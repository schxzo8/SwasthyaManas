// Mindfulness prompts and affirmations
const mindfulnessPrompts = [
  {
    id: 1,
    type: "affirmation",
    text: "I am capable of handling whatever comes my way.",
    icon: "💪",
  },
  {
    id: 2,
    type: "affirmation",
    text: "This moment is an opportunity to start fresh.",
    icon: "🌟",
  },
  {
    id: 3,
    type: "affirmation",
    text: "I choose peace and calmness in this moment.",
    icon: "☮️",
  },
  {
    id: 4,
    type: "breathing",
    text: "Take 4 deep breaths: In for 4 counts, hold for 4, out for 4.",
    icon: "🫁",
  },
  {
    id: 5,
    type: "affirmation",
    text: "My mental health matters and I am taking care of it.",
    icon: "💚",
  },
  {
    id: 6,
    type: "grounding",
    text: "Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.",
    icon: "🌍",
  },
  {
    id: 7,
    type: "affirmation",
    text: "I am growing stronger every day.",
    icon: "🌱",
  },
  {
    id: 8,
    type: "affirmation",
    text: "It's okay to not be okay, and it's okay to ask for help.",
    icon: "🤝",
  },
  {
    id: 9,
    type: "body-scan",
    text: "Relax each part of your body from head to toe for 2 minutes.",
    icon: "🧘",
  },
  {
    id: 10,
    type: "affirmation",
    text: "I am worthy of love and respect, including from myself.",
    icon: "👑",
  },
  {
    id: 11,
    type: "affirmation",
    text: "My progress, no matter how small, is still progress.",
    icon: "📈",
  },
  {
    id: 12,
    type: "gratitude",
    text: "Think of 3 things, no matter how small, that you're grateful for today.",
    icon: "🙏",
  },
  {
    id: 13,
    type: "affirmation",
    text: "I am in control of my thoughts and emotions.",
    icon: "🧠",
  },
  {
    id: 14,
    type: "affirmation",
    text: "This too shall pass. I am resilient.",
    icon: "🌈",
  },
  {
    id: 15,
    type: "mindfulness",
    text: "Observe 3 things without judgment: what you see, hear, and feel.",
    icon: "👁️",
  },
  {
    id: 16,
    type: "affirmation",
    text: "I am enough just as I am.",
    icon: "✨",
  },
  {
    id: 17,
    type: "affirmation",
    text: "I deserve rest and relaxation.",
    icon: "🛌",
  },
  {
    id: 18,
    type: "movement",
    text: "Stand up and do 10 gentle stretches or a quick walk.",
    icon: "🚶",
  },
  {
    id: 19,
    type: "affirmation",
    text: "Every challenge is an opportunity to learn and grow.",
    icon: "🎓",
  },
  {
    id: 20,
    type: "affirmation",
    text: "I choose to focus on what I can control.",
    icon: "⚙️",
  },
];

/**
 * Get a random mindfulness prompt
 * @returns {Object} Random prompt object
 */
const getRandomPrompt = () => {
  return mindfulnessPrompts[Math.floor(Math.random() * mindfulnessPrompts.length)];
};

/**
 * Get prompt by type
 * @param {string} type - Prompt type (affirmation, breathing, grounding, etc.)
 * @returns {Object} Random prompt of requested type
 */
const getPromptByType = (type) => {
  const filtered = mindfulnessPrompts.filter((p) => p.type === type);
  return filtered[Math.floor(Math.random() * filtered.length)];
};

module.exports = {
  mindfulnessPrompts,
  getRandomPrompt,
  getPromptByType,
};
