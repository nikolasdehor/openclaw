import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export default function SettingsScreen() {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.Colors.gray50 }]}>
      <Text
        style={[
          styles.title,
          { color: theme.Colors.gray900, fontFamily: theme.Typography.fontFamily.bold },
        ]}
      >
        Configurações
      </Text>
      <Text style={{ color: theme.Colors.gray600 }}>Ajustes do aplicativo</Text>
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
    marginBottom: 8,
  },
});
