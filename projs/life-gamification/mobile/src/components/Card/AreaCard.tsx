import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import ProgressBar from '../ProgressBar/ProgressBar';
import { Ionicons } from '@expo/vector-icons';

export type AreaType = 'bolsa' | 'mente' | 'vitalidade' | 'proposito';

interface AreaCardProps {
  area: AreaType;
  areaName: string;
  icon: keyof typeof Ionicons.glyphMap;
  level: number;
  points: number;
  totalPoints: number;
  showProgressBar?: boolean;
}

export default function AreaCard({
  area,
  areaName,
  icon,
  level,
  points,
  totalPoints,
  showProgressBar = true,
}: AreaCardProps) {
  const theme = useTheme();

  // Mapeia área para cor
  const areaColorMap = {
    bolsa: theme.Colors.bolsa,
    mente: theme.Colors.mente,
    vitalidade: theme.Colors.vitalidade,
    proposito: theme.Colors.proposito,
  };

  const areaColor = areaColorMap[area];

  // Calcula progresso percentual
  const progress = totalPoints > 0 ? points / totalPoints : 0;

  // Mapeia ícone para emoji (fallback visual caso ícone não carregue)
  const iconEmojiMap: Record<AreaType, string> = {
    bolsa: '💰',
    mente: '🧠',
    vitalidade: '❤️',
    proposito: '✨',
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.Colors.gray800,
          borderRadius: theme.BorderRadius.lg,
          padding: theme.Spacing[4],
          borderLeftWidth: 4,
          borderLeftColor: areaColor,
          ...theme.Shadows.sm,
        },
      ]}
    >
      {/* Header: ícone + nome + nível */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.emoji}>{iconEmojiMap[area]}</Text>
          <Text style={[styles.areaName, { color: theme.Colors.gray100 }]}>{areaName}</Text>
        </View>
        <View
          style={[
            styles.levelBadge,
            {
              backgroundColor: areaColor,
              paddingHorizontal: theme.Spacing[3],
              paddingVertical: theme.Spacing[1],
              borderRadius: theme.BorderRadius.full,
            },
          ]}
        >
          <Text style={[styles.levelText, { color: theme.Colors.white }]}>LVL {level}</Text>
        </View>
      </View>

      {/* Progress bar */}
      {showProgressBar && (
        <View style={styles.progressContainer}>
          <ProgressBar progress={progress} color={areaColor} height={8} showLabel={false} />
          <View style={styles.pointsRow}>
            <Text style={[styles.pointsText, { color: theme.Colors.gray300 }]}>
              {points.toLocaleString('pt-BR')} / {totalPoints.toLocaleString('pt-BR')} pontos
            </Text>
            <Text style={[styles.percentText, { color: areaColor }]}>
              {Math.round(progress * 100)}%
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emoji: {
    fontSize: 24,
  },
  areaName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  levelBadge: {
    alignSelf: 'flex-start',
  },
  levelText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
  },
  progressContainer: {
    marginTop: 8,
  },
  pointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  pointsText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  percentText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
  },
});
