import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import type { Achievement } from '../services/api';

interface AchievementDetailScreenProps {
  route?: {
    params?: {
      achievement: Achievement & { unlocked: boolean };
    };
  };
}

export default function AchievementDetailScreen({ route }: AchievementDetailScreenProps) {
  const theme = useTheme();
  const achievement = route?.params?.achievement;

  if (!achievement) {
    return (
      <View style={[styles.container, { backgroundColor: theme.Colors.gray50 }]}>
        <Text style={{ color: theme.Colors.gray600 }}>Conquista não encontrada</Text>
      </View>
    );
  }

  // Determina cor baseada nos pontos (mais pontos = mais raro)
  const getRarityColor = (points: number) => {
    if (points >= 1000) return '#F59E0B'; // legendary
    if (points >= 500) return '#A855F7'; // epic
    if (points >= 200) return '#3B82F6'; // rare
    return theme.Colors.gray400; // common
  };

  const rarityColor = getRarityColor(achievement.points_reward);
  const rarityLabel = achievement.points_reward >= 1000 ? 'Lendário' :
                      achievement.points_reward >= 500 ? 'Épico' :
                      achievement.points_reward >= 200 ? 'Raro' : 'Comum';

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.Colors.gray50 }]}>
      <View style={[styles.header, { backgroundColor: theme.Colors.white }]}>
        <View style={[styles.iconContainer, {
          backgroundColor: achievement.unlocked ? rarityColor + '15' : theme.Colors.gray100,
          borderColor: rarityColor,
          borderWidth: achievement.unlocked ? 3 : 1,
        }]}>
          <Text style={styles.icon}>{achievement.icon || '🏆'}</Text>
          {achievement.unlocked && (
            <View style={[styles.unlockedBadge, { backgroundColor: theme.Colors.success }]}>
              <Text style={styles.unlockedText}>✓</Text>
            </View>
          )}
        </View>
        <Text style={[styles.title, { color: theme.Colors.gray900 }]}>
          {achievement.name}
        </Text>
        <View style={[styles.rarityBadge, { backgroundColor: rarityColor + '20', borderColor: rarityColor }]}>
          <Text style={[styles.rarityText, { color: rarityColor }]}>
            {rarityLabel}
          </Text>
        </View>
      </View>

      <View style={[styles.body, { backgroundColor: theme.Colors.white, marginTop: 8 }]}>
        <Text style={[styles.sectionTitle, { color: theme.Colors.gray900 }]}>Descrição</Text>
        <Text style={[styles.description, { color: theme.Colors.gray700 }]}>
          {achievement.description}
        </Text>

        <View style={[styles.divider, { backgroundColor: theme.Colors.gray200 }]} />

        <Text style={[styles.sectionTitle, { color: theme.Colors.gray900 }]}>Requisitos</Text>
        <Text style={[styles.requirement, { color: theme.Colors.gray700 }]}>
          {achievement.condition_type.replace('_', ' ')}: {achievement.condition_value}
        </Text>

        <View style={[styles.divider, { backgroundColor: theme.Colors.gray200 }]} />

        <View style={styles.rewardsContainer}>
          <Text style={[styles.sectionTitle, { color: theme.Colors.gray900 }]}>Recompensas</Text>
          <View style={styles.rewardRow}>
            <Text style={[styles.rewardIcon, { color: theme.Colors.warning }]}>⭐</Text>
            <Text style={[styles.rewardText, { color: theme.Colors.gray700 }]}>
              +{achievement.points_reward} pontos
            </Text>
          </View>
          {achievement.nft_contract && (
            <View style={styles.rewardRow}>
              <Text style={[styles.rewardIcon, { color: theme.Colors.info }]}>🎟️</Text>
              <Text style={[styles.rewardText, { color: theme.Colors.gray700 }]}>
                NFT unique badge
              </Text>
            </View>
          )}
        </View>

        {achievement.unlocked && achievement.unlocked_at && (
          <>
            <View style={[styles.divider, { backgroundColor: theme.Colors.gray200 }]} />
            <Text style={[styles.unlockedAt, { color: theme.Colors.success }]}>
              Desbloqueada em {new Date(achievement.unlocked_at).toLocaleDateString('pt-BR')}
            </Text>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  icon: {
    fontSize: 48,
  },
  unlockedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  unlockedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  rarityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  rarityText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  body: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  requirement: {
    fontSize: 15,
    lineHeight: 22,
  },
  rewardsContainer: {
    marginTop: 4,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  rewardIcon: {
    fontSize: 18,
  },
  rewardText: {
    fontSize: 15,
  },
  unlockedAt: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
  },
});
