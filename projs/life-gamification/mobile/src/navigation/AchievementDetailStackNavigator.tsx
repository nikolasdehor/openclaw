import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AchievementDetailScreen from '../screens/AchievementDetailScreen';

export type AchievementDetailStackParamList = {
  AchievementDetail: { achievementId: string };
};

const Stack = createStackNavigator<AchievementDetailStackParamList>();

export default function AchievementDetailStackNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="AchievementDetail"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTintColor: '#374151',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="AchievementDetail"
          component={AchievementDetailScreen}
          options={{ title: 'Detalhe da Conquista' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
