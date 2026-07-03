import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUser } from '../context/UserContext';

// Theme Constants
const BG_COLOR = '#EBEEF2';
const RED_ACCENT = '#9E3641'; // DULL, MUTED RED
const TEXT_DARK = '#2D3142';
const TEXT_MUTED = '#8E94A3';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
};

// Neomorphism Helper Component
const NeoView = ({ children, containerStyle, innerStyle, borderRadius = 16 }: any) => (
  <View style={[styles.neoDark, { borderRadius }, containerStyle]}>
    <View style={[styles.neoLight, { borderRadius }, innerStyle]}>
      {children}
    </View>
  </View>
);

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  
  const { user } = useUser(); 
  
  const [isBotOnline, setIsBotOnline] = useState(true);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hello! I am your AI assistant. How can I help you today?', sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const kShow = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const kHide = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

    return () => { kShow.remove(); kHide.remove(); };
  }, []);

  const scrollToBottom = () => {
    if (flatListRef.current) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newUserMessage: Message = {
      id: Date.now().toString(), text: inputText.trim(), sender: 'user'
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputText('');

    if (isBotOnline) {
      setTimeout(() => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "The shadows are casting much heavier now! The dull brick red really fits the Neumorphic style nicely.",
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
        <NeoView 
          containerStyle={styles.bubbleShadow} 
          innerStyle={[styles.messageBubble, isUser ? styles.userBubble : styles.botBubble]}
          borderRadius={20}
        >
          <Text style={[styles.messageText, isUser ? styles.userText : styles.botText]}>
            {item.text}
          </Text>
        </NeoView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        
        {/* Neomorphic Header */}
        <View style={styles.headerContainer}>
          <NeoView containerStyle={styles.headerNeo} innerStyle={styles.headerInner} borderRadius={24}>
            <View style={styles.headerLeft}>
              <NeoView containerStyle={styles.logoOuter} innerStyle={styles.logoInner} borderRadius={22}>
                <Text style={styles.logoText}>AI</Text>
              </NeoView>
              <View>
                <Text style={styles.headerTitle}>B-Hack Bot</Text>
                {/* NEW SOLID RED PILL FOR ONLINE STATUS */}
                <View style={[styles.headerSubtitleContainer, !isBotOnline && styles.headerSubtitleOfflineContainer]}>
                  <Text style={styles.headerSubtitle}>
                    {isBotOnline ? 'ONLINE' : 'OFFLINE'}
                  </Text>
                </View>
              </View>
            </View>
            
            <TouchableOpacity onPress={() => router.push('/profile')}>
              <NeoView containerStyle={styles.avatarShadow} innerStyle={styles.avatarInner} borderRadius={22}>
                <Image source={user.avatar} style={styles.avatarImage} />
              </NeoView>
            </TouchableOpacity>
          </NeoView>
        </View>

        {/* Chat History */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatContainer}
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
        />

        {/* Neomorphic Input Area */}
        <View style={[styles.bottomContainer, { paddingBottom: isKeyboardVisible ? 12 : Math.max(insets.bottom + 8, 20) }]}>
          <NeoView containerStyle={styles.inputWrapper} innerStyle={styles.inputInner} borderRadius={28}>
            
            {/* NEW SOLID RED MEDIA BUTTON */}
            <TouchableOpacity style={styles.mediaButton}>
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <TextInput
              style={styles.textInput}
              placeholder="Message..."
              placeholderTextColor={TEXT_MUTED}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              editable={isBotOnline}
            />
            
            <TouchableOpacity
              style={styles.sendButtonArea}
              onPress={handleSend}
              disabled={!inputText.trim() || !isBotOnline}
            >
              <NeoView containerStyle={styles.sendNeo} innerStyle={[styles.sendInner, (!inputText.trim() || !isBotOnline) && styles.sendInnerDisabled]} borderRadius={20}>
                <Ionicons 
                  name="send" 
                  size={16} 
                  color="#FFFFFF" 
                  style={{ marginLeft: 2 }}
                />
              </NeoView>
            </TouchableOpacity>
          </NeoView>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_COLOR },
  keyboardView: { flex: 1 },
  
  /* MAXED OUT SHADOWS TO POP MORE */
  neoDark: {
    backgroundColor: BG_COLOR,
    shadowColor: '#8C9CB0', // Much darker shadow
    shadowOffset: { width: 12, height: 12 }, // Pushed further out
    shadowOpacity: 1, // Max opacity
    shadowRadius: 16, // Softer, larger spread
    elevation: 15,
  },
  neoLight: {
    backgroundColor: BG_COLOR,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: -12, height: -12 },
    shadowOpacity: 1,
    shadowRadius: 16,
  },

  headerContainer: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 16 },
  headerNeo: { width: '100%' },
  headerInner: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12 
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  logoOuter: { marginRight: 14 },
  logoInner: { 
    width: 44, height: 44, justifyContent: 'center', alignItems: 'center',
    backgroundColor: RED_ACCENT, // SOLID DULL RED
    borderRadius: 22,
  },
  logoText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: TEXT_DARK },
  
  headerSubtitleContainer: { 
    backgroundColor: RED_ACCENT, // SOLID DULL RED
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginTop: 4, alignSelf: 'flex-start'
  },
  headerSubtitleOfflineContainer: { backgroundColor: TEXT_MUTED },
  headerSubtitle: { fontSize: 10, color: '#FFFFFF', fontWeight: '800', letterSpacing: 1 },
  
  avatarShadow: {},
  avatarInner: { 
    width: 44, height: 44, overflow: 'hidden', borderRadius: 22,
    borderWidth: 2, borderColor: RED_ACCENT
  },
  avatarImage: { width: '100%', height: '100%' },

  chatContainer: { padding: 16, paddingBottom: 24 },
  messageWrapper: { marginVertical: 10, flexDirection: 'row' },
  messageWrapperUser: { justifyContent: 'flex-end' },
  messageWrapperBot: { justifyContent: 'flex-start' },
  bubbleShadow: { maxWidth: '82%' },
  messageBubble: { paddingHorizontal: 18, paddingVertical: 14 },
  userBubble: { 
    borderBottomRightRadius: 4,
    backgroundColor: RED_ACCENT // SOLID DULL RED
  },
  botBubble: { borderBottomLeftRadius: 4 },
  messageText: { fontSize: 16, lineHeight: 22 },
  userText: { color: '#FFFFFF', fontWeight: '600' },
  botText: { color: TEXT_DARK },

  bottomContainer: { paddingHorizontal: 16, paddingTop: 8 },
  inputWrapper: { width: '100%' },
  inputInner: { 
    flexDirection: 'row', alignItems: 'flex-end', 
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 2, borderColor: RED_ACCENT
  },
  mediaButton: { 
    marginBottom: 8, marginRight: 8, width: 36, height: 36, 
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: RED_ACCENT, // SOLID DULL RED
    borderRadius: 18
  },
  textInput: {
    flex: 1, minHeight: 40, maxHeight: 120, fontSize: 16, 
    color: TEXT_DARK, paddingVertical: 10, paddingHorizontal: 4
  },
  sendButtonArea: { marginBottom: 6, marginLeft: 8 },
  sendNeo: {},
  sendInner: { 
    width: 40, height: 40, justifyContent: 'center', alignItems: 'center',
    backgroundColor: RED_ACCENT, // SOLID DULL RED
    borderRadius: 20
  },
  sendInnerDisabled: { backgroundColor: '#C47C84' },
});