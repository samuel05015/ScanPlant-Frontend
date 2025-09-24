import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from 'react-native';
import { database } from './supabase'; // Importando o Supabase
import Icon from 'react-native-vector-icons/FontAwesome'; // Importando o ícone
import { Picker } from '@react-native-picker/picker';

const PlantCard = ({ navigation }) => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupedPlants, setGroupedPlants] = useState({});

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const { data, error } = await database.select('plants');
        
        if (error) {
          throw new Error(error.message);
        }
        
        if (data && data.length > 0) {
          // Mapear dados do Supabase para o formato esperado
          const plantsData = data.map((plant, index) => ({
            id: plant.id || `plant-${index}`, // Usar ID do Supabase ou gerar um
            ...plant,
          }));
          setPlants(plantsData);
        } else {
          setPlants([]);
        }
      } catch (error) {
        console.error('Error fetching plants data:', error);
        setPlants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, []);

  useEffect(() => {
    const groupPlants = () => {
      // Filtrar plantas com base na consulta de pesquisa
      const filteredPlants = plants.filter((plant) =>
        (plant.common_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (plant.scientific_name || '').toLowerCase().includes(searchQuery.toLowerCase())
      );

      const groups = filteredPlants.reduce((acc, plant) => {
        const scientificName =
          plant.scientific_name || 'Nome Científico Não Disponível';
        if (!acc[scientificName]) {
          acc[scientificName] = [];
        }
        acc[scientificName].push(plant);
        return acc;
      }, {});

      setGroupedPlants(groups);
    };

    groupPlants();
  }, [plants, searchQuery]);

  const handlePlantPress = (plant) => {
    navigation.navigate('ImageScreen', { imageUrl: plant.image_url });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../assets/imagemlogotcc.png')}
          style={styles.logo}
        />
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar por nome da Planta"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Icon
            name="search"
            size={20}
            color="#333"
            style={styles.searchIcon}
          />
        </View>
        <Text style={styles.title}>PLANTAS</Text>
        <View style={styles.separator} />
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : Object.keys(groupedPlants).length === 0 ? (
        <View style={styles.noPlantsContainer}>
          <Text style={styles.noPlantsText}>Nenhuma planta encontrada</Text>
        </View>
      ) : (
        Object.keys(groupedPlants).map((scientificName) => (
          <View style={styles.list} key={scientificName}>
            <Text style={styles.scientificNameHeader}>{scientificName}</Text>
            <Picker
              style={styles.picker}
              selectedValue={null}
              onValueChange={(itemValue) => {
                const selectedPlant = groupedPlants[scientificName].find(
                  (plant) => plant.common_name === itemValue
                );
                if (selectedPlant) {
                  handlePlantPress(selectedPlant);
                }
              }}
            >
              {groupedPlants[scientificName].map((plant) => (
                <Picker.Item
                  key={plant.id}
                  label={`${
                    plant.common_name || 'Nome Comum Não Disponível'
                  } - ${plant.city_name ? 'Cidade (' + plant.city_name + ')' : 'Cidade Não Disponível'}`}
                  value={plant.common_name || 'Nome Comum Não Disponível'}
                />
              ))}
            </Picker>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D4E6C3',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    width: 220,
    marginRight: 10,
    textAlign: 'left',
  },
  searchIcon: {
    marginLeft: -30,
  },
  title: {
    fontSize: 50,
    color: 'black',
    textShadowColor: 'white',
    fontFamily: 'Outfit-Regular',
    textShadowRadius: 20,
  },
  separator: {
    height: 4,
    backgroundColor: '#000000',
    width: '100%',
    marginTop: 10,
  },
  scientificNameHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
  },
  noPlantsContainer: {
    marginTop: 20,
    width: '90%',
    height: 150,
    borderWidth: 2,
    borderColor: '#333',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 10,
  },
  noPlantsText: {
    fontSize: 20,
    color: '#333',
    textShadowColor: 'white',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  picker: {
    height: 50,
    width: 300,
    alignSelf: 'center',
    marginVertical: 10,
    borderWidth: 2,
  },
  list: {
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 20,
  },
});

export default PlantCard;
