import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoadingScreen from './components/LoadingScreen';
import ScreenPasso from './components/ScreenPasso';
import HomeScreen from './components/HomeScreen';
import LoginScreen from './components/LoginScreen';
import CriarConta from './components/CriarConta';
import PhotoScreen from './components/PhotoScreen';
import PlantCard from './components/PlantCard';
import ImageScreen from './components/ImageScreen';
import SearchScreen from './components/SearchScreen';
import LoadingScreenSave from './components/LoadingScreenSave';
import PlantGallery from './components/PlantGallery';
import PlantDetailScreen from './components/PlantDetailScreen';

const Stack = createStackNavigator();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadResources = async () => {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setIsLoading(false);
    };

    loadResources();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoading ? (
          <Stack.Screen name="Loading" component={LoadingScreen} />
        ) : (
          <>
            <Stack.Screen name="ScreenPasso" component={ScreenPasso} />
            <Stack.Screen name="HomeScreen" component={HomeScreen} />
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="CriarConta" component={CriarConta} />
            <Stack.Screen name="PhotoScreen" component={PhotoScreen} />
            <Stack.Screen name="PlantCard" component={PlantCard} />
            <Stack.Screen name="ImageScreen" component={ImageScreen} />
            <Stack.Screen name="SearchScreen" component={SearchScreen} />
            <Stack.Screen name="LoadingSave" component={LoadingScreenSave} />
            <Stack.Screen name="PlantGallery" component={PlantGallery} />
            <Stack.Screen name="PlantDetail" component={PlantDetailScreen} />
            
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
