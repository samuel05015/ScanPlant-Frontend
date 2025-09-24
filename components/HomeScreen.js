import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Typography, Spacing, BorderRadius, Shadows, BaseStyles, Icons } from './styles/DesignSystem';

const HomeScreen = () => {
  const navigation = useNavigation();

  const goToPlantGallery = () => {
    navigation.navigate('PlantGallery');
  };

  const goToPhotoScreen = () => {
    navigation.navigate('PhotoScreen');
  };

  const goToSearchScreen = () => {
    navigation.navigate('SearchScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background.primary} />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Logo Container */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/imagemlogotcc.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.welcomeText}>Bem-vindo ao ScanPlant</Text>
          <Text style={styles.descriptionText}>
            Descubra o mundo das plantas com inteligência artificial
          </Text>
        </View>

        {/* Action Cards */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.primaryCard} onPress={goToPhotoScreen}>
              <View style={styles.cardIcon}>
                <Text style={styles.cardIconText}>{Icons.identify}</Text>
              </View>
              <Text style={styles.primaryCardTitle}>Identificar Planta</Text>
              <Text style={styles.primaryCardSubtitle}>
                Tire uma foto e descubra informações detalhadas
              </Text>
            </TouchableOpacity>
  
            <View style={styles.secondaryCardsRow}>
              <TouchableOpacity style={styles.secondaryCard} onPress={goToPlantGallery}>
                <View style={styles.secondaryCardIcon}>
                  <Text style={styles.secondaryCardIconText}>{Icons.collection}</Text>
                </View>
                <Text style={styles.secondaryCardTitle}>Minhas Plantas</Text>
                <Text style={styles.secondaryCardSubtitle}>Ver coleção</Text>
              </TouchableOpacity>
 
             <TouchableOpacity style={styles.secondaryCard} onPress={goToSearchScreen}>
               <View style={styles.secondaryCardIcon}>
                 <Text style={styles.secondaryCardIconText}>{Icons.search}</Text>
               </View>
               <Text style={styles.secondaryCardTitle}>Explorar</Text>
               <Text style={styles.secondaryCardSubtitle}>Buscar plantas</Text>
             </TouchableOpacity>
           </View>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Recursos</Text>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>{Icons.leaf}</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Identificação Precisa</Text>
              <Text style={styles.featureDescription}>
                IA avançada para identificar milhares de espécies
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>{Icons.location}</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Localização GPS</Text>
              <Text style={styles.featureDescription}>
                Registre onde encontrou cada planta
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>{Icons.save}</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Coleção Pessoal</Text>
              <Text style={styles.featureDescription}>
                Mantenha um registro de suas descobertas
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...BaseStyles.container,
  },
  
  scrollView: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  
  logoContainer: {
    alignItems: 'center',
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing['2xl'],
    paddingHorizontal: Spacing.lg,
  },
  
  logoImage: {
    width: 200,
    height: 250,
    marginBottom: Spacing.xl,
  },
  
  welcomeText: {
    ...Typography.styles.h2,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  
  descriptionText: {
    ...Typography.styles.caption,
    textAlign: 'center',
    maxWidth: 280,
  },
  
  actionsContainer: {
    marginBottom: Spacing['2xl'],
  },
  
  primaryCard: {
    backgroundColor: Colors.primary[500],
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.xl,
    borderWidth: 1,
    borderColor: Colors.primary[400],
  },
  
  cardIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.primary[400],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.md,
    borderWidth: 2,
    borderColor: Colors.primary[300],
  },
  
  cardIconText: {
    fontSize: 28,
  },
  
  primaryCardTitle: {
    ...Typography.styles.h3,
    color: Colors.text.inverse,
    marginBottom: Spacing.sm,
  },
  
  primaryCardSubtitle: {
    ...Typography.styles.body,
    color: Colors.primary[100],
    textAlign: 'center',
  },
  
  secondaryCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  secondaryCard: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    marginHorizontal: Spacing.xs,
    ...Shadows.lg,
    borderWidth: 1,
    borderColor: Colors.primary[100],
    minHeight: 140,
  },
  
  secondaryCardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  
  secondaryCardIconText: {
    fontSize: 20,
  },
  
  secondaryCardTitle: {
    ...Typography.styles.bodyMedium,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  
  secondaryCardSubtitle: {
    ...Typography.styles.small,
    textAlign: 'center',
  },
  
  featuresContainer: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.lg,
    borderWidth: 1,
    borderColor: Colors.primary[100],
    marginTop: Spacing.md,
  },
  
  featuresTitle: {
    ...Typography.styles.h3,
    marginBottom: Spacing.lg,
  },
  
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  
  featureIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
    width: 32,
    textAlign: 'center',
  },
  
  featureContent: {
    flex: 1,
  },
  
  featureTitle: {
    ...Typography.styles.bodyMedium,
    marginBottom: Spacing.xs,
  },
  
  featureDescription: {
    ...Typography.styles.caption,
  },
});

export default HomeScreen;
