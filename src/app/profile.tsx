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

// Theme Constants
const BG_COLOR = '#EBEEF2';
const RED_ACCENT = '#9E3641'; // DULL, MUTED RED
const TEXT_DARK = '#2D3142';
const TEXT_MUTED = '#8E94A3';

// Neomorphism Helper Component
const NeoView = ({ children, containerStyle, innerStyle, borderRadius = 16 }: any) => (
  <View style={[styles.neoDark, { borderRadius }, containerStyle]}>
    <View style={[styles.neoLight, { borderRadius }, innerStyle]}>
      {children}
    </View>
  </View>
);

const InfoRow = ({ label, value, onChangeText, isEditing, isLast = false, multiline = false }: any) => (
  <View style={styles.rowContainer}>
    <View style={multiline ? styles.rowVertical : styles.row}>
      <Text style={styles.label}>{label}</Text>
      {isEditing ? (
        <TextInput
          style={[styles.textInput, multiline && styles.textInputMultiline]}
          value={value}
          onChangeText={onChangeText}
          placeholder={`Enter ${label.toLowerCase()}`}
          placeholderTextColor="#E0A8AE"
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
  const { user: globalUser, setUser: setGlobalUser } = useUser();
  
  const [isEditing, setIsEditing] = useState(false);
  const [localUser, setLocalUser] = useState<UserProfile>(globalUser);

  const toggleEdit = () => {
    if (isEditing) setGlobalUser(localUser);
    else setLocalUser(globalUser);
    setIsEditing(!isEditing);
  };

  const handleUpdatePicture = () => {
    if (!isEditing) return;
    Alert.alert(
      "Update Profile Picture", "How would you like to select your picture?",
      [
        { text: "Take Photo", onPress: openCamera },
        { text: "Choose from Gallery", onPress: openGallery },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const openCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return Alert.alert('Denied', 'Camera access is required.');
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.5 });
    if (!result.canceled) setLocalUser({ ...localUser, avatar: { uri: result.assets[0].uri } });
  };

  const openGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert('Denied', 'Gallery access is required.');
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.5 });
    if (!result.canceled) setLocalUser({ ...localUser, avatar: { uri: result.assets[0].uri } });
  };

  const displayUser = isEditing ? localUser : globalUser;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        
        {/* Neomorphic Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <NeoView containerStyle={styles.iconBtn} innerStyle={styles.iconBtnInner} borderRadius={20}>
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" style={{ marginLeft: -2 }} />
            </NeoView>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Profile</Text>
          
          <TouchableOpacity onPress={toggleEdit}>
            <NeoView containerStyle={styles.editBtn} innerStyle={styles.editBtnInner} borderRadius={20}>
              <Text style={styles.editBtnText}>
                {isEditing ? 'Save' : 'Edit'}
              </Text>
            </NeoView>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          
          {/* Avatar Section */}
          <View style={styles.avatarContainer}>
            <NeoView containerStyle={styles.avatarWrapper} innerStyle={styles.avatarInnerWrapper} borderRadius={70}>
              <Image source={displayUser.avatar} style={styles.largeAvatar} />
              {isEditing && (
                <TouchableOpacity style={styles.editAvatarButton} onPress={handleUpdatePicture}>
                  <NeoView containerStyle={styles.camBtn} innerStyle={styles.camBtnInner} borderRadius={20}>
                    <Ionicons name="camera" size={18} color="#FFFFFF" />
                  </NeoView>
                </TouchableOpacity>
              )}
            </NeoView>
          </View>

          {/* Info Sections */}
          <View style={styles.section}>
            {/* NEW SOLID RED SECTION BADGES */}
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>PERSONAL INFO</Text>
            </View>
            <NeoView containerStyle={styles.cardShadow} innerStyle={styles.cardInner} borderRadius={24}>
              <InfoRow label="Name" value={displayUser.name} onChangeText={(t: string) => setLocalUser({...localUser, name: t})} isEditing={isEditing} />
              <InfoRow label="Surname" value={displayUser.surname} onChangeText={(t: string) => setLocalUser({...localUser, surname: t})} isEditing={isEditing} />
              <InfoRow label="Age" value={displayUser.age} onChangeText={(t: string) => setLocalUser({...localUser, age: t})} isEditing={isEditing} />
              <InfoRow label="Gender" value={displayUser.gender} onChangeText={(t: string) => setLocalUser({...localUser, gender: t})} isEditing={isEditing} />
              <InfoRow label="Phone" value={displayUser.phone} onChangeText={(t: string) => setLocalUser({...localUser, phone: t})} isEditing={isEditing} isLast />
            </NeoView>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>EMERGENCY CONTACT</Text>
            </View>
            <NeoView containerStyle={styles.cardShadow} innerStyle={styles.cardInner} borderRadius={24}>
              <InfoRow label="Primary Contact" value={displayUser.emergencyContact} onChangeText={(t: string) => setLocalUser({...localUser, emergencyContact: t})} isEditing={isEditing} multiline isLast />
            </NeoView>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>MEDICAL INFORMATION</Text>
            </View>
            <NeoView containerStyle={styles.cardShadow} innerStyle={styles.cardInner} borderRadius={24}>
              <InfoRow label="Blood Type" value={displayUser.bloodType} onChangeText={(t: string) => setLocalUser({...localUser, bloodType: t})} isEditing={isEditing} />
              <InfoRow label="Medical Data" value={displayUser.medicalData} onChangeText={(t: string) => setLocalUser({...localUser, medicalData: t})} isEditing={isEditing} multiline />
              <InfoRow label="Health Issues" value={displayUser.healthIssues} onChangeText={(t: string) => setLocalUser({...localUser, healthIssues: t})} isEditing={isEditing} multiline />
              <InfoRow label="Disabilities" value={displayUser.disabilities} onChangeText={(t: string) => setLocalUser({...localUser, disabilities: t})} isEditing={isEditing} multiline />
              <InfoRow label="Other" value={displayUser.other} onChangeText={(t: string) => setLocalUser({...localUser, other: t})} isEditing={isEditing} multiline isLast />
            </NeoView>
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_COLOR },
  
  /* MAXED OUT SHADOWS TO POP MORE */
  neoDark: {
    backgroundColor: BG_COLOR,
    shadowColor: '#8C9CB0', // Much darker shadow 
    shadowOffset: { width: 12, height: 12 }, // Pushed further out
    shadowOpacity: 1, // Max Opacity
    shadowRadius: 16,
    elevation: 15,
  },
  neoLight: {
    backgroundColor: BG_COLOR,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: -12, height: -12 },
    shadowOpacity: 1,
    shadowRadius: 16,
  },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12, backgroundColor: BG_COLOR,
  },
  iconBtn: { width: 40, height: 40 },
  iconBtnInner: { 
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: RED_ACCENT, // SOLID DULL RED
    borderRadius: 20
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: TEXT_DARK },
  editBtn: { minWidth: 70, height: 40 },
  editBtnInner: { 
    flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 12,
    backgroundColor: RED_ACCENT, // SOLID DULL RED
    borderRadius: 20
  },
  editBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  content: { paddingVertical: 24, paddingHorizontal: 16 },
  
  avatarContainer: { alignItems: 'center', marginBottom: 36, marginTop: 10 },
  avatarWrapper: { padding: 6 },
  avatarInnerWrapper: { 
    padding: 4, borderRadius: 70,
    borderWidth: 3, borderColor: RED_ACCENT 
  },
  largeAvatar: { width: 120, height: 120, borderRadius: 60 },
  editAvatarButton: { position: 'absolute', bottom: -5, right: 0 },
  camBtn: { width: 42, height: 42 },
  camBtnInner: { 
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: RED_ACCENT, // SOLID DULL RED
    borderRadius: 21,
  },

  section: { marginBottom: 32 },
  sectionTitleContainer: {
    backgroundColor: RED_ACCENT, // SOLID DULL RED BADGE
    alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 12, marginBottom: 12,
  },
  sectionTitle: { 
    fontSize: 12, color: '#FFFFFF', fontWeight: '800', letterSpacing: 1.5 
  },
  cardShadow: { width: '100%' },
  cardInner: { 
    paddingVertical: 8,
    borderWidth: 2, borderColor: RED_ACCENT
  },
  
  rowContainer: { paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  rowVertical: { flexDirection: 'column', justifyContent: 'center', paddingVertical: 14 },
  divider: { height: 1, backgroundColor: '#FFFFFF', opacity: 0.5, marginHorizontal: 4 },
  
  label: { width: 130, fontSize: 16, color: TEXT_DARK, fontWeight: '700' },
  value: { flex: 1, fontSize: 16, color: TEXT_MUTED, textAlign: 'left', fontWeight: '500' },
  valueMultiline: { fontSize: 16, color: TEXT_MUTED, marginTop: 8, lineHeight: 22, textAlign: 'left', fontWeight: '500' },
  emptyValue: { color: '#B0B5C0', fontStyle: 'italic' },
  
  /* NEW SOLID RED TEXT INPUT BLOCKS */
  textInput: { 
    flex: 1, fontSize: 16, color: '#FFFFFF', fontWeight: '600', textAlign: 'left', 
    backgroundColor: RED_ACCENT, // SOLID DULL RED
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 
  },
  textInputMultiline: {
    textAlign: 'left', marginTop: 8, minHeight: 44, color: '#FFFFFF',
    backgroundColor: RED_ACCENT, // SOLID DULL RED
    borderRadius: 12, padding: 12, overflow: 'hidden'
  }
});