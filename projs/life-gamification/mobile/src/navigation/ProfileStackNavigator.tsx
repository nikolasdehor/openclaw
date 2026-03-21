import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import PerfilScreen from '../screens/PerfilScreen';
import InventoryScreen from '../screens/InventoryScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import AchievementDetailScreen from '../screens/AchievementDetailScreen';
import { useTheme } from '../theme/ThemeProvider';
import type { Achievement } from '../services/api';

export type ProfileStackParamList = {
  PerfilMain: undefined;
  Inventory: undefined;
  Achievements: undefined;
  AchievementDetail: { achievement: Achievement & { unlocked: boolean } };
};

const Stack = createStackNavigator<ProfileStackParamList>();

export default function ProfileStackNavigator() {
  const theme = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="PerfilMain"
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.Colors.white,
          },
          headerTintColor: theme.Colors.gray900,
          headerTitleStyle: {
            fontFamily: theme.Typography.fontFamily.bold,
          },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen
          name="PerfilMain"
          component={PerfilScreen}
          options={{ title: 'Perfil' }}
        />
        <Stack.Screen
          name="Inventory"
          component={InventoryScreen}
          options={{ title: 'Inventário' }}
        />
        <Stack.Screen
          name="Achievements"
          component={AchievementsScreen}
          options={{ title: 'Conquistas' }}
        />
        <Stack.Screen
          name="AchievementDetail"
          component={AchievementDetailScreen}
          options={{ title: 'Detalhe da Conquista' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}