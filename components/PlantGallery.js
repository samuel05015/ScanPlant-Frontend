import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { database } from './supabase'; // Verifique se o caminho está correto
import { Feather } from '@expo/vector-icons'; // Importando ícones
import { LinearGradient } from 'expo-linear-gradient';

// Simulação do seu DesignSystem para o exemplo funcionar
const Colors = {
    primary: { 50: '#F0FDF4', 100: '#DCFCE7', 400: '#4ADE80', 500: '#22C55E', 600: '#16A34A'},
    background: { primary: '#FFFFFF', secondary: '#F8FAFC' },
    text: { primary: '#1E293B', secondary: '#475569', tertiary: '#94A3B8', inverse: '#FFFFFF' },
    neutral: { 300: '#CBD5E1', 400: '#94A3B8' }
};
const Spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, '2xl': 32 };
const BorderRadius = { lg: 12, xl: 16, full: 9999 };
const Shadows = {
    md: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2, },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    }
};
const Typography = {
    styles: {
        h2: { fontSize: 24, fontWeight: 'bold' },
        h3: { fontSize: 20, fontWeight: 'bold' },
        body: { fontSize: 16 },
        bodyMedium: { fontSize: 16, fontWeight: '600' },
        caption: { fontSize: 12, color: Colors.text.tertiary },
        small: { fontSize: 14, color: Colors.text.tertiary },
    }
};
// Fim da simulação do DesignSystem

const PlantGallery = ({ navigation }) => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPlants = useCallback(async () => {
    try {
      const { data, error } = await database.select('plants', '*');
      if (error) {
        Alert.alert('Erro', 'Falha ao carregar plantas: ' + error.message);
        return;
      }
      setPlants(data || []);
    } catch (error) {
      Alert.alert('Erro', 'Erro inesperado ao carregar plantas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPlants();
  }, [loadPlants]);

  const onRefresh = () => {
    setRefreshing(true);
    loadPlants();
  };

  const PlantItem = React.memo(({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.plantItem}
        onPress={() => navigation.navigate('PlantDetail', { plant: item })}
        activeOpacity={0.8}
      >
        <Image 
          source={{ uri: item.image_data }} 
          style={styles.plantImage}
          resizeMode="cover"
        />
        <View style={styles.plantInfo}>
          <Text style={styles.commonName} numberOfLines={2}>
            {item.common_name || 'Nome não disponível'}
          </Text>
          <Text style={styles.scientificName} numberOfLines={1}>
            {item.scientific_name || 'Nome científico não disponível'}
          </Text>
          <View style={styles.locationContainer}>
            <Feather name="map-pin" size={14} color={Colors.text.tertiary} />
            <Text style={styles.location} numberOfLines={1}>
              {item.city || 'Local não disponível'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  });

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <Text style={styles.headerTitle}>Minha Coleção</Text>
      <Text style={styles.headerSubtitle}>{plants.length} {plants.length === 1 ? 'planta registrada' : 'plantas registradas'}</Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.centerContainer}>
      <Feather name="plus-square" size={64} color={Colors.neutral[300]} />
      <Text style={styles.emptyText}>Nenhuma planta na coleção</Text>
      <Text style={styles.emptySubtext}>Adicione sua primeira planta para começar!</Text>
      <TouchableOpacity 
        style={styles.emptyButton}
        onPress={() => navigation.navigate('PhotoScreen')}
      >
        <Feather name="camera" size={18} color={Colors.text.inverse} />
        <Text style={styles.emptyButtonText}>Identificar Planta</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
        <Text style={styles.loadingText}>Carregando sua coleção...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background.secondary} />
      <FlatList
        data={plants}
        renderItem={({ item }) => <PlantItem item={item} />}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[Colors.primary[500]]}
            tintColor={Colors.primary[500]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  listContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['2xl'],
  },
  headerContent: {
    paddingVertical: Spacing.xl,
    paddingTop: Spacing['2xl'],
    alignItems: 'flex-start',
  },
  headerTitle: {
    ...Typography.styles.h2,
    color: Colors.text.primary,
  },
  headerSubtitle: {
    ...Typography.styles.body,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  plantItem: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    ...Shadows.md,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  plantImage: {
    width: 100,
    height: '100%',
    minHeight: 120,
  },
  plantInfo: {
    flex: 1,
    padding: Spacing.lg,
  },
  commonName: {
    ...Typography.styles.bodyMedium,
    color: Colors.primary[600],
    marginBottom: Spacing.xs,
  },
  scientificName: {
    ...Typography.styles.caption,
    fontStyle: 'italic',
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
  },
  location: {
    ...Typography.styles.small,
    marginLeft: Spacing.xs,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: Spacing.xl,
  },
  loadingText: {
    ...Typography.styles.body,
    marginTop: Spacing.lg,
    color: Colors.text.secondary,
  },
  emptyText: {
    ...Typography.styles.h3,
    textAlign: 'center',
    marginTop: Spacing.lg,
    color: Colors.text.secondary,
  },
  emptySubtext: {
    ...Typography.styles.body,
    textAlign: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
    color: Colors.text.tertiary,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[500],
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    ...Shadows.md,
  },
  emptyButtonText: {
    ...Typography.styles.bodyMedium,
    color: Colors.text.inverse,
    marginLeft: Spacing.sm,
  },
});

export default PlantGallery;