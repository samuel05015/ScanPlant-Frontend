import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from './supabase'; // Corrigido: 'database' para 'supabase'
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Simulação do seu DesignSystem para o exemplo funcionar
const Colors = {
    primary: { 50: '#F0FDF4', 100: '#DCFCE7', 200: '#BBF7D0', 400: '#4ADE80', 500: '#22C55E', 600: '#16A34A'},
    background: { primary: '#FFFFFF', secondary: '#F8FAFC' },
    text: { primary: '#1E293B', secondary: '#475569', tertiary: '#94A3B8', inverse: '#FFFFFF' },
    neutral: { 300: '#CBD5E1', 400: '#94A3B8' },
    error: { 500: '#EF4444' }
};
const Spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, '2xl': 32 };
const BorderRadius = { lg: 12, xl: 16, '2xl': 24, full: 9999 };
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
        h1: { fontSize: 32, fontWeight: 'bold' },
        h3: { fontSize: 20, fontWeight: 'bold' },
        body: { fontSize: 16, lineHeight: 24 },
        bodyMedium: { fontSize: 16, fontWeight: '600' },
        caption: { fontSize: 12, color: Colors.text.tertiary },
        small: { fontSize: 14, color: Colors.text.tertiary },
    }
};
// Fim da simulação do DesignSystem

const PLACEHOLDER_IMAGE = require('../assets/placeholder.png');

const resolveImageSource = (imageData) => {
  if (typeof imageData === 'string' && imageData.length > 0) {
    const trimmed = imageData.trim();
    if (trimmed.startsWith('data:') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return { uri: trimmed };
    }
    const compact = trimmed.replace(/\s/g, '');
    if (compact.length > 0 && /^[A-Za-z0-9+/=]+$/.test(compact)) {
      return { uri: `data:image/jpeg;base64,${compact}` };
    }
  }
  return PLACEHOLDER_IMAGE;
};


const PlantDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [plant, setPlant] = React.useState(route.params.plant);
  const [loading, setLoading] = React.useState(!route.params.plant);
  const [error, setError] = React.useState(null);
  
  // Buscar detalhes da planta se apenas o ID foi fornecido
  React.useEffect(() => {
    const fetchPlantDetails = async () => {
      if (route.params.plantId && !route.params.plant) {
        try {
          setLoading(true);
          const { data, error } = await supabase
            .from('plants')
            .select('*')
            .eq('id', route.params.plantId)
            .single();
            
          if (error) throw error;
          setPlant(data);
        } catch (err) {
          console.error('Erro ao buscar detalhes da planta:', err);
          setError('Não foi possível carregar os detalhes da planta');
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchPlantDetails();
  }, [route.params.plantId]);
  
  // Mostrar tela de carregamento
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color={Colors.primary[500]} />
        <Text style={styles.loadingText}>Carregando detalhes da planta...</Text>
      </SafeAreaView>
    );
  }
  
  // Mostrar tela de erro
  if (error || !plant) {
    return (
      <SafeAreaView style={[styles.container, styles.errorContainer]}>
        <StatusBar barStyle="dark-content" />
        <Feather name="alert-triangle" size={64} color={Colors.error[500]} />
        <Text style={styles.errorText}>{error || 'Planta não encontrada'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const deletePlant = () => {
    if (!plant || !plant.id) {
      Alert.alert('Erro', 'Não foi possível encontrar informações sobre esta planta.');
      return;
    }
    
    Alert.alert(
      'Excluir Planta',
      'Tem certeza que deseja remover esta planta da sua coleção?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('plants')
                .delete()
                .eq('id', plant.id);
              if (error) throw error;
              Alert.alert('Sucesso', 'Planta excluída com sucesso!');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Erro', 'Falha ao excluir a planta.');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Data não disponível';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'long', year: 'numeric'
      });
    } catch {
      return 'Data inválida';
    }
  };
  
  const HeaderButton = ({ iconName, onPress, style }) => (
    <TouchableOpacity style={[styles.headerButton, style]} onPress={onPress}>
        <Feather name={iconName} size={22} color={Colors.text.inverse} />
    </TouchableOpacity>
  );

  const InfoRow = ({ label, value, isItalic = false }) => {
    if (!value) return null;
    return (
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={[styles.infoValue, isItalic && styles.infoValueItalic]}>{value}</Text>
        </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
            <Image
                source={plant && (plant.image_data || plant.image_url) ? 
                  resolveImageSource(plant.image_data || plant.image_url) : 
                  PLACEHOLDER_IMAGE}
                style={styles.plantImage}
                resizeMode="cover"
            />
            <LinearGradient
                colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.8)']}
                style={styles.gradient}
            />
            <View style={styles.header}>
                <HeaderButton iconName="arrow-left" onPress={() => navigation.goBack()} />
                <HeaderButton iconName="trash-2" onPress={deletePlant} style={{backgroundColor: Colors.error[500]}}/>
            </View>
        </View>

        <View style={styles.contentContainer}>
            <Text style={styles.commonName}>{plant?.common_name || 'Nome não disponível'}</Text>
            <Text style={styles.scientificName}>{plant?.scientific_name || 'Nome científico não disponível'}</Text>
            
            <View style={styles.divider} />
            
            <InfoRow label="Descrição" value={plant?.wiki_description || plant?.enhanced_description || 'Descrição não disponível'} />
            
            <Text style={styles.sectionTitle}>Detalhes</Text>
            <InfoRow label="Família" value={plant?.family || 'Não disponível'} />
            <InfoRow label="Gênero" value={plant?.genus || 'Não disponível'} />
            <InfoRow label="Cuidados" value={plant?.care_instructions || 'Cuidados não disponíveis'} />

            <Text style={styles.sectionTitle}>Lembrete de Rega</Text>
            <InfoRow
              label="Status"
              value={plant?.reminder_enabled ? 'Ativado' : 'Desativado'}
            />
            {plant?.reminder_enabled && (
              <InfoRow
                label="Frequência"
                value={plant?.watering_frequency_days ? `${plant?.watering_frequency_days} dia(s)` : (plant?.watering_frequency_text || 'Informação indisponível')}
              />
            )}

            <Text style={styles.sectionTitle}>Localização</Text>
            <InfoRow label="Cidade" value={plant?.city || 'Não disponível'} />
            <InfoRow label="Local Específico" value={plant?.location_name || 'Não disponível'} />

            {plant?.notes ? (
              <>
                <Text style={styles.sectionTitle}>Anotações</Text>
                <Text style={styles.notesText}>{plant.notes}</Text>
              </>
            ) : null}

            <View style={styles.footer}>
                <Text style={styles.dateText}>Registrada em {formatDate(plant?.created_at)}</Text>
            </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  imageContainer: {
    height: 400,
    width: '100%',
    backgroundColor: Colors.neutral[300],
  },
  plantImage: {
    height: '100%',
    width: '100%',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    position: 'absolute',
    top: StatusBar.currentHeight || 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    backgroundColor: Colors.background.primary,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    marginTop: -Spacing.xl,
    padding: Spacing.xl,
  },
  commonName: {
    ...Typography.styles.h1,
    color: Colors.text.primary,
  },
  scientificName: {
    ...Typography.styles.body,
    color: Colors.text.secondary,
    fontStyle: 'italic',
    marginTop: Spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.neutral[300],
    marginVertical: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.styles.h3,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  infoRow: {
    marginBottom: Spacing.lg,
  },
  infoLabel: {
    ...Typography.styles.bodyMedium,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  infoValue: {
    ...Typography.styles.body,
    color: Colors.text.primary,
  },
  infoValueItalic: {
    fontStyle: 'italic',
  },
  notesText: {
    ...Typography.styles.body,
    color: Colors.text.primary,
    backgroundColor: Colors.background.secondary,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  footer: {
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  dateText: {
    ...Typography.styles.caption,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.styles.body,
    color: Colors.text.primary,
    marginTop: Spacing.md,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorText: {
    ...Typography.styles.body,
    color: Colors.text.primary,
    textAlign: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  backButton: {
    backgroundColor: Colors.primary[500],
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  backButtonText: {
    ...Typography.styles.buttonText,
    color: Colors.white,
  },
});

export default PlantDetailScreen;
