import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useAuth } from '../contexts/AuthContext';
import { listAchievements, Achievement } from '../services/api';

type FilterType = 'all' | 'unlocked' | 'locked';

type AchievementWithStatus = Achievement & { unlocked: boolean };

export default function AchievementsScreen({ navigation }: any) {
  const theme = useTheme();
  const { userPhone } = useAuth();
  const [achievements, setAchievements] = useState<AchievementWithStatus[]>([]);
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  const loadAchievements = async (refresh = false) => {
    if (!refresh) setLoading(true);
    try {
      const data = await listAchievements(userPhone);
      const withStatus: AchievementWithStatus[] = [
        ...data.unlocked.map((a: Achievement) => ({ ...a, unlocked: true })),
        ...data.pending.map((a: Achievement) => ({ ...a, unlocked: false })),
      ];
      setAchievements(withStatus);
      setUnlockedCount(data.total_unlocked);
    } catch (e: any) {
      console.error('Erro ao carregar achievements:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAchievements();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAchievements(true);
  }, []);

  const filteredData = achievements.filter((ach) => {
    if (filter === 'unlocked') return ach.unlocked;
    if (filter === 'locked') return !ach.unlocked;
    return true;
  });

  // Cor baseada nos pontos (mais pontos = mais raro)
  const getRarityColor = (points: number) => {
    if (points >= 1000) return '#F59E0B'; // legendary
    if (points >= 500) return '#A855F7'; // epic
    if (points >= 200) return '#3B82F6'; // rare
    return '#9CA3AF'; // common
  };

  const renderAchievement = ({ item }: { item: AchievementWithStatus }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.Colors.white }]}
      onPress={() => navigation.navigate('AchievementDetail', { achievement: item })}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, {
        backgroundColor: item.unlocked ? getRarityColor(item.points_reward) + '20' : theme.Colors.gray100,
        borderColor: getRarityColor(item.points_reward),
        borderWidth: item.unlocked ? 2 : 1,
      }]}>
        <Text style={[styles.icon, { fontSize: 32 }]}>{item.icon || '🏆'}</Text>
        {item.unlocked && (
          <View style={[styles.unlockedBadge, { backgroundColor: theme.Colors.success }]}>
            <Text style={styles.unlockedText}>✓</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: theme.Colors.gray900 }]} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={[styles.description, { color: theme.Colors.gray600 }]} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.meta}>
          <Text style={[styles.points, { color: theme.Colors.info }]}>
            +{item.points_reward} pts
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'Todas' },
    { key: 'unlocked', label: 'Desbloqueadas' },
    { key: 'locked', label: 'Pendentes' },
  ];

  const progress = achievements.length > 0 ? Math.round((unlockedCount / achievements.length) * 100) : 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.Colors.gray50 }]}>
      <View style={[styles.header, { backgroundColor: theme.Colors.white }]}>
        <Text style={[styles.headerTitle, { color: theme.Colors.gray900, fontFamily: theme.Typography.fontFamily.bold }]}>
          Conquistas
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.Colors.gray600 }]}>
          {unlockedCount} de {achievements.length} desbloqueadas ({progress}%)
        </Text>
        <View style={[styles.progressBarContainer, { backgroundColor: theme.Colors.gray200 }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: theme.Colors.success,
                width: `${progress}%`,
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.filterContainer}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterChip,
              {
                backgroundColor: filter === f.key ? theme.Colors.info : theme.Colors.white,
                borderColor: filter === f.key ? theme.Colors.info : theme.Colors.gray300,
              },
            ]}
            onPress={() => setFilter(f.key)}
          >
            <Text
              style={[
                styles.filterLabel,
                {
                  color: filter === f.key ? theme.Colors.white : theme.Colors.gray700,
                },
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.Colors.info} />
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderAchievement}
          contentContainerStyle={styles.list}
          numColumns={2}
          columnWrapperStyle={styles.row}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={[styles.empty, { color: theme.Colors.gray500 }]}>
              Nenhuma conquista nesta categoria.
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  list: {
    padding: 8,
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    flex: 1,
    margin: 6,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  icon: {
    textAlign: 'center',
  },
  unlockedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  info: {
    alignItems: 'center',
    width: '100%',
  },
  name: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 6,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  points: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
});
