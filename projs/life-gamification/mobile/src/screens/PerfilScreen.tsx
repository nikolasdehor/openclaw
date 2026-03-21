import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useAuth } from '../contexts/AuthContext';
import { getDashboard, DashboardResponse, getStoreAchievements, syncStoreAchievements } from '../services/api';

export default function PerfilScreen({ navigation }: any) {
  const theme = useTheme();
  const { userPhone } = useAuth();
  const [stats, setStats] = useState<DashboardResponse['user'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await getDashboard(userPhone);
      setStats(res.user);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncStore = async (storeType: 'apple' | 'google') => {
    try {
      const storeName = storeType === 'apple' ? 'Game Center' : 'Play Games';
      const achievements = await getStoreAchievements(userPhone, storeType);
      if (achievements.achievements.length === 0) {
        Alert.alert('Nenhuma conquista', 'Não há conquistas novas para sincronizar.');
        return;
      }
      const ids = achievements.achievements.map(a => a.id);
      await syncStoreAchievements({
        user_phone: userPhone,
        store_type: storeType,
        achievement_ids: ids,
      });
      Alert.alert('Sucesso!', `${ids.length} conquistas sincronizadas com ${storeName}.`);
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Falha ao sincronizar conquistas');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.Colors.gray50 }]}>
        <ActivityIndicator size="large" color={theme.Colors.info} />
      </View>
    );
  }

  const userStats = stats || { level: 1, total_points: 0, unlocked_achievements: [] };

  const totalStreak = stats ? Object.values(stats.streaks).reduce((sum: number, val: number) => sum + val, 0) : 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.Colors.gray50 }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.Colors.white }]}>
        <View style={[styles.avatar, { backgroundColor: theme.Colors.gray200 }]}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <Text style={[styles.phone, { color: theme.Colors.gray900 }]}>
          {userPhone}
        </Text>
        <View style={[styles.levelBadge, { backgroundColor: theme.Colors.bolsa }]}>
          <Text style={styles.levelText}>Nível {userStats.level}</Text>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: theme.Colors.white }]}>
          <Text style={[styles.statValue, { color: theme.Colors.info }]}>
            {userStats.total_points.toLocaleString()}
          </Text>
          <Text style={[styles.statLabel, { color: theme.Colors.gray600 }]}>Pontos Totais</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.Colors.white }]}>
          <Text style={[styles.statValue, { color: theme.Colors.warning }]}>
            {totalStreak}
          </Text>
          <Text style={[styles.statLabel, { color: theme.Colors.gray600 }]}>Streak Total</Text>
        </View>
      </View>

      {/* Achievements count */}
      <View style={[styles.card, { backgroundColor: theme.Colors.white }]}>
        <Text style={[styles.cardTitle, { color: theme.Colors.gray900 }]}>Conquistas</Text>
        <View style={styles.achievementsRow}>
          <Text style={[styles.achievementsCount, { color: theme.Colors.info }]}>
            {userStats.unlocked_achievements.length}
          </Text>
          <Text style={[styles.achievementsLabel, { color: theme.Colors.gray600 }]}>
            desbloqueadas
          </Text>
        </View>
      </View>

      {/* Menu */}
      <Text style={[styles.sectionTitle, { color: theme.Colors.gray900, marginTop: 24 }]}>
        Mais
      </Text>
      <View style={styles.menuList}>
        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: theme.Colors.white }]}
          onPress={() => navigation.navigate('Achievements')}
        >
          <Text style={styles.menuIcon}>🏆</Text>
          <View style={styles.menuItemContent}>
            <Text style={[styles.menuTitle, { color: theme.Colors.gray900 }]}>Conquistas</Text>
            <Text style={[styles.menuDesc, { color: theme.Colors.gray600 }]}>
              Veja todas as suas badges e recompensas
            </Text>
          </View>
          <Text style={[styles.menuArrow, { color: theme.Colors.gray400 }]}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: theme.Colors.white }]}
          onPress={() => {
            Alert.alert(
              'Sincronizar Conquistas',
              'Escolha a plataforma para sincronizar suas conquistas:',
              [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Game Center (iOS)', onPress: () => handleSyncStore('apple') },
                { text: 'Play Games (Android)', onPress: () => handleSyncStore('google') },
              ]
            );
          }}
        >
          <Text style={styles.menuIcon}>🔄</Text>
          <View style={styles.menuItemContent}>
            <Text style={[styles.menuTitle, { color: theme.Colors.gray900 }]}>Sincronizar Store</Text>
            <Text style={[styles.menuDesc, { color: theme.Colors.gray600 }]}>
              Envie conquistas para Game Center / Play Games
            </Text>
          </View>
          <Text style={[styles.menuArrow, { color: theme.Colors.gray400 }]}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: theme.Colors.white }]}
          onPress={() => navigation.navigate('Inventory')}
        >
          <Text style={styles.menuIcon}>🎒</Text>
          <View style={styles.menuItemContent}>
            <Text style={[styles.menuTitle, { color: theme.Colors.gray900 }]}>Inventário</Text>
            <Text style={[styles.menuDesc, { color: theme.Colors.gray600 }]}>
              Badges, perks e itens colecionáveis
            </Text>
          </View>
          <Text style={[styles.menuArrow, { color: theme.Colors.gray400 }]}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: theme.Colors.white }]}
          onPress={() => navigation.navigate('Ranking')}
        >
          <Text style={styles.menuIcon}>🏆</Text>
          <View style={styles.menuItemContent}>
            <Text style={[styles.menuTitle, { color: theme.Colors.gray900 }]}>Ranking</Text>
            <Text style={[styles.menuDesc, { color: theme.Colors.gray600 }]}>
              Veja sua posição nos leaderboards
            </Text>
          </View>
          <Text style={[styles.menuArrow, { color: theme.Colors.gray400 }]}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: theme.Colors.white }]}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.menuIcon}>⚙️</Text>
          <View style={styles.menuItemContent}>
            <Text style={[styles.menuTitle, { color: theme.Colors.gray900 }]}>Configurações</Text>
            <Text style={[styles.menuDesc, { color: theme.Colors.gray600 }]}>
              Preferências do app
            </Text>
          </View>
          <Text style={[styles.menuArrow, { color: theme.Colors.gray400 }]}>›</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 24 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  avatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 40 },
  phone: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  levelBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  levelText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  statsGrid: { flexDirection: 'row', padding: 16, gap: 12 },
  statCard: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  statValue: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  statLabel: { fontSize: 12 },
  card: { marginHorizontal: 16, marginTop: 16, padding: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  achievementsRow: { flexDirection: 'row', alignItems: 'baseline' },
  achievementsCount: { fontSize: 28, fontWeight: 'bold' },
  achievementsLabel: { fontSize: 14, marginLeft: 6 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 16, marginBottom: 12 },
  menuList: { paddingHorizontal: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  menuIcon: { fontSize: 28, marginRight: 12 },
  menuItemContent: { flex: 1 },
  menuTitle: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  menuDesc: { fontSize: 12 },
  menuArrow: { fontSize: 24 },
});