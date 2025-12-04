# NutriTrack Mobile - iOS-First Nutrition Tracking App

A modern, iOS-first nutrition tracking app built with React Native, featuring a simplified UI focused on calories and protein tracking with advanced macros available on demand.

## 🚀 Features

### Core Functionality
- **Simplified Day View** - Focus on calories and protein (what matters most)
- **Swipeable Advanced Macros** - Carbs, fats, and micronutrients hidden by default
- **Weekly Budget System** - Track by week, not just daily
- **Plan-First Workflow** - Plan meals ahead, auto-confirm at day's end
- **Gamification** - Earn coins for logging, streaks, and hitting goals

### Character & Coaching
- **Animated Mascot** - Headspace-style blob character with multiple moods
- **CBT-Informed Responses** - Evidence-based coaching for cravings and guilt
- **Progress Check-ins** - Regular motivation and feedback

### Mobile-First Design
- **Compact Meal List** - 5-6 items visible above the fold
- **iOS Navigation** - Native tab bar with elevated add button
- **Touch Optimized** - 44px minimum touch targets
- **Gesture Support** - Swipe to reveal, pull to refresh

## 📱 Screenshots

<div align="center">
  <img src="https://via.placeholder.com/300x600/007AFF/FFFFFF?text=Onboarding" width="200" />
  <img src="https://via.placeholder.com/300x600/4ECDC4/FFFFFF?text=Day+View" width="200" />
  <img src="https://via.placeholder.com/300x600/FFD93D/FFFFFF?text=Add+Food" width="200" />
</div>

## 🛠️ Tech Stack

- **React Native** - Cross-platform mobile development
- **Expo** - Development and build tools
- **React Navigation** - Native navigation patterns
- **AsyncStorage** - Local data persistence
- **React Native SVG** - Charts and character animations
- **Gesture Handler** - Smooth swipe interactions

## 📲 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Xcode (for iOS development)
- Expo CLI (optional)

### Setup

```bash
# Clone the repository
git clone https://github.com/colindacity/nutri-app-mobile.git
cd nutri-app-mobile

# Install dependencies
npm install

# Start the development server
npm start
```

### Running on Different Platforms

```bash
# iOS Simulator
npm run ios

# Web Browser (Mobile Preview)
npm run web

# Android (currently disabled, iOS-first)
# npm run android
```

## 🎯 Design Principles

1. **Simplicity First** - Only show calories and protein by default
2. **Progressive Disclosure** - Advanced features behind gestures
3. **Mobile Constraints** - Designed for one-handed use
4. **Information Density** - More meals visible without scrolling
5. **Native Feel** - iOS patterns and animations throughout

## 📊 Key Screens

### Onboarding Flow
1. Welcome with character introduction
2. Name collection
3. Basic info (age, sex)
4. Measurements (height, weight)
5. Activity level selection
6. Goal setting
7. Summary with calculated targets

### Day Screen (Main View)
- **Top**: Week day selector and date
- **Primary Card**: Calorie ring + protein bar
- **Swipe Right**: Reveals carbs, fats, micronutrients
- **Meal List**: Compact items with badges (B/L/D/S)
- **Bottom Tab**: iOS-style navigation

### Add Food Modal
- Quick add from common foods
- Manual calorie/protein entry
- Plan for later vs log as eaten
- Confirmation for planned items

## 🔄 Data Flow

```
User Profile (AsyncStorage)
    ↓
Calculate Daily Goals (BMR/TDEE)
    ↓
Track Foods (By Date)
    ↓
Update Progress & Coins
    ↓
Show Character Feedback
```

## 🎮 Gamification System

### Coin Rewards
- **Onboarding**: 10 coins
- **Log Food**: 5 coins
- **Confirm Planned**: 5 coins
- **Daily Goal**: 20 coins
- **Weekly Goal**: 50 coins

### Character Moods
- `calm` - Default state
- `happy` - Food logged
- `excited` - Goal achieved
- `supportive` - During struggles
- `proud` - Milestone reached

## 🚧 Roadmap

- [ ] Real AI food parsing integration
- [ ] Photo analysis with vision models
- [ ] Progress charts and analytics
- [ ] Apple Health integration
- [ ] Social features (friends, challenges)
- [ ] Meal planning templates
- [ ] Restaurant menu integration

## 📝 Notes

This is an iOS-first implementation. The Android folder has been intentionally removed to focus on iOS excellence. The app also runs on web for development and testing purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT

---

Built with ❤️ using React Native and Expo