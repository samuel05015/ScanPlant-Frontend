import React, { Component } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth } from './supabase'; // Mantenha seu import do Supabase
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

// Componente de classe principal com a lógica
class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      senha: '',
      errorMessage: '',
      successMessage: '',
    };

    this.login = this.login.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
  }

  // Sua lógica de login (sem alterações)
  async login() {
    try {
      const { data, error } = await auth.signIn(this.state.email, this.state.senha);
      
      if (error) {
        switch (error.message) {
          case 'Invalid login credentials':
            this.setState({ errorMessage: 'Email ou senha incorretos!' });
            break;
          case 'Email not confirmed':
            this.setState({ errorMessage: 'Email não confirmado! Verifique sua caixa de entrada.' });
            break;
          default:
            this.setState({
              errorMessage: 'Ocorreu um erro! Tente novamente.',
            });
            break;
        }
      } else {
        this.setState({ errorMessage: '', successMessage: '' });
        this.props.navigation.navigate('HomeScreen');
      }
    } catch (error) {
      this.setState({
        errorMessage: 'Erro de conexão! Verifique sua internet.',
      });
    }
  }

  // Sua lógica de reset de senha (sem alterações)
  async resetPassword() {
    if (!this.state.email) {
      this.setState({
        errorMessage: 'Digite seu email para redefinir a senha.',
        successMessage: '',
      });
      return;
    }

    try {
      const { data, error } = await auth.api.resetPasswordForEmail(this.state.email);
      
      if (error) {
        this.setState({
          errorMessage: 'Erro ao enviar email. Verifique o endereço.',
          successMessage: '',
        });
      } else {
        this.setState({
          successMessage: 'Email de redefinição de senha enviado!',
          errorMessage: '',
        });
      }
    } catch (error) {
      this.setState({
        errorMessage: 'Erro de conexão! Verifique sua internet.',
        successMessage: '',
      });
    }
  }

  render() {
    return (
      <LinearGradient colors={['#E9F5DB', '#FFFFFF']} style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}>
          <ScrollView contentContainerStyle={styles.scrollView}>
            <Image
              source={require('../assets/imagemlogotcc.png')} // Mantenha o caminho para sua logo
              style={styles.logo}
            />

            <Text style={styles.title}>Bem-vindo de volta!</Text>
            <Text style={styles.subtitle}>Faça login para continuar</Text>

            <View style={styles.inputContainer}>
              <Feather name="mail" size={20} color="#A9A9A9" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                onChangeText={(email) => this.setState({ email })}
                placeholder="Email"
                placeholderTextColor="#A9A9A9"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Feather name="lock" size={20} color="#A9A9A9" style={styles.inputIcon} />
              <TextInput
                secureTextEntry={true}
                style={styles.input}
                onChangeText={(senha) => this.setState({ senha })}
                placeholder="Senha"
                placeholderTextColor="#A9A9A9"
              />
            </View>

            {this.state.errorMessage ? (
              <Text style={styles.errorText}>{this.state.errorMessage}</Text>
            ) : null}

            {this.state.successMessage ? (
              <Text style={styles.successText}>{this.state.successMessage}</Text>
            ) : null}

            <TouchableOpacity
              style={styles.button}
              onPress={this.login}
              activeOpacity={0.8}>
              <Text style={styles.buttonText}>Entrar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.linkButton} onPress={this.resetPassword}>
              <Text style={styles.linkText}>Esqueceu a senha?</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => this.props.navigation.navigate('CriarConta')}>
              <Text style={styles.linkText}>Não tem uma conta? <Text style={styles.linkTextBold}>Crie uma aqui.</Text></Text>
            </TouchableOpacity>

          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    );
  }
}

// Wrapper para injetar a navegação no componente de classe
const LoginScreenWithNavigation = (props) => {
  const navigation = useNavigation();
  return <LoginScreen {...props} navigation={navigation} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: 100,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'Roboto',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
    borderRadius: 12,
    width: '100%',
    height: 50,
    marginBottom: 20,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E8E8E8'
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#4A6C35',
    paddingVertical: 16,
    width: '100%',
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: "#000",
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
  errorText: {
    color: '#D9534F',
    marginBottom: 10,
    textAlign: 'center',
  },
  successText: {
    color: '#5CB85C',
    marginBottom: 10,
    textAlign: 'center',
  },
  linkButton: {
     marginTop: 20,
  },
  linkText: {
    color: '#4A6C35',
    fontSize: 14,
  },
  linkTextBold: {
    fontWeight: 'bold',
  }
});

export default LoginScreenWithNavigation;