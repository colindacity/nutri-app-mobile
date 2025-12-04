import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  FlatList,
  SafeAreaView,
} from 'react-native';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';
import { colors, spacing, typography } from '../constants/theme';

const { width: screenWidth } = Dimensions.get('window');

const DayScreen = () => {
  const [selectedDate] = useState(new Date());
  const [meals, setMeals] = useState([
    { id: '1', name: 'Oatmeal with berries', calories: 320, protein: 12, time: 'B', timestamp: '8:30 AM' },
    { id: '2', name: 'Grilled chicken salad', calories: 450, protein: 35, time: 'L', timestamp: '12:30 PM' },
    { id: '3', name: 'Greek yogurt', calories: 150, protein: 15, time: 'S', timestamp: '3:00 PM' },
    { id: '4', name: 'Salmon with veggies', calories: 520, protein: 42, time: 'D', timestamp: '7:00 PM' },
  ]);

  const [dailyGoals] = useState({
    calories: 2200,
    protein: 150,
    carbs: 275,
    fat: 73,
    fiber: 28,
    sugar: 50,
    sodium: 2300,
  });

  const consumed = {
    calories: meals.reduce((sum, meal) => sum + meal.calories, 0),
    protein: meals.reduce((sum, meal) => sum + meal.protein, 0),
  };

  const swipeAnim = useRef(new Animated.Value(0)).current;
  const [showAdvanced, setShowAdvanced] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0 && !showAdvanced) {
          swipeAnim.setValue(Math.max(gestureState.dx, -screenWidth));
        } else if (gestureState.dx > 0 && showAdvanced) {
          swipeAnim.setValue(Math.min(gestureState.dx - screenWidth, 0));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -50 && !showAdvanced) {
          Animated.spring(swipeAnim, {
            toValue: -screenWidth,
            useNativeDriver: true,
          }).start();
          setShowAdvanced(true);
        } else if (gestureState.dx > 50 && showAdvanced) {
          Animated.spring(swipeAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          setShowAdvanced(false);
        } else {
          Animated.spring(swipeAnim, {
            toValue: showAdvanced ? -screenWidth : 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const CalorieRing = ({ consumed, goal, size = 140 }) => {
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = Math.min(consumed / goal, 1);
    const strokeDashoffset = circumference - progress * circumference;

    return (
      <View style={{ alignItems: 'center' }}>
        <Svg width={size} height={size}>
          <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
            <Circle
              stroke={colors.borderLight}
              fill="none"
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={strokeWidth}
            />
            <Circle
              stroke={colors.calories}
              fill="none"
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </G>
          <SvgText
            x={size / 2}
            y={size / 2 - 10}
            fontSize="28"
            fontWeight="bold"
            textAnchor="middle"
            fill={colors.text}
          >
            {consumed}
          </SvgText>
          <SvgText
            x={size / 2}
            y={size / 2 + 15}
            fontSize="14"
            textAnchor="middle"
            fill={colors.textSecondary}
          >
            / {goal} cal
          </SvgText>
        </Svg>
        <Text style={styles.remaining}>
          {goal - consumed} remaining
        </Text>
      </View>
    );
  };

  const ProteinBar = ({ consumed, goal }) => {
    const progress = Math.min((consumed / goal) * 100, 100);

    return (
      <View style={styles.proteinContainer}>
        <View style={styles.proteinHeader}>
          <Text style={styles.proteinLabel}>Protein</Text>
          <Text style={styles.proteinValue}>{consumed}g / {goal}g</Text>
        </View>
        <View style={styles.proteinBarBg}>
          <Animated.View
            style={[
              styles.proteinBarFill,
              { width: `${progress}%` },
            ]}
          />
        </View>
      </View>
    );
  };

  const MealItem = ({ meal }) => (
    <TouchableOpacity style={styles.mealItem} activeOpacity={0.7}>
      <View style={styles.mealLeft}>
        <View style={[styles.mealBadge, { backgroundColor: getMealColor(meal.time) }]}>
          <Text style={styles.mealBadgeText}>{meal.time}</Text>
        </View>
        <View style={styles.mealInfo}>
          <Text style={styles.mealName} numberOfLines={1}>{meal.name}</Text>
          <Text style={styles.mealTime}>{meal.timestamp}</Text>
        </View>
      </View>
      <View style={styles.mealRight}>
        <Text style={styles.mealCalories}>{meal.calories}</Text>
        <Text style={styles.mealProtein}>{meal.protein}g</Text>
      </View>
    </TouchableOpacity>
  );

  const getMealColor = (time) => {
    switch (time) {
      case 'B': return '#FFD93D';
      case 'L': return '#4ECDC4';
      case 'D': return '#95E77E';
      case 'S': return '#FF6B6B';
      default: return colors.primary;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Text style={styles.dateText}>Today</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.weekToggle}>Week</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.metricsCard,
            {
              transform: [{ translateX: swipeAnim }],
            },
          ]}
        >
          <View style={styles.metricsRow}>
            <View style={styles.primaryMetrics}>
              <CalorieRing consumed={consumed.calories} goal={dailyGoals.calories} />
              <ProteinBar consumed={consumed.protein} goal={dailyGoals.protein} />
            </View>

            <View style={[styles.advancedMetrics, { left: screenWidth }]}>
              <Text style={styles.advancedTitle}>Detailed Macros</Text>
              <MacroRow label="Carbs" value={120} goal={dailyGoals.carbs} color={colors.carbs} />
              <MacroRow label="Fat" value={45} goal={dailyGoals.fat} color={colors.fat} />
              <MacroRow label="Fiber" value={18} goal={dailyGoals.fiber} color={colors.success} />
              <MacroRow label="Sugar" value={25} goal={dailyGoals.sugar} color={colors.warning} />
              <MacroRow label="Sodium" value={1200} goal={dailyGoals.sodium} color={colors.primary} unit="mg" />
            </View>
          </View>

          {!showAdvanced && (
            <Text style={styles.swipeHint}>Swipe for more →</Text>
          )}
        </Animated.View>

        <View style={styles.mealsSection}>
          <View style={styles.mealsSectionHeader}>
            <Text style={styles.mealsSectionTitle}>Today's Meals</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          {meals.map((meal) => (
            <MealItem key={meal.id} meal={meal} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const MacroRow = ({ label, value, goal, color, unit = 'g' }) => {
  const progress = Math.min((value / goal) * 100, 100);

  return (
    <View style={styles.macroRow}>
      <Text style={styles.macroLabel}>{label}</Text>
      <View style={styles.macroBarContainer}>
        <View style={styles.macroBarBg}>
          <View style={[styles.macroBarFill, { width: `${progress}%`, backgroundColor: color }]} />
        </View>
        <Text style={styles.macroValue}>{value}{unit}/{goal}{unit}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  dateText: {
    ...typography.headline,
    color: colors.text,
  },
  weekToggle: {
    ...typography.body,
    color: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  metricsCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  metricsRow: {
    flexDirection: 'row',
    width: screenWidth * 2,
  },
  primaryMetrics: {
    width: screenWidth - (spacing.md * 2) - (spacing.lg * 2),
    alignItems: 'center',
  },
  advancedMetrics: {
    position: 'absolute',
    width: screenWidth - (spacing.md * 2) - (spacing.lg * 2),
    paddingLeft: spacing.md,
  },
  advancedTitle: {
    ...typography.headline,
    color: colors.text,
    marginBottom: spacing.md,
  },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  macroLabel: {
    ...typography.subheadline,
    color: colors.textSecondary,
    width: 60,
  },
  macroBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  macroBarBg: {
    flex: 1,
    height: 20,
    backgroundColor: colors.borderLight,
    borderRadius: 10,
    marginRight: spacing.sm,
  },
  macroBarFill: {
    height: 20,
    borderRadius: 10,
  },
  macroValue: {
    ...typography.caption1,
    color: colors.textSecondary,
    width: 80,
  },
  remaining: {
    ...typography.footnote,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  proteinContainer: {
    width: '100%',
    marginTop: spacing.lg,
  },
  proteinHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  proteinLabel: {
    ...typography.subheadline,
    color: colors.text,
  },
  proteinValue: {
    ...typography.subheadline,
    color: colors.protein,
    fontWeight: '600',
  },
  proteinBarBg: {
    height: 28,
    backgroundColor: colors.borderLight,
    borderRadius: 14,
    overflow: 'hidden',
  },
  proteinBarFill: {
    height: 28,
    backgroundColor: colors.protein,
    borderRadius: 14,
  },
  swipeHint: {
    ...typography.caption1,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  mealsSection: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  mealsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  mealsSectionTitle: {
    ...typography.title3,
    color: colors.text,
  },
  viewAll: {
    ...typography.subheadline,
    color: colors.primary,
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    height: 60,
  },
  mealLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mealBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  mealBadgeText: {
    ...typography.caption1,
    fontWeight: '600',
    color: colors.surface,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    ...typography.subheadline,
    color: colors.text,
    marginBottom: 2,
  },
  mealTime: {
    ...typography.caption2,
    color: colors.textTertiary,
  },
  mealRight: {
    alignItems: 'flex-end',
  },
  mealCalories: {
    ...typography.headline,
    color: colors.text,
  },
  mealProtein: {
    ...typography.caption1,
    color: colors.protein,
  },
});

export default DayScreen;