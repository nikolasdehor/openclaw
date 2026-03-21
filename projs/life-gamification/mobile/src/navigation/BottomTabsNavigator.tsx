import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Platform } from 'react-native';
import DashboardScreen from '../screens/DashboardScreen';
import MissoesScreen from '../screens/MissoesScreen';
import RankingScreen from '../screens/RankingScreen';
import ProfileStackNavigator from './ProfileStackNavigator';
import CoachScreen from '../screens/CoachScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import SocialScreen from '../screens/SocialScreen';
import { useTheme } from '../theme/ThemeProvider';

export type BottomTabParamList = {
  Dashboard: undefined;
  Missoes: undefined;
  Ranking: undefined;
  Coach: undefined;
  Analytics: undefined;
  Social: undefined;
  Perfil: undefined; // points to ProfileStack
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const theme = useTheme();
  const icons: Record<string, string> = {
    Dashboard: '📊',
    Missoes: '🎯',
    Ranking: '🏆',
    Coach: '🤖',
    Analytics: '📈',
    Social: '👥',
    Perfil: '👤',
  };

  return (
    <View style={styles.iconContainer}>
      <Text style={{ fontSize: 24 }}>{icons[name]}</Text>
      {focused && <View style={[styles.indicator, { backgroundColor: theme.Colors.bolsa }]} />}
    </View>
  );
}

export default function BottomTabsNavigator() {
  const theme = useTheme();

  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Dashboard"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
          tabBarActiveTintColor: theme.Colors.bolsa,
          tabBarInactiveTintColor: theme.Colors.gray400,
          tabBarStyle: {
            backgroundColor: theme.Colors.white,
            borderTopColor: theme.Colors.gray200,
            paddingBottom: Platform.select({ ios: 20, default: 8 }),
            paddingTop: 8,
            height: 60,
          },
          tabBarLabelStyle: {
            fontFamily: theme.Typography.fontFamily.regular,
            fontSize: theme.Typography.fontSize.xs,
          },
        })}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ tabBarLabel: 'Home' }}
        />
        <Tab.Screen name="Missoes" component={MissoesScreen} options={{ tabBarLabel: 'Missões' }} />
        <Tab.Screen name="Ranking" component={RankingScreen} options={{ tabBarLabel: 'Ranking' }} />
        <Tab.Screen name="Coach" component={CoachScreen} options={{ tabBarLabel: 'Coach' }} />
        <Tab.Screen
          name="Analytics"
          component={AnalyticsScreen}
          options={{ tabBarLabel: 'Analytics' }}
        />
        <Tab.Screen
          name="Social"
          component={SocialScreen}
          options={{ tabBarLabel: 'Social' }}
        />
        <Tab.Screen
          name="Perfil"
          component={ProfileStackNavigator}
          options={{ tabBarLabel: 'Perfil' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
