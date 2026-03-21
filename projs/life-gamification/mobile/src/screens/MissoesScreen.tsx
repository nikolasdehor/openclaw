import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useAuth } from '../contexts/AuthContext';
import MissionCard from '../components/Card/MissionCard';
import { getDashboard, Mission } from '../services/api';
import Copy from '../constants/copy';

const areaLabels: Record<string, string> = {
  all: 'Todas',
  saude: 'Saúde',
  foco: 'Foco',
  aprendizado: 'Aprendizado',
  financas: 'Finanças',
};

export default function MissoesScreen() {
  const theme = useTheme();
  const { userPhone } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadMissions = useCallback(async (refresh = false) => {
    if (!refresh) setLoading(true);
    try {
      const res = await getDashboard(userPhone);
      const availableMissions: Mission[] = res.available_missions || [];
      setMissions(availableMissions);
    } catch (e: any) {
      console.error('Erro ao carregar missões:', e);
      Alert.alert('Erro', 'Não foi possível carregar as missões.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userPhone]);

  const filteredMissions = useMemo(() => {
    let result = missions;
    if (selectedArea !== 'all') {
      result = result.filter(m => m.area === selectedArea);
    }
    if (searchQuery.trim()) {
      const lower = searchQuery.toLowerCase();
      result = result.filter(m =>
        m.title.toLowerCase().includes(lower) ||
        (m.description && m.description.toLowerCase().includes(lower))
      );
    }
    return result;
  }, [missions, selectedArea, searchQuery]);

  useEffect(() => {
    loadMissions();
  }, [loadMissions]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMissions(true);
  }, [loadMissions]);

  const handleComplete = (mission: Mission) => {
    Alert.alert(
      Copy.missions.confirmTitle || 'Concluir Missão',
      typeof Copy.missions.confirmMessage === 'function'
        ? Copy.missions.confirmMessage(mission.title)
        : Copy.missions.confirmMessage || `Você tem certeza que deseja marcar "${mission.title}" como concluída?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Concluir',
          style: 'default',
          onPress: async () => {
            try {
              // TODO: Call complete mission API
              Alert.alert('Sucesso!', `+${mission.points} pontos ganhos!`);
              await loadMissions(true);
              // TODO: update global dashboard/stats via Zustand or context
            } catch (e: any) {
              Alert.alert('Erro', e.message || 'Falha ao concluir missão');
            }
          },
        },
      ]
    );
  };

  const mapMissionToCardProps = (mission: Mission) => {
    const areaMap: Record<string, { key: 'bolsa' | 'mente' | 'vitalidade' | 'proposito'; name: string }> = {
      saude: { key: 'vitalidade', name: Copy.areas.vitalidade.name },
      foco: { key: 'mente', name: Copy.areas.mente.name },
      aprendizado: { key: 'mente', name: Copy.areas.mente.altName || 'Mente' },
      financas: { key: 'bolsa', name: Copy.areas.bolsa.name },
    };
    const areaInfo = areaMap[mission.area] || { key: 'bolsa', name: 'Geral' };
    const dueDate = mission.due_date ? new Date(mission.due_date) : undefined;

    return {
      title: mission.title,
      area: areaInfo.key,
      areaName: areaInfo.name,
      points: mission.points,
      difficulty: mission.difficulty as 'easy' | 'medium' | 'hard',
      completed: mission.completed,
      dueDate,
      disabled: false,
    };
  };

  const renderMission = ({ item }: { item: Mission }) => (
    <MissionCard
      {...mapMissionToCardProps(item)}
      onComplete={() => handleComplete(item)}
    />
  );

  const areas = Object.keys(areaLabels);

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.Colors.gray50 }]}>
        <ActivityIndicator size="large" color={theme.Colors.info} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.Colors.gray50 }]}>
      <Text style={[styles.title, { color: theme.Colors.gray900, fontFamily: theme.Typography.fontFamily.bold }]}>
        {Copy.missions.title || 'Missões'}
      </Text>

      <TextInput
        style={[styles.searchInput, { backgroundColor: theme.Colors.white, color: theme.Colors.gray900 }]}
        placeholder={Copy.missions.searchPlaceholder || 'Buscar missões...'}
        placeholderTextColor={theme.Colors.gray400}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View style={styles.areaFilter}>
        {areas.map(area => (
          <TouchableOpacity
            key={area}
            style={[
              styles.areaChip,
              {
                backgroundColor: selectedArea === area ? theme.Colors.info : theme.Colors.white,
                borderColor: selectedArea === area ? theme.Colors.info : theme.Colors.gray300,
              },
            ]}
            onPress={() => setSelectedArea(area)}
          >
            <Text
              style={[
                styles.areaChipText,
                {
                  color: selectedArea === area ? theme.Colors.white : theme.Colors.gray700,
                },
              ]}
            >
              {areaLabels[area]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredMissions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMission}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.Colors.gray600 }]}>
              {Copy.missions.emptyState || 'Nenhuma missão disponível'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, marginHorizontal: 16, marginTop: 16, marginBottom: 12 },
  searchInput: {
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  areaFilter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  areaChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  areaChipText: { fontSize: 12, fontWeight: '600' },
  listContent: { paddingBottom: 20 },
  emptyContainer: { flex: 1, marginTop: 60, alignItems: 'center' },
  emptyText: { fontSize: 16 },
});
