import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Share,
  Alert,
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useTheme } from '../theme/ThemeProvider';
import { getDashboard, DashboardResponse } from '../services/api';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen(_props: any) {
  const theme = useTheme();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [userPhone] = useState<string>('+556286077431');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const res = await getDashboard(userPhone);
      setDashboard(res);
    } catch (e) {
      console.error('Erro ao carregar analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!dashboard) return;
    const message = `🚀 Meu progresso no Life Gamification!\n\nNível: ${dashboard.user.level}\nPontos: ${dashboard.user.total_points.toLocaleString()}\nStreak: ${Object.values(dashboard.user.streaks).reduce((a: number, b: number) => a + b, 0)} dias\n\nBaixe o app e comece sua jornada!`;
    try {
      await Share.share({
        message,
        title: 'Meu Progresso - Life Gamification',
      });
    } catch {
      Alert.alert('Erro', 'Não foi possível compartilhar');
    }
  };

  const handleExportData = async () => {
    if (!dashboard) return;
    const data = JSON.stringify(dashboard, null, 2);
    const filename = `life-gamification-backup-${new Date().toISOString().split('T')[0]}.json`;
    try {
      if (Platform.OS === 'ios') {
        // iOS: copy to clipboard
        await Share.share({ message: data, title: filename });
      } else {
        // Android: share
        await Share.share({ message: data, title: filename });
      }
      Alert.alert('Sucesso', 'Dados exportados com sucesso!');
    } catch {
      Alert.alert('Erro', 'Não foi possível exportar dados');
    }
  };

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
  const areaScores = user.area_scores;
  const streaks = user.streaks;
  const totalStreak = Object.values(streaks).reduce((sum: number, val: number) => sum + val, 0);

  // Simular histórico de pontos últimos 7 dias (para gráfico)
  // Na prática, viria de API separada. Aqui usamos模拟数据
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toLocaleDateString('pt-BR', { weekday: 'short' });
  });

  const simulatedPoints = [120, 150, 180, 200, 170, 220, user.total_points % 300 + 100];

  const areaLabels = Object.keys(areaScores).map(area => area.charAt(0).toUpperCase() + area.slice(1));
  const areaValues = Object.values(areaScores);

  const chartConfig = {
    backgroundColor: theme.Colors.white,
    backgroundGradientFrom: theme.Colors.white,
    backgroundGradientTo: theme.Colors.white,
    decimalPlaces: 0,
    color: (opacity = 1) => theme.Colors.info + Math.floor(opacity * 255).toString(16),
    labelColor: (opacity = 1) => theme.Colors.gray900,
    style: { borderRadius: 16 },
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.Colors.gray50 }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.Colors.info }]}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <Text style={styles.headerSubtitle}>Métricas e progresso</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: theme.Colors.white }]}>
          <Text style={[styles.statValue, { color: theme.Colors.info }]}>{user.level}</Text>
          <Text style={[styles.statLabel, { color: theme.Colors.gray600 }]}>Nível</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.Colors.white }]}>
          <Text style={[styles.statValue, { color: theme.Colors.success }]}>{user.total_points.toLocaleString()}</Text>
          <Text style={[styles.statLabel, { color: theme.Colors.gray600 }]}>Pontos</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.Colors.white }]}>
          <Text style={[styles.statValue, { color: theme.Colors.warning }]}>{totalStreak}</Text>
          <Text style={[styles.statLabel, { color: theme.Colors.gray600 }]}>Streak Total</Text>
        </View>
      </View>

      {/* Points Trend Chart */}
      <View style={[styles.card, { backgroundColor: theme.Colors.white }]}>
        <Text style={[styles.cardTitle, { color: theme.Colors.gray900 }]}>Pontuação ( últimos 7 dias )</Text>
        <LineChart
          data={{
            labels: last7Days,
            datasets: [{ data: simulatedPoints }],
          }}
          width={screenWidth - 32}
          height={200}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Area Scores Bar Chart */}
      <View style={[styles.card, { backgroundColor: theme.Colors.white }]}>
        <Text style={[styles.cardTitle, { color: theme.Colors.gray900 }]}>Pontos por Área</Text>
        <BarChart
          data={{
            labels: areaLabels,
            datasets: [{ data: areaValues }],
          }}
          width={screenWidth - 32}
          height={200}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => theme.Colors.bolsa + Math.floor(opacity * 255).toString(16),
          }}
          style={styles.chart}
          showValuesOnTopOfBars
          yAxisLabel=""
          yAxisSuffix=""
        />
      </View>

      {/* Streaks by Area */}
      <View style={[styles.card, { backgroundColor: theme.Colors.white }]}>
        <Text style={[styles.cardTitle, { color: theme.Colors.gray900 }]}>Streaks por Área</Text>
        {Object.entries(streaks).map(([area, streak]) => (
          <View key={area} style={styles.streakRow}>
            <Text style={[styles.streakArea, { color: theme.Colors.gray900 }]}>
              {area.charAt(0).toUpperCase() + area.slice(1)}
            </Text>
            <View style={[styles.streakBadge, { backgroundColor: theme.Colors.warning }]}>
              <Text style={styles.streakText}>{streak}🔥</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.Colors.info }]}
          onPress={handleShare}
        >
          <Text style={styles.actionIcon}>📤</Text>
          <Text style={styles.actionText}>Compartilhar Progresso</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.Colors.bolsa }]}
          onPress={handleExportData}
        >
          <Text style={styles.actionIcon}>📊</Text>
          <Text style={styles.actionText}>Exportar Dados (JSON)</Text>
        </TouchableOpacity>
      </View>

      {/* Insights */}
      <View style={[styles.card, { backgroundColor: theme.Colors.white }]}>
        <Text style={[styles.cardTitle, { color: theme.Colors.gray900 }]}>Insights</Text>
        <View style={styles.insightItem}>
          <Text style={styles.insightIcon}>💡</Text>
          <Text style={[styles.insightText, { color: theme.Colors.gray700 }]}>
            Sua área mais forte é {areaLabels[0] || 'N/A'} com {areaValues[0] || 0} pontos.
          </Text>
        </View>
        <View style={styles.insightItem}>
          <Text style={styles.insightIcon}>🎯</Text>
          <Text style={[styles.insightText, { color: theme.Colors.gray700 }]}>
            Você tem {totalStreak} dias de streak no total. Continue assim!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 24, paddingTop: 40, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  statsGrid: { flexDirection: 'row', padding: 16, gap: 12 },
  statCard: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  statValue: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  statLabel: { fontSize: 12 },
  card: { marginHorizontal: 16, marginTop: 16, padding: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  chart: { marginVertical: 8, borderRadius: 16 },
  streakRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  streakArea: { fontSize: 16, fontWeight: '500' },
  streakBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  streakText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  actions: { flexDirection: 'row', padding: 16, gap: 12, marginTop: 16 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, gap: 8 },
  actionIcon: { fontSize: 20 },
  actionText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  insightItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  insightIcon: { fontSize: 20, marginRight: 8 },
  insightText: { flex: 1, fontSize: 14, lineHeight: 20 },
});