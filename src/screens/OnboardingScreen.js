import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Character } from '../components/Character';
import { colors, spacing, typography } from '../constants/theme';
import { ACTIVITY_LEVELS, GOALS, COIN_REWARDS } from '../constants/data';
import { calcGoals } from '../utils/calculations';

const OnboardingScreen = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [userData, setUserData] = useState({
    name: '',
    age: 30,
    sex: 'male',
    height: 70,
    weight: 180,
    activity: 'moderate',
    goal: 'lose',
  });

  const steps = ['welcome', 'name', 'basics', 'measurements', 'activity', 'goal', 'summary'];
  const currentStep = steps[step];

  const updateData = (data) => {
    setUserData(prev => ({ ...prev, ...data }));
  };

  const goNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    }
  };

  const goBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const completeOnboarding = () => {
    onComplete({ ...userData, onboarded: true });
  };

  const goals = calcGoals(userData);

  const canProceed = () => {
    switch (currentStep) {
      case 'name':
        return userData.name.trim().length > 0;
      case 'basics':
        return userData.age > 0 && userData.age < 120;
      case 'measurements':
        return userData.height > 0 && userData.weight > 0;
      default:
        return true;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((step + 1) / steps.length) * 100}%` },
              ]}
            />
          </View>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {currentStep === 'welcome' && (
            <View style={styles.stepContainer}>
              <View style={styles.centerContent}>
                <Character mood="welcome" size={140} />
                <Text style={styles.title}>Hey there!</Text>
                <Text style={styles.subtitle}>
                  Track nutrition without the stress.
                </Text>
              </View>
              <TouchableOpacity style={styles.primaryButton} onPress={goNext}>
                <Text style={styles.primaryButtonText}>Let's do it</Text>
              </TouchableOpacity>
            </View>
          )}

          {currentStep === 'name' && (
            <View style={styles.stepContainer}>
              <View style={styles.centerContent}>
                <Character mood="happy" size={100} />
                <Text style={styles.title}>What should I call you?</Text>
                <TextInput
                  style={styles.nameInput}
                  placeholder="Your name"
                  value={userData.name}
                  onChangeText={(text) => updateData({ name: text })}
                  autoFocus
                  autoCapitalize="words"
                />
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={goBack}>
                  <Text style={styles.backButton}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    !canProceed() && styles.disabledButton,
                  ]}
                  onPress={goNext}
                  disabled={!canProceed()}
                >
                  <Text style={styles.primaryButtonText}>Continue</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {currentStep === 'basics' && (
            <View style={styles.stepContainer}>
              <TouchableOpacity onPress={goBack} style={styles.backButtonTop}>
                <Ionicons name="chevron-back" size={24} color={colors.text} />
              </TouchableOpacity>

              <View style={styles.formContent}>
                <Character mood="calm" size={80} />
                <Text style={styles.sectionTitle}>About you</Text>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Biological sex (for BMR calculation)</Text>
                  <View style={styles.toggleRow}>
                    {['male', 'female'].map((sex) => (
                      <TouchableOpacity
                        key={sex}
                        style={[
                          styles.toggleButton,
                          userData.sex === sex && styles.toggleButtonActive,
                        ]}
                        onPress={() => updateData({ sex })}
                      >
                        <Text
                          style={[
                            styles.toggleButtonText,
                            userData.sex === sex && styles.toggleButtonTextActive,
                          ]}
                        >
                          {sex.charAt(0).toUpperCase() + sex.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Age</Text>
                  <TextInput
                    style={styles.input}
                    value={userData.age.toString()}
                    onChangeText={(text) => updateData({ age: parseInt(text) || 0 })}
                    keyboardType="numeric"
                    placeholder="30"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  !canProceed() && styles.disabledButton,
                ]}
                onPress={goNext}
                disabled={!canProceed()}
              >
                <Text style={styles.primaryButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          )}

          {currentStep === 'measurements' && (
            <View style={styles.stepContainer}>
              <TouchableOpacity onPress={goBack} style={styles.backButtonTop}>
                <Ionicons name="chevron-back" size={24} color={colors.text} />
              </TouchableOpacity>

              <View style={styles.formContent}>
                <Text style={styles.sectionTitle}>Measurements</Text>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Height (inches)</Text>
                  <TextInput
                    style={styles.input}
                    value={userData.height.toString()}
                    onChangeText={(text) => updateData({ height: parseInt(text) || 0 })}
                    keyboardType="numeric"
                    placeholder="70"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Weight (lbs)</Text>
                  <TextInput
                    style={styles.input}
                    value={userData.weight.toString()}
                    onChangeText={(text) => updateData({ weight: parseInt(text) || 0 })}
                    keyboardType="numeric"
                    placeholder="180"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  !canProceed() && styles.disabledButton,
                ]}
                onPress={goNext}
                disabled={!canProceed()}
              >
                <Text style={styles.primaryButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          )}

          {currentStep === 'activity' && (
            <View style={styles.stepContainer}>
              <TouchableOpacity onPress={goBack} style={styles.backButtonTop}>
                <Ionicons name="chevron-back" size={24} color={colors.text} />
              </TouchableOpacity>

              <View style={styles.formContent}>
                <Text style={styles.sectionTitle}>Activity level</Text>

                <View style={styles.optionsContainer}>
                  {Object.entries(ACTIVITY_LEVELS).map(([key, value]) => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.optionCard,
                        userData.activity === key && styles.optionCardActive,
                      ]}
                      onPress={() => updateData({ activity: key })}
                    >
                      <Text
                        style={[
                          styles.optionTitle,
                          userData.activity === key && styles.optionTitleActive,
                        ]}
                      >
                        {value.label}
                      </Text>
                      <Text
                        style={[
                          styles.optionDescription,
                          userData.activity === key && styles.optionDescriptionActive,
                        ]}
                      >
                        {value.desc}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity style={styles.primaryButton} onPress={goNext}>
                <Text style={styles.primaryButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          )}

          {currentStep === 'goal' && (
            <View style={styles.stepContainer}>
              <TouchableOpacity onPress={goBack} style={styles.backButtonTop}>
                <Ionicons name="chevron-back" size={24} color={colors.text} />
              </TouchableOpacity>

              <View style={styles.formContent}>
                <Text style={styles.sectionTitle}>Your goal</Text>

                <View style={styles.optionsContainer}>
                  {Object.entries(GOALS).map(([key, value]) => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.optionCard,
                        userData.goal === key && styles.optionCardActive,
                      ]}
                      onPress={() => updateData({ goal: key })}
                    >
                      <Text
                        style={[
                          styles.optionTitle,
                          userData.goal === key && styles.optionTitleActive,
                        ]}
                      >
                        {value.label}
                      </Text>
                      <Text
                        style={[
                          styles.optionDescription,
                          userData.goal === key && styles.optionDescriptionActive,
                        ]}
                      >
                        {value.deficit > 0
                          ? `${value.deficit} cal deficit`
                          : value.deficit < 0
                          ? `${Math.abs(value.deficit)} cal surplus`
                          : 'Maintain weight'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity style={styles.primaryButton} onPress={goNext}>
                <Text style={styles.primaryButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          )}

          {currentStep === 'summary' && (
            <View style={styles.stepContainer}>
              <TouchableOpacity onPress={goBack} style={styles.backButtonTop}>
                <Ionicons name="chevron-back" size={24} color={colors.text} />
              </TouchableOpacity>

              <View style={styles.centerContent}>
                <Character mood="excited" size={100} />
                <Text style={styles.title}>You're set, {userData.name}!</Text>
                <Text style={styles.subtitle}>Your daily targets:</Text>

                <View style={styles.summaryCard}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Daily Calories</Text>
                    <Text style={styles.summaryValue}>{goals.cal.toLocaleString()}</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Protein</Text>
                    <Text style={styles.summaryValue}>{goals.protein}g</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Carbs</Text>
                    <Text style={styles.summaryValue}>{goals.carbs}g</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Fat</Text>
                    <Text style={styles.summaryValue}>{goals.fat}g</Text>
                  </View>

                  <View style={styles.weeklyBudget}>
                    <Text style={styles.weeklyLabel}>Weekly Budget</Text>
                    <Text style={styles.weeklyValue}>
                      {(goals.cal * 7).toLocaleString()} calories
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={completeOnboarding}
              >
                <Text style={styles.primaryButtonText}>Start Tracking</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  progressContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.borderLight,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  stepContainer: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContent: {
    flex: 1,
    paddingTop: spacing.xl,
  },
  backButtonTop: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.largeTitle,
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.title2,
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  nameInput: {
    ...typography.title1,
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingVertical: spacing.md,
    marginTop: spacing.xl,
    minWidth: 200,
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.subheadline,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleButtonText: {
    ...typography.body,
    color: colors.text,
  },
  toggleButtonTextActive: {
    color: colors.surface,
    fontWeight: '600',
  },
  optionsContainer: {
    gap: spacing.sm,
  },
  optionCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  optionTitle: {
    ...typography.headline,
    color: colors.text,
    marginBottom: 4,
  },
  optionTitleActive: {
    color: colors.primary,
  },
  optionDescription: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  optionDescriptionActive: {
    color: colors.primary,
  },
  buttonContainer: {
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  primaryButtonText: {
    ...typography.headline,
    color: colors.surface,
    fontWeight: '600',
  },
  backButton: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginTop: spacing.xl,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  summaryLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.headline,
    color: colors.text,
    fontWeight: '600',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.xs,
  },
  weeklyBudget: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    alignItems: 'center',
  },
  weeklyLabel: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  weeklyValue: {
    ...typography.title2,
    color: colors.primary,
    fontWeight: '700',
  },
});

export default OnboardingScreen;