import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const router = useRouter();

  const mockUser = {
    // Personal
    name: 'Alex',
    surname: 'Smith',
    age: '28',
    gender: 'Male',
    phone: '+1 (555) 123-4567',
    
    // Emergency
    emergencyContact: 'Sarah Smith (Sister) - +1 (555) 987-6543',

    // Medical Data
    bloodType: 'O Positive (O+)',
    medicalData: 'Regular checkups normal. No recent surgeries.',
    healthIssues: 'Mild Asthma',
    disabilities: 'None',
    other: '', // Intentionally left empty as requested

    avatar: require('../../assets/images/user.jpg'), 
  };

  // Helper component to render rows consistently
  const InfoRow = ({ label, value, isLast = false }: { label: string, value: string, isLast?: boolean }) => (
    <View>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, !value && styles.emptyValue]}>
          {value ? value : 'None provided'}
        </Text>
      </View>
      {!isLast && <View style={styles.divider} />}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#007AFF" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Picture */}
        <View style={styles.avatarContainer}>
          <Image source={mockUser.avatar} style={styles.largeAvatar} />
          <TouchableOpacity style={styles.editAvatarButton}>
            <Ionicons name="camera" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Personal Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PERSONAL INFO</Text>
          <View style={styles.card}>
            <InfoRow label="Name" value={mockUser.name} />
            <InfoRow label="Surname" value={mockUser.surname} />
            <InfoRow label="Age" value={mockUser.age} />
            <InfoRow label="Gender" value={mockUser.gender} />
            <InfoRow label="Phone" value={mockUser.phone} isLast={true} />
          </View>
        </View>

        {/* Emergency Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EMERGENCY CONTACT</Text>
          <View style={styles.card}>
            <View style={styles.rowVertical}>
              <Text style={styles.label}>Primary Contact</Text>
              <Text style={styles.valueMultiline}>{mockUser.emergencyContact}</Text>
            </View>
          </View>
        </View>

        {/* Medical Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MEDICAL INFORMATION</Text>
          <View style={styles.card}>
            <InfoRow label="Blood Type" value={mockUser.bloodType} />
            <View style={styles.rowVertical}>
              <Text style={styles.label}>Medical Data</Text>
              <Text style={styles.valueMultiline}>{mockUser.medicalData}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.rowVertical}>
              <Text style={styles.label}>Health Issues</Text>
              <Text style={styles.valueMultiline}>{mockUser.healthIssues}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.rowVertical}>
              <Text style={styles.label}>Disabilities</Text>
              <Text style={styles.valueMultiline}>{mockUser.disabilities}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.rowVertical}>
              <Text style={styles.label}>Other</Text>
              <Text style={[styles.valueMultiline, !mockUser.other && styles.emptyValue]}>
                {mockUser.other ? mockUser.other : 'Tap to add information'}
              </Text>
            </View>
          </View>
        </View>

        {/* Spacer for bottom scrolling */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 70,
  },
  backText: {
    color: '#007AFF',
    fontSize: 17,
    marginLeft: -4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  content: {
    paddingVertical: 24,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  largeAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E5E5EA',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: '#007AFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#F2F2F7',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginLeft: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E5EA',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowVertical: {
    flexDirection: 'column',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginLeft: 16,
  },
  label: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    color: '#8E8E93',
    maxWidth: '60%',
    textAlign: 'right',
  },
  valueMultiline: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 6,
    lineHeight: 22,
  },
  emptyValue: {
    color: '#C7C7CC',
    fontStyle: 'italic',
  },
});