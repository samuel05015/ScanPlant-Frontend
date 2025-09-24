import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Text,
  Alert,
  Linking,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const ImageScreen = ({ route }) => {
  const { imageUrl, wikiUrl } = route.params; // Receber o URL da Wikipedia

  // Função para abrir o link da Wikipedia
  const openWikipedia = () => {
    if (wikiUrl) {
      Linking.openURL(wikiUrl);
    } else {
      Alert.alert('Erro', 'URL do Wikipedia não disponível.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="contain"
      />
      
      {wikiUrl && (
        <TouchableOpacity onPress={openWikipedia} style={styles.linkContainer}>
          <Text style={styles.linkText}>Saiba mais na Wikipedia</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width,
    height: height,
  },
  linkContainer: {
    marginTop: 20,
    padding: 10,
  },
  linkText: {
    color: '#0000EE',
    textDecorationLine: 'underline',
  },
});

export default ImageScreen;
