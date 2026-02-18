import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import ProjectsScreen from '../screens/ProjectsScreen';
import ConsultantsScreen from '../screens/ConsultantsScreen';
import AssignmentsScreen from '../screens/AssignmentsScreen';
import { RootStackParamList } from './AppNavigator';

export type MainTabParamList = {
  Projects: undefined;
  Consultants: undefined;
  Assignments: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

type NavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const MainTabNavigator: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'briefcase';

            if (route.name === 'Projects') {
              iconName = focused ? 'briefcase' : 'briefcase-outline';
            } else if (route.name === 'Consultants') {
              iconName = focused ? 'people' : 'people-outline';
            } else if (route.name === 'Assignments') {
              iconName = focused ? 'calendar' : 'calendar-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#2563EB',
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopColor: '#E5E7EB',
            paddingBottom: 4,
            height: 56,
          },
          headerStyle: {
            backgroundColor: '#2563EB',
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 3,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
        })}
      >
        <Tab.Screen name="Projects" component={ProjectsScreen} />
        <Tab.Screen name="Consultants" component={ConsultantsScreen} />
        <Tab.Screen name="Assignments" component={AssignmentsScreen} />
      </Tab.Navigator>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 64 }]}
        onPress={() => navigation.navigate('CreateAssignment')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  fab: {
    position: 'absolute',
    right: 24,
    backgroundColor: '#2563EB',
    borderRadius: 28,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default MainTabNavigator;
