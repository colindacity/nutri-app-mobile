export const MOODS = {
  calm: { gradient: ['#7DD3C0', '#4ECDC4'], eyeY: 0, mouth: 4 },
  happy: { gradient: ['#FFD93D', '#F6B93B'], eyeY: -1, mouth: 6 },
  excited: { gradient: ['#FF8A5B', '#FF6B6B'], eyeY: -2, mouth: 8, bounce: true },
  thinking: { gradient: ['#A8D8EA', '#7EC8E3'], eyeY: -2, mouth: 0, pulse: true },
  supportive: { gradient: ['#DDA0DD', '#DA70D6'], eyeY: 0, mouth: 5 },
  proud: { gradient: ['#98D8AA', '#5CDB95'], eyeY: -1, mouth: 7 },
  welcome: { gradient: ['#FF9A9E', '#FECFEF'], eyeY: -1, mouth: 7 },
};

export const ACTIVITY_LEVELS = {
  sedentary: { label: 'Sedentary', desc: 'Desk job', mult: 1.2 },
  light: { label: 'Light', desc: '1-3x/week exercise', mult: 1.375 },
  moderate: { label: 'Moderate', desc: '3-5x/week', mult: 1.55 },
  active: { label: 'Very Active', desc: '6-7x/week', mult: 1.725 },
};

export const GOALS = {
  lose_fast: { label: 'Lose faster', deficit: 750 },
  lose: { label: 'Lose weight', deficit: 500 },
  maintain: { label: 'Maintain', deficit: 0 },
  gain: { label: 'Build muscle', deficit: -500 },
};

export const CHECK_IN_FLOWS = {
  progress: {
    title: 'Progress Check-In',
    mood: 'supportive',
    steps: [
      {
        q: "How are you feeling about progress?",
        opts: [
          { text: "Frustrated", val: 'frustrated' },
          { text: "Okay", val: 'okay' },
          { text: "Good", val: 'good' },
          { text: "Great!", val: 'great' }
        ]
      }
    ]
  },
  craving: {
    title: 'Craving SOS',
    mood: 'calm',
    steps: [
      {
        q: "What's pulling at you?",
        opts: [
          { text: "Something sweet", val: 'sweet' },
          { text: "Something salty", val: 'salty' },
          { text: "Just want to eat", val: 'emotional' }
        ]
      }
    ]
  },
  guilt: {
    title: "Let's Talk",
    mood: 'supportive',
    steps: [
      {
        q: "What happened?",
        opts: [
          { text: "Ate way more than planned", val: 'overate' },
          { text: "Binged", val: 'binge' }
        ]
      }
    ]
  },
};

export const COIN_REWARDS = {
  onboarding: 10,
  logFood: 5,
  confirmFood: 5,
  checkIn: 10,
  dailyGoal: 20,
  weeklyGoal: 50,
};

export const SAMPLE_FOODS = [
  { name: 'Chicken breast (6oz)', cal: 300, protein: 55, carbs: 0, fat: 6 },
  { name: 'Brown rice (1 cup)', cal: 220, protein: 5, carbs: 45, fat: 2 },
  { name: 'Avocado (half)', cal: 120, protein: 2, carbs: 6, fat: 11 },
  { name: 'Greek yogurt', cal: 150, protein: 15, carbs: 20, fat: 0 },
  { name: 'Protein shake', cal: 160, protein: 30, carbs: 8, fat: 3 },
  { name: 'Banana', cal: 105, protein: 1, carbs: 27, fat: 0 },
  { name: 'Almonds (1oz)', cal: 165, protein: 6, carbs: 6, fat: 14 },
  { name: 'Eggs (2)', cal: 140, protein: 12, carbs: 1, fat: 10 },
];