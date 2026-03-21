import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import { AreaType } from '../Card/types';

interface AreaIconProps {
  area: AreaType;
  size?: number;
  showBackground?: boolean;
}

export default function AreaIcon({
  area,
  size = 32,
  showBackground = true,
}: AreaIconProps) {
  const theme = useTheme();

  // Mapeia área paracor e ícone
  const areaConfig = {
    bolsa: {
      color: theme.Colors.bolsa,
      icon: 'cash' as keyof typeof Ionicons.glyphMap,
      bgColor: 'rgba(16, 185, 129, 0.15)',
    },
    mente: {
      color: theme.Colors.mente,
      icon: 'brain' as keyof typeof Ionicons.glyphMap,
      bgColor: 'rgba(59, 130, 246, 0.15)',
    },
    vitalidade: {
      color: theme.Colors.vitalidade,
      icon: 'heart' as keyof typeof Ionicons.glyphMap,
      bgColor: 'rgba(239, 68, 68, 0.15)',
    },
    proposito: {
      color: theme.Colors.proposito,
      icon: 'rocket' as keyof typeof Ionicons.glyphMap,
      bgColor: 'rgba(139, 92, 246, 0.15)',
    },
  };

  const config = areaConfig[area];

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: showBackground ? config.bgColor : 'transparent',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };

  return (
    <View style={containerStyle}>
      <Ionicons name={config.icon} size={size * 0.6} color={config.color} />
    </View>
  );
}
