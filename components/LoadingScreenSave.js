import { View, Text, ActivityIndicator, StyleSheet, Image } from 'react-native';

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/imagemlogotcc.png')}
        style={styles.logo}
      />
      <ActivityIndicator size="large" color="#4CAF50" />
      <Text style={styles.loadingText}>SALVANDO IMAGEM</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#BED9A7',
    alignItems: 'center',
    opacity: 10,
    justifyContent: 'center',
  },
  logo: {
    width: 130,
    height: 200,
    marginBottom: 170,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 30,
    textAlign:'center',
    color: 'black',
    fontWeight: 'bold',
  },
});

export default LoadingScreen;
