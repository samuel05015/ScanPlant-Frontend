import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  StatusBar,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

// Componente para reutilizar a estrutura de cada passo
const InstructionStep = ({ iconName, title, description }) => (
  <View style={styles.stepContainer}>
    <Feather name={iconName} size={28} color="#4A6C35" style={styles.stepIcon} />
    <View style={styles.stepTextContainer}>
      <Text style={styles.stepTitle}>{title}</Text>
      <Text style={styles.stepDescription}>{description}</Text>
    </View>
  </View>
);

const ScreenPasso = () => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate('LoginScreen');
  };

  return (
    <LinearGradient colors={['#E9F5DB', '#FFFFFF']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />

        <View style={styles.headerContainer}>
          <View style={styles.iconContainer}>
            <Feather name="shield-check" size={70} color="#4A6C35" />
          </View>
          <Text style={styles.mainTitle}>Como Tirar a Foto Perfeita</Text>
          <Text style={styles.mainSubtitle}>
            Siga estas dicas para garantir uma análise precisa da sua planta.
          </Text>
        </View>

        <View style={styles.card}>
          <InstructionStep
            iconName="camera"
            title="Enquadramento"
            description="Certifique-se de que a folha ou a área afetada esteja bem focada e centralizada na foto."
          />
          <InstructionStep
            iconName="sun"
            title="Iluminação Ideal"
            description="Fotografe em um local com boa luz natural, evitando sombras fortes e o uso de flash."
          />
          <InstructionStep
            iconName="check-circle"
            title="Foco e Nitidez"
            description="Toque na tela para focar e mantenha o celular firme para obter uma imagem nítida e clara."
          />
        </View>

        <TouchableOpacity onPress={handlePress} style={styles.button}>
          <Text style={styles.buttonText}>OK, ENTENDI</Text>
        </TouchableOpacity>
        
      </SafeAreaView>
    </LinearGradient>
  );
};

// ... (seus estilos continuam aqui, sem alterações)
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around', // Alterado para melhor distribuição
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerContainer: {
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10, // Aumentado
  },
  mainSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    maxWidth: '95%',
    lineHeight: 22, // Adicionado para melhor legibilidade
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 25, // Aumentado
    paddingHorizontal: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    justifyContent: 'space-around', // Alterado para espaçar os itens
    minHeight: 300, // Garante altura mínima
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIcon: {
    marginRight: 20,
  },
  stepTextContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6, // Aumentado
  },
  stepDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 21, // Aumentado
  },
  button: {
    backgroundColor: '#4A6C35',
    paddingVertical: 16,
    width: '100%',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ScreenPasso;