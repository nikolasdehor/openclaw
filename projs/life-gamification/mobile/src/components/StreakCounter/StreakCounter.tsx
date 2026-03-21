import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';

interface StreakCounterProps {
  days: number;
  showIcon?: boolean;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
}

export default function StreakCounter({
  days,
  showIcon = true,
  size = 'medium',
  animated = true,
}: StreakCounterProps) {
  const theme = useTheme();

  const scale = useSharedValue(1);

  // Animação de pulso se animate=true e days > 0
  useEffect(() => {
    if (animated && days > 0) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      scale.value = withTiming(1);
    }
  }, [days, animated]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Tamanhos baseados na prop size
  const iconSize = size === 'small' ? 16 : size === 'large' ? 28 : 22;
  const fontSize = size === 'small' ? 12 : size === 'large' ? 24 : 18;
  const containerPadding = size === 'small' ? 6 : size === 'large' ? 12 : 8;

  // Cores baseadas no número de dias (quanto maior, mais "quente")
  const getStreakColor = () => {
    if (days >= 90) return '#F97316'; // laranja escuro (90+)
    if (days >= 30) return '#EF4444'; // vermelho (lendário)
    if (days >= 14) return '#F59E0B'; // laranja (raro)
    if (days >= 7) return '#3B82F6'; // azul (semana)
    return theme.Colors.gray400; // normal
  };

  const streakColor = getStreakColor();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          backgroundColor: theme.Colors.gray800,
          paddingHorizontal: containerPadding,
          paddingVertical: containerPadding / 2,
          borderRadius: theme.BorderRadius.full,
          borderWidth: days >= 30 ? 2 : 1,
          borderColor: days >= 30 ? streakColor : theme.Colors.gray700,
          shadowColor: days >= 7 ? streakColor : 'transparent',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: days >= 7 ? 0.6 : 0,
          shadowRadius: days >= 7 ? 8 : 0,
          elevation: days >= 7 ? 4 : 0,
        },
        animatedStyle,
      ]}
    >
      {showIcon && (
        <Ionicons
          name="flame"
          size={iconSize}
          color={streakColor}
        />
      )}
      <Text
        style={[
          styles.text,
          {
            color: streakColor,
            fontSize,
            fontFamily: theme.Typography.fontFamily.bold,
          },
        ]}
      >
        {days} {days === 1 ? 'dia' : 'dias'}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
  text: {
    textAlign: 'center',
  },
});
