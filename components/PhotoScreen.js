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
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location'; 
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { auth, database } from './supabase'; // Verifique se o caminho está correto

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
        return { common_name: 'Configure a IA', description: 'Configure a IA', care_instructions: 'Configure a IA', family: 'Configure a IA', genus: 'Configure a IA' };
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
              content: `Você é um especialista em botânica. Sua resposta deve ser apenas o texto solicitado, sem introduções ou despedidas. O formato da resposta deve ser exatamente: "Nome Popular: [nome] Família: [família] Gênero: [gênero] Descrição: [descrição] Cuidados: [cuidados]"`
            },
            {
              role: 'user',
              content: `Me diga o nome popular, a família, o gênero, uma descrição curta e um guia simples de cuidados da planta ${scientificName} em português. Formato da resposta: Nome Popular: ... Família: ... Gênero: ... Descrição: ... Cuidados: ...`
            }
          ],
        }),
      });

      if (!response.ok) throw new Error('Erro na API da Groq');
      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';

      // Extração das informações com a nova estrutura
      const commonName = (content.split('Família:')[0].replace('Nome Popular:', '') || '').trim();
      const family = (content.split('Família:')[1]?.split('Gênero:')[0] || '').trim();
      const genus = (content.split('Gênero:')[1]?.split('Descrição:')[0] || '').trim();
      const description = (content.split('Descrição:')[1]?.split('Cuidados:')[0] || '').trim();
      const careInstructions = (content.split('Cuidados:')[1] || '').trim();

      return {
        common_name: commonName || 'Não encontrado',
        family: family || 'Não encontrada',
        genus: genus || 'Não encontrado',
        description: description || 'Não encontrada',
        care_instructions: careInstructions || 'Não encontrados',
      };
    } catch (error) {
      console.error('Erro na API Groq:', error);
      return { common_name: 'Erro na IA', description: 'Erro na IA', care_instructions: 'Erro na IA', family: 'Erro na IA', genus: 'Erro na IA' };
    }
  };
  
  // --- FUNÇÕES DE CÂMERA E GALERIA ---
  const takePicture = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
    setImage(photo.uri);
    identifyPlant(photo.uri);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      identifyPlant(result.assets[0].uri);
    }
  };
  
  // --- AÇÕES DO USUÁRIO ---
  const handleCancel = () => {
    setImage(null);
    setPlantData(null);
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

    setLoading(true);
    setLoadingMessage('Salvando na sua coleção...');

    try {
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
            image_data: image,
            user_id: auth.currentUser?.id,
        };

        const { error } = await database.insert('plants', plantRecord);

        if (error) {
            throw error;
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
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Identificar Planta</Text>
          <Text style={styles.headerSubtitle}>Capture ou selecione uma foto para análise</Text>
        </View>

        {image ? (
            <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: image }} style={styles.imagePreview} />
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
    header: { alignItems: 'center', marginBottom: 24 },
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
});