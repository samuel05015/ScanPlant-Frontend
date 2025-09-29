import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Keyboard,
  FlatList,
  Image,
  Linking,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { database } from './supabase'; // Import Supabase configuration
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// --- TELA PRINCIPAL COM NOVO VISUAL ---
export default function SearchScreen() {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('common_name');
  const [filteredPlants, setFilteredPlants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Carrega todas as plantas ao iniciar a tela
  useEffect(() => {
    fetchAllPlants();
  }, []);

  const searchPlant = async () => {
    Keyboard.dismiss();
    setLoading(true);
    setSearched(true);
    try {
      const { data, error } = await database.select('plants');
      
      if (error) throw error;

      if (data && data.length > 0) {
        const filtered = data.filter((plant) => {
          const term = searchTerm.toLowerCase();
          if (!term) return true; // Se a busca for vazia, retorna todos
          switch (searchType) {
            case 'common_name':
              return (plant.common_name || '').toLowerCase().includes(term);
            case 'city':
              return (plant.city || '').toLowerCase().includes(term);
            case 'scientific_name':
              return (plant.scientific_name || '').toLowerCase().includes(term);
            default:
              return false;
          }
        });
        setFilteredPlants(filtered);
      } else {
        setFilteredPlants([]);
      }

    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao buscar a planta.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPlants = async () => {
    setLoading(true);
    setSearchTerm('');
    setSearched(false);
    try {
      const { data, error } = await database.select('plants');
      if (error) throw error;
      setFilteredPlants(data || []);
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao buscar as plantas.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const openPlantInMap = (plant) => {
    if (!plant.latitude || !plant.longitude) {
        Alert.alert('Localização indisponível', 'Esta planta não possui coordenadas para serem mostradas no mapa.');
        return;
    }
    const { latitude, longitude } = plant;
    const scheme = Platform.select({ ios: 'maps://0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${latitude},${longitude}`;
    const label = plant.common_name || 'Local da Planta';
    const url = Platform.select({
        ios: `${scheme}${label}@${latLng}`,
        android: `${scheme}${latLng}(${label})`,
    });
    Linking.openURL(url);
  };

  // Componente para renderizar cada item da lista
  const PlantListItem = ({ item }) => (
    <TouchableOpacity style={styles.plantCard} onPress={() => openPlantInMap(item)}>
      <Image 
        source={{ uri: item.image_data }}
        style={styles.plantImage}
        defaultSource={require('../assets/placeholder.png')} // Adicione um placeholder
      />
      <View style={styles.plantInfo}>
        <Text style={styles.plantName} numberOfLines={1}>{item.common_name || 'Nome não disponível'}</Text>
        <Text style={styles.plantScientificName} numberOfLines={1}>{item.scientific_name}</Text>
        <View style={styles.locationContainer}>
            <Feather name="map-pin" size={14} color="#94A3B8" />
            <Text style={styles.plantLocation} numberOfLines={1}>{item.city || 'Cidade não informada'}</Text>
        </View>
      </View>
       <Feather name="chevron-right" size={24} color="#e2e8f0" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
        <View style={styles.headerWithBack}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
            >
              <Feather name="arrow-left" size={24} color="#475569" />
            </TouchableOpacity>
            <View style={styles.header}>
              <Feather name="search" size={28} color="#16A34A" />
              <Text style={styles.headerTitle}>Explorar Plantas</Text>
              <Text style={styles.headerSubtitle}>Encontre plantas salvas na sua coleção</Text>
            </View>
        </View>

        <View style={styles.searchContainer}>
            <View style={styles.pickerContainer}>
                 <Picker
                    selectedValue={searchType}
                    onValueChange={(itemValue) => setSearchType(itemValue)}
                    style={styles.picker}
                    dropdownIconColor="#16A34A"
                >
                    <Picker.Item label="Nome Comum" value="common_name" />
                    <Picker.Item label="Cidade" value="city" />
                    <Picker.Item label="Nome Científico" value="scientific_name" />
                </Picker>
            </View>
            
            <View style={styles.inputContainer}>
                <Feather name="tag" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Digite o termo de busca..."
                    placeholderTextColor="#94A3B8"
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    onSubmitEditing={searchPlant}
                />
            </View>

            <View style={styles.buttonContainer}>
                 <TouchableOpacity style={styles.searchButton} onPress={searchPlant}>
                    <Feather name="search" size={20} color="#FFFFFF" />
                    <Text style={styles.buttonText}>Buscar</Text>
                </TouchableOpacity>
                 <TouchableOpacity style={styles.viewAllButton} onPress={fetchAllPlants}>
                     <Feather name="list" size={20} color="#16A34A" />
                    <Text style={[styles.buttonText, {color: "#16A34A"}]}>Ver Todas</Text>
                </TouchableOpacity>
            </View>
        </View>

        {loading ? (
            <ActivityIndicator style={styles.activityIndicator} size="large" color="#16A34A" />
        ) : (
            <FlatList
                data={filteredPlants}
                renderItem={({item}) => <PlantListItem item={item} />}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={() => (
                    searched && !loading && (
                        <View style={styles.noResultsContainer}>
                            <Feather name="alert-circle" size={40} color="#94A3B8" />
                            <Text style={styles.noResultsText}>Nenhuma planta encontrada.</Text>
                        </View>
                    )
                )}
            />
        )}
    </SafeAreaView>
  );
}


// --- NOVOS ESTILOS PROFISSIONAIS ---
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
    headerWithBack: { 
        flexDirection: 'row', 
        paddingVertical: 24, 
        paddingHorizontal: 16, 
        borderBottomWidth: 1, 
        borderBottomColor: '#f1f5f9',
        alignItems: 'flex-start',
    },
    backButton: { 
        padding: 8, 
        borderRadius: 20, 
        backgroundColor: '#F1F5F9',
        marginRight: 12,
        marginTop: 4,
    },
    header: { 
        flex: 1,
        alignItems: 'center', 
    },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: "#1E293B", marginTop: 8 },
    headerSubtitle: { fontSize: 16, color: "#475569" },
    
    searchContainer: { margin: 16, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 5, borderWidth: 1, borderColor: '#f1f5f9' },
    pickerContainer: { 
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 12,
        justifyContent: 'center',
    },
    picker: {
        height: 50,
        color: '#1E293B',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        paddingHorizontal: 12,
        marginBottom: 16,
    },
    inputIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 16,
        color: '#1E293B',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    searchButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#22C55E',
        paddingVertical: 14,
        borderRadius: 8,
    },
    viewAllButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#DCFCE7',
        paddingVertical: 14,
        borderRadius: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    
    listContainer: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    plantCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    plantImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: '#e2e8f0'
    },
    plantInfo: {
        flex: 1,
    },
    plantName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    plantScientificName: {
        fontSize: 14,
        color: '#94A3B8',
        fontStyle: 'italic',
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    plantLocation: {
        fontSize: 14,
        color: '#475569',
        marginLeft: 4,
    },
    
    activityIndicator: {
        marginTop: 40,
    },
    noResultsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        marginTop: 50,
    },
    noResultsText: {
        marginTop: 16,
        fontSize: 16,
        color: '#475569',
        textAlign: 'center',
    },
});