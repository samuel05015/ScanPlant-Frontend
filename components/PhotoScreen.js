import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  SafeAreaView,
  StatusBar,
  Switch,
  TextInput,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location'; 
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { auth, database } from './supabase'; // Verifique se o caminho está correto

// Importar notifications de forma segura
let Notifications;
try {
  Notifications = require('expo-notifications');
} catch (error) {
  console.warn('Erro ao importar expo-notifications:', error);
  // Criar um objeto fictício para evitar erros
  Notifications = {
    getPermissionsAsync: async () => ({ granted: false }),
    requestPermissionsAsync: async () => ({ granted: false }),
    scheduleNotificationAsync: async () => null,
  };
}

// --- CONFIGURAÇÕES E CONSTANTES ---
const PLANT_ID_API_KEY = 'lz8GUbeXEkLexa0nWTZ0n1dU8DOOiLMdeOPA3BY5nWrC2p2D6O';
const PLANT_ID_API_URL = 'https://api.plant.id/v2/identify';
const GROQ_API_KEY = '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'; 
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const REVERSE_GEOCODING_API_URL = 'https://nominatim.openstreetmap.org/reverse';


export default function PhotoScreen() {
  const navigation = useNavigation();
  const cameraRef = useRef(null);

  // --- ESTADOS DO COMPONENTE ---
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [plantData, setPlantData] = useState(null);
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [exactLocation, setExactLocation] = useState(''); // Novo estado
  const [cityName, setCityName] = useState(''); // Novo estado
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderFrequencyDays, setReminderFrequencyDays] = useState(null);
  const [reminderFrequencyInput, setReminderFrequencyInput] = useState('');
  const [notes, setNotes] = useState('');

  // --- LÓGICA DE PERMISSÕES E LOCALIZAÇÃO ---
  useEffect(() => {
    (async () => {
      await requestPermission();
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão Negada', 'A localização é necessária para registrar onde a planta foi encontrada.');
        return;
      }
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      
      const { exactLocation, city } = await getLocationName(currentLocation.coords.latitude, currentLocation.coords.longitude);
      setExactLocation(exactLocation);
      setCityName(city);
    })();
  }, []);

  useEffect(() => {
    if (plantData?.watering_frequency_days) {
      const freqNumber = Math.max(1, Math.round(Number(plantData.watering_frequency_days)) || 1);
      setReminderFrequencyDays(freqNumber);
      setReminderFrequencyInput(String(freqNumber));
      setReminderEnabled(false);
      setNotes('');
    }
  }, [plantData?.watering_frequency_days]);

  const getLocationName = async (latitude, longitude) => {
    try {
      const response = await fetch(`${REVERSE_GEOCODING_API_URL}?lat=${latitude}&lon=${longitude}&format=json`, {
        headers: { 'User-Agent': 'PlantApp/1.0' }
      });
      const data = await response.json();
      if (data.address) {
        const city = data.address.city || data.address.town || data.address.village || 'Cidade Não Disponível';
        const road = data.address.road || 'Rua não disponível';
        const neighborhood = data.address.neighbourhood || 'Bairro não disponível';
        return { exactLocation: `${road}, ${neighborhood}`, city };
      }
    } catch (error) {
      console.error('Error fetching location name:', error);
    }
    return { exactLocation: 'Endereço não disponível', city: 'Cidade não disponível' };
  };

  // --- LÓGICA DE IDENTIFICAÇÃO (PLANT.ID + GROQ AI) ---
  const identifyPlant = async (uri) => {
    setLoading(true);
    setPlantData(null);
    setLoadingMessage('Analisando imagem...');

    try {
      let formData = new FormData();
      formData.append('images', { uri, type: 'image/jpeg', name: 'plant.jpg' });
      const plantIdResponse = await fetch(PLANT_ID_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data', 'Api-Key': PLANT_ID_API_KEY },
        body: formData,
      });

      if (!plantIdResponse.ok) throw new Error('Erro na API Plant.id');
      const plantIdData = await plantIdResponse.json();

      if (plantIdData.suggestions && plantIdData.suggestions.length > 0) {
        const plantDetails = plantIdData.suggestions[0].plant_details;
        const scientificName = plantDetails.scientific_name || 'Nome Científico Não Disponível';

        setLoadingMessage('Buscando informações com IA...');
        const aiInfo = await fetchPlantInfoWithAI(scientificName);

        setPlantData({
          scientific_name: scientificName,
          family: aiInfo.family,
          genus: aiInfo.genus,
          common_name: aiInfo.common_name,
          description: aiInfo.description,
          care_instructions: aiInfo.care_instructions,
          watering_frequency_days: aiInfo.watering_frequency_days,
          watering_frequency_text: aiInfo.watering_frequency_text,
        });
      } else {
        Alert.alert('Erro', 'Nenhuma sugestão de planta encontrada.');
      }
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlantInfoWithAI = async (scientificName) => {
    if (GROQ_API_KEY === 'SUA_CHAVE_GROQ') {
        Alert.alert("Aviso", "Por favor, insira sua chave da API da Groq no código para a IA funcionar.");
        return {
          common_name: 'Configure a IA',
          description: 'Configure a IA',
          care_instructions: 'Configure a IA',
          family: 'Configure a IA',
          genus: 'Configure a IA',
          watering_frequency_days: null,
          watering_frequency_text: 'Configure a IA',
        };
    }
    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: `Responda sempre em JSON válido (UTF-8, sem crases) com o formato {"common_name": string, "family": string, "genus": string, "description": string, "care_instructions": string, "watering_frequency_text": string, "watering_frequency_days": number}. "watering_frequency_days" deve ser um número inteiro representando o intervalo recomendado em dias entre regas. Se não souber, use null.`
            },
            {
              role: 'user',
              content: `Forneça dados botânicos resumidos, dicas de cuidados e a frequência de rega da planta ${scientificName} em português brasileiro. Lembre-se: responda SOMENTE no formato JSON especificado, sem texto adicional.`
            }
          ],
        }),
      });

      if (!response.ok) throw new Error('Erro na API Groq');
      const data = await response.json();
      const content = (data.choices?.[0]?.message?.content || '').trim();

      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch (jsonError) {
        console.warn('Falha ao interpretar JSON da IA. Conteúdo bruto:', content);
        parsed = {};
      }

      const sanitizeText = (value, fallback) => {
        if (typeof value === 'string' && value.trim().length > 0) {
          return value.trim();
        }
        return fallback;
      };

      const sanitizeNumber = (value) => {
        const numberValue = Number(value);
        if (!Number.isFinite(numberValue) || numberValue <= 0) {
          return null;
        }
        return Math.round(numberValue);
      };

      return {
        common_name: sanitizeText(parsed?.common_name, 'Não encontrado'),
        family: sanitizeText(parsed?.family, 'Não encontrada'),
        genus: sanitizeText(parsed?.genus, 'Não encontrado'),
        description: sanitizeText(parsed?.description, 'Não encontrada'),
        care_instructions: sanitizeText(parsed?.care_instructions, 'Não encontrados'),
        watering_frequency_text: sanitizeText(parsed?.watering_frequency_text, 'Frequência não fornecida'),
        watering_frequency_days: sanitizeNumber(parsed?.watering_frequency_days),
      };
    } catch (error) {
      console.error('Erro na API Groq:', error);
      return {
        common_name: 'Erro na IA',
        description: 'Erro na IA',
        care_instructions: 'Erro na IA',
        family: 'Erro na IA',
        genus: 'Erro na IA',
        watering_frequency_text: 'Erro ao obter frequência',
        watering_frequency_days: null,
      };
    }
  };
  
  // --- FUNÇÕES DE CÂMERA E GALERIA ---
  const takePicture = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.7, base64: true });
    setImage({
      uri: photo.uri,
      base64: photo.base64,
      mimeType: 'image/jpeg',
    });
    identifyPlant(photo.uri);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.7,
      base64: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setImage({
        uri: asset.uri,
        base64: asset.base64,
        mimeType: asset.mimeType || 'image/jpeg',
      });
      identifyPlant(asset.uri);
    }
  };
  
  const ensureNotificationPermission = async () => {
    try {
      // Verificar se Notifications está disponível
      if (!Notifications || typeof Notifications.getPermissionsAsync !== 'function') {
        console.warn('Módulo de notificações não está disponível');
        Alert.alert(
          'Notificações indisponíveis',
          'O sistema de lembretes não está disponível neste dispositivo.'
        );
        return false;
      }

      const settings = await Notifications.getPermissionsAsync();
      if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
        return true;
      }
      
      const request = await Notifications.requestPermissionsAsync();
      return request.granted || request.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
    } catch (error) {
      console.error('Erro ao solicitar permissão de notificação:', error);
      Alert.alert(
        'Erro nas notificações',
        'Não foi possível configurar as notificações. O recurso de lembretes pode não funcionar corretamente.'
      );
      return false;
    }
  };

  const handleReminderToggle = async (value) => {
    if (value) {
      const granted = await ensureNotificationPermission();
      if (!granted) {
        Alert.alert('Permissão necessária', 'Ative as notificações do aplicativo para receber lembretes de rega.');
        setReminderEnabled(false);
        return;
      }
      if (!reminderFrequencyDays) {
        const fallback = 3;
        setReminderFrequencyDays(fallback);
        setReminderFrequencyInput(String(fallback));
      }
    }
    setReminderEnabled(value);
  };

  const scheduleWateringReminder = async (plant, frequencyDays) => {
    try {
      // Verificar se Notifications está disponível
      if (!Notifications || typeof Notifications.scheduleNotificationAsync !== 'function') {
        console.warn('Módulo de notificações não está disponível para agendar lembretes');
        return null;
      }
      
      const seconds = Math.max(60, frequencyDays * 24 * 60 * 60);
      const title = plant.common_name ? `Hora de regar ${plant.common_name}` : 'Hora de regar sua planta';
      const body = `Regue esta planta a cada ${frequencyDays} dia${frequencyDays > 1 ? 's' : ''}.`;
      
      return await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: {
            plantId: plant.id,
            wateringFrequencyDays: frequencyDays,
          },
        },
        trigger: {
          seconds,
          repeats: true,
          channelId: Platform.OS === 'android' ? 'watering-reminders' : undefined,
        },
      });
    } catch (error) {
      console.error('Erro ao agendar notificação:', error);
      return null;
    }
  };

  const handleFrequencyInputChange = (text) => {
    setReminderFrequencyInput(text);
    const numericValue = Number(text.replace(/[^0-9]/g, ''));
    if (Number.isFinite(numericValue) && numericValue > 0) {
      setReminderFrequencyDays(Math.round(numericValue));
    }
  };
  
  // --- AÇÕES DO USUÁRIO ---
  const handleCancel = () => {
    setImage(null);
    setPlantData(null);
    setReminderEnabled(false);
    setReminderFrequencyDays(null);
    setReminderFrequencyInput('');
    setNotes('');
  };

  const openInMaps = () => {
    if (!location) return;
    const { latitude, longitude } = location.coords;
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${latitude},${longitude}`;
    const label = 'Local da Planta';
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });
    Linking.openURL(url);
  };
  
  // --- FUNÇÃO DE SALVAR ---
  const saveData = async () => {
    if (!plantData || !location || !image) {
      Alert.alert('Dados Incompletos', 'Aguarde a identificação da planta e a localização estarem prontas.');
      return;
    }

    if (reminderEnabled) {
      if (!reminderFrequencyDays || reminderFrequencyDays <= 0) {
        Alert.alert('Intervalo inválido', 'Informe em quantos dias deseja receber o lembrete de rega.');
        return;
      }
    }

    setLoading(true);
    setLoadingMessage('Salvando na sua coleção...');

    try {
    let imageDataUrl = '';
    if (image?.base64) {
      const mimeType = image.mimeType || 'image/jpeg';
      imageDataUrl = `data:${mimeType};base64,${image.base64}`;
    } else if (image?.uri) {
      const fileBase64 = await FileSystem.readAsStringAsync(image.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      imageDataUrl = `data:image/jpeg;base64,${fileBase64}`;
    } else {
      throw new Error('Não foi possível processar a imagem para salvar.');
    }

        const plantRecord = {
            scientific_name: plantData.scientific_name,
            common_name: plantData.common_name,
            wiki_description: plantData.description,
            care_instructions: plantData.care_instructions,
            family: plantData.family,
            genus: plantData.genus,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            city: cityName,
            location_name: exactLocation,
      image_data: imageDataUrl,
            watering_frequency_days: reminderEnabled ? reminderFrequencyDays : plantData.watering_frequency_days,
            watering_frequency_text: plantData.watering_frequency_text,
            reminder_enabled: reminderEnabled,
            notes,
            user_id: auth.currentUser?.id,
        };

        const { data: insertedPlants, error } = await database.insert('plants', plantRecord);

        if (error) {
            throw error;
        }

        const insertedPlant = insertedPlants?.[0];

        if (reminderEnabled && reminderFrequencyDays && insertedPlant?.id) {
          try {
            const notificationId = await scheduleWateringReminder(insertedPlant, reminderFrequencyDays);
            const { error: updateError } = await database.update('plants', { reminder_notification_id: notificationId }, { id: insertedPlant.id });
            if (updateError) {
              console.error('Erro ao salvar notification_id no Supabase:', updateError);
            }
          } catch (notificationError) {
            console.error('Falha ao agendar lembrete de rega:', notificationError);
            Alert.alert('Aviso', 'Planta salva, mas não foi possível agendar o lembrete de rega.');
          }
        }

        Alert.alert("Sucesso", "Planta salva na sua coleção!");
        navigation.navigate('PlantGallery');

    } catch (error) {
        console.error('Erro ao salvar no Supabase:', error);
        Alert.alert('Erro ao Salvar', `Não foi possível salvar a planta. Detalhes: ${error.message}`);
    } finally {
        setLoading(false);
    }
  };

  // --- RENDERIZAÇÃO ---
  if (!permission) {
    return <View style={styles.centerContainer}><ActivityIndicator color="#4CAF50" /></View>;
  }
  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.infoText}>É necessário permitir o acesso à câmera.</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Permitir Câmera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerWithBack}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={24} color="#475569" />
          </TouchableOpacity>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Identificar Planta</Text>
            <Text style={styles.headerSubtitle}>Capture ou selecione uma foto para análise</Text>
          </View>
        </View>

    {image ? (
            <View style={styles.imagePreviewContainer}>
        <Image source={{ uri: image.uri }} style={styles.imagePreview} />
            </View>
        ) : (
            <View style={styles.cameraContainer}>
                <CameraView ref={cameraRef} style={styles.camera} facing={facing} />
            </View>
        )}
        
        <View style={styles.controlsContainer}>
            <TouchableOpacity style={styles.controlButton} onPress={pickImage}>
                <Feather name="image" size={24} color="#475569" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                <Feather name="camera" size={32} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')}>
                <Feather name="refresh-cw" size={24} color="#475569" />
            </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>{loadingMessage}</Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Localização da Captura</Text>
          {location ? (
            <>
              <InfoRow icon="map-pin" label="Endereço" value={exactLocation} />
              <InfoRow icon="sun" label="Cidade" value={cityName} />
              <InfoRow icon="compass" label="Coordenadas" value={`${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`} />
              <TouchableOpacity style={styles.mapButton} onPress={openInMaps}>
                <Text style={styles.mapButtonText}>🗺️ Abrir no Google Maps</Text>
              </TouchableOpacity>
            </>
          ) : <Text style={styles.infoText}>Obtendo localização...</Text>}
        </View>

        <View style={styles.card}>
          <View style={styles.reminderHeader}>
            <Text style={styles.cardTitle}>Lembrete de Rega</Text>
            <View style={styles.reminderToggleContainer}>
              <Text style={styles.reminderToggleLabel}>{reminderEnabled ? 'Ativado' : 'Desativado'}</Text>
              <Switch
                value={reminderEnabled}
                onValueChange={handleReminderToggle}
                trackColor={{ false: '#CBD5F5', true: '#86EFAC' }}
                thumbColor={reminderEnabled ? '#22C55E' : '#f4f3f4'}
              />
            </View>
          </View>
          <Text style={styles.reminderInfoText}>
            {plantData?.watering_frequency_text || 'A IA recomendará a frequência ideal após a identificação.'}
          </Text>
          {reminderEnabled && (
            <>
              <Text style={styles.inputLabel}>Intervalo entre regas (em dias)</Text>
              <TextInput
                style={styles.frequencyInput}
                value={reminderFrequencyInput}
                onChangeText={handleFrequencyInputChange}
                placeholder="Ex.: 3"
                keyboardType="number-pad"
              />
              <Text style={styles.reminderSubInfo}>
                Você receberá notificações a cada {reminderFrequencyDays || '?'} dia(s).
              </Text>
            </>
          )}
        </View>

        {plantData && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Resultado da Análise</Text>
            <InfoRow icon="leaf" label="Nome Científico" value={plantData.scientific_name} isItalic />
            <InfoRow icon="tag" label="Nome Popular" value={plantData.common_name} />
            <InfoRow icon="book-open" label="Família" value={plantData.family} />
            <InfoRow icon="bookmark" label="Gênero" value={plantData.genus} />
            <InfoRow icon="align-left" label="Descrição" value={plantData.description} isMultiline />
            <InfoRow icon="droplet" label="Guia de Cuidados" value={plantData.care_instructions} isMultiline/>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Anotações da Planta</Text>
          <Text style={styles.helperText}>Registre observações específicas (recomendações, reações da planta, etc.).</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Ex.: Prefere luz indireta de manhã e pouca água no inverno."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={saveData} disabled={!plantData || loading}>
                <Text style={styles.buttonText}>Salvar Planta</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
                <Text style={[styles.buttonText, {color: '#475569'}]}>Cancelar</Text>
            </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const InfoRow = ({ icon, label, value, isItalic, isMultiline }) => (
    <View style={styles.infoRow}>
        <Feather name={icon} size={18} color="#4CAF50" />
        <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={[styles.infoValue, isItalic && {fontStyle: 'italic'}, isMultiline && {lineHeight: 22}]}>{value}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
    scrollContainer: { padding: 16, paddingBottom: 32 },
    headerWithBack: { flexDirection: 'row', marginBottom: 24, alignItems: 'center' },
    backButton: { 
        padding: 8, 
        borderRadius: 20, 
        backgroundColor: '#F1F5F9',
        marginRight: 10,
    },
    header: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#1E293B' },
    headerSubtitle: { fontSize: 16, color: '#64748B', marginTop: 4 },
    cameraContainer: { height: 300, borderRadius: 16, overflow: 'hidden', backgroundColor: '#000' },
    camera: { flex: 1 },
    imagePreviewContainer: { height: 300, borderRadius: 16, overflow: 'hidden' },
    imagePreview: { width: '100%', height: '100%' },
    controlsContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginVertical: 16 },
    controlButton: { padding: 12 },
    captureButton: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center' },
    loadingContainer: { alignItems: 'center', marginVertical: 24 },
    loadingText: { marginTop: 12, fontSize: 16, color: '#475569' },
    card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 8 },
  reminderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  reminderToggleContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reminderToggleLabel: { fontSize: 14, color: '#475569' },
  reminderInfoText: { fontSize: 14, color: '#64748B', marginBottom: 12 },
  reminderSubInfo: { fontSize: 13, color: '#475569', marginTop: 8 },
  inputLabel: { fontSize: 14, color: '#475569', marginBottom: 6 },
  frequencyInput: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: '#0F172A' },
    infoRow: { flexDirection: 'row', marginBottom: 12 },
    infoContent: { flex: 1, marginLeft: 12 },
    infoLabel: { fontSize: 14, color: '#94A3B8', marginBottom: 2 },
    infoValue: { fontSize: 16, color: '#334155' },
    infoText: { fontSize: 16, color: '#64748B' },
    mapButton: { backgroundColor: '#F1F5F9', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
    mapButtonText: { color: '#334155', fontWeight: 'bold' },
    actionButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 16 },
    button: { flex: 1, paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
    saveButton: { backgroundColor: '#4CAF50' },
    cancelButton: { backgroundColor: '#F1F5F9' },
    buttonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  helperText: { fontSize: 13, color: '#94A3B8', marginBottom: 8 },
  notesInput: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 12, minHeight: 120, fontSize: 16, color: '#1E293B' },
});