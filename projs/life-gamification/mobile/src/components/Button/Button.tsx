import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap; // nome do ícone do Ionicons
  loading?: boolean;
  fullWidth?: boolean;
  color?: string; // cor customizada (para gradiente da área)
}

export default function Button({
  variant = 'primary',
  size = 'medium',
  label,
  onPress,
  disabled = false,
  icon,
  loading = false,
  fullWidth = false,
  color,
}: ButtonProps) {
  const theme = useTheme();

  // Determine container style based on variant
  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.Spacing[2],
      borderRadius: theme.BorderRadius.md,
      ...(fullWidth ? { width: '100%' } : {}),
    };

    // Padding por tamanho
    const paddingVertical = size === 'small' ? theme.Spacing[2] : size === 'large' ? theme.Spacing[4] : theme.Spacing[3];
    const paddingHorizontal = size === 'small' ? theme.Spacing[3] : size === 'large' ? theme.Spacing[6] : theme.Spacing[4];
    baseStyle.paddingVertical = paddingVertical;
    baseStyle.paddingHorizontal = paddingHorizontal;

    // Variante
    switch (variant) {
      case 'primary':
        // Gradiente se cor fornecida, senão fallback sólido
        baseStyle.overflow = 'hidden';
        break;
      case 'secondary':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = theme.Colors.gray600;
        break;
      case 'ghost':
        baseStyle.backgroundColor = 'transparent';
        break;
    }

    if (disabled) {
      baseStyle.opacity = 0.5;
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const fontSize =
      size === 'small' ? theme.Typography.fontSize.sm :
      size === 'large' ? theme.Typography.fontSize.lg :
      theme.Typography.fontSize.base;

    const baseTextStyle: TextStyle = {
      fontFamily: theme.Typography.fontFamily.semibold,
      fontSize,
      textAlign: 'center',
    };

    switch (variant) {
      case 'primary':
        baseTextStyle.color = theme.Colors.white;
        break;
      case 'secondary':
        baseTextStyle.color = theme.Colors.gray200;
        break;
      case 'ghost':
        baseTextStyle.color = theme.Colors.gray300;
        break;
    }

    if (disabled) {
      baseTextStyle.opacity = 0.6;
    }

    return baseTextStyle;
  };

  const containerStyle = getContainerStyle();
  const textStyle = getTextStyle();

  // Renderiza botão primário com gradiente opcional
  if (variant === 'primary') {
    const gradientColors = color
      ? [color, color] // cor sólida fornecida
      : ['#3B82F6', '#60A5FA']; // fallback azul (ou usar área default)

    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={containerStyle}
      >
        <LinearGradient
          colors={gradientColors as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        {loading ? (
          <ActivityIndicator color={theme.Colors.white} />
        ) : (
          <>
            {icon && <Ionicons name={icon} size={size === 'small' ? 16 : size === 'large' ? 24 : 20} color={theme.Colors.white} />}
            <Text style={textStyle}>{label}</Text>
          </>
        )}
      </TouchableOpacity>
    );
  }

  // Secondary e Ghost são simples
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={containerStyle}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? theme.Colors.gray200 : theme.Colors.gray300} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={size === 'small' ? 16 : size === 'large' ? 24 : 20} color={variant === 'secondary' ? theme.Colors.gray200 : theme.Colors.gray300} />}
          <Text style={textStyle}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
