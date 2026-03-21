import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Clipboard,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { getDashboard, DashboardResponse } from '../services/api';

export default function SocialScreen({ navigation }: any) {
  const theme = useTheme();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [userPhone] = useState<string>('+556286077431');

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await getDashboard(userPhone);
      setDashboard(res);
    } catch (e) {
      console.error('Erro ao carregar dados:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleShareAchievement = async (achievement: any) => {
    const message = `🏆 Desbloqueei a conquista "${achievement.name}" no Life Gamification!\n\n${achievement.description}\n\nJunte-se a mim e comece sua jornada de gamificação!`;
    try {
      await Share.share({
        message,
        title: 'Conquista Desbloqueada!',
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível compartilhar');
    }
  };

  const handleInviteFriend = async () => {
    const inviteText = `🚀 Junte-se a mim no Life Gamification!\n\nEstou usando este app para transformar minha vida em um jogo. Complete missões, ganhe pontos e suba de nível!\n\nBaixe o app: https://life-gamification.example.com (ou escaneie o QR no app)\n\nMeu código de convite: ${userPhone.replace('+', '')}`;
    try {
      await Share.share({
        message: inviteText,
        title: 'Convite para Life Gamification',
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível enviar convite');
    }
  };

  const handleCopyReferralCode = async () => {
    const code = userPhone.replace('+', '');
    try {
      await Clipboard.setString(code);
      Alert.alert('Copiado!', 'Código de convite copiado para a área de transferência');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível copiar');
    }
  };

  const handleConnectWhatsApp = async () => {
    const message = encodeURIComponent(`Olá! Estou usando o Life Gamification e gostaria de conectar minha conta para receber notificações. Meu número: ${userPhone}`);
    const url = `https://wa.me/556286077431?text=${message}`;
    // Poderia abrirlinking, mas por enquanto share
    try {
      await Share.share({
        message: `Contato: ${url}`,
        title: 'Conectar WhatsApp',
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível abrir WhatsApp');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.Colors.gray50 }]}>
        <Text style={{ color: theme.Colors.gray600 }}>Carregando...</Text>
      </View>
    );
  }

  const recentAchievements = dashboard?.user.unlocked_achievements.slice(0, 3) || [];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.Colors.gray50 }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.Colors.bolsa }]}>
        <Text style={styles.headerTitle}>Social & Compartilhar</Text>
        <Text style={styles.headerSubtitle}>Conecte-se e compartilhe conquistas</Text>
      </View>

      {/* Referral Code */}
      <View style={[styles.card, { backgroundColor: theme.Colors.white }]}>
        <Text style={[styles.cardTitle, { color: theme.Colors.gray900 }]}>Seu Código de Convite</Text>
        <View style={[styles.codeBox, { backgroundColor: theme.Colors.gray100 }]}>
          <Text style={[styles.codeText, { color: theme.Colors.gray900 }]}>
            {userPhone.replace('+', '')}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.copyButton, { backgroundColor: theme.Colors.info }]}
          onPress={handleCopyReferralCode}
        >
          <Text style={styles.buttonText}>Copiar Código</Text>
        </TouchableOpacity>
        <Text style={[styles.cardHint, { color: theme.Colors.gray500 }]}>
          Compartilhe com amigos e ganhe pontos extras por cada convite usado!
        </Text>
      </View>

      {/* Invite Actions */}
      <View style={[styles.card, { backgroundColor: theme.Colors.white }]}>
        <Text style={[styles.cardTitle, { color: theme.Colors.gray900 }]}>Convidar Amigos</Text>

        <TouchableOpacity
          style={[styles.actionRow, { borderBottomColor: theme.Colors.gray200 }]}
          onPress={handleInviteFriend}
        >
          <Text style={styles.actionIcon}>📨</Text>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: theme.Colors.gray900 }]}>Enviar Convite</Text>
            <Text style={[styles.actionDesc, { color: theme.Colors.gray600 }]}>
              Compartilhe via WhatsApp, email, etc.
            </Text>
          </View>
          <Text style={[styles.arrow, { color: theme.Colors.gray400 }]}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionRow}
          onPress={handleConnectWhatsApp}
        >
          <Text style={styles.actionIcon}>💬</Text>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: theme.Colors.gray900 }]}>Conectar WhatsApp</Text>
            <Text style={[styles.actionDesc, { color: theme.Colors.gray600 }]}>
              Receba notificações no WhatsApp
            </Text>
          </View>
          <Text style={[styles.arrow, { color: theme.Colors.gray400 }]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Share Achievements */}
      <View style={[styles.card, { backgroundColor: theme.Colors.white }]}>
        <Text style={[styles.cardTitle, { color: theme.Colors.gray900 }]}>Compartilhar Conquistas</Text>
        <Text style={[styles.cardHint, { color: theme.Colors.gray600, marginBottom: 12 }]}>
          Compartilhe suas conquistas nas redes sociais
        </Text>

        {recentAchievements.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.Colors.gray500 }]}>
            Nenhuma conquista ainda. Complete missões para desbloquear!
          </Text>
        ) : (
          recentAchievements.map((achievement) => (
            <TouchableOpacity
              key={achievement.id}
              style={[styles.achievementRow, { borderBottomColor: theme.Colors.gray200 }]}
              onPress={() => handleShareAchievement(achievement)}
            >
              <Text style={styles.achievementIcon}>{achievement.icon}</Text>
              <View style={styles.achievementContent}>
                <Text style={[styles.achievementName, { color: theme.Colors.gray900 }]}>
                  {achievement.name}
                </Text>
                <Text style={[styles.achievementDesc, { color: theme.Colors.gray600 }]} numberOfLines={1}>
                  {achievement.description}
                </Text>
              </View>
              <Text style={[styles.shareIcon, { color: theme.Colors.info }]}>📤</Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Leaderboard Sharing */}
      <View style={[styles.card, { backgroundColor: theme.Colors.white }]}>
        <Text style={[styles.cardTitle, { color: theme.Colors.gray900 }]}>Compartilhar Ranking</Text>
        <TouchableOpacity
          style={[styles.shareRankingButton, { backgroundColor: theme.Colors.warning }]}
          onPress={() => {
            const message = `🏆 Estou no ranking do Life Gamification!\n\nNível: ${dashboard?.user.level}\nPontos: ${dashboard?.user.total_points.toLocaleString()}\n\nVocê consegue me superar?`;
            Share.share({ message, title: 'Meu Ranking' });
          }}
        >
          <Text style={[styles.buttonText, { color: theme.Colors.gray900 }]}>Compartilhar Minha Posição</Text>
        </TouchableOpacity>
      </View>

      {/* Social Features Info */}
      <View style={[styles.infoCard, { backgroundColor: theme.Colors.gray100 }]}>
        <Text style={[styles.infoTitle, { color: theme.Colors.gray900 }]}>💡 Como Funciona</Text>
        <Text style={[styles.infoText, { color: theme.Colors.gray700 }]}>
          1. Compartilhe seu código de convite com amigos.{'\n'}
          2. Quando eles se cadastrarem usando seu código, ambos ganham bônus de pontos!{'\n'}
          3. Compartilhe conquistas para inspirar outros.{'\n'}
          4. Acompanhe seu ranking social na aba Ranking.
        </Text>
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
  card: { marginHorizontal: 16, marginTop: 16, padding: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  cardHint: { fontSize: 12, marginTop: 8, fontStyle: 'italic' },
  codeBox: { padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  codeText: { fontSize: 24, fontWeight: 'bold', letterSpacing: 2 },
  copyButton: { padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  actionIcon: { fontSize: 28, marginRight: 12 },
  actionContent: { flex: 1 },
  actionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  actionDesc: { fontSize: 12 },
  arrow: { fontSize: 24 },
  emptyText: { textAlign: 'center', padding: 16, fontStyle: 'italic' },
  achievementRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  achievementIcon: { fontSize: 32, marginRight: 12 },
  achievementContent: { flex: 1 },
  achievementName: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  achievementDesc: { fontSize: 12 },
  shareIcon: { fontSize: 20 },
  shareRankingButton: { padding: 16, borderRadius: 8, alignItems: 'center' },
  infoCard: { marginHorizontal: 16, marginTop: 16, padding: 16, borderRadius: 12 },
  infoTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  infoText: { fontSize: 14, lineHeight: 20 },
});