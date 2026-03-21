import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';

export type BadgeVariant = 'points' | 'level' | 'achievement' | 'status';
export type BadgeStatus = 'unlocked' | 'locked' | 'pending' | 'expired';

interface BadgeProps {
  variant: BadgeVariant;
  value?: string | number;
  icon?: keyof typeof Ionicons.glyphMap;
  status?: BadgeStatus;
  color?: string;
  size?: 'small' | 'medium';
}

export default function Badge({
  variant,
  value,
  icon,
  status = 'unlocked',
  color,
  size = 'small',
}: BadgeProps) {
  const theme = useTheme();

  // Determina cor baseada no variant ou usa cor fornecida
  const getBadgeColor = () => {
    if (color) return color;

    switch (variant) {
      case 'points':
        return theme.Colors.bolsa; // verde
      case 'level':
        return theme.Colors.proposito; // roxo
      case 'achievement':
        return status === 'unlocked' ? theme.Colors.success : theme.Colors.gray600;
      case 'status':
        switch (status) {
          case 'unlocked':
            return theme.Colors.success;
          case 'pending':
            return theme.Colors.warning;
          case 'expired':
          case 'locked':
            return theme.Colors.error;
          default:
            return theme.Colors.gray600;
        }
      default:
        return theme.Colors.gray600;
    }
  };

  const badgeColor = getBadgeColor();

  // Renderiza conteúdo interno baseado no variant
  const renderContent = () => {
    switch (variant) {
      case 'points':
        return (
          <View style={styles.row}>
            <Ionicons name="cash" size={size === 'small' ? 12 : 16} color={badgeColor} />
            <Text style={[styles.text, { color: badgeColor, fontSize: size === 'small' ? 10 : 12 }]}>
              {value} pts
            </Text>
          </View>
        );
      case 'level':
        return (
          <View style={styles.row}>
            <Ionicons name="star" size={size === 'small' ? 12 : 16} color={badgeColor} />
            <Text style={[styles.text, { color: badgeColor, fontSize: size === 'small' ? 10 : 12 }]}>
              LVL {value}
            </Text>
          </View>
        );
      case 'achievement':
        return (
          <View style={styles.row}>
            {icon ? (
              <Ionicons name={icon} size={size === 'small' ? 12 : 16} color={status === 'unlocked' ? badgeColor : theme.Colors.gray500} />
            ) : (
              <Ionicons name="trophy" size={size === 'small' ? 12 : 16} color={status === 'unlocked' ? badgeColor : theme.Colors.gray500} />
            )}
            {value && (
              <Text style={[styles.text, { color: status === 'unlocked' ? badgeColor : theme.Colors.gray500, fontSize: size === 'small' ? 10 : 12 }]}>
                {value}
              </Text>
            )}
          </View>
        );
      case 'status':
        return (
          <View style={styles.row}>
            {status === 'unlocked' ? (
              <Ionicons name="checkmark-circle" size={size === 'small' ? 12 : 16} color={badgeColor} />
            ) : status === 'pending' ? (
              <Ionicons name="time" size={size === 'small' ? 12 : 16} color={badgeColor} />
            ) : (
              <Ionicons name="close-circle" size={size === 'small' ? 12 : 16} color={badgeColor} />
            )}
            <Text style={[styles.text, { color: badgeColor, fontSize: size === 'small' ? 10 : 12 }]}>
              {value}
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.Colors.gray800,
          borderRadius: theme.BorderRadius.full,
          paddingHorizontal: size === 'small' ? theme.Spacing[2] : theme.Spacing[3],
          paddingVertical: size === 'small' ? theme.Spacing[1] : theme.Spacing[2],
          borderWidth: 1,
          borderColor: theme.Colors.gray700,
        },
      ]}
    >
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  text: {
    fontFamily: 'Inter-Medium',
  },
});
