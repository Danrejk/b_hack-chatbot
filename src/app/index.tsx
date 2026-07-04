import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
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
  text?: string;
  image?: string;
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
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isBotOnline, setIsBotOnline] = useState(true);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isConversationMode, setIsConversationMode] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hello! I am your AI assistant. How can I help you today?', sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const kShow = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const kHide = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
      setIsFocused(false);
    });

    return () => { kShow.remove(); kHide.remove(); };
  }, []);

  const scrollToBottom = () => {
    if (flatListRef.current) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

const handleCamera = async () => {
  setShowMenu(false);
  Keyboard.dismiss();

  const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
  if (!permissionResult.granted) {
    alert("Permission to access camera is required!");
    return;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.8,
  });

  if (!result.canceled && result.assets && result.assets.length > 0) {
    // Store the URI in state to be sent when user clicks "Send"
    setSelectedImage(result.assets[0].uri);
  }
};

  const handleSend = async () => {
  if (!inputText.trim() && !selectedImage) return;

  const userMessage: Message = {
    id: Date.now().toString(),
    text: inputText.trim() || undefined,
    image: selectedImage || undefined,
    sender: 'user'
  };

  setMessages(prev => [...prev, userMessage]);
  setInputText('');
  setSelectedImage(null); // Clear image after queuing
  setShowMenu(false);

  const thinkingId = (Date.now() + 1).toString();
  setMessages(prev => [...prev, { id: thinkingId, text: 'Thinking...', sender: 'bot' }]);

  try {
    let response;

    if (userMessage.image) {
      const formData = new FormData();

      // 1. Properly format the image object for React Native
      const filename = userMessage.image.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      // 2. Append using the specific structure required by React Native
      formData.append('image', {
        uri: userMessage.image,
        name: filename,
        type: type,
      } as any);

      // 3. Append text message if it exists
      if (userMessage.text) {
        formData.append('message', userMessage.text);
      }

      // 4. Send the request
      // IMPORTANT: Do NOT set Content-Type header. 
      // The React Native network layer automatically sets it 
      // with the correct boundary when it detects a FormData body.
      response = await fetch('http://127.0.0.1:8000/chat/image', {
        method: 'POST',
        body: formData,
      });
    } else {
      // Standard JSON for text-only
      response = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.text, conversation_id: null }),
      });
    }

    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();

    setMessages(prev =>
      prev.map(msg => msg.id === thinkingId ? { ...msg, text: data.answer } : msg)
    );
  } catch (error) {
    console.error('API Error:', error);
    setMessages(prev =>
      prev.map(msg => msg.id === thinkingId ? { ...msg, text: 'Error connecting to server.' } : msg)
    );
  }
};

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    
    return (
      <View style={[styles.messageWrapper, isUser ? styles.messageWrapperUser : styles.messageWrapperBot]}>
        <NeoView 
          containerStyle={styles.bubbleShadow} 
          // If it's an image, we reduce the padding so it fits tighter inside the bubble
          innerStyle={[styles.messageBubble, isUser ? styles.userBubble : styles.botBubble, item.image && { paddingHorizontal: 6, paddingVertical: 6 }]}
          borderRadius={20}
        >
          {item.image && (
            <Image source={{ uri: item.image }} style={styles.messageImage} resizeMode="cover" />
          )}
          {item.text && (
            <Text style={[styles.messageText, isUser ? styles.userText : styles.botText]}>
              {item.text}
            </Text>
          )}
        </NeoView>
      </View>
    );
  };

  // Determine if Mic should be shown
  const hasSentMessage = messages.some(m => m.sender === 'user');
  const showMic = (!hasSentMessage || isConversationMode) && !isFocused && !isKeyboardVisible && inputText.length === 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        
        {/* Full Screen Overlay to dismiss menu */}
        {showMenu && (
          <Pressable 
            style={styles.overlay} 
            onPress={() => setShowMenu(false)} 
          />
        )}

        {/* Neomorphic Header */}
        <View style={styles.headerContainer}>
          <NeoView containerStyle={styles.headerNeo} innerStyle={styles.headerInner} borderRadius={24}>
            <View style={styles.headerLeft}>
              <NeoView containerStyle={styles.logoOuter} innerStyle={styles.logoInner} borderRadius={22}>
                <Text style={styles.logoText}>AI</Text>
              </NeoView>
              <View>
                <Text style={styles.headerTitle}>B-Hack Bot</Text>
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
          
          {/* removed because its not working */}
          {/* Centered Microphone Button */}
          {/* {showMic && (
            <View style={styles.micWrapper}>
              <TouchableOpacity>
                <NeoView containerStyle={styles.micNeo} innerStyle={styles.micInner} borderRadius={44}>
                  <Ionicons name="mic" size={42} color="#FFFFFF" />
                </NeoView>
              </TouchableOpacity>
            </View>
          )} */}

          <View style={styles.inputGroup}>
            {/* Options Menu Popup */}
            {showMenu && (
              <View style={styles.menuWrapper}>
                <NeoView containerStyle={styles.menuNeo} innerStyle={styles.menuInner} borderRadius={16}>
                  <TouchableOpacity 
                    style={styles.menuItem} 
                    onPress={() => {
                      setIsConversationMode(true);
                      setShowMenu(false);
                    }}
                  >
                    <Ionicons name="mic-outline" size={20} color={RED_ACCENT} />
                    <Text style={styles.menuText}>Conversation Mode</Text>
                  </TouchableOpacity>

                  {/* Add Camera Option */}
                  <TouchableOpacity 
                    style={[styles.menuItem, { marginTop: 16 }]} 
                    onPress={handleCamera}
                  >
                    <Ionicons name="camera-outline" size={20} color={RED_ACCENT} />
                    <Text style={styles.menuText}>Camera</Text>
                  </TouchableOpacity>

                </NeoView>
              </View>
            )}

            <NeoView containerStyle={styles.inputWrapper} innerStyle={styles.inputInner} borderRadius={28}>
              
              <TouchableOpacity 
                style={styles.mediaButton} 
                onPress={() => {
                  setShowMenu(!showMenu);
                  Keyboard.dismiss();
                }}
              >
                <Ionicons name={showMenu ? "close" : "add"} size={24} color="#FFFFFF" />
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
                onFocus={() => {
                  setIsFocused(true);
                  setShowMenu(false);
                }}
                onBlur={() => setIsFocused(false)}
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
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_COLOR },
  keyboardView: { flex: 1 },
  
  /* OVERLAY FOR CLICK-AWAY MENU DISMISSAL */
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9,
    elevation: 9,
  },

  /* HEAVILY MAXED OUT SHADOWS */
  neoDark: {
    backgroundColor: BG_COLOR,
    shadowColor: '#7A8C9E', // Darker gray-blue for much stronger dark shadow
    shadowOffset: { width: 16, height: 16 }, // Pushed out further
    shadowOpacity: 1,
    shadowRadius: 20, // More blur to spread the darkness
    elevation: 20, // Increased for Android
  },
  neoLight: {
    backgroundColor: BG_COLOR,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: -16, height: -16 }, // Pushed out further
    shadowOpacity: 1,
    shadowRadius: 20, // More blur to spread the light
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
    backgroundColor: RED_ACCENT,
    borderRadius: 22,
  },
  logoText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: TEXT_DARK },
  
  headerSubtitleContainer: { 
    backgroundColor: RED_ACCENT,
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
    backgroundColor: RED_ACCENT
  },
  botBubble: { borderBottomLeftRadius: 4 },
  messageText: { fontSize: 16, lineHeight: 22 },
  userText: { color: '#FFFFFF', fontWeight: '600' },
  botText: { color: TEXT_DARK },
  messageImage: { 
    width: 220, 
    height: 220, 
    borderRadius: 14, // Fits nicely inside the bubble
  },

  bottomContainer: { paddingHorizontal: 16, paddingTop: 8, zIndex: 10 },
  
  /* Input Group to correctly relative-position the menu */
  inputGroup: {
    width: '100%',
    position: 'relative',
  },

  /* Menu Styles */
  menuWrapper: {
    position: 'absolute',
    bottom: '100%',
    marginBottom: 16,
    left: 0,
    zIndex: 100,
    elevation: 24, // Ensure it floats way above
  },
  menuNeo: {
    shadowColor: '#7A8C9E', // Stronger shadow
    shadowOffset: { width: 8, height: 8 }, // Pushed out further
    shadowOpacity: 1,
    shadowRadius: 14,
  },
  menuInner: {
    backgroundColor: BG_COLOR,
    paddingHorizontal: 16,
    paddingVertical: 16, // slightly increased for two items
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_DARK,
  },

  /* Mic Styles */
  micWrapper: {
    alignItems: 'center',
    marginBottom: 30, // Increased gap slightly for huge shadow
  },
  micNeo: {
    shadowColor: '#7A8C9E', // Stronger shadow
    shadowOffset: { width: 14, height: 14 }, // Pushed out further
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  micInner: {
    width: 88, 
    height: 88, 
    backgroundColor: RED_ACCENT,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3, 
    borderColor: BG_COLOR,
  },

  inputWrapper: { width: '100%' },
  inputInner: { 
    flexDirection: 'row', alignItems: 'flex-end', 
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 2, borderColor: RED_ACCENT
  },
  mediaButton: { 
    marginBottom: 2, marginRight: 8, width: 36, height: 36, 
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: RED_ACCENT,
    borderRadius: 18
  },
  textInput: {
    flex: 1, minHeight: 40, maxHeight: 120, fontSize: 16, 
    color: TEXT_DARK, 
    paddingTop: 10, paddingBottom: 10, paddingHorizontal: 4,
    textAlignVertical: 'center'
  },
  sendButtonArea: { marginBottom: 0, marginLeft: 8 },
  sendNeo: {},
  sendInner: { 
    width: 40, height: 40, justifyContent: 'center', alignItems: 'center',
    backgroundColor: RED_ACCENT,
    borderRadius: 20
  },
  sendInnerDisabled: { backgroundColor: '#C47C84' },
});