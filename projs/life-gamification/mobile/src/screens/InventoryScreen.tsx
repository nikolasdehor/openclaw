import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useAuth } from '../contexts/AuthContext';
import { getUserInventory, InventoryItem } from '../services/api';

const rarityColors: Record<string, string> = {
  common: '#9CA3AF',
  rare: '#3B82F6',
  epic: '#A855F7',
  legendary: '#F59E0B',
};

const rarityLabels: Record<string, string> = {
  common: 'Comum',
  rare: 'Raro',
  epic: 'Épico',
  legendary: 'Lendário',
};

export default function InventoryScreen() {
  const theme = useTheme();
  const { userPhone } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInventory(userPhone);
  }, [userPhone]);

  const loadInventory = async (phone: string) => {
    if (!phone) return;
    setLoading(true);
    try {
      const res = await getUserInventory(phone);
      setItems(res.items);
    } catch (e: any) {
      console.error('Erro ao carregar inventário:', e);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: InventoryItem }) => (
    <View style={[styles.card, { backgroundColor: theme.Colors.white }]}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{item.icon}</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: theme.Colors.gray900 }]}>{item.name}</Text>
        <Text style={[styles.description, { color: theme.Colors.gray600 }]}>{item.description}</Text>
        <View style={styles.meta}>
          <View style={[[
            styles.rarityBadge,
            { backgroundColor: rarityColors[item.rarity] + '20', borderColor: rarityColors[item.rarity] }
          ]]}>
            <Text style={[styles.rarityText, { color: rarityColors[item.rarity] }]}>
              {rarityLabels[item.rarity]}
            </Text>
          </View>
          <Text style={[styles.type, { color: theme.Colors.gray500 }]}>
            {item.type.toUpperCase()}
          </Text>
          {item.used_at && (
            <Text style={[styles.used, { color: theme.Colors.error }]}>USADO</Text>
          )}
        </View>
        <Text style={[styles.acquired, { color: theme.Colors.gray400 }]}>
          Adquirido em: {new Date(item.acquired_at).toLocaleDateString('pt-BR')}
        </Text>
      </View>
    </View>
  );

  const groupedItems = {
    badges: items.filter(i => i.type === 'badge'),
    perks: items.filter(i => i.type === 'perk'),
    cosmetics: items.filter(i => i.type === 'cosmetic' || i.type === 'boost'),
  };

  const renderSection = (title: string, data: InventoryItem[]) => {
    if (data.length === 0) return null;
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.Colors.gray900, fontFamily: theme.Typography.fontFamily.bold }]}>
          {title} ({data.length})
        </Text>
        <FlatList
          data={data}
          keyExtractor={(item) => item.inventory_id.toString()}
          renderItem={renderItem}
          scrollEnabled={false}
        />
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.Colors.gray50 }]}>
      <Text style={[styles.title, { color: theme.Colors.gray900, fontFamily: theme.Typography.fontFamily.bold }]}>
        Inventário
      </Text>
      <Text style={[styles.subtitle, { color: theme.Colors.gray600 }]}>
        Seus itens colecionáveis e perks
      </Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.Colors.info} />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ color: theme.Colors.gray600 }}>Seu inventário está vazio</Text>
          <Text style={{ color: theme.Colors.gray500, marginTop: 8 }}>
            Complete missões e streaks para ganhar itens!
          </Text>
        </View>
      ) : (
        <FlatList
          data={[]}
          keyExtractor={() => 'root'}
          renderItem={() => (
            <View>
              {renderSection('Badges (NFT)', groupedItems.badges)}
              {renderSection('Perks', groupedItems.perks)}
              {renderSection('Cosméticos', groupedItems.cosmetics)}
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 28,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    marginRight: 8,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  type: {
    fontSize: 10,
    marginRight: 8,
    fontFamily: 'monospace',
  },
  used: {
    fontSize: 10,
    fontWeight: '600',
  },
  acquired: {
    fontSize: 10,
    marginTop: 4,
  },
});
