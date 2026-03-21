import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useAuth } from '../contexts/AuthContext';
import { getDashboard, DashboardResponse } from '../services/api';

const areaIcons: Record<string, string> = {
  saude: '🏃',
  foco: '🎯',
  aprendizado: '📚',
  financas: '💰',
};

const areaColorMap: Record<string, string> = {
  saude: 'bolsa',
  foco: 'mente',
  aprendizado: 'vitalidade',
  financas: 'proposito',
};

export default function DashboardScreen({ navigation }: any) {
  const theme = useTheme();
  const { userPhone } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = async (refresh = false) => {
    if (!refresh) setLoading(true);
    try {
      const res = await getDashboard(userPhone);
      setDashboard(res);
    } catch (e: any) {
      console.error('Erro ao carregar dashboard:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboard(true);
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.Colors.gray50 }]}>
        <ActivityIndicator size="large" color={theme.Colors.info} />
      </View>
    );
  }

  if (!dashboard) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.Colors.gray50 }]}>
        <Text style={{ color: theme.Colors.gray600 }}>Erro ao carregar dados</Text>
      </View>
    );
  }

  const { user } = dashboard;
  const area_scores = user.area_scores;
  const streaks = user.streaks;

  // Calculate level progress
  const currentLevel = user.level;
  const pointsForCurrentLevel = Math.pow(currentLevel, 2) * 100;
  const pointsForNextLevel = Math.pow(currentLevel + 1, 2) * 100;
  const pointsInLevel = user.total_points - pointsForCurrentLevel;
  const pointsNeeded = pointsForNextLevel - pointsForCurrentLevel;
  const progressPercent = Math.min((pointsInLevel / pointsNeeded) * 100, 100);

  const areasArray = Object.entries(area_scores) as [string, number][];

  // Helper to get area color
  const getAreaColor = (areaName: string): string => {
    const key = areaColorMap[areaName] || 'info';
    return (theme.Colors as any)[key] || theme.Colors.info;
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.Colors.gray50 }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.Colors.info }]}>
        <Text style={styles.headerTitle}>Nível {user.level}</Text>
        <Text style={styles.headerSubtitle}>
          {user.total_points.toLocaleString()} pontos
        </Text>
        <View style={[styles.progressBarContainer, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
          <View
            style={[
              styles.progressFill,
              { backgroundColor: theme.Colors.success, width: `${progressPercent}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {pointsInLevel} / {pointsNeeded} pts para nível {currentLevel + 1}
        </Text>
      </View>

      {/* Areas */}
      <Text style={[styles.sectionTitle, { color: theme.Colors.gray900 }]}>Suas Áreas</Text>
      <View style={styles.areasGrid}>
        {areasArray.map(([areaName, score]) => {
          const areaColor = getAreaColor(areaName);
          const streak = streaks[areaName] || 0;
          return (
            <TouchableOpacity
              key={areaName}
              style={[styles.areaCard, { backgroundColor: theme.Colors.white }]}
              onPress={() => navigation.navigate('Missoes')}
            >
              <View style={[styles.areaIconContainer, { backgroundColor: areaColor + '20' }]}>
                <Text style={styles.areaIcon}>{areaIcons[areaName] || '⭐'}</Text>
              </View>
              <Text style={[styles.areaName, { color: theme.Colors.gray900 }]}>
                {areaName.charAt(0).toUpperCase() + areaName.slice(1)}
              </Text>
              <Text style={[styles.areaScore, { color: areaColor }]}>
                {score.toLocaleString()} pts
              </Text>
              <View style={[styles.streakBadge, { backgroundColor: theme.Colors.warning }]}>
                <Text style={styles.streakText}>{streak}🔥</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Quick Actions */}
      <Text style={[styles.sectionTitle, { color: theme.Colors.gray900, marginTop: 24 }]}>
        Ações Rápidas
      </Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: theme.Colors.white }]}
          onPress={() => navigation.getParent()?.navigate('SpecialMissions')}
        >
          <Text style={styles.actionIcon}>⚔️</Text>
          <Text style={[styles.actionTitle, { color: theme.Colors.gray900 }]}>Missões Especiais</Text>
          <Text style={[styles.actionDesc, { color: theme.Colors.gray600 }]}>
            Desafios épicos com recompensas NFT
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: theme.Colors.white }]}
          onPress={() => navigation.navigate('Ranking')}
        >
          <Text style={styles.actionIcon}>🏆</Text>
          <Text style={[styles.actionTitle, { color: theme.Colors.gray900 }]}>Ranking</Text>
          <Text style={[styles.actionDesc, { color: theme.Colors.gray600 }]}>
            Veja sua posição global
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: theme.Colors.white }]}
          onPress={() => navigation.navigate('Perfil')}
        >
          <Text style={styles.actionIcon}>🎒</Text>
          <Text style={[styles.actionTitle, { color: theme.Colors.gray900 }]}>Inventário</Text>
          <Text style={[styles.actionDesc, { color: theme.Colors.gray600 }]}>
            Seus itens e badges NFT
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: theme.Colors.white }]}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.actionIcon}>⚙️</Text>
          <Text style={[styles.actionTitle, { color: theme.Colors.gray900 }]}>Configurações</Text>
          <Text style={[styles.actionDesc, { color: theme.Colors.gray600 }]}>
            Preferências e integração
          </Text>
        </TouchableOpacity>
      </View>

      {/* Recent Achievements */}
      {user.unlocked_achievements && user.unlocked_achievements.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: theme.Colors.gray900, marginTop: 24 }]}>
            Conquistas Recentes
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {user.unlocked_achievements.slice(0, 5).map((ach) => (
              <View key={ach.id} style={[styles.achievementCard, { backgroundColor: theme.Colors.white }]}>
                <Text style={styles.achievementIcon}>{ach.icon}</Text>
                <Text style={[styles.achievementName, { color: theme.Colors.gray900 }]} numberOfLines={1}>
                  {ach.name}
                </Text>
              </View>
            ))}
          </ScrollView>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 24, paddingTop: 40, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  progressBarContainer: { height: 8, borderRadius: 4, marginTop: 16, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressText: { fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 6 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 24, marginHorizontal: 16, marginBottom: 12 },
  areasGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16 },
  areaCard: { width: '48%', padding: 16, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, alignItems: 'center' },
  areaIconContainer: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  areaIcon: { fontSize: 24 },
  areaName: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  areaScore: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  streakBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  streakText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16 },
  actionCard: { width: '48%', padding: 16, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2, alignItems: 'center' },
  actionIcon: { fontSize: 32, marginBottom: 8 },
  actionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4, textAlign: 'center' },
  actionDesc: { fontSize: 12, textAlign: 'center' },
  achievementCard: { width: 100, height: 100, marginHorizontal: 8, borderRadius: 12, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  achievementIcon: { fontSize: 36, marginBottom: 4 },
  achievementName: { fontSize: 10, textAlign: 'center', paddingHorizontal: 4 },
});
