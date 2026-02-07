// server/utils/aiReplies.js

export function fallbackChatReply() {
  const replies = [
    "Hey! 👋 What did you eat today?",
    "Got it 👍 Tell me your meal (example: 100g rice).",
    "Alright! What food should I log?",
    "I’m here 😄 Just tell me what you ate.",
    "Cool! What’s on your plate today?",
  ];

  return replies[Math.floor(Math.random() * replies.length)];
}

export function foodLoggedReply(items = []) {
  if (!items.length) return "Food logged ✅";

  if (items.length === 1) {
    return `Logged ${items[0].quantity_g || 100}g of ${items[0].name} ✅`;
  }

  return `Logged ${items.length} items successfully 💪`;
}

export function deleteLogReply() {
  const replies = [
    "Last food entry removed 🗑️",
    "Done! I removed the last log.",
    "Gone 👍 Last entry deleted.",
  ];

  return replies[Math.floor(Math.random() * replies.length)];
}

export function profileUpdatedReply(profile = {}) {
  const keys = Object.keys(profile);

  if (!keys.length) {
    return "Your profile has been updated 👍";
  }

  return `Updated your ${keys.join(", ")} ✨`;
}
