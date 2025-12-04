import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Ellipse, Circle, Path, G } from 'react-native-svg';
import { MOODS } from '../constants/data';
import { colors, typography, spacing } from '../constants/theme';

const AnimatedView = Animated.View;

export const Character = ({ mood = 'calm', size = 80, message, coins, onPress }) => {
  const m = MOODS[mood] || MOODS.calm;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (message) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [message]);

  useEffect(() => {
    if (m.bounce) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -10,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else if (m.pulse) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [mood]);

  const animStyle = m.bounce
    ? { transform: [{ translateY: bounceAnim }] }
    : m.pulse
    ? { transform: [{ scale: pulseAnim }] }
    : {};

  return (
    <View style={styles.container} onTouchEnd={onPress}>
      {message && (
        <AnimatedView style={[styles.messageContainer, { opacity: fadeAnim }]}>
          <View style={styles.messageBubble}>
            <Text style={styles.messageText}>
              {message}
              {coins > 0 && <Text style={styles.coins}> +{coins}</Text>}
            </Text>
            <View style={styles.messageTail} />
          </View>
        </AnimatedView>
      )}

      <AnimatedView style={[{ width: size, height: size }, animStyle]}>
        <Svg viewBox="0 0 100 100" width={size} height={size}>
          <Defs>
            <LinearGradient id={`gradient-${mood}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={m.gradient[0]} />
              <Stop offset="100%" stopColor={m.gradient[1]} />
            </LinearGradient>
          </Defs>

          <G>
            {/* Main body */}
            <Ellipse cx="50" cy="52" rx="38" ry="36" fill={`url(#gradient-${mood})`} />

            {/* Highlight */}
            <Ellipse cx="38" cy="38" rx="12" ry="8" fill="white" opacity="0.3" />

            {/* Eyes */}
            <Ellipse cx="38" cy={48 + m.eyeY} rx="5" ry="6" fill="#2d3748" />
            <Ellipse cx="62" cy={48 + m.eyeY} rx="5" ry="6" fill="#2d3748" />

            {/* Eye highlights */}
            <Circle cx="40" cy={46 + m.eyeY} r="2" fill="white" />
            <Circle cx="64" cy={46 + m.eyeY} r="2" fill="white" />

            {/* Cheeks */}
            <Ellipse cx="28" cy="58" rx="6" ry="4" fill="#FDA4AF" opacity="0.4" />
            <Ellipse cx="72" cy="58" rx="6" ry="4" fill="#FDA4AF" opacity="0.4" />

            {/* Mouth */}
            <Path
              d={`M 42 65 Q 50 ${65 + m.mouth} 58 65`}
              fill="none"
              stroke="#2d3748"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </G>
        </Svg>
      </AnimatedView>
    </View>
  );
};

export const CharacterWithMessage = ({ mood, message, coins = 0 }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <AnimatedView style={[styles.overlay, { opacity: fadeAnim }]}>
      <Character mood={mood} size={100} message={message} coins={coins} />
    </AnimatedView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  messageContainer: {
    marginBottom: spacing.sm,
  },
  messageBubble: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    maxWidth: 240,
  },
  messageText: {
    ...typography.body,
    color: colors.text,
  },
  coins: {
    color: '#F59E0B',
    fontWeight: 'bold',
  },
  messageTail: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    marginLeft: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'white',
  },
  overlay: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
});

export default Character;