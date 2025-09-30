import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { auth, database, supabase } from './supabase';
import { Colors, Typography, Spacing, BorderRadius, Shadows, BaseStyles } from './styles/DesignSystem';

const ProfileSettingsScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
  });
  const [initialUserData, setInitialUserData] = useState({});

  // Carregar dados do usuário ao iniciar
  useEffect(() => {
    fetchUserData();
  }, []);

  // Verificar se há mudanças não salvas
  const hasChanges = () => {
    return (
      userData.name !== initialUserData.name ||
      userData.phone !== initialUserData.phone ||
      userData.bio !== initialUserData.bio ||
      (profileImage && typeof profileImage !== 'string')
    );
  };

  // Buscar dados do usuário
  const fetchUserData = async () => {
    try {
      setLoading(true);
      console.log("Buscando dados do usuário...");
      
      // Verificar se o usuário está autenticado
      const { data: userData } = await auth.getCurrentUser();
      const currentUser = userData?.user;
      
      if (!currentUser) {
        console.log("Usuário não autenticado, redirecionando para login");
        Alert.alert('Erro', 'Você precisa estar logado para acessar esta página.');
        navigation.navigate('LoginScreen');
        return;
      }
      
      console.log("Usuário autenticado:", currentUser.id);
      
      // Buscar dados do perfil no Supabase usando diretamente o cliente
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 é o código para "Nenhum registro encontrado"
        console.error('Erro ao buscar dados de perfil:', error);
      } else if (data) {
        console.log("Dados de perfil encontrados:", data);
        const profileData = data;
        
        // Preencher os dados do perfil
        setUserData({
          name: profileData.name || '',
          email: currentUser.email || '',
          phone: profileData.phone || '',
          bio: profileData.bio || '',
        });
        setInitialUserData({
          name: profileData.name || '',
          email: currentUser.email || '',
          phone: profileData.phone || '',
          bio: profileData.bio || '',
        });
        
        // Definir a imagem de perfil, se existir
        if (profileData.avatar_url) {
          console.log("Avatar URL encontrado:", profileData.avatar_url);
          setProfileImage(profileData.avatar_url);
        }
      } else {
        console.log("Nenhum perfil encontrado. Usando apenas dados de autenticação");
        // Usuário autenticado mas sem perfil ainda
        setUserData({
          name: '',
          email: currentUser.email || '',
          phone: '',
          bio: '',
        });
        setInitialUserData({
          name: '',
          email: currentUser.email || '',
          phone: '',
          bio: '',
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      Alert.alert('Erro', 'Não foi possível carregar seus dados. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Selecionar imagem da galeria
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setProfileImage({
          uri: asset.uri,
          base64: asset.base64,
          mimeType: asset.mimeType || 'image/jpeg',
        });
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  // Salvar alterações
  const saveChanges = async () => {
    try {
      setLoading(true);
      console.log("Iniciando salvamento de dados do perfil...");
      
      // Verificar se o usuário está autenticado
      const { data: authData } = await auth.getCurrentUser();
      const currentUser = authData?.user;
      if (!currentUser) {
        console.log("Usuário não autenticado");
        Alert.alert('Erro', 'Você precisa estar logado para salvar alterações.');
        return;
      }
      
      console.log("Usuário autenticado:", currentUser.id);
      console.log("Dados a serem salvos:", userData);
      
      // Preparar dados para atualização
      const updateData = {
        id: currentUser.id,
        name: userData.name,
        phone: userData.phone,
        bio: userData.bio,
        updated_at: new Date().toISOString(),
      };
      
      // Adicionar a imagem base64 se foi alterada
      if (profileImage && profileImage.base64) {
        console.log("Atualizando imagem de perfil (base64)");
        const imageDataUrl = `data:${profileImage.mimeType || 'image/jpeg'};base64,${profileImage.base64}`;
        updateData.avatar_url = imageDataUrl;
      } else if (profileImage && typeof profileImage === 'string') {
        console.log("Mantendo URL da imagem de perfil existente");
        updateData.avatar_url = profileImage;
      }
      
      console.log("Enviando atualização para o Supabase...");
      // Atualizar no Supabase usando diretamente o cliente supabase - usando upsert para criar o perfil caso não exista
      const { data: result, error } = await supabase
        .from('profiles')
        .upsert(updateData, { 
          onConflict: 'id',
          returning: 'representation' // Garante que retorne a representação completa
        })
        .select();
      
      if (error) {
        console.error("Erro ao salvar perfil:", error);
        throw error;
      }
      
      console.log("Perfil atualizado com sucesso:", result);
      
      // Atualizar o estado local com os dados salvos
      setInitialUserData({ ...userData });
      
      Alert.alert(
        'Sucesso', 
        'Perfil atualizado com sucesso!', 
        [{ 
          text: 'OK', 
          onPress: () => {
            console.log("Navegando de volta para HomeScreen");
            // Utilizar reset para garantir que voltamos para a tela inicial
            navigation.reset({
              index: 0,
              routes: [{ name: 'HomeScreen' }]
            });
          }
        }]
      );
    } catch (error) {
      console.error('Erro ao salvar alterações:', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Voltar para a tela anterior
  const handleBack = () => {
    if (hasChanges()) {
      Alert.alert(
        'Atenção',
        'Você fez alterações que não foram salvas. Deseja sair sem salvar?',
        [
          { text: 'Continuar editando', style: 'cancel' },
          { text: 'Sair sem salvar', onPress: () => {
            console.log("Voltando para HomeScreen sem salvar alterações");
            // Usar reset para garantir que voltamos para a tela inicial
            navigation.reset({
              index: 0,
              routes: [{ name: 'HomeScreen' }]
            });
          }}
        ]
      );
    } else {
      console.log("Voltando para HomeScreen - sem alterações");
      // Usar reset para garantir que voltamos para a tela inicial
      navigation.reset({
        index: 0,
        routes: [{ name: 'HomeScreen' }]
      });
    }
  };
  
  // Função para fazer logout
  const handleLogout = async () => {
    try {
      setLoading(true);
      const { error } = await auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // Navegue para a tela de login após o logout bem-sucedido
      navigation.reset({
        index: 0,
        routes: [{ name: 'LoginScreen' }],
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      Alert.alert('Erro', 'Não foi possível sair da sua conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background.secondary} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Feather name="arrow-left" size={24} color={Colors.text.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações de Perfil</Text>
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary[500]} />
          </View>
        ) : (
          <>
            {/* Seção de perfil */}
            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                {profileImage ? (
                  <Image 
                    source={typeof profileImage === 'string' ? { uri: profileImage } : { uri: profileImage.uri }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarPlaceholderText}>
                      {userData.name ? userData.name.charAt(0).toUpperCase() : '?'}
                    </Text>
                  </View>
                )}
                <TouchableOpacity style={styles.editAvatarButton} onPress={pickImage}>
                  <Feather name="camera" size={16} color={Colors.text.inverse} />
                </TouchableOpacity>
              </View>
              <Text style={styles.avatarText}>Toque para alterar foto</Text>
            </View>
            
            {/* Formulário */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Informações pessoais</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nome</Text>
                <View style={styles.inputContainer}>
                  <Feather name="user" size={20} color={Colors.text.secondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={userData.name}
                    onChangeText={(text) => setUserData(prev => ({ ...prev, name: text }))}
                    placeholder="Seu nome completo"
                    placeholderTextColor={Colors.text.tertiary}
                  />
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={[styles.inputContainer, styles.inputDisabled]}>
                  <Feather name="mail" size={20} color={Colors.text.tertiary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, styles.textInputDisabled]}
                    value={userData.email}
                    editable={false}
                    placeholder="Seu email"
                    placeholderTextColor={Colors.text.tertiary}
                  />
                </View>
                <Text style={styles.helperText}>O email não pode ser alterado</Text>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Telefone</Text>
                <View style={styles.inputContainer}>
                  <Feather name="phone" size={20} color={Colors.text.secondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={userData.phone}
                    onChangeText={(text) => setUserData(prev => ({ ...prev, phone: text }))}
                    placeholder="Seu telefone"
                    placeholderTextColor={Colors.text.tertiary}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bio</Text>
                <View style={[styles.inputContainer, styles.textAreaContainer]}>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={userData.bio}
                    onChangeText={(text) => setUserData(prev => ({ ...prev, bio: text }))}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              </View>
            </View>
            
            {/* Botões de ação */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.button, styles.saveButton, !hasChanges() && styles.buttonDisabled]}
                onPress={saveChanges}
                disabled={!hasChanges()}
              >
                <Text style={styles.buttonText}>Salvar Alterações</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, {backgroundColor: Colors.success}]}
                onPress={() => navigation.navigate('ChatList')}
              >
                <Text style={styles.buttonText}>Minhas Conversas</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.logoutButton]}
                onPress={handleLogout}
              >
                <Text style={styles.logoutButtonText}>Sair da conta</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    backgroundColor: Colors.background.primary,
  },
  
  backButton: {
    padding: Spacing.xs,
  },
  
  headerTitle: {
    ...Typography.styles.h3,
  },
  
  headerRight: {
    width: 24,
  },
  
  content: {
    flex: 1,
  },
  
  contentContainer: {
    paddingBottom: Spacing['3xl'],
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing['2xl'],
  },
  
  profileSection: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.neutral[200],
  },
  
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  avatarPlaceholderText: {
    ...Typography.styles.h1,
    color: Colors.neutral[500],
  },
  
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary[500],
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.background.primary,
  },
  
  avatarText: {
    ...Typography.styles.caption,
    color: Colors.text.secondary,
  },
  
  formSection: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
    ...Shadows.md,
  },
  
  sectionTitle: {
    ...Typography.styles.h4,
    marginBottom: Spacing.lg,
  },
  
  inputGroup: {
    marginBottom: Spacing.md,
  },
  
  inputLabel: {
    ...Typography.styles.bodyMedium,
    marginBottom: Spacing.xs,
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.medium,
    borderRadius: BorderRadius.md,
    height: 48,
    backgroundColor: Colors.background.primary,
    paddingHorizontal: Spacing.md,
  },
  
  inputDisabled: {
    backgroundColor: Colors.neutral[50],
    borderColor: Colors.neutral[200],
  },
  
  inputIcon: {
    marginRight: Spacing.sm,
  },
  
  textInput: {
    flex: 1,
    height: 44,
    color: Colors.text.primary,
    ...Typography.styles.body,
  },
  
  textInputDisabled: {
    color: Colors.text.tertiary,
  },
  
  textAreaContainer: {
    height: 100,
    alignItems: 'flex-start',
    paddingVertical: Spacing.xs,
  },
  
  textArea: {
    height: 90,
  },
  
  helperText: {
    ...Typography.styles.small,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
  },
  
  actionButtons: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  
  button: {
    height: 48,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  saveButton: {
    backgroundColor: Colors.primary[500],
    ...Shadows.md,
  },
  
  buttonDisabled: {
    backgroundColor: Colors.neutral[300],
    opacity: 0.7,
  },
  
  buttonText: {
    ...Typography.styles.bodyMedium,
    color: Colors.text.inverse,
  },
  
  logoutButton: {
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  
  logoutButtonText: {
    ...Typography.styles.bodyMedium,
    color: Colors.error,
  },
});

export default ProfileSettingsScreen;