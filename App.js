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
import ChatListScreen from './components/ChatListScreen';
import ChatScreen from './components/ChatScreen';
import UserListScreen from './components/UserListScreen';
import PlantAssistantChat from './components/PlantAssistantChat';

// Desativa console.log e outros métodos do console em produção
if (!__DEV__) {
  const noOp = () => {};
  
  // Salva os métodos originais para depuração caso necessário
  const originalConsole = { ...console };
  
  // Substitui os métodos do console por funções vazias
  console.log = noOp;
  console.warn = noOp;
  console.error = noOp;
  console.info = noOp;
  console.debug = noOp;
  
  // Método para restaurar console original se necessário em algum ponto
  console.restoreConsole = () => {
    Object.keys(originalConsole).forEach(key => {
      console[key] = originalConsole[key];
    });
  };
}

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
        // Pedir permissão de notificação ao iniciar o aplicativo
        if (Notifications && typeof Notifications.requestPermissionsAsync === 'function') {
          const { granted } = await Notifications.requestPermissionsAsync({
            ios: {
              allowAlert: true,
              allowBadge: true,
              allowSound: true,
              allowAnnouncements: true,
            },
          });
          
          console.log('Permissão inicial de notificações:', granted ? 'concedida' : 'negada');
        }
        
        // Criar canal de notificação para Android
        if (Platform.OS === 'android' && Notifications && typeof Notifications.setNotificationChannelAsync === 'function') {
          await Notifications.setNotificationChannelAsync('watering-reminders', {
            name: 'Lembretes de Rega',
            description: 'Notificações para lembrá-lo de regar suas plantas',
            importance: Notifications.AndroidImportance?.HIGH || 4,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#22C55E',
            sound: 'default',
          });
          console.log('Canal de notificações configurado com sucesso');
        }
      } catch (error) {
        console.warn('Falha ao configurar notificações:', error);
        // Continuar mesmo se falhar a configuração
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
            <Stack.Screen name="ChatList" component={ChatListScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="UserList" component={UserListScreen} />
            <Stack.Screen name="PlantAssistantChat" component={PlantAssistantChat} />
            
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
