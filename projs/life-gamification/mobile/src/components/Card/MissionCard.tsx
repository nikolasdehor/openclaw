import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import Badge from '../Badge/Badge';
import { Ionicons } from '@expo/vector-icons';
import { MissionCardProps } from './types';

export default function MissionCard({
  title,
  area,
  areaName,
  points,
  difficulty = 'medium',
  completed = false,
  onComplete,
  dueDate,
  disabled = false,
}: MissionCardProps) {
  const theme = useTheme();

  // Mapeia dificuldade para cor e label
  const difficultyMap = {
    easy: { color: theme.Colors.success, label: 'Fácil' },
    medium: { color: theme.Colors.warning, label: 'Médio' },
    hard: { color: theme.Colors.error, label: 'Difícil' },
  };

  const diffInfo = difficultyMap[difficulty];

  // Mapeia área para cor e emoji
  const areaColorMap = {
    bolsa: theme.Colors.bolsa,
    mente: theme.Colors.mente,
    vitalidade: theme.Colors.vitalidade,
    proposito: theme.Colors.proposito,
  };

  const areaEmojiMap: Record<string, string> = {
    bolsa: '💰',
    mente: '🧠',
    vitalidade: '❤️',
    proposito: '✨',
  };

  const areaColor = areaColorMap[area] || theme.Colors.gray500;
  const areaEmoji = areaEmojiMap[area] || '🎯';

  // Formata data de expiração
  const formatDueDate = (date: Date) => {
    const now = new Date();
    const diffHours = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60));
    if (diffHours < 24) {
      return `Expira em ${diffHours}h`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `Expira em ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
    }
  };

  // Estilo principal do card
  const cardStyle = [
    styles.container,
    {
      backgroundColor: theme.Colors.gray800,
      borderRadius: theme.BorderRadius.lg,
      padding: theme.Spacing[4],
      borderLeftWidth: completed ? 0 : 4,
      borderLeftColor: completed ? 'transparent' : areaColor,
      opacity: completed ? 0.7 : 1,
    },
  ];

  // Botão de completar
  const renderActionButton = () => {
    if (completed) {
      return (
        <View
          style={[
            styles.completedBadge,
            {
              backgroundColor: theme.Colors.success,
              paddingHorizontal: theme.Spacing[4],
              paddingVertical: theme.Spacing[2],
              borderRadius: theme.BorderRadius.md,
            },
          ]}
        >
          <Ionicons name="checkmark-circle" size={18} color={theme.Colors.black} />
          <Text style={[styles.completedText, { color: theme.Colors.black }]}>Concluída</Text>
        </View>
      );
    }

    if (disabled) {
      return (
        <View
          style={[
            styles.disabledBadge,
            {
              backgroundColor: theme.Colors.gray700,
              paddingHorizontal: theme.Spacing[4],
              paddingVertical: theme.Spacing[2],
              borderRadius: theme.BorderRadius.md,
            },
          ]}
        >
          <Ionicons name="lock-closed" size={18} color={theme.Colors.gray400} />
          <Text style={[styles.disabledText, { color: theme.Colors.gray400 }]}>Bloqueada</Text>
        </View>
      );
    }

    return (
      <View style={styles.actionRow}>
        {dueDate && (
          <Badge variant="status" value={formatDueDate(dueDate)} status="pending" size="small" />
        )}
        <View style={styles.pointsBadge}>
          <Badge variant="points" value={`+${points}`} />
        </View>
        <View
          style={[
            styles.completeButton,
            {
              backgroundColor: areaColor,
              paddingHorizontal: theme.Spacing[4],
              paddingVertical: theme.Spacing[2],
              borderRadius: theme.BorderRadius.md,
            },
          ]}
        >
          <Ionicons name="checkmark" size={18} color={theme.Colors.white} />
          <Text style={[styles.completeButtonText, { color: theme.Colors.white }]}>
            Completar missão
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={cardStyle}>
      {/* Header: título + dificuldade */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.areaEmoji]}>{areaEmoji}</Text>
          <Text style={[styles.title, { color: theme.Colors.gray100 }]}>{title}</Text>
        </View>
        <Badge variant="status" value={diffInfo.label} color={diffInfo.color} size="small" />
      </View>

      {/* Área e pontos */}
      <View style={styles.metaRow}>
        <Text style={[styles.areaLabel, { color: theme.Colors.gray400 }]}>
          {areaName} • +{points} pts
        </Text>
      </View>

      {/* Ação: botão completar ou badges */}
      <View style={styles.actionContainer}>{renderActionButton()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  areaEmoji: {
    fontSize: 20,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    flex: 1,
  },
  metaRow: {
    marginBottom: 12,
  },
  areaLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
  },
  actionContainer: {
    marginTop: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  pointsBadge: {
    alignSelf: 'flex-start',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-end',
  },
  completeButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  completedText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  disabledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  disabledText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
});
