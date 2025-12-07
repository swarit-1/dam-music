import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

interface AudioWaveformProps {
    waveformData: number[]; // Array of amplitude values (0-1)
    isPlaying: boolean;
    progress: number; // Current playback progress (0-1)
    height?: number;
    barWidth?: number;
    barGap?: number;
    activeColor?: string[];
    inactiveColor?: string[];
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({
    waveformData,
    isPlaying,
    progress,
    height = 80,
    barWidth = 3,
    barGap = 2,
    activeColor = [colors.brandPurple, colors.brandPurple400],
    inactiveColor = ['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.15)'],
}) => {
    const animatedValues = useRef(
        waveformData.map(() => new Animated.Value(0))
    ).current;

    useEffect(() => {
        // Animate bars in when component mounts
        const animations = animatedValues.map((animValue, index) =>
            Animated.timing(animValue, {
                toValue: 1,
                duration: 600,
                delay: index * 10,
                useNativeDriver: true,
            })
        );

        Animated.stagger(5, animations).start();
    }, []);

    const playedIndex = Math.floor(progress * waveformData.length);

    return (
        <View style={[styles.container, { height }]}>
            <View style={styles.waveformContainer}>
                {waveformData.map((amplitude, index) => {
                    const barHeight = Math.max(amplitude * height * 0.9, 4);
                    const isPlayed = index <= playedIndex;

                    return (
                        <Animated.View
                            key={index}
                            style={[
                                styles.barContainer,
                                {
                                    width: barWidth,
                                    marginRight: index < waveformData.length - 1 ? barGap : 0,
                                    opacity: animatedValues[index],
                                    transform: [
                                        {
                                            scaleY: animatedValues[index].interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0.2, 1],
                                            }),
                                        },
                                    ],
                                },
                            ]}
                        >
                            <LinearGradient
                                colors={isPlayed ? activeColor : inactiveColor}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 0, y: 1 }}
                                style={[
                                    styles.bar,
                                    {
                                        height: barHeight,
                                        borderRadius: barWidth / 2,
                                    },
                                ]}
                            />
                        </Animated.View>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    waveformContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    barContainer: {
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bar: {
        width: '100%',
    },
});

export default AudioWaveform;
