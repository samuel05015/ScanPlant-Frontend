import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './LoginScreen';
import HomeScreen from './HomeScreen';
import PhotoScreen from './PhotoScreen';
import ImageScreen from './ImageScreen';
import PlantGallery from './PlantGallery';
import PlantDetailScreen from './PlantDetailScreen';
import SearchScreen from './SearchScreen';
import ProfileSettingsScreen from './ProfileSettingsScreen';
import PlantAssistantChat from './PlantAssistantChat';
import LoadingScreen from './LoadingScreen';
import CriarConta from './CriarConta';
import ScreenPasso from './ScreenPasso';
import DebugAuthScreen from './DebugAuthScreen';

const Stack = createNativeStackNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Photo" component={PhotoScreen} />
        <Stack.Screen name="Image" component={ImageScreen} />
        <Stack.Screen name="PlantGallery" component={PlantGallery} />
        <Stack.Screen name="PlantDetail" component={PlantDetailScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="Profile" component={ProfileSettingsScreen} />
        <Stack.Screen name="PlantAssistant" component={PlantAssistantChat} />
        <Stack.Screen name="Loading" component={LoadingScreen} />
        <Stack.Screen name="CriarConta" component={CriarConta} />
        <Stack.Screen name="ScreenPasso" component={ScreenPasso} />
        <Stack.Screen name="DebugAuth" component={DebugAuthScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}