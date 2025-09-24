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
import { auth } from './supabase'; // Mantenha seu import do Supabase
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

export default class CriarConta extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      senha: '',
      errorMessage: '',
      successMessage: '',
    };

    this.cadastrar = this.cadastrar.bind(this);
    this.voltar = this.voltar.bind(this);
  }

  // Sua lógica de cadastro (sem alterações)
  async cadastrar() {
    if (!this.state.email || !this.state.senha) {
      this.setState({
        errorMessage: 'Por favor, preencha todos os campos!',
        successMessage: '',
      });
      return;
    }

    if (this.state.senha.length < 6) {
      this.setState({
        errorMessage: 'Sua senha deve ter pelo menos 6 caracteres!',
        successMessage: '',
      });
      return;
    }

    try {
      const { data, error } = await auth.signUp(this.state.email, this.state.senha);
      
      if (error) {
        switch (error.message) {
          case 'User already registered':
            this.setState({
              errorMessage: 'Já existe uma conta com este email.',
              successMessage: '',
            });
            break;
          default:
            this.setState({
              errorMessage: 'Ocorreu um erro! Tente novamente.',
              successMessage: '',
            });
            break;
        }
      } else {
        this.setState({
          successMessage: 'Usuário cadastrado! Verifique seu email para confirmar.',
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

  // Sua lógica para voltar (sem alterações)
  voltar() {
    this.props.navigation.goBack();
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

            <Text style={styles.title}>Crie sua conta</Text>
            <Text style={styles.subtitle}>É rápido e fácil!</Text>

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
                placeholder="Senha (mín. 6 caracteres)"
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
              onPress={this.cadastrar}
              activeOpacity={0.8}>
              <Text style={styles.buttonText}>Criar Conta</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={this.voltar}
              activeOpacity={0.8}>
              <Text style={styles.backButtonText}>Voltar</Text>
            </TouchableOpacity>

          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    );
  }
}

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
    backButton: {
        backgroundColor: 'transparent',
        paddingVertical: 16,
        width: '100%',
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#4A6C35'
    },
    backButtonText: {
        color: '#4A6C35',
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
});