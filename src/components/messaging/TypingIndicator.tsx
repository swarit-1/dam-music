import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '../../theme/colors';

interface TypingIndicatorProps {
  userNames?: string[];
  showNames?: boolean;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ 
  userNames = [],
  showNames = true,
}) => {
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const animations = [
      createAnimation(dot1Anim, 0),
      createAnimation(dot2Anim, 133),
      createAnimation(dot3Anim, 266),
    ];

    animations.forEach(anim => anim.start());

    return () => {
      animations.forEach(anim => anim.stop());
    };
  }, []);

  const getTypingText = () => {
    if (!showNames || userNames.length === 0) {
      return 'Typing';
    }
    if (userNames.length === 1) {
      return `${userNames[0]} is typing`;
    }
    if (userNames.length === 2) {
      return `${userNames[0]} and ${userNames[1]} are typing`;
    }
    return `${userNames[0]} and ${userNames.length - 1} others are typing`;
  };

  return (
    <View style={styles.container}>
      {showNames && userNames.length > 0 && (
        <Text style={styles.text}>{getTypingText()}</Text>
      )}
      <View style={styles.dotsContainer}>
        <Animated.View 
          style={[
            styles.dot,
            {
              opacity: dot1Anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1],
              }),
              transform: [{
                translateY: dot1Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -3],
                }),
              }],
            },
          ]}
        />
        <Animated.View 
          style={[
            styles.dot,
            {
              opacity: dot2Anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1],
              }),
              transform: [{
                translateY: dot2Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -3],
                }),
              }],
            },
          ]}
        />
        <Animated.View 
          style={[
            styles.dot,
            {
              opacity: dot3Anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1],
              }),
              transform: [{
                translateY: dot3Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -3],
                }),
              }],
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  text: {
    fontSize: 13,
    color: colors.gray600,
    fontStyle: 'italic',
    marginRight: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gray600,
  },
});

export default TypingIndicator;

