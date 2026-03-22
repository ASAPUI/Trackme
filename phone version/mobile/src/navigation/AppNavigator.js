import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useStore from '../store/useStore';
import { colors } from '../theme';

import AuthScreen    from '../screens/AuthScreen';
import HomeScreen    from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import AIScreen      from '../screens/AIScreen';
import ReportsScreen from '../screens/ReportsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AddScreen     from '../screens/AddScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabIcon({ name, focused }) {
  const icons = {
    Home:     focused ? '⬛' : '⬜',
    History:  '📋',
    Add:      '+',
    Reports:  '📊',
    Settings: '⚙️',
  };
  // SVG-style icons via text
  const svgIcons = {
    Home:     { f: '🏠', u: '🏠' },
    History:  { f: '📋', u: '📋' },
    Reports:  { f: '📊', u: '📊' },
    Settings: { f: '⚙️', u: '⚙️' },
  };
  if (name === 'Add') {
    return (
      <View style={tabS.addBtn}>
        <Text style={{ color: '#fff', fontSize: 26, lineHeight: 30 }}>+</Text>
      </View>
    );
  }
  return <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.45 }}>{svgIcons[name]?.f}</Text>;
}

function MainTabs({ navigation }) {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(14,14,17,0.96)',
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarActiveTintColor: colors.accent2,
        tabBarInactiveTintColor: colors.text3,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', letterSpacing: 0.3 },
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="Home"     component={HomeScreen} />
      <Tab.Screen name="History"  component={HistoryScreen} />
      <Tab.Screen name="Add"      component={AddScreen}
        listeners={{ tabPress: e => { e.preventDefault(); navigation.navigate('AddModal'); } }}
      />
      <Tab.Screen name="Reports"  component={ReportsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user } = useStore();

  return (
    <NavigationContainer>
      {!user ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Auth" component={AuthScreen} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false, presentation: 'modal' }}>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="AddModal" component={AddScreen} options={{ gestureEnabled: true }} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

const tabS = StyleSheet.create({
  addBtn: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 6,
    shadowColor: colors.accent, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 10,
    elevation: 8,
  },
});
