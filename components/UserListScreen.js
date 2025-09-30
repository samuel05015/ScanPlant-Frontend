import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { supabase, auth } from './supabase';
import { Feather } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, BaseStyles } from './styles/DesignSystem';

const PLACEHOLDER_IMAGE = require('../assets/placeholder.png');

const UserListScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    experienceLevel: null, // 'iniciante', 'intermediário', 'avançado'
    plantPreference: null, // 'suculentas', 'tropicais', 'ornamentais', 'hortaliças'
    locationBased: false, // Filtrar por proximidade
  });

  // Obter o usuário atual
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data, error } = await auth.getCurrentUser();
        if (error) throw error;
        setCurrentUser(data.user);
      } catch (error) {
        console.error('Erro ao obter usuário atual:', error);
      }
    };
    
    getUser();
  }, []);

  // Buscar usuários
  useEffect(() => {
    if (!currentUser) return;
    
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // Verificar primeiro se as tabelas de chat existem
        try {
          await supabase.from('chats').select('id').limit(1);
        } catch (tableError) {
          console.error('Tabelas de chat não existem:', tableError);
          Alert.alert(
            'Configuração Necessária',
            'O sistema de chat ainda não está configurado. Por favor, execute o script SQL no painel do Supabase.',
            [{ text: 'Voltar', onPress: () => navigation.goBack() }]
          );
          setLoading(false);
          return;
        }
        
        // Buscar todos os usuários exceto o atual
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .neq('id', currentUser.id)
          .order('name');
          
        if (error) throw error;
        
        setUsers(data || []);
        setFilteredUsers(data || []);
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        if (error.message && error.message.includes('Could not find the table')) {
          Alert.alert(
            'Configuração Necessária',
            'O sistema de chat ainda não está configurado. Por favor, execute o script SQL no painel do Supabase.',
            [{ text: 'Voltar', onPress: () => navigation.goBack() }]
          );
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [currentUser, navigation]);
  
  // Filtrar usuários com base na pesquisa e filtros
  useEffect(() => {
    let filtered = [...users];
    
    // Aplicar filtro de busca por texto
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(query)
      );
    }
    
    // Aplicar filtros adicionais
    if (filters.experienceLevel) {
      filtered = filtered.filter(user => 
        user.experience_level === filters.experienceLevel
      );
    }
    
    if (filters.plantPreference) {
      filtered = filtered.filter(user => 
        user.plant_preference === filters.plantPreference
      );
    }
    
    // O filtro de localização seria mais complexo e exigiria cálculos de distância
    // Esta é uma implementação simplificada
    if (filters.locationBased) {
      filtered = filtered.filter(user => 
        user.city === currentUser?.city
      );
    }
    
    setFilteredUsers(filtered);
  }, [searchQuery, users, filters]);
  
  // Iniciar chat com um usuário
  const startChat = (userId, userName) => {
    navigation.navigate('Chat', {
      otherUserId: userId,
      otherUserName: userName
    });
  };
  
  // Limpar todos os filtros
  const clearFilters = () => {
    setFilters({
      experienceLevel: null,
      plantPreference: null,
      locationBased: false,
    });
  };
  
  // Renderizar item da lista de usuários
  const renderUserItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => startChat(item.id, item.name)}
      >
        <Image
          source={item.avatar_url ? { uri: item.avatar_url } : PLACEHOLDER_IMAGE}
          style={styles.avatar}
        />
        
        <View style={styles.userInfo}>
          <Text style={styles.username} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.userStatus} numberOfLines={1}>
            Entusiasta de plantas
          </Text>
        </View>
        
        <Feather name="message-square" size={20} color={Colors.primary[500]} />
      </TouchableOpacity>
    );
  };

  if (loading && !currentUser) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color={Colors.text.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nova Conversa</Text>
        <View style={{ width: 24 }} />
      </View>
      
      {/* Barra de pesquisa */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color={Colors.text.tertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar usuários..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Feather name="x" size={18} color={Colors.text.tertiary} />
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            (filters.experienceLevel || filters.plantPreference || filters.locationBased) && styles.filterButtonActive
          ]} 
          onPress={() => setShowFilters(!showFilters)}
        >
          <Feather name="filter" size={18} color={
            (filters.experienceLevel || filters.plantPreference || filters.locationBased) 
              ? Colors.primary[500] 
              : Colors.text.tertiary
          } />
        </TouchableOpacity>
      </View>
      
      {/* Painel de filtros */}
      {showFilters && (
        <View style={styles.filterPanel}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filtros</Text>
            <TouchableOpacity onPress={clearFilters}>
              <Text style={styles.clearFilterText}>Limpar</Text>
            </TouchableOpacity>
          </View>
          
          {/* Filtro por nível de experiência */}
          <Text style={styles.filterSectionTitle}>Nível de experiência</Text>
          <View style={styles.filterOptions}>
            <TouchableOpacity 
              style={[
                styles.filterOption, 
                filters.experienceLevel === 'iniciante' && styles.filterOptionActive
              ]}
              onPress={() => setFilters({...filters, experienceLevel: filters.experienceLevel === 'iniciante' ? null : 'iniciante'})}
            >
              <Text style={[
                styles.filterOptionText,
                filters.experienceLevel === 'iniciante' && styles.filterOptionTextActive
              ]}>Iniciante</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.filterOption, 
                filters.experienceLevel === 'intermediario' && styles.filterOptionActive
              ]}
              onPress={() => setFilters({...filters, experienceLevel: filters.experienceLevel === 'intermediario' ? null : 'intermediario'})}
            >
              <Text style={[
                styles.filterOptionText,
                filters.experienceLevel === 'intermediario' && styles.filterOptionTextActive
              ]}>Intermediário</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.filterOption, 
                filters.experienceLevel === 'avancado' && styles.filterOptionActive
              ]}
              onPress={() => setFilters({...filters, experienceLevel: filters.experienceLevel === 'avancado' ? null : 'avancado'})}
            >
              <Text style={[
                styles.filterOptionText,
                filters.experienceLevel === 'avancado' && styles.filterOptionTextActive
              ]}>Avançado</Text>
            </TouchableOpacity>
          </View>
          
          {/* Filtro por preferência de plantas */}
          <Text style={styles.filterSectionTitle}>Preferência de plantas</Text>
          <View style={styles.filterOptions}>
            <TouchableOpacity 
              style={[
                styles.filterOption, 
                filters.plantPreference === 'suculentas' && styles.filterOptionActive
              ]}
              onPress={() => setFilters({...filters, plantPreference: filters.plantPreference === 'suculentas' ? null : 'suculentas'})}
            >
              <Text style={[
                styles.filterOptionText,
                filters.plantPreference === 'suculentas' && styles.filterOptionTextActive
              ]}>Suculentas</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.filterOption, 
                filters.plantPreference === 'tropicais' && styles.filterOptionActive
              ]}
              onPress={() => setFilters({...filters, plantPreference: filters.plantPreference === 'tropicais' ? null : 'tropicais'})}
            >
              <Text style={[
                styles.filterOptionText,
                filters.plantPreference === 'tropicais' && styles.filterOptionTextActive
              ]}>Tropicais</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.filterOption, 
                filters.plantPreference === 'ornamentais' && styles.filterOptionActive
              ]}
              onPress={() => setFilters({...filters, plantPreference: filters.plantPreference === 'ornamentais' ? null : 'ornamentais'})}
            >
              <Text style={[
                styles.filterOptionText,
                filters.plantPreference === 'ornamentais' && styles.filterOptionTextActive
              ]}>Ornamentais</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.filterOption, 
                filters.plantPreference === 'hortalicas' && styles.filterOptionActive
              ]}
              onPress={() => setFilters({...filters, plantPreference: filters.plantPreference === 'hortalicas' ? null : 'hortalicas'})}
            >
              <Text style={[
                styles.filterOptionText,
                filters.plantPreference === 'hortalicas' && styles.filterOptionTextActive
              ]}>Hortaliças</Text>
            </TouchableOpacity>
          </View>
          
          {/* Filtro por localização */}
          <View style={styles.locationFilterOption}>
            <Text style={styles.filterSectionTitle}>Localização</Text>
            <TouchableOpacity 
              style={[
                styles.toggleOption,
                filters.locationBased && styles.toggleOptionActive
              ]}
              onPress={() => setFilters({...filters, locationBased: !filters.locationBased})}
            >
              <View style={[
                styles.toggleCircle, 
                filters.locationBased && styles.toggleCircleActive
              ]} />
            </TouchableOpacity>
            <Text style={styles.toggleText}>Mostrar apenas pessoas próximas</Text>
          </View>
        </View>
      )}
      
      {/* Lista de usuários */}
      {loading ? (
        <ActivityIndicator 
          style={styles.loadingIndicator} 
          size="large" 
          color={Colors.primary[500]} 
        />
      ) : filteredUsers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="users" size={64} color={Colors.neutral[300]} />
          <Text style={styles.emptyText}>
            {searchQuery ? 'Nenhum usuário encontrado' : 'Nenhum usuário disponível'}
          </Text>
          <Text style={styles.emptySubtext}>
            {searchQuery 
              ? 'Tente uma busca diferente'
              : 'Parece que você é o único entusiasta de plantas por aqui!'
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderUserItem}
          contentContainerStyle={styles.userList}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...BaseStyles.container,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    ...Typography.h5,
    color: Colors.text.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? Spacing.sm : 0,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
  },
  searchInput: {
    flex: 1,
    height: 40,
    marginLeft: Spacing.sm,
    ...Typography.body,
    color: Colors.text.primary,
  },
  loadingIndicator: {
    marginTop: Spacing.xl,
  },
  userList: {
    paddingVertical: Spacing.sm,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: Spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
  },
  userStatus: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyText: {
    ...Typography.h5,
    color: Colors.text.secondary,
    marginTop: Spacing.lg,
  },
  emptySubtext: {
    ...Typography.body,
    color: Colors.text.tertiary,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  // Novos estilos para o sistema de filtros
  filterButton: {
    marginLeft: Spacing.md,
    padding: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary[50],
  },
  filterPanel: {
    backgroundColor: Colors.background.primary,
    marginHorizontal: Spacing.lg,
    marginTop: -Spacing.xs,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  filterTitle: {
    ...Typography.subtitle,
    color: Colors.text.primary,
  },
  clearFilterText: {
    ...Typography.small,
    color: Colors.primary[500],
  },
  filterSectionTitle: {
    ...Typography.small,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.sm,
  },
  filterOption: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.neutral[100],
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  filterOptionActive: {
    backgroundColor: Colors.primary[100],
  },
  filterOptionText: {
    ...Typography.small,
    color: Colors.text.secondary,
  },
  filterOptionTextActive: {
    color: Colors.primary[700],
    fontWeight: '600',
  },
  locationFilterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  toggleOption: {
    width: 40,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.neutral[200],
    marginHorizontal: Spacing.sm,
    justifyContent: 'center',
  },
  toggleOptionActive: {
    backgroundColor: Colors.primary[400],
  },
  toggleCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.background.primary,
    marginLeft: 2,
  },
  toggleCircleActive: {
    marginLeft: 22,
  },
  toggleText: {
    ...Typography.small,
    color: Colors.text.secondary,
  },
});

export default UserListScreen;