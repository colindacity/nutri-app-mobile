import { ACTIVITY_LEVELS, GOALS } from '../constants/data';

export const calcBMR = (weight, height, age, sex) => {
  const kg = weight * 0.453592;
  const cm = height * 2.54;
  if (sex === 'male') {
    return 10 * kg + 6.25 * cm - 5 * age + 5;
  } else {
    return 10 * kg + 6.25 * cm - 5 * age - 161;
  }
};

export const calcGoals = (user) => {
  if (!user?.weight) {
    return { cal: 2000, protein: 150, carbs: 200, fat: 67 };
  }

  const bmr = calcBMR(user.weight, user.height, user.age, user.sex);
  const tdee = bmr * (ACTIVITY_LEVELS[user.activity]?.mult || 1.55);
  const cal = Math.round(tdee - (GOALS[user.goal]?.deficit || 0));
  const protein = Math.round(user.weight * 1.0);
  const fat = Math.round(cal * 0.27 / 9);
  const carbs = Math.round((cal - protein * 4 - fat * 9) / 4);

  return { cal, protein, carbs, fat };
};

export const sumNutrients = (foods, confirmedOnly = false) => {
  const list = confirmedOnly ? foods.filter(f => f.confirmed) : foods;
  return list.reduce((acc, food) => ({
    cal: acc.cal + (food.cal || 0),
    protein: acc.protein + (food.protein || 0),
    carbs: acc.carbs + (food.carbs || 0),
    fat: acc.fat + (food.fat || 0),
  }), { cal: 0, protein: 0, carbs: 0, fat: 0 });
};

export const getDateKey = (date) => {
  return date.toISOString().split('T')[0];
};

export const getMealTimeColor = (time) => {
  switch (time) {
    case 'B': return '#FFD93D';
    case 'L': return '#4ECDC4';
    case 'D': return '#95E77E';
    case 'S': return '#FF6B6B';
    default: return '#007AFF';
  }
};

export const getMealTimeLabel = (time) => {
  switch (time) {
    case 'B': return 'Breakfast';
    case 'L': return 'Lunch';
    case 'D': return 'Dinner';
    case 'S': return 'Snack';
    default: return 'Meal';
  }
};