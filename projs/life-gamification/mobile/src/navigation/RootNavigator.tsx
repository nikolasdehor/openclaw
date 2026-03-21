import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import BottomTabsNavigator from './BottomTabsNavigator';
import SettingsStackNavigator from './SettingsStackNavigator';
import AchievementDetailStackNavigator from './AchievementDetailStackNavigator';
import SpecialMissionsScreen from '../screens/SpecialMissionsScreen';
import { ThemeProvider } from '../theme/ThemeProvider';

export type RootStackParamList = {
  MainTabs: undefined;
  Settings: undefined;
  AchievementDetail: { achievementId: string };
  SpecialMissions: undefined; // Meta-game screen
};

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="MainTabs"
          screenOptions={{
            headerShown: false,
            cardOverlayEnabled: true,
            cardStyle: { backgroundColor: 'transparent' },
          }}
        >
          <Stack.Screen name="MainTabs" component={BottomTabsNavigator} />
          <Stack.Screen
            name="Settings"
            component={SettingsStackNavigator}
            options={{
              presentation: 'modal',
              headerShown: true,
              title: 'Configurações',
            }}
          />
          <Stack.Screen
            name="AchievementDetail"
            component={AchievementDetailStackNavigator}
            options={{
              headerShown: true,
              title: 'Detalhe da Conquista',
            }}
          />
          <Stack.Screen
            name="SpecialMissions"
            component={SpecialMissionsScreen}
            options={{
              headerShown: true,
              title: 'Missões Especiais',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}
