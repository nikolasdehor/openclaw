import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeProvider';

interface ProgressBarProps {
  progress: number; // 0 a 1
  color?: string;
  height?: number;
  showLabel?: boolean;
  animated?: boolean;
  labelStyle?: object;
  gradientColors?: string[]; // opcional: cores do gradiente
}

export default function ProgressBar({
  progress,
  color,
  height = 12,
  showLabel = false,
  animated = true,
  labelStyle,
  gradientColors,
}: ProgressBarProps) {
  const theme = useTheme();
  const progressAnim = useRef(new Animated.Value(0)).current;

  const normalizedProgress = Math.max(0, Math.min(1, progress));

  // Cores padrão por área ou info
  const defaultGradient = gradientColors || (color
    ? [color, color]
    : [
        theme.Colors.info,
        theme.Colors.info, // fallback: sem segunda cor
      ]);

  useEffect(() => {
    if (animated) {
      Animated.timing(progressAnim, {
        toValue: normalizedProgress,
        duration: 800,
        useNativeDriver: false,
      }).start();
    } else {
      progressAnim.setValue(normalizedProgress);
    }
  }, [normalizedProgress]);

  const containerStyle = {
    flexDirection: 'row' as const,
    height,
    backgroundColor: theme.Colors.gray700,
    borderRadius: theme.BorderRadius.full,
    overflow: 'hidden' as const,
    flex: 1,
  };

  const barWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.wrapper}>
      <View style={containerStyle}>
        <Animated.View
          style={[
            styles.bar,
            {
              width: animated ? barWidth : `${normalizedProgress * 100}%`,
            },
          ]}
        >
          <LinearGradient
            colors={defaultGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          />
          {/* Brilho sutil na barra */}
          <View style={[styles.shine, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
        </Animated.View>
      </View>
      {showLabel && (
        <Text style={[styles.label, labelStyle, { color: theme.Colors.gray300 }]}>
          {Math.round(normalizedProgress * 100)}%
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  bar: {
    height: '100%',
    borderRadius: 999,
    position: 'relative' as const,
  },
  gradient: {
    flex: 1,
    borderRadius: 999,
  },
  shine: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 999,
  },
  label: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
});
