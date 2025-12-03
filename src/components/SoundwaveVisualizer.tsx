import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '../theme/colors';

interface SoundwaveVisualizerProps {
  isPlaying: boolean;
  color?: string;
  barCount?: number;
}

export const SoundwaveVisualizer: React.FC<SoundwaveVisualizerProps> = ({
  isPlaying,
  color = colors.brandPurple,
  barCount = 30,
}) => {
  const animatedValues = useRef(
    Array.from({ length: barCount }, () => new Animated.Value(0.3))
  ).current;

  useEffect(() => {
    if (isPlaying) {
      // Create staggered animations for each bar
      const animations = animatedValues.map((animatedValue, index) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(animatedValue, {
              toValue: Math.random() * 0.7 + 0.3, // Random height between 0.3 and 1
              duration: 150 + Math.random() * 100, // Slightly random timing
              useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
              toValue: Math.random() * 0.5 + 0.2,
              duration: 150 + Math.random() * 100,
              useNativeDriver: true,
            }),
          ])
        );
      });

      // Start all animations with slight delays
      animations.forEach((animation, index) => {
        setTimeout(() => animation.start(), index * 20);
      });

      return () => {
        animations.forEach(animation => animation.stop());
      };
    } else {
      // Reset to low position when not playing
      animatedValues.forEach(animatedValue => {
        Animated.timing(animatedValue, {
          toValue: 0.2,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [isPlaying]);

  return (
    <View style={styles.container}>
      {animatedValues.map((animatedValue, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              backgroundColor: color,
              transform: [
                {
                  scaleY: animatedValue,
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    gap: 3,
  },
  bar: {
    width: 4,
    height: 60,
    borderRadius: 2,
    opacity: 0.9,
  },
});
