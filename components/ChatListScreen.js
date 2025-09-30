import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { supabase, auth } from './supabase';
import { Feather } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows, BaseStyles } from './styles/DesignSystem';

const PLACEHOLDER_IMAGE = require('../assets/placeholder.png');

const ChatListScreen = ({ navigation }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [dbError, setDbError] = useState(false);

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

  // Verificar se as tabelas de chat existem
  useEffect(() => {
    const checkDbTables = async () => {
      try {
        await supabase.from('chats').select('id').limit(1);
      } catch (error) {
        console.error('Erro ao verificar tabelas:', error);
        setDbError(true);
      }
    };
    
    checkDbTables();
  }, []);

  // Buscar chats do usuário
  useEffect(() => {
    if (!currentUser || dbError) return;
    
    const fetchChats = async () => {
      setLoading(true);
      try {
        // Buscar todas as conversas onde o usuário atual está envolvido
        const { data, error } = await supabase
          .from('chats')
          .select(`
            id, 
            last_message,
            last_message_time,
            last_sender_id,
            unread_count,
            participant_ids
          `)
          .contains('participant_ids', [currentUser.id])
          .order('last_message_time', { ascending: false });
          
        if (error) throw error;
        
        // Buscar perfis para cada conversa
        const processedChats = await Promise.all(data.map(async (chat) => {
          // Encontrar o ID do outro participante
          const otherUserId = chat.participant_ids.find(id => id !== currentUser.id);
          
          // Buscar perfil do outro usuário
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id, name, avatar_url')
            .eq('id', otherUserId)
            .single();
            
          // Usar dados do perfil ou valores padrão se não encontrado
          const otherParticipant = profileData || { id: otherUserId, name: 'Usuário desconhecido', avatar_url: null };
          
          // Determinar se a última mensagem foi enviada pelo usuário atual
          const isLastMessageFromMe = chat.last_sender_id === currentUser.id;
          
          return {
            id: chat.id,
            otherUserId: otherParticipant?.id || 'Usuário desconhecido',
            otherUserName: otherParticipant?.name || 'Usuário desconhecido',
            avatarUrl: otherParticipant?.avatar_url,
            lastMessage: chat.last_message,
            lastMessageTime: chat.last_message_time,
            isLastMessageFromMe: isLastMessageFromMe,
            unreadCount: chat.unread_count || 0
          };
        }));
        
        setChats(processedChats);
      } catch (error) {
        console.error('Erro ao buscar chats:', error);
        if (error.message.includes('Could not find the table')) {
          setDbError(true);
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (!dbError) {
      fetchChats();
      
      try {
        // Configurar escuta em tempo real para novas mensagens
        const subscription = supabase
          .channel('chats_changes')
          .on('postgres_changes', { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'chats',
            filter: `participant_ids=cs.{${currentUser.id}}` 
          }, fetchChats)
          .subscribe();
          
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Erro ao configurar subscription:', error);
      }
    }
  }, [currentUser, dbError]);
  
  // Função para truncar a mensagem longa
  const truncateMessage = (message, maxLength = 35) => {
    if (!message) return '';
    return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
  };
  
  // Renderizar item da lista de chats
  const renderChatItem = ({ item }) => {
    const messageTime = new Date(item.lastMessageTime);
    const now = new Date();
    const isToday = messageTime.toDateString() === now.toDateString();
    
    const timeString = isToday
      ? messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : messageTime.toLocaleDateString();
    
    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => navigation.navigate('Chat', {
          chatId: item.id,
          otherUserId: item.otherUserId,
          otherUserName: item.otherUserName
        })}
      >
        <View style={styles.avatarContainer}>
          <Image
            source={item.avatarUrl ? { uri: item.avatarUrl } : PLACEHOLDER_IMAGE}
            style={styles.avatar}
          />
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.username} numberOfLines={1}>
              {item.otherUserName}
            </Text>
            <Text style={styles.timeText}>{timeString}</Text>
          </View>
          
          <View style={styles.messagePreviewContainer}>
            {item.lastMessage ? (
              <>
                {item.isLastMessageFromMe && (
                  <Text style={styles.messageSender}>Você: </Text>
                )}
                <Text 
                  style={[
                    styles.lastMessage, 
                    item.unreadCount > 0 && !item.isLastMessageFromMe ? styles.unreadMessage : null
                  ]} 
                  numberOfLines={1}
                >
                  {truncateMessage(item.lastMessage)}
                </Text>
                {item.isLastMessageFromMe && item.unreadCount === 0 && (
                  <Feather 
                    name="check" 
                    size={14} 
                    color={Colors.primary[400]} 
                    style={styles.readIcon} 
                  />
                )}
              </>
            ) : (
              <Text style={styles.lastMessage} numberOfLines={1}>
                Iniciar uma conversa...
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !dbError) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
      </SafeAreaView>
    );
  }

  if (dbError) {
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
          <Text style={styles.headerTitle}>Configuração Necessária</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <ScrollView style={styles.scrollView}>
          <View style={styles.setupContainer}>
            <Feather name="alert-triangle" size={64} color={Colors.warning} />
            <Text style={styles.setupTitle}>Configuração do Banco de Dados</Text>
            <Text style={styles.setupText}>
              O sistema de chat ainda não está configurado no seu banco de dados Supabase.
            </Text>
            <Text style={styles.setupInstructions}>
              Para completar a configuração:
            </Text>
            <View style={styles.setupSteps}>
              <Text style={styles.setupStep}>1. Acesse o painel do Supabase</Text>
              <Text style={styles.setupStep}>2. Vá para o Editor SQL</Text>
              <Text style={styles.setupStep}>3. Execute o script encontrado em:</Text>
              <Text style={styles.setupCodePath}>chat_tables_setup.sql</Text>
            </View>
            <Text style={styles.setupNote}>
              Após executar o script, reinicie o aplicativo para usar o sistema de chat.
            </Text>
          </View>
        </ScrollView>
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
        <Text style={styles.headerTitle}>Conversas</Text>
        <TouchableOpacity
          style={styles.newChatButton}
          onPress={() => navigation.navigate('UserList')}
        >
          <Feather name="edit" size={20} color={Colors.primary[500]} />
        </TouchableOpacity>
      </View>
      
      {/* Lista de conversas */}
      {chats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="message-circle" size={64} color={Colors.neutral[300]} />
          <Text style={styles.emptyText}>Nenhuma conversa ainda</Text>
          <Text style={styles.emptySubtext}>
            Inicie uma conversa com outro dono de plantas para trocar dicas e tirar dúvidas!
          </Text>
          <TouchableOpacity
            style={styles.startChatButton}
            onPress={() => navigation.navigate('UserList')}
          >
            <Text style={styles.startChatButtonText}>Nova Conversa</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderChatItem}
          contentContainerStyle={styles.chatList}
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
  newChatButton: {
    padding: Spacing.xs,
  },
  chatList: {
    paddingVertical: Spacing.md,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
    backgroundColor: Colors.background.primary,
    marginHorizontal: Spacing.xs,
    marginVertical: Spacing.xs / 2,
    borderRadius: BorderRadius.md,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  unreadBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.primary[500],
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: Colors.text.inverse,
    fontSize: 10,
    fontWeight: 'bold',
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  username: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    flex: 1,
  },
  timeText: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginLeft: Spacing.sm,
  },
  messagePreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs / 2,
    width: '100%',
  },
  messageSender: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    marginRight: 2,
  },
  readIcon: {
    marginLeft: 4,
  },
  lastMessage: {
    ...Typography.body,
    color: Colors.text.secondary,
    flex: 1,
    marginRight: Spacing.xs,
  },
  unreadMessage: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
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
  startChatButton: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.primary[500],
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  startChatButtonText: {
    ...Typography.buttonText,
    color: Colors.text.inverse,
  },
  scrollView: {
    flex: 1,
  },
  setupContainer: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.xl,
    paddingTop: Spacing['2xl'],
  },
  setupTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  setupText: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  setupInstructions: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  setupSteps: {
    alignSelf: 'stretch',
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  setupStep: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  setupCodePath: {
    ...Typography.bodyMedium,
    color: Colors.primary[600],
    backgroundColor: Colors.primary[50],
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  setupNote: {
    ...Typography.caption,
    color: Colors.warning,
    textAlign: 'center',
  },
});

export default ChatListScreen;