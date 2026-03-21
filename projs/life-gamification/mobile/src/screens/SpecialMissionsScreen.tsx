import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useAuth } from '../contexts/AuthContext';
import { getSpecialMissions, completeSpecialMission, SpecialMission } from '../services/api';

export default function SpecialMissionsScreen() {
  const theme = useTheme();
  const { userPhone } = useAuth();
  const [missions, setMissions] = useState<SpecialMission[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMissions(userPhone);
  }, [userPhone]);

  const loadMissions = async (phone: string) => {
    if (!phone) return;
    setLoading(true);
    try {
      const res = await getSpecialMissions(phone);
      setMissions(res.special_missions);
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Falha ao carregar missões especiais');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (missionId: number, title: string) => {
    Alert.alert(
      'Concluir Missão Especial',
      `Você tem certeza que deseja marcar "${title}" como concluída?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Concluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await completeSpecialMission({
                user_phone: userPhone,
                special_mission_id: missionId,
              });
              Alert.alert('Sucesso!', `+${res.points_awarded} pontos ganhos!`);
              await loadMissions(userPhone);
              // TODO: atualizar dashboard/stats global
            } catch (e: any) {
              Alert.alert('Erro', e.message || 'Falha ao concluir missão');
            }
          },
        },
      ]
    );
  };

  const renderMission = ({ item }: { item: SpecialMission }) => {
    const isCompleted = item.completed;
    const isClaimed = item.claimed;
    const canClaim = item.available_to_claim;

    // Parse requirements to show progress
    const req = item.requirements;
    const progress = JSON.parse(item.progress || '{}');

    return (
      <View style={[styles.card, { backgroundColor: theme.Colors.white }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: theme.Colors.gray900 }]}>{item.title}</Text>
          {isCompleted && !isClaimed && (
            <View style={[styles.badge, { backgroundColor: theme.Colors.success }]}>
              <Text style={styles.badgeText}>✓ Concluída</Text>
            </View>
          )}
          {isClaimed && (
            <View style={[styles.badge, { backgroundColor: theme.Colors.gray400 }]}>
              <Text style={styles.badgeText}>✓ Reclamada</Text>
            </View>
          )}
        </View>

        <Text style={[styles.description, { color: theme.Colors.gray600 }]}>{item.description}</Text>

        {item.area && (
          <View style={[styles.areaTag, { backgroundColor: theme.Colors.gray100 }]}>
            <Text style={[styles.areaText, { color: theme.Colors.gray700 }]}>
              {item.area_icon} {item.area}
            </Text>
          </View>
        )}

        {/* Requirements display */}
        <View style={styles.requirements}>
          <Text style={[styles.reqTitle, { color: theme.Colors.gray700 }]}>Requisitos:</Text>
          {Object.entries(req).map(([key, val]: [string, any]) => (
            <Text key={key} style={[styles.reqItem, { color: theme.Colors.gray600 }]}>
              • {key.replace(/_/g, ' ')}: {JSON.stringify(val)}
            </Text>
          ))}
        </View>

        {/* Progress */}
        {Object.keys(progress).length > 0 && (
          <View style={styles.progressContainer}>
            <Text style={[styles.progressLabel, { color: theme.Colors.gray700 }]}>Progresso:</Text>
            <Text style={[styles.progressValue, { color: theme.Colors.info }]}>
              {JSON.stringify(progress)}
            </Text>
          </View>
        )}

        {/* Rewards */}
        <View style={styles.rewardsContainer}>
          <View style={styles.rewardItem}>
            <Text style={[styles.rewardLabel, { color: theme.Colors.gray700 }]}>Pontos:</Text>
            <Text style={[styles.rewardValue, { color: theme.Colors.success }]}>
              +{item.reward_points}
            </Text>
          </View>
          {item.reward_item_id && (
            <View style={styles.rewardItem}>
              <Text style={[styles.rewardLabel, { color: theme.Colors.gray700 }]}>Item:</Text>
              <Text style={[styles.rewardValue, { color: theme.Colors.gray900 }]}>🎁 Desbloqueado</Text>
            </View>
          )}
        </View>

        {/* Action button */}
        {!isCompleted && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.Colors.info }]}
            onPress={() => handleComplete(item.id, item.title)}
          >
            <Text style={[styles.actionButtonText, { color: theme.Colors.white }]}>
              Marcar como Concluída
            </Text>
          </TouchableOpacity>
        )}
        {canClaim && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.Colors.success }]}
            onPress={() => {
              Alert.alert('Recompensa', 'Você pode reclamar sua recompensa no inventário!');
            }}
          >
            <Text style={[styles.actionButtonText, { color: theme.Colors.white }]}>
              Reclamar Recompensa
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.Colors.gray50 }]}>
      <Text style={[styles.title, { color: theme.Colors.gray900, fontFamily: theme.Typography.fontFamily.bold }]}>
        Missões Especiais
      </Text>
      <Text style={[styles.subtitle, { color: theme.Colors.gray600 }]}>
        Meta-game: desafios épicos que desbloqueiam itens exclusivos
      </Text>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.Colors.info} />
        </View>
      )}

      {!loading && missions.length === 0 && (
        <View style={styles.center}>
          <Text style={{ color: theme.Colors.gray600 }}>Nenhuma missão especial disponível</Text>
        </View>
      )}

      <FlatList
        data={missions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMission}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  areaTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  areaText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  requirements: {
    marginBottom: 12,
  },
  reqTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  reqItem: {
    fontSize: 12,
    marginLeft: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  progressValue: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  rewardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardLabel: {
    fontSize: 12,
    marginRight: 6,
  },
  rewardValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
