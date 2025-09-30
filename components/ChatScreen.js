import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { supabase, auth } from './supabase';
import { Feather } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows, BaseStyles } from './styles/DesignSystem';

const PLACEHOLDER_IMAGE = require('../assets/placeholder.png');

// Função para resolver fontes de imagem (igual à do PlantGallery)
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

const ChatScreen = ({ route, navigation }) => {
  const { chatId: existingChatId, otherUserId, otherUserName } = route.params;
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [chatId, setChatId] = useState(existingChatId);
  const [currentUser, setCurrentUser] = useState(null);
  const [otherUserProfile, setOtherUserProfile] = useState(null);
  const [otherUserPlants, setOtherUserPlants] = useState([]);
  const [loadingPlants, setLoadingPlants] = useState(false);
  
  const flatListRef = useRef();
  
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
  
  // Buscar informações do outro usuário
  useEffect(() => {
    const fetchOtherUserProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', otherUserId)
          .single();
          
        if (error) throw error;
        setOtherUserProfile(data);
      } catch (error) {
        console.error('Erro ao buscar perfil do outro usuário:', error);
      }
    };
    
    if (otherUserId) {
      fetchOtherUserProfile();
    }
  }, [otherUserId]);
  
  // Buscar plantas do outro usuário
  useEffect(() => {
    const fetchOtherUserPlants = async () => {
      if (!otherUserId) return;
      
      setLoadingPlants(true);
      try {
        const { data, error } = await supabase
          .from('plants')
          .select('*')
          .eq('user_id', otherUserId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setOtherUserPlants(data || []);
      } catch (error) {
        console.error('Erro ao buscar plantas do outro usuário:', error);
      } finally {
        setLoadingPlants(false);
      }
    };
    
    fetchOtherUserPlants();
  }, [otherUserId]);
  
  // Buscar ou criar conversa e mensagens
  useEffect(() => {
    if (!currentUser) return;
    
    const fetchOrCreateChat = async () => {
      setLoading(true);
      try {
        // Verificar primeiro se as tabelas existem
        try {
          await supabase.from('chats').select('id').limit(1);
        } catch (tableError) {
          console.error('Tabelas de chat não existem:', tableError);
          setLoading(false);
          Alert.alert(
            'Configuração Necessária',
            'O sistema de chat ainda não está configurado. Por favor, execute o script SQL no painel do Supabase.',
            [{ text: 'Voltar', onPress: () => navigation.goBack() }]
          );
          return;
        }
        
        // Se não temos um chatId, tentamos encontrar ou criar um
        if (!existingChatId) {
          // Verificar se já existe um chat entre esses usuários
          const { data: existingChats, error: findError } = await supabase
            .from('chats')
            .select('id')
            .contains('participant_ids', [currentUser.id, otherUserId])
            .limit(1);
            
          if (findError) throw findError;
          
          if (existingChats && existingChats.length > 0) {
            // Chat já existe
            setChatId(existingChats[0].id);
          } else {
            // Criar novo chat
            const { data: newChat, error: createError } = await supabase
              .from('chats')
              .insert({
                participant_ids: [currentUser.id, otherUserId],
                created_at: new Date().toISOString(),
              })
              .select('id')
              .single();
              
            if (createError) throw createError;
            
            // Adicionar participantes
            await supabase.from('chat_participants').insert([
              { chat_id: newChat.id, user_id: currentUser.id },
              { chat_id: newChat.id, user_id: otherUserId }
            ]);
            
            setChatId(newChat.id);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar/criar chat:', error);
        if (error.message && error.message.includes('Could not find the table')) {
          Alert.alert(
            'Configuração Necessária',
            'O sistema de chat ainda não está configurado. Por favor, execute o script SQL no painel do Supabase.',
            [{ text: 'Voltar', onPress: () => navigation.goBack() }]
          );
        }
      }
    };
    
    fetchOrCreateChat();
  }, [currentUser, existingChatId, otherUserId, navigation]);
  
  // Buscar mensagens quando chatId estiver disponível
  useEffect(() => {
    if (!chatId) return;
    
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', chatId)
          .order('created_at', { ascending: true });
          
        if (error) throw error;
        setMessages(data || []);
        
        // Marcar mensagens como lidas
        if (currentUser) {
          await supabase
            .from('messages')
            .update({ read: true })
            .eq('chat_id', chatId)
            .neq('sender_id', currentUser.id)
            .eq('read', false);
            
          // Atualizar contador de mensagens não lidas
          await supabase
            .from('chats')
            .update({ unread_count: 0 })
            .eq('id', chatId);
        }
      } catch (error) {
        console.error('Erro ao buscar mensagens:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
    
    // Configurar escuta em tempo real para novas mensagens
    const subscription = supabase
      .channel(`chat:${chatId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `chat_id=eq.${chatId}` 
      }, async (payload) => {
        const newMessage = payload.new;
        
        // Adicionar a nova mensagem à lista
        setMessages(prev => [...prev, newMessage]);
        
        // Marcar como lida se não for do usuário atual
        if (currentUser && newMessage.sender_id !== currentUser.id) {
          await supabase
            .from('messages')
            .update({ read: true })
            .eq('id', newMessage.id);
        }
      })
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, [chatId, currentUser]);
  
  // Rolar para a última mensagem quando chegar uma nova
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [messages]);
  
  // Enviar mensagem
  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !chatId) return;
    
    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);
    
    try {
      const newMessageObj = {
        chat_id: chatId,
        sender_id: currentUser.id,
        content: messageText,
        created_at: new Date().toISOString(),
        read: false
      };
      
      const { error } = await supabase
        .from('messages')
        .insert([newMessageObj]);
        
      if (error) throw error;
      
      // Atualizar última mensagem no chat
      await supabase
        .from('chats')
        .update({
          last_message: messageText,
          last_message_time: new Date().toISOString(),
          last_sender_id: currentUser.id,
          unread_count: supabase.rpc('increment_unread', { chat_id_param: chatId })
        })
        .eq('id', chatId);
        
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Não foi possível enviar a mensagem. Tente novamente.');
    } finally {
      setSending(false);
    }
  };
  
  // Renderizar uma mensagem
  const renderMessage = ({ item }) => {
    const isMine = currentUser && item.sender_id === currentUser.id;
    
    return (
      <View style={[
        styles.messageContainer,
        isMine ? styles.myMessageContainer : styles.otherMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isMine ? styles.myMessageBubble : styles.otherMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            isMine ? styles.myMessageText : styles.otherMessageText
          ]}>
            {item.content}
          </Text>
        </View>
        <Text style={styles.messageTime}>
          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };
  
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color={Colors.text.secondary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate('UserProfile', { userId: otherUserId })}
        >
          <Image
            source={otherUserProfile?.avatar_url ? { uri: otherUserProfile.avatar_url } : PLACEHOLDER_IMAGE}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.username} numberOfLines={1}>
              {otherUserProfile?.name || otherUserName}
            </Text>
            <Text style={styles.status}>
              Entusiasta de plantas
            </Text>
          </View>
        </TouchableOpacity>
        
        <View style={{ width: 40 }} />
      </View>
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        {/* Lista de mensagens */}
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="message-square" size={64} color={Colors.neutral[300]} />
            <Text style={styles.emptyText}>Nenhuma mensagem ainda</Text>
            <Text style={styles.emptySubtext}>
              Inicie uma conversa para trocar dicas e tirar dúvidas sobre plantas!
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
          />
        )}
        
        {/* Input para nova mensagem */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity 
            style={[
              styles.sendButton,
              (!newMessage.trim() || sending) && styles.sendButtonDisabled
            ]}
            onPress={sendMessage}
            disabled={!newMessage.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color={Colors.text.inverse} />
            ) : (
              <Feather name="send" size={20} color={Colors.text.inverse} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  backButton: {
    padding: Spacing.xs,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: Spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: Spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
  },
  status: {
    ...Typography.caption,
    color: Colors.success,
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  messagesList: {
    padding: Spacing.md,
  },
  messageContainer: {
    marginBottom: Spacing.md,
    maxWidth: '80%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  myMessageBubble: {
    backgroundColor: Colors.primary[500],
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: Colors.background.secondary,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    ...Typography.body,
  },
  myMessageText: {
    color: Colors.text.inverse,
  },
  otherMessageText: {
    color: Colors.text.primary,
  },
  messageTime: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
    backgroundColor: Colors.background.primary,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? Spacing.md : Spacing.sm,
    maxHeight: 120,
    ...Typography.body,
  },
  sendButton: {
    backgroundColor: Colors.primary[500],
    borderRadius: BorderRadius.full,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.md,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.primary[300],
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
});

export default ChatScreen;