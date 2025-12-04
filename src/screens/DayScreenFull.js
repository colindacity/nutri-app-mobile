import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  SafeAreaView,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle, G } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../constants/theme';
import { COIN_REWARDS, SAMPLE_FOODS } from '../constants/data';
import { calcGoals, sumNutrients, getDateKey, getMealTimeColor } from '../utils/calculations';
import { Character, CharacterWithMessage } from '../components/Character';

const { width: screenWidth } = Dimensions.get('window');

const DayScreenFull = ({ user, onUpdateCoins }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [foods, setFoods] = useState([]);
  const [timeframe, setTimeframe] = useState('day'); // day, week, month
  const [viewMode, setViewMode] = useState('left'); // left, eaten, planned, total
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCharacter, setShowCharacter] = useState(null);
  const [loading, setLoading] = useState(false);

  const swipeAnim = useRef(new Animated.Value(0)).current;
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Load foods for selected date
  useEffect(() => {
    loadFoods();
  }, [selectedDate]);

  const loadFoods = async () => {
    try {
      const key = getDateKey(selectedDate);
      const stored = await AsyncStorage.getItem(`foods_${key}`);
      if (stored) {
        setFoods(JSON.parse(stored));
      } else {
        setFoods([]);
      }
    } catch (error) {
      console.error('Error loading foods:', error);
      setFoods([]);
    }
  };

  const saveFoods = async (newFoods) => {
    try {
      const key = getDateKey(selectedDate);
      await AsyncStorage.setItem(`foods_${key}`, JSON.stringify(newFoods));
    } catch (error) {
      console.error('Error saving foods:', error);
    }
  };

  const goals = calcGoals(user);
  const weeklyGoals = {
    cal: goals.cal * 7,
    protein: goals.protein * 7,
    carbs: goals.carbs * 7,
    fat: goals.fat * 7,
  };
  const monthlyGoals = {
    cal: goals.cal * 30,
    protein: goals.protein * 30,
    carbs: goals.carbs * 30,
    fat: goals.fat * 30,
  };

  const activeGoals = timeframe === 'day' ? goals : timeframe === 'week' ? weeklyGoals : monthlyGoals;

  const eaten = sumNutrients(foods, true);
  const planned = sumNutrients(foods.filter(f => !f.confirmed));
  const projected = sumNutrients(foods);

  const displayValue =
    viewMode === 'left' ? activeGoals.cal - projected.cal :
    viewMode === 'eaten' ? eaten.cal :
    viewMode === 'planned' ? planned.cal :
    projected.cal;

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

  const addFood = (food, isPlanned = false) => {
    const newFood = {
      ...food,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      time: getTimeOfDay(),
      confirmed: !isPlanned,
    };

    const newFoods = [...foods, newFood];
    setFoods(newFoods);
    saveFoods(newFoods);

    if (!isPlanned) {
      onUpdateCoins(COIN_REWARDS.logFood);
      showCharacterMessage('happy', 'Logged!', COIN_REWARDS.logFood);
    } else {
      showCharacterMessage('calm', 'Planned for later!');
    }
  };

  const confirmFood = (id) => {
    const newFoods = foods.map(f =>
      f.id === id ? { ...f, confirmed: true } : f
    );
    setFoods(newFoods);
    saveFoods(newFoods);

    onUpdateCoins(COIN_REWARDS.confirmFood);
    showCharacterMessage('happy', 'Nice!', COIN_REWARDS.confirmFood);
  };

  const deleteFood = (id) => {
    Alert.alert(
      'Delete Food',
      'Are you sure you want to remove this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const newFoods = foods.filter(f => f.id !== id);
            setFoods(newFoods);
            saveFoods(newFoods);
          },
        },
      ]
    );
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'B';
    if (hour < 15) return 'L';
    if (hour < 20) return 'D';
    return 'S';
  };

  const showCharacterMessage = (mood, message, coins = 0) => {
    setShowCharacter({ mood, message, coins });
    setTimeout(() => setShowCharacter(null), 2500);
  };

  const CalorieRing = ({ consumed, goal, size = 140 }) => {
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = Math.min(consumed / goal, 1);
    const strokeDashoffset = circumference - progress * circumference;

    const isOver = viewMode === 'left' && consumed > goal;

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
              stroke={isOver ? colors.danger : colors.primary}
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
        </Svg>
        <View style={[StyleSheet.absoluteFillObject, styles.ringCenter]}>
          <Text style={styles.ringValue}>{Math.round(Math.abs(displayValue)).toLocaleString()}</Text>
          <Text style={styles.ringLabel}>{viewMode}</Text>
        </View>
      </View>
    );
  };

  const ProteinBar = ({ consumed, goal }) => {
    const progress = Math.min((consumed / goal) * 100, 100);

    return (
      <View style={styles.proteinContainer}>
        <View style={styles.proteinHeader}>
          <Text style={styles.proteinLabel}>Protein</Text>
          <Text style={styles.proteinValue}>{Math.round(consumed)}g / {goal}g</Text>
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

  const MealItem = ({ food }) => (
    <TouchableOpacity
      style={styles.mealItem}
      activeOpacity={0.7}
      onLongPress={() => deleteFood(food.id)}
    >
      <View style={styles.mealLeft}>
        <View style={[styles.mealBadge, { backgroundColor: getMealTimeColor(food.time) }]}>
          <Text style={styles.mealBadgeText}>{food.time}</Text>
        </View>
        <View style={styles.mealInfo}>
          <Text style={styles.mealName} numberOfLines={1}>{food.name}</Text>
          <Text style={styles.mealTime}>
            {new Date(food.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
      <View style={styles.mealRight}>
        {!food.confirmed ? (
          <TouchableOpacity
            onPress={() => confirmFood(food.id)}
            style={styles.confirmButton}
          >
            <Ionicons name="checkmark-circle-outline" size={24} color={colors.warning} />
          </TouchableOpacity>
        ) : (
          <>
            <Text style={styles.mealCalories}>{food.cal}</Text>
            <Text style={styles.mealProtein}>{food.protein}g</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );

  const MacroRow = ({ label, value, goal, color, unit = 'g' }) => {
    const progress = Math.min((value / goal) * 100, 100);

    return (
      <View style={styles.macroRow}>
        <Text style={styles.macroLabel}>{label}</Text>
        <View style={styles.macroBarContainer}>
          <View style={styles.macroBarBg}>
            <View style={[styles.macroBarFill, { width: `${progress}%`, backgroundColor: color }]} />
          </View>
          <Text style={styles.macroValue}>
            {Math.round(value)}{unit}/{goal}{unit}
          </Text>
        </View>
      </View>
    );
  };

  // Week selector
  const today = new Date();
  const startWeek = new Date(today);
  startWeek.setDate(today.getDate() - today.getDay());
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startWeek);
    d.setDate(startWeek.getDate() + i);
    return d;
  });

  return (
    <SafeAreaView style={styles.container}>
      {showCharacter && (
        <CharacterWithMessage
          mood={showCharacter.mood}
          message={showCharacter.message}
          coins={showCharacter.coins}
        />
      )}

      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSelectedDate(new Date())}>
          <Text style={styles.dateText}>
            {selectedDate.toDateString() === today.toDateString() ? 'Today' :
             selectedDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
          </Text>
        </TouchableOpacity>
        <View style={styles.timeframeToggle}>
          {['day', 'week', 'month'].map(t => (
            <TouchableOpacity
              key={t}
              onPress={() => setTimeframe(t)}
              style={[styles.timeframeButton, timeframe === t && styles.timeframeActive]}
            >
              <Text style={[styles.timeframeText, timeframe === t && styles.timeframeActiveText]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Week selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weekSelector}>
        {weekDays.map((day, i) => {
          const isToday = day.toDateString() === today.toDateString();
          const isSelected = day.toDateString() === selectedDate.toDateString();
          return (
            <TouchableOpacity
              key={i}
              onPress={() => setSelectedDate(day)}
              style={[styles.dayButton, isSelected && styles.dayButtonActive]}
            >
              <Text style={[styles.dayButtonWeekday, isSelected && styles.dayButtonActiveText]}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'][day.getDay()]}
              </Text>
              <Text style={[
                styles.dayButtonDate,
                isSelected && styles.dayButtonActiveText,
                isToday && !isSelected && styles.dayButtonToday
              ]}>
                {day.getDate()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* View mode selector */}
        <View style={styles.viewModeSelector}>
          {['left', 'eaten', 'planned', 'total'].map(mode => (
            <TouchableOpacity
              key={mode}
              onPress={() => setViewMode(mode)}
              style={[styles.viewModeButton, viewMode === mode && styles.viewModeActive]}
            >
              <Text style={[styles.viewModeText, viewMode === mode && styles.viewModeActiveText]}>
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

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
              <CalorieRing consumed={Math.abs(displayValue)} goal={activeGoals.cal} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Eaten: {eaten.cal}</Text>
                <Text style={styles.summaryLabel}>Planned: {planned.cal}</Text>
                <Text style={styles.summaryLabel}>Goal: {activeGoals.cal.toLocaleString()}</Text>
              </View>
              <ProteinBar consumed={projected.protein} goal={activeGoals.protein} />
            </View>

            <View style={[styles.advancedMetrics, { left: screenWidth }]}>
              <Text style={styles.advancedTitle}>Detailed Macros</Text>
              <MacroRow label="Carbs" value={projected.carbs} goal={activeGoals.carbs} color={colors.carbs} />
              <MacroRow label="Fat" value={projected.fat} goal={activeGoals.fat} color={colors.fat} />
              <MacroRow label="Fiber" value={18} goal={28} color={colors.success} />
              <MacroRow label="Sugar" value={25} goal={50} color={colors.warning} />
              <MacroRow label="Sodium" value={1200} goal={2300} color={colors.primary} unit="mg" />
            </View>
          </View>

          {!showAdvanced && (
            <Text style={styles.swipeHint}>Swipe for more →</Text>
          )}
        </Animated.View>

        <View style={styles.mealsSection}>
          <View style={styles.mealsSectionHeader}>
            <Text style={styles.mealsSectionTitle}>Today's Meals</Text>
            <TouchableOpacity onPress={() => setShowAddModal(true)}>
              <Ionicons name="add-circle" size={28} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {foods.length === 0 ? (
            <View style={styles.emptyState}>
              <Character mood="calm" size={100} />
              <Text style={styles.emptyText}>No food logged yet</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
                <Text style={styles.addButtonText}>Add your first meal</Text>
              </TouchableOpacity>
            </View>
          ) : (
            foods.map((food) => (
              <MealItem key={food.id} food={food} />
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Food Modal */}
      <AddFoodModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addFood}
      />
    </SafeAreaView>
  );
};

// Add Food Modal Component
const AddFoodModal = ({ visible, onClose, onAdd }) => {
  const [input, setInput] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [customCals, setCustomCals] = useState('');
  const [customProtein, setCustomProtein] = useState('');

  const handleQuickAdd = (food) => {
    setSelectedFood(food);
    setCustomCals(food.cal.toString());
    setCustomProtein(food.protein.toString());
  };

  const handleAdd = (asPlanned) => {
    if (selectedFood || (customCals && customProtein)) {
      const food = selectedFood || {
        name: input || 'Custom food',
        cal: parseInt(customCals) || 0,
        protein: parseInt(customProtein) || 0,
        carbs: 0,
        fat: 0,
      };
      onAdd(food, asPlanned);
      resetModal();
      onClose();
    }
  };

  const resetModal = () => {
    setInput('');
    setSelectedFood(null);
    setCustomCals('');
    setCustomProtein('');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modal}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Add Food</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView style={styles.modalContent}>
          <TextInput
            style={styles.foodInput}
            placeholder="What did you eat?"
            value={input}
            onChangeText={setInput}
            multiline
          />

          <Text style={styles.sectionTitle}>Quick Add</Text>
          <View style={styles.quickAddGrid}>
            {SAMPLE_FOODS.slice(0, 6).map((food, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.quickAddItem,
                  selectedFood?.name === food.name && styles.quickAddItemSelected
                ]}
                onPress={() => handleQuickAdd(food)}
              >
                <Text style={styles.quickAddName}>{food.name}</Text>
                <Text style={styles.quickAddInfo}>{food.cal} cal • {food.protein}g</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Manual Entry</Text>
          <View style={styles.manualEntry}>
            <View style={styles.manualRow}>
              <Text style={styles.manualLabel}>Calories:</Text>
              <TextInput
                style={styles.manualInput}
                placeholder="0"
                value={customCals}
                onChangeText={setCustomCals}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.manualRow}>
              <Text style={styles.manualLabel}>Protein (g):</Text>
              <TextInput
                style={styles.manualInput}
                placeholder="0"
                value={customProtein}
                onChangeText={setCustomProtein}
                keyboardType="numeric"
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={[styles.modalButton, styles.modalButtonSecondary]}
            onPress={() => handleAdd(true)}
          >
            <Text style={styles.modalButtonTextSecondary}>Plan for Later</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, styles.modalButtonPrimary]}
            onPress={() => handleAdd(false)}
          >
            <Text style={styles.modalButtonTextPrimary}>Log as Eaten</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
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
  timeframeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 2,
  },
  timeframeButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  timeframeActive: {
    backgroundColor: colors.primary,
  },
  timeframeText: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  timeframeActiveText: {
    color: colors.surface,
    fontWeight: '600',
  },
  weekSelector: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    maxHeight: 80,
  },
  dayButton: {
    width: 48,
    height: 60,
    marginHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSecondary,
  },
  dayButtonActive: {
    backgroundColor: colors.text,
  },
  dayButtonWeekday: {
    ...typography.caption2,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  dayButtonDate: {
    ...typography.headline,
    color: colors.text,
  },
  dayButtonActiveText: {
    color: colors.surface,
  },
  dayButtonToday: {
    color: colors.primary,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  viewModeSelector: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
    padding: 2,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    alignItems: 'center',
  },
  viewModeActive: {
    backgroundColor: colors.text,
  },
  viewModeText: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  viewModeActiveText: {
    color: colors.surface,
    fontWeight: '600',
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
  ringCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringValue: {
    ...typography.title1,
    color: colors.text,
  },
  ringLabel: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: spacing.md,
  },
  summaryLabel: {
    ...typography.caption1,
    color: colors.textSecondary,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  addButton: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: 20,
  },
  addButtonText: {
    ...typography.subheadline,
    color: colors.surface,
    fontWeight: '600',
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    minHeight: 60,
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
  confirmButton: {
    padding: spacing.xs,
  },

  // Modal styles
  modal: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  modalCancel: {
    ...typography.body,
    color: colors.primary,
  },
  modalTitle: {
    ...typography.headline,
    color: colors.text,
  },
  modalContent: {
    flex: 1,
    padding: spacing.md,
  },
  foodInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    ...typography.body,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.headline,
    color: colors.text,
    marginBottom: spacing.md,
  },
  quickAddGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.lg,
  },
  quickAddItem: {
    width: (screenWidth - spacing.md * 3) / 2,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginRight: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  quickAddItemSelected: {
    borderColor: colors.primary,
  },
  quickAddName: {
    ...typography.subheadline,
    color: colors.text,
    marginBottom: 4,
  },
  quickAddInfo: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  manualEntry: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
  },
  manualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  manualLabel: {
    ...typography.body,
    color: colors.text,
    width: 120,
  },
  manualInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    ...typography.body,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  modalButtonSecondary: {
    backgroundColor: colors.warning + '20',
  },
  modalButtonPrimary: {
    backgroundColor: colors.primary,
  },
  modalButtonTextSecondary: {
    ...typography.headline,
    color: colors.warning,
  },
  modalButtonTextPrimary: {
    ...typography.headline,
    color: colors.surface,
  },
});

export default DayScreenFull;