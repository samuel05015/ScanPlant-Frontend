import React, { useState, useEffect } from 'react';
import { Platform } from 'react-native';
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
import ProfileSettingsScreen from './components/ProfileSettingsScreen';

// Import notifications de forma segura
let Notifications;
try {
  Notifications = require('expo-notifications');
} catch (error) {
  console.warn('Falha ao importar expo-notifications:', error);
  // Fallback para objeto vazio se o módulo falhar ao carregar
  Notifications = {
    setNotificationHandler: () => {},
    AndroidImportance: { HIGH: 4 },
    setNotificationChannelAsync: async () => {},
  };
}

const Stack = createStackNavigator();

// Configurar handler de notificações com tratamento de erro
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
} catch (error) {
  console.warn('Falha ao configurar notification handler:', error);
}

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadResources = async () => {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setIsLoading(false);
    };

    loadResources();
  }, []);

  useEffect(() => {
    const setupNotifications = async () => {
      try {
        if (Platform.OS === 'android' && Notifications && typeof Notifications.setNotificationChannelAsync === 'function') {
          await Notifications.setNotificationChannelAsync('watering-reminders', {
            name: 'Lembretes de Rega',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#22C55E',
          });
          console.log('Canal de notificações configurado com sucesso');
        }
      } catch (error) {
        console.warn('Falha ao configurar canal de notificações:', error);
        // Continuar sem criar o canal de notificação
      }
    };
    
    setupNotifications();
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
            <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} />
            
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
