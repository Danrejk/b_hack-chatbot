import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
};

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  
  const [isBotOnline, setIsBotOnline] = useState(true);
  
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hello! I am your AI assistant. How can I help you today?', sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');

  // Helper to reliably scroll to bottom
  const scrollToBottom = () => {
    if (flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100); // 100ms delay ensures layout calculations for multiline text finish first
    }
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user'
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputText('');

    if (isBotOnline) {
      setTimeout(() => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "I am a frontend UI demo right now, but soon I'll be connected to a real AI backend!\n\nI can handle multiline messages much better now, and the view will automatically scroll all the way to the bottom so you can read everything I have to say without manually swiping down.",
          sender: 'bot'
        };
        setMessages(prev => [...prev, botMessage]);
      }, 1000);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.messageWrapper, isUser ? styles.messageWrapperUser : styles.messageWrapperBot]}>
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.botBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.botText]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>AI</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>B-Hack Bot</Text>
              <Text style={[styles.headerSubtitle, !isBotOnline && styles.headerSubtitleOffline]}>
                {isBotOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity onPress={() => router.push('/profile')}>
            <Image 
              source={require('../../assets/images/user.jpg')} 
              style={styles.avatarImage} 
            />
          </TouchableOpacity>
        </View>

        {/* Chat History Section */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatContainer}
          // Both onLayout and onContentSizeChange help guarantee the scroll triggers properly
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
        />

        {/* Message Input Section */}
        <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TouchableOpacity style={styles.mediaButton}>
            <Ionicons name="add-circle" size={28} color="#8E8E93" />
          </TouchableOpacity>

          <TextInput
            style={styles.textInput}
            placeholder="Message..."
            placeholderTextColor="#8E8E93"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={isBotOnline}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || !isBotOnline) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || !isBotOnline}
          >
            <Ionicons name="send" size={18} color={inputText.trim() && isBotOnline ? "#FFFFFF" : "#A1C6F6"} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  keyboardView: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#E5E5EA',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  logoCircle: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#007AFF',
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  logoText: { color: '#FFFFFF', fontWeight: '800', fontSize: 18 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E' },
  headerSubtitle: { fontSize: 13, color: '#34C759', fontWeight: '500', marginTop: 2 },
  headerSubtitleOffline: { color: '#8E8E93' },
  avatarImage: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5E5EA' },
  chatContainer: { padding: 16, paddingBottom: 24 },
  messageWrapper: { marginVertical: 8, flexDirection: 'row' },
  messageWrapperUser: { justifyContent: 'flex-end' },
  messageWrapperBot: { justifyContent: 'flex-start' },
  messageBubble: { maxWidth: '82%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20 },
  userBubble: { backgroundColor: '#007AFF', borderBottomRightRadius: 4 },
  botBubble: { backgroundColor: '#FFFFFF', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#E5E5EA' },
  messageText: { fontSize: 16, lineHeight: 22 },
  userText: { color: '#FFFFFF' },
  botText: { color: '#1C1C1E' },
  inputContainer: {
    flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingTop: 12,
    backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E5EA',
  },
  mediaButton: { marginBottom: 8, marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  textInput: {
    flex: 1, backgroundColor: '#F2F2F7', borderRadius: 20, paddingHorizontal: 18, paddingTop: 12, paddingBottom: 12,
    fontSize: 16, maxHeight: 120, color: '#1C1C1E',
  },
  sendButton: {
    marginLeft: 12, marginBottom: 4, backgroundColor: '#007AFF', width: 40, height: 40,
    borderRadius: 20, justifyContent: 'center', alignItems: 'center',
  },
  sendButtonDisabled: { backgroundColor: 'transparent' },
});