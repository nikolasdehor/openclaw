import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useAuth } from '../contexts/AuthContext';
import { AICoach } from '../services/aiCoach';
import { ChatMessage } from '../types/ai-coach';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CoachScreen() {
  const theme = useTheme();
  const { userPhone } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [coach, setCoach] = useState<AICoach | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Initialize coach
  useEffect(() => {
    const aiCoach = new AICoach(userPhone);
    aiCoach.loadHistory().then((history) => {
      setMessages(history);
      setCoach(aiCoach);
    }).catch(console.error);
  }, [userPhone]);

  // Scroll to bottom when new message arrives
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  // Update scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = async () => {
    if (!inputText.trim() || !coach || isLoading) return;

    const userMessage = inputText.trim();
    setInputText('');
    setIsLoading(true);

    try {
      const response = await coach.processMessage(userMessage);

      // Update messages list
      setMessages(prev => {
        const updated = [...prev];
        // The coach already saved to storage, but we need to update UI
        // We'll fetch the latest from storage or trust the response
        // For simplicity, we'll append the user message (already in UI) and assistant response
        // Actually, the context inside coach has been updated. Let's just add the assistant message
        const assistantMsg: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: response.content,
          timestamp: Date.now(),
          metadata: response.metadata,
        };
        return [...updated, assistantMsg];
      });
    } catch (error) {
      console.error('Send message error:', error);
      Alert.alert('Erro', 'Não foi possível enviar a mensagem. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = async () => {
    if (!coach) return;
    Alert.alert(
      'Limpar conversa',
      'Tem certeza que deseja apagar todo o histórico?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: async () => {
            await coach.clearHistory();
            setMessages([]);
          },
        },
      ]
    );
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    return (
      <View
        style={[
          styles.messageBubble,
          isUser
            ? [styles.userBubble, { backgroundColor: theme.Colors.bolsa }]
            : [styles.assistantBubble, { backgroundColor: theme.Colors.gray100 }],
        ]}
      >
        <Text
          style={[
            styles.messageText,
            {
              color: isUser ? theme.Colors.white : theme.Colors.gray900,
              fontFamily: isUser ? theme.Typography.fontFamily.medium : theme.Typography.fontFamily.regular,
            },
          ]}
        >
          {item.content}
        </Text>
        <Text
          style={[
            styles.timestamp,
            {
              color: isUser ? 'rgba(255,255,255,0.7)' : theme.Colors.gray500,
              fontFamily: theme.Typography.fontFamily.regular,
            },
          ]}
        >
          {new Date(item.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.Colors.white, borderBottomColor: theme.Colors.gray200 }]}>
      <View>
        <Text style={[styles.headerTitle, { color: theme.Colors.gray900, fontFamily: theme.Typography.fontFamily.bold }]}>
          AI Coach
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.Colors.gray600, fontFamily: theme.Typography.fontFamily.regular }]}>
          Seu assistente pessoal de gamificação
        </Text>
      </View>
      <TouchableOpacity onPress={clearChat} style={styles.clearButton}>
        <Text style={{ color: theme.Colors.bolsa, fontFamily: theme.Typography.fontFamily.medium }}>
          Limpar
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.Colors.gray50 }]} edges={['top']}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={
          isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.Colors.bolsa} />
              <Text style={[styles.loadingText, { color: theme.Colors.gray600 }]}>
                Coach está pensando...
              </Text>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={80}
      >
        <View style={[styles.inputContainer, { backgroundColor: theme.Colors.white, borderTopColor: theme.Colors.gray200 }]}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.Colors.gray100,
                color: theme.Colors.gray900,
                fontFamily: theme.Typography.fontFamily.regular,
              },
            ]}
            placeholder="Digite sua mensagem..."
            placeholderTextColor={theme.Colors.gray400}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: inputText.trim() ? theme.Colors.bolsa : theme.Colors.gray300,
              },
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <Text style={[styles.sendButtonText, { fontFamily: theme.Typography.fontFamily.medium }]}>
              Enviar
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  clearButton: {
    padding: 8,
  },
  messageBubble: {
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 12,
    borderRadius: 16,
    maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    gap: 8,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
  },
});
