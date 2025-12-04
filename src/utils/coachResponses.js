export const getProgressResponse = (responses, stats) => {
  const response = responses[0];

  if (response === 'frustrated') {
    return {
      msg: `Weight loss isn't linear. You've been consistent for ${stats.streak || 7} days. That matters.`,
      tip: "Focus on non-scale wins: energy, clothes fit, strength.",
      mood: 'supportive'
    };
  }

  if (response === 'good' || response === 'great') {
    return {
      msg: "That's what I like to hear! Keep protein high.",
      tip: "You're doing great!",
      mood: 'proud'
    };
  }

  return {
    msg: "Every day you show up matters.",
    tip: "Small consistent actions beat sporadic perfection.",
    mood: 'calm'
  };
};

export const getCravingResponse = (responses) => {
  const response = responses[0];

  const tips = {
    sweet: {
      msg: "Sweet cravings often signal low energy.",
      tip: "Try protein shake with cocoa, Greek yogurt, or dark chocolate.",
      mood: 'calm'
    },
    salty: {
      msg: "Salty cravings can mean stress.",
      tip: "Pickles, seaweed snacks, or popcorn work well.",
      mood: 'calm'
    },
    emotional: {
      msg: "Emotional hunger is human.",
      tip: "What's actually going on? Try addressing the root.",
      mood: 'supportive'
    },
  };

  return tips[response] || tips.emotional;
};

export const getGuiltResponse = (responses) => {
  const response = responses[0];

  if (response === 'binge') {
    return {
      msg: "Thank you for being here. That takes courage.",
      tip: "Drink water, take a walk, be gentle. Tomorrow isn't punishment day.",
      mood: 'supportive'
    };
  }

  return {
    msg: "One meal is a tiny blip. What matters is weeks.",
    tip: "Log it, then close the app. No guilt.",
    mood: 'supportive'
  };
};