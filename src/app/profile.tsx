import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserProfile, useUser } from '../context/UserContext';

const InfoRow = ({ 
  label, 
  value, 
  onChangeText, 
  isEditing, 
  isLast = false, 
  multiline = false 
}: { 
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  isEditing: boolean;
  isLast?: boolean;
  multiline?: boolean;
}) => (
  <View>
    <View style={multiline ? styles.rowVertical : styles.row}>
      <Text style={styles.label}>{label}</Text>
      {isEditing ? (
        <TextInput
          style={[styles.textInput, multiline && styles.textInputMultiline]}
          value={value}
          onChangeText={onChangeText}
          placeholder={`Enter ${label.toLowerCase()}`}
          placeholderTextColor="#C7C7CC"
          multiline={multiline}
        />
      ) : (
        <Text style={[multiline ? styles.valueMultiline : styles.value, !value && styles.emptyValue]}>
          {value ? value : (multiline ? 'Tap Edit to add information' : 'None provided')}
        </Text>
      )}
    </View>
    {!isLast && <View style={styles.divider} />}
  </View>
);

export default function ProfileScreen() {
  const router = useRouter();
  
  // Connect to the Global App State
  const { user: globalUser, setUser: setGlobalUser } = useUser();
  
  // Local state for edits. It only updates the global state when "Save" is pressed.
  const [isEditing, setIsEditing] = useState(false);
  const [localUser, setLocalUser] = useState<UserProfile>(globalUser);

  const toggleEdit = () => {
    if (isEditing) {
      setGlobalUser(localUser); // Save changes globally
    } else {
      setLocalUser(globalUser); // Sync fresh data when starting to edit
    }
    setIsEditing(!isEditing);
  };

  const handleUpdatePicture = () => {
    if (!isEditing) return;
    Alert.alert(
      "Update Profile Picture",
      "How would you like to select your picture?",
      [
        { text: "Take Photo", onPress: openCamera },
        { text: "Choose from Gallery", onPress: openGallery },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission Denied', 'Camera access is required to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) {
      setLocalUser({ ...localUser, avatar: { uri: result.assets[0].uri } });
    }
  };

  const openGallery = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission Denied', 'Gallery access is required to choose a photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) {
      setLocalUser({ ...localUser, avatar: { uri: result.assets[0].uri } });
    }
  };

  // Determine which user data to show (local if editing, global if just viewing)
  const displayUser = isEditing ? localUser : globalUser;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#007AFF" />
            <Text style={styles.headerButtonText}>Back</Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Profile</Text>
          
          <TouchableOpacity 
            style={[styles.headerButton, { justifyContent: 'flex-end' }]} 
            onPress={toggleEdit}
          >
            <Text style={[styles.headerButtonText, isEditing && styles.saveText]}>
              {isEditing ? 'Save' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.avatarContainer}>
            <Image source={displayUser.avatar} style={styles.largeAvatar} />
            {isEditing && (
              <TouchableOpacity style={styles.editAvatarButton} onPress={handleUpdatePicture}>
                <Ionicons name="camera" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PERSONAL INFO</Text>
            <View style={styles.card}>
              <InfoRow label="Name" value={displayUser.name} onChangeText={(text) => setLocalUser({...localUser, name: text})} isEditing={isEditing} />
              <InfoRow label="Surname" value={displayUser.surname} onChangeText={(text) => setLocalUser({...localUser, surname: text})} isEditing={isEditing} />
              <InfoRow label="Age" value={displayUser.age} onChangeText={(text) => setLocalUser({...localUser, age: text})} isEditing={isEditing} />
              <InfoRow label="Gender" value={displayUser.gender} onChangeText={(text) => setLocalUser({...localUser, gender: text})} isEditing={isEditing} />
              <InfoRow label="Phone" value={displayUser.phone} onChangeText={(text) => setLocalUser({...localUser, phone: text})} isEditing={isEditing} isLast={true} />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EMERGENCY CONTACT</Text>
            <View style={styles.card}>
              <InfoRow label="Primary Contact" value={displayUser.emergencyContact} onChangeText={(text) => setLocalUser({...localUser, emergencyContact: text})} isEditing={isEditing} multiline={true} isLast={true} />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MEDICAL INFORMATION</Text>
            <View style={styles.card}>
              <InfoRow label="Blood Type" value={displayUser.bloodType} onChangeText={(text) => setLocalUser({...localUser, bloodType: text})} isEditing={isEditing} />
              <InfoRow label="Medical Data" value={displayUser.medicalData} onChangeText={(text) => setLocalUser({...localUser, medicalData: text})} isEditing={isEditing} multiline={true} />
              <InfoRow label="Health Issues" value={displayUser.healthIssues} onChangeText={(text) => setLocalUser({...localUser, healthIssues: text})} isEditing={isEditing} multiline={true} />
              <InfoRow label="Disabilities" value={displayUser.disabilities} onChangeText={(text) => setLocalUser({...localUser, disabilities: text})} isEditing={isEditing} multiline={true} />
              <InfoRow label="Other" value={displayUser.other} onChangeText={(text) => setLocalUser({...localUser, other: text})} isEditing={isEditing} multiline={true} isLast={true} />
            </View>
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 8, paddingVertical: 12, backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#E5E5EA',
  },
  headerButton: { flexDirection: 'row', alignItems: 'center', width: 75 },
  headerButtonText: { color: '#007AFF', fontSize: 17, marginLeft: -4 },
  saveText: { fontWeight: '600' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#1C1C1E' },
  content: { paddingVertical: 24 },
  avatarContainer: { alignItems: 'center', marginBottom: 32 },
  largeAvatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#E5E5EA' },
  editAvatarButton: {
    position: 'absolute', bottom: 0, right: '35%',
    backgroundColor: '#007AFF', width: 38, height: 38, borderRadius: 19,
    justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#F2F2F7',
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 2 }
  },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 13, color: '#8E8E93', marginLeft: 16, marginBottom: 8, textTransform: 'uppercase' },
  card: { backgroundColor: '#FFFFFF', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#E5E5EA' },
  
  // Left Alignment Styles
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  rowVertical: { flexDirection: 'column', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  divider: { height: 1, backgroundColor: '#E5E5EA', marginLeft: 16 },
  
  label: { width: 130, fontSize: 16, color: '#1C1C1E', fontWeight: '500' },
  value: { flex: 1, fontSize: 16, color: '#8E8E93', textAlign: 'left' },
  valueMultiline: { fontSize: 16, color: '#8E8E93', marginTop: 6, lineHeight: 22, textAlign: 'left' },
  emptyValue: { color: '#C7C7CC', fontStyle: 'italic' },
  
  textInput: { flex: 1, fontSize: 16, color: '#007AFF', textAlign: 'left', padding: 0 },
  textInputMultiline: {
    textAlign: 'left', marginTop: 6, minHeight: 44,
    backgroundColor: '#F2F2F7', borderRadius: 8, padding: 10, overflow: 'hidden'
  }
});