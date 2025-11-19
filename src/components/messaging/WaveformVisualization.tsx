import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Dimensions } from 'react-native';
import Svg, { Rect, Line } from 'react-native-svg';
import { colors } from '../../theme/colors';

interface WaveformVisualizationProps {
  waveformData: number[];
  currentPosition: number;
  duration: number;
  onPress?: (progress: number) => void;
  color?: string;
  height?: number;
  width?: number;
}

const WaveformVisualization: React.FC<WaveformVisualizationProps> = ({
  waveformData,
  currentPosition,
  duration,
  onPress,
  color = colors.brandPurple,
  height = 40,
  width,
}) => {
  const screenWidth = width || Dimensions.get('window').width - 120;
  const barCount = waveformData.length || 50;
  const barWidth = 2;
  const barSpacing = 1;
  const totalWidth = barCount * (barWidth + barSpacing);

  // Generate waveform if no data provided
  const displayData = useMemo(() => {
    if (waveformData.length > 0) {
      return waveformData;
    }
    // Generate pseudo-random waveform
    return Array.from({ length: 50 }, (_, i) => {
      const value = Math.sin(i * 0.2) * 0.5 + Math.random() * 0.5;
      return Math.abs(value);
    });
  }, [waveformData]);

  const progress = duration > 0 ? currentPosition / duration : 0;

  const handlePress = (event: any) => {
    if (onPress) {
      const { locationX } = event.nativeEvent;
      const pressProgress = Math.max(0, Math.min(1, locationX / totalWidth));
      onPress(pressProgress);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={[styles.container, { height }]}>
        <Svg width={totalWidth} height={height}>
          {displayData.map((amplitude, index) => {
            const barHeight = Math.max(3, amplitude * height * 0.8);
            const x = index * (barWidth + barSpacing);
            const y = (height - barHeight) / 2;
            
            const isPlayed = index / barCount < progress;
            const barColor = isPlayed ? color : `${color}40`; // 40 is 25% opacity in hex

            return (
              <Rect
                key={index}
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={barColor}
                rx={1}
              />
            );
          })}
          
          {/* Progress line */}
          {progress > 0 && (
            <Line
              x1={progress * totalWidth}
              y1={0}
              x2={progress * totalWidth}
              y2={height}
              stroke={color}
              strokeWidth={2}
            />
          )}
        </Svg>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    overflow: 'hidden',
  },
});

export default WaveformVisualization;

