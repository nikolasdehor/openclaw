import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { getRanking, getLeaderboard, RankingEntry } from '../services/api';

type TabType = 'global' | 'area' | 'weekly' | 'monthly';

const areaColorMap: Record<string, string> = {
  saude: 'bolsa',
  foco: 'mente',
  aprendizado: 'vitalidade',
  financas: 'proposito',
};

export default function RankingScreen() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('global');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const areas = ['saude', 'foco', 'aprendizado', 'financas'];

  useEffect(() => {
    loadData();
  }, [activeTab, selectedArea]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      let data: RankingEntry[] = [];
      if (activeTab === 'global' || activeTab === 'area') {
        const res = await getRanking({
          area: activeTab === 'area' ? selectedArea : undefined,
          limit: 100,
        });
        data = res.ranking;
      } else {
        const res = await getLeaderboard({
          type: activeTab,
          area: (activeTab === 'weekly' || activeTab === 'monthly') ? selectedArea : undefined,
        });
        data = res.entries.map(e => ({
          position: e.position,
          user_phone: e.user_phone,
          points: e.points,
          level: 1,
        }));
      }
      setRanking(data);
    } catch (e: any) {
      setError(e.message || 'Erro ao carregar ranking');
    } finally {
      setLoading(false);
    }
  };

  const renderMedal = (position: number) => {
    if (position === 1) return <Text style={[styles.medal, { color: theme.Colors.medal.gold }]}>🥇</Text>;
    if (position === 2) return <Text style={[styles.medal, { color: theme.Colors.medal.silver }]}>🥈</Text>;
    if (position === 3) return <Text style={[styles.medal, { color: theme.Colors.medal.bronze }]}>🥉</Text>;
    return <Text style={[styles.position, { color: theme.Colors.gray600 }]}>{position}°</Text>;
  };

  const renderItem = ({ item }: { item: RankingEntry }) => (
    <View style={[styles.item, { backgroundColor: theme.Colors.white }]}>
      <View style={styles.positionContainer}>
        {renderMedal(item.position)}
      </View>
      <View style={styles.userInfo}>
        <Text style={[styles.userPhone, { color: theme.Colors.gray900 }]}>{item.user_phone}</Text>
        <Text style={[styles.details, { color: theme.Colors.gray600 }]}>
          Nível {item.level} • {item.points.toLocaleString()} pts
        </Text>
      </View>
    </View>
  );

  const tabs: { key: TabType; label: string }[] = [
    { key: 'global', label: 'Geral' },
    { key: 'area', label: 'Por Área' },
    { key: 'weekly', label: 'Semanal' },
    { key: 'monthly', label: 'Mensal' },
  ];

  const getAreaColor = (areaName: string): string => {
    return areaColorMap[areaName] || theme.Colors.info;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.Colors.gray50 }]}>
      <Text style={[styles.title, { color: theme.Colors.gray900, fontFamily: theme.Typography.fontFamily.bold }]}>
        Ranking
      </Text>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              activeTab === tab.key && { backgroundColor: theme.Colors.info },
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === tab.key ? theme.Colors.white : theme.Colors.gray600 },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Area filter */}
      {(activeTab === 'area' || activeTab === 'weekly' || activeTab === 'monthly') && (
        <View style={styles.areaSelector}>
          {areas.map((area) => {
            const isSelected = selectedArea === area;
            const areaColor = getAreaColor(area);
            return (
              <TouchableOpacity
                key={area}
                style={[
                  styles.areaButton,
                  { borderColor: isSelected ? areaColor : theme.Colors.gray300, borderWidth: 2 },
                ]}
                onPress={() => setSelectedArea(area)}
              >
                <Text
                  style={[
                    styles.areaText,
                    { color: isSelected ? areaColor : theme.Colors.gray700 },
                  ]}
                >
                  {area.charAt(0).toUpperCase() + area.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.Colors.info} />
        </View>
      )}

      {error && (
        <View style={styles.center}>
          <Text style={{ color: theme.Colors.error }}>{error}</Text>
        </View>
      )}

      {!loading && !error && (
        <FlatList
          data={ranking}
          keyExtractor={(item) => item.position.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: theme.Colors.gray600, textAlign: 'center', marginTop: 40 }]}>
              Nenhum ranking disponível
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, marginBottom: 16 },
  tabContainer: { flexDirection: 'row', marginBottom: 12, borderRadius: 8, overflow: 'hidden' },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: '#E5E7EB' },
  tabText: { fontSize: 12, fontWeight: '600' },
  areaSelector: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  areaButton: { flex: 1, paddingVertical: 8, marginHorizontal: 4, borderRadius: 6, alignItems: 'center', backgroundColor: '#F3F4F6' },
  areaText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingBottom: 20 },
  item: { flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 8, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  positionContainer: { width: 40, alignItems: 'center' },
  medal: { fontSize: 24 },
  position: { fontSize: 16, fontWeight: 'bold' },
  userInfo: { flex: 1, marginLeft: 12 },
  userPhone: { fontSize: 16, fontWeight: '600' },
  details: { fontSize: 12, marginTop: 2 },
  empty: {},
});
