import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from './styles/DesignSystem';

// Respostas pré-definidas para perguntas comuns sobre plantas
const PLANT_RESPONSES = {
  default: "Olá! Sou o assistente virtual do ScanPlant. Como posso ajudar com suas plantas hoje?",
  greeting: ["Olá! Como posso ajudar?", "Oi! Precisa de ajuda com plantas?", "Olá, sou o assistente do ScanPlant!"],
  notFound: "Desculpe, não tenho informações específicas sobre isso. Tente perguntar sobre rega, luz, plantio ou cuidados gerais com plantas.",
  
  // Respostas sobre rega
  water: [
    "A maioria das plantas precisa ser regada quando a camada superior do solo estiver seca. Evite encharcar as raízes.",
    "A frequência de rega depende do tipo de planta. Plantas suculentas precisam de menos água, enquanto plantas tropicais geralmente precisam de mais.",
    "Uma dica para rega: coloque seu dedo no solo até a primeira junta. Se estiver seco, está na hora de regar!"
  ],
  
  // Respostas sobre luz
  light: [
    "A maioria das plantas de interior precisa de luz indireta brilhante. Luz solar direta pode queimar as folhas de algumas plantas.",
    "Plantas com folhas variegadas (com manchas ou listras) geralmente precisam de mais luz para manter seus padrões.",
    "Se sua planta está esticada em direção à luz, provavelmente precisa ser movida para um local mais iluminado."
  ],
  
  // Respostas sobre solo e fertilizantes
  soil: [
    "Um bom solo deve ter drenagem adequada. Adicionar perlita ou areia pode ajudar a melhorar a drenagem.",
    "A maioria das plantas de interior cresce bem em solo comum para vasos com um pouco de composto orgânico.",
    "Fertilizantes líquidos diluídos são ótimos para plantas de interior, utilize na metade da concentração recomendada."
  ],
  
  // Problemas comuns
  problems: [
    "Folhas amarelando geralmente indicam excesso de água ou falta de nutrientes.",
    "Pontas marrons nas folhas podem indicar ar muito seco ou excesso de fertilizante.",
    "Manchas brancas ou teias podem ser sinais de pragas como cochonilha ou ácaros. Examine a planta de perto."
  ],
};

// Função para gerar resposta com base no texto da pergunta
const generateResponse = (question) => {
  const q = question.toLowerCase();
  
  // Saudações
  if (q.includes('olá') || q.includes('oi') || q.includes('bom dia') || q.includes('boa tarde') || q.includes('boa noite')) {
    return PLANT_RESPONSES.greeting[Math.floor(Math.random() * PLANT_RESPONSES.greeting.length)];
  }
  
  // Respostas baseadas em palavras-chave
  if (q.includes('água') || q.includes('regar') || q.includes('rega')) {
    return PLANT_RESPONSES.water[Math.floor(Math.random() * PLANT_RESPONSES.water.length)];
  }
  
  if (q.includes('sol') || q.includes('luz') || q.includes('iluminação')) {
    return PLANT_RESPONSES.light[Math.floor(Math.random() * PLANT_RESPONSES.light.length)];
  }
  
  if (q.includes('solo') || q.includes('terra') || q.includes('fertilizante') || q.includes('adubo')) {
    return PLANT_RESPONSES.soil[Math.floor(Math.random() * PLANT_RESPONSES.soil.length)];
  }
  
  if (q.includes('problema') || q.includes('doença') || q.includes('praga') || 
      q.includes('amarelando') || q.includes('morrendo') || q.includes('murcha')) {
    return PLANT_RESPONSES.problems[Math.floor(Math.random() * PLANT_RESPONSES.problems.length)];
  }
  
  // Resposta padrão para perguntas não reconhecidas
  return PLANT_RESPONSES.notFound;
};

const PlantAssistantChat = ({ visible, onClose }) => {
  const [messages, setMessages] = useState([
    { id: '1', text: PLANT_RESPONSES.default, sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');

  const sendMessage = () => {
    if (inputText.trim() === '') return;
    
    // Adiciona a mensagem do usuário
    const userMessage = { id: Date.now().toString(), text: inputText, sender: 'user' };
    setMessages(currentMessages => [...currentMessages, userMessage]);
    
    // Gera e adiciona a resposta do bot
    setTimeout(() => {
      const botResponse = { id: (Date.now() + 1).toString(), text: generateResponse(inputText), sender: 'bot' };
      setMessages(currentMessages => [...currentMessages, botResponse]);
    }, 500);
    
    setInputText('');
  };

  const renderMessageItem = ({ item }) => (
    <View style={[
      styles.messageBubble,
      item.sender === 'user' ? styles.userMessage : styles.botMessage
    ]}>
      <Text style={[
        styles.messageText,
        item.sender === 'user' ? styles.userMessageText : styles.botMessageText
      ]}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <View style={styles.chatContainer}>
            <View style={styles.chatHeader}>
              <View style={styles.headerContent}>
                <View style={styles.avatarContainer}>
                  <Feather name="target" size={20} color={Colors.primary[500]} />
                </View>
                <View>
                  <Text style={styles.headerTitle}>Assistente de Plantas</Text>
                  <Text style={styles.headerSubtitle}>Pergunte sobre cuidados com plantas</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Feather name="x" size={24} color={Colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={messages}
              renderItem={renderMessageItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.messageList}
              inverted={false}
              showsVerticalScrollIndicator={false}
            />

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Digite sua pergunta..."
                value={inputText}
                onChangeText={setInputText}
                multiline
                returnKeyType="send"
                onSubmitEditing={sendMessage}
              />
              <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                <Feather name="send" size={20} color={Colors.primary[600]} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

// Componente do botão flutuante
export const PlantAssistantButton = () => {
  const [chatVisible, setChatVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setChatVisible(true)}
        activeOpacity={0.8}
      >
        <Feather name="help-circle" size={28} color="#FFFFFF" />
      </TouchableOpacity>
      
      <PlantAssistantChat visible={chatVisible} onClose={() => setChatVisible(false)} />
    </>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.xl,
    borderWidth: 2,
    borderColor: Colors.primary[500],
  },
  
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  
  keyboardAvoid: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  
  chatContainer: {
    height: '80%',
    backgroundColor: Colors.background.primary,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    ...Shadows.xl,
  },
  
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
    backgroundColor: Colors.background.primary,
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary[100],
  },
  
  headerTitle: {
    ...Typography.styles.bodyMedium,
    color: Colors.text.primary,
  },
  
  headerSubtitle: {
    ...Typography.styles.small,
    color: Colors.text.tertiary,
  },
  
  closeButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral[100],
  },
  
  messageList: {
    padding: Spacing.lg,
    flexGrow: 1,
  },
  
  messageBubble: {
    maxWidth: '80%',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary[500],
  },
  
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.neutral[100],
  },
  
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  
  userMessageText: {
    color: Colors.text.inverse,
  },
  
  botMessageText: {
    color: Colors.text.primary,
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },
  
  textInput: {
    flex: 1,
    padding: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? Spacing.md : Spacing.sm,
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.lg,
    maxHeight: 100,
    ...Typography.styles.body,
  },
  
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary[100],
  },
});

export default PlantAssistantButton;