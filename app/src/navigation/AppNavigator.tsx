import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Screens
import MainTabNavigator from './MainTabNavigator';
import CreateAssignmentScreen from '../screens/CreateAssignmentScreen';
import ProjectDetailScreen from '../screens/ProjectDetailScreen';
import ConsultantDetailScreen from '../screens/ConsultantDetailScreen';

export type RootStackParamList = {
  Main: undefined;
  CreateAssignment: undefined;
  ProjectDetail: { projectId: string };
  ConsultantDetail: { consultantId: string };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Main" 
          component={MainTabNavigator} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="CreateAssignment" 
          component={CreateAssignmentScreen}
          options={{ title: 'Create Assignment' }}
        />
        <Stack.Screen 
          name="ProjectDetail" 
          component={ProjectDetailScreen}
          options={{ title: 'Project Details' }}
        />
        <Stack.Screen 
          name="ConsultantDetail" 
          component={ConsultantDetailScreen}
          options={{ title: 'Consultant Details' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}