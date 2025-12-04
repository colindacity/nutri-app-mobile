import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import OnboardingScreen from './src/screens/OnboardingScreen';
import DayScreenFull from './src/screens/DayScreenFull';
import { colors, typography, spacing } from './src/constants/theme';
import { COIN_REWARDS } from './src/constants/data';

const Tab = createBottomTabNavigator();

// Placeholder screens for now
const PlaceholderScreen = ({ title }) => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>{title} Screen</Text>
    <Text style={styles.placeholderSubtext}>Coming soon...</Text>
  </View>
);

const TempProgressScreen = () => <PlaceholderScreen title="Progress" />;
const TempCoachScreen = () => <PlaceholderScreen title="Coach" />;
const TempProfileScreen = () => <PlaceholderScreen title="Profile" />;

// Custom Add Button
const AddButton = ({ onPress }) => (
  <TouchableOpacity style={styles.addButton} onPress={onPress}>
    <View style={styles.addButtonInner}>
      <Ionicons name="add" size={28} color="white" />
    </View>
  </TouchableOpacity>
);

export default function App() {
  const [user, setUser] = useState(null);
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const storedCoins = await AsyncStorage.getItem('coins');

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      if (storedCoins) {
        setCoins(JSON.parse(storedCoins));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = async (userData) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      // Award onboarding coins
      const newCoins = coins + COIN_REWARDS.onboarding;
      await AsyncStorage.setItem('coins', JSON.stringify(newCoins));

      setUser(userData);
      setCoins(newCoins);
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const updateCoins = async (amount) => {
    const newCoins = coins + amount;
    setCoins(newCoins);
    try {
      await AsyncStorage.setItem('coins', JSON.stringify(newCoins));
    } catch (error) {
      console.error('Error saving coins:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!user || !user.onboarded) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Tab.Navigator
          screenOptions={{
            tabBarStyle: {
              backgroundColor: colors.surface,
              borderTopWidth: 1,
              borderTopColor: colors.borderLight,
              height: 85,
              paddingBottom: 25,
              paddingTop: 10,
            },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textTertiary,
            tabBarLabelStyle: {
              ...typography.caption1,
              marginTop: 4,
            },
            headerShown: true,
            headerStyle: {
              backgroundColor: colors.surface,
              borderBottomWidth: 1,
              borderBottomColor: colors.borderLight,
            },
            headerTitleStyle: {
              ...typography.headline,
            },
          }}
        >
          <Tab.Screen
            name="Today"
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="today-outline" size={size} color={color} />
              ),
              headerTitle: `Hey ${user.name}!`,
              headerRight: () => (
                <View style={styles.headerRight}>
                  <View style={styles.coinBadge}>
                    <Text style={styles.coinText}>🪙 {coins}</Text>
                  </View>
                </View>
              ),
            }}
          >
            {(props) => <DayScreenFull {...props} user={user} onUpdateCoins={updateCoins} />}
          </Tab.Screen>

          <Tab.Screen
            name="Progress"
            component={TempProgressScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="trending-up-outline" size={size} color={color} />
              ),
            }}
          />

          <Tab.Screen
            name="Add"
            component={DayScreenFull}
            options={{
              tabBarButton: (props) => <AddButton {...props} />,
            }}
            listeners={({ navigation }) => ({
              tabPress: (e) => {
                e.preventDefault();
                // Navigate to Today tab and open add modal
                navigation.navigate('Today');
                // You can trigger modal opening here
              },
            })}
          />

          <Tab.Screen
            name="Coach"
            component={TempCoachScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="happy-outline" size={size} color={color} />
              ),
            }}
          />

          <Tab.Screen
            name="Profile"
            component={TempProfileScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="person-outline" size={size} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  placeholderText: {
    ...typography.title2,
    color: colors.textSecondary,
  },
  placeholderSubtext: {
    ...typography.body,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
  addButton: {
    top: -10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  headerRight: {
    paddingRight: spacing.md,
  },
  coinBadge: {
    backgroundColor: colors.warning + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  coinText: {
    ...typography.caption1,
    color: colors.warning,
    fontWeight: '600',
  },
});
