import { Ionicons } from '@expo/vector-icons';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const RED_ACCENT = '#9E3641';
const BG_COLOR = '#EBEEF2';
const TEXT_DARK = '#2D3142';
const TEXT_MUTED = '#8E94A3';
const CARD_BG = '#FFFFFF';

// Static placeholder content until the rescue plan is generated from the
// live conversation (location, active alerts, agent guidance).
const EVACUATION_STEPS = [
  'Stay away from windows and exterior walls.',
  'Move to the lowest, most central room or basement.',
  'Grab your go-bag only if it is already packed and nearby.',
  'Follow official evacuation routes - avoid the port/harbor district.',
  'Do not return home until authorities confirm the area is clear.',
];

const BACKPACK_CHECKLIST = [
  'Water and non-perishable food (2-3 days)',
  'ID, passport, and medical documents',
  'Cash in small bills',
  'Prescription medication and first aid kit',
  'Flashlight, power bank, and phone charger',
  'Warm clothing and sturdy shoes',
];

const EMERGENCY_NUMBERS = [
  { label: 'All emergencies (EU-wide)', number: '112' },
  { label: 'Police', number: '110' },
  { label: 'Poison control', number: '+49 30 19240' },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PANEL_WIDTH = SCREEN_WIDTH * 0.84;
const OPEN_X = 0;
const CLOSED_X = PANEL_WIDTH;
const SPRING_CONFIG = { damping: 22, stiffness: 220 };

function clamp(value: number, min: number, max: number) {
  'worklet';
  return Math.min(Math.max(value, min), max);
}

// Panel is dragged/tapped open from a small handle on the right edge of the
// screen, and dragged closed again from its own grab bar - both gestures
// drive the same translateX shared value, clamped between fully open (0)
// and fully closed (off-screen by its own width).
export default function RescuePlanPanel() {
  const translateX = useSharedValue(CLOSED_X);
  const dragStartX = useSharedValue(CLOSED_X);

  const onDragStart = () => {
    'worklet';
    dragStartX.value = translateX.value;
  };
  const onDragUpdate = (translationX: number) => {
    'worklet';
    translateX.value = clamp(dragStartX.value + translationX, OPEN_X, CLOSED_X);
  };
  const onDragEnd = (velocityX: number) => {
    'worklet';
    const shouldOpen = translateX.value < PANEL_WIDTH / 2 || velocityX < -600;
    translateX.value = withSpring(shouldOpen ? OPEN_X : CLOSED_X, SPRING_CONFIG);
  };

  const dragToOpen = Gesture.Pan()
    .onStart(onDragStart)
    .onUpdate((event) => onDragUpdate(event.translationX))
    .onEnd((event) => onDragEnd(event.velocityX));

  const tapToOpen = Gesture.Tap()
    .maxDistance(10)
    .onEnd((_event, success) => {
      if (success) translateX.value = withSpring(OPEN_X, SPRING_CONFIG);
    });

  const dragToClose = Gesture.Pan()
    .onStart(onDragStart)
    .onUpdate((event) => onDragUpdate(event.translationX))
    .onEnd((event) => onDragEnd(event.velocityX));

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, PANEL_WIDTH * 0.4, PANEL_WIDTH], [0, 0.4, 1], 'clamp'),
  }));

  return (
    <>
      <GestureDetector gesture={Gesture.Race(tapToOpen, dragToOpen)}>
        <Animated.View style={[styles.handle, handleStyle]}>
          <Ionicons name="chevron-back" size={16} color="#FFFFFF" />
        </Animated.View>
      </GestureDetector>

      <Animated.View style={[styles.panel, panelStyle]}>
        <SafeAreaView style={styles.panelSafeArea} edges={['top', 'bottom']}>
          <GestureDetector gesture={dragToClose}>
            <View style={styles.grabArea}>
              <View style={styles.grabBar} />
              <Text style={styles.title}>Rescue Plan</Text>
            </View>
          </GestureDetector>

          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="walk-outline" size={18} color={RED_ACCENT} />
                <Text style={styles.cardTitle}>Next steps: evacuation</Text>
              </View>
              {EVACUATION_STEPS.map((step, index) => (
                <View key={step} style={styles.row}>
                  <Text style={styles.rowIndex}>{index + 1}</Text>
                  <Text style={styles.rowText}>{step}</Text>
                </View>
              ))}
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="bag-outline" size={18} color={RED_ACCENT} />
                <Text style={styles.cardTitle}>Backpack checklist</Text>
              </View>
              {BACKPACK_CHECKLIST.map((item) => (
                <View key={item} style={styles.row}>
                  <Ionicons name="checkbox-outline" size={16} color={TEXT_MUTED} />
                  <Text style={styles.rowText}>{item}</Text>
                </View>
              ))}
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="call-outline" size={18} color={RED_ACCENT} />
                <Text style={styles.cardTitle}>Emergency numbers</Text>
              </View>
              {EMERGENCY_NUMBERS.map((entry) => (
                <View key={entry.label} style={styles.contactRow}>
                  <Text style={styles.rowText}>{entry.label}</Text>
                  <Text style={styles.contactNumber}>{entry.number}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  handle: {
    position: 'absolute',
    right: 0,
    top: '45%',
    width: 28,
    height: 72,
    backgroundColor: RED_ACCENT,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    elevation: 20,
  },
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: PANEL_WIDTH,
    backgroundColor: BG_COLOR,
    zIndex: 30,
    elevation: 30,
    shadowColor: '#000000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  panelSafeArea: { flex: 1, paddingHorizontal: 20 },
  grabArea: { paddingTop: 12, paddingBottom: 8 },
  grabBar: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C9CFD9',
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: '800', color: TEXT_DARK },
  body: { flex: 1 },
  bodyContent: { paddingBottom: 24, gap: 16 },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 14,
    padding: 16,
    gap: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: TEXT_DARK },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  rowIndex: {
    fontSize: 13,
    fontWeight: '700',
    color: RED_ACCENT,
    width: 16,
  },
  rowText: { flex: 1, fontSize: 13, color: TEXT_DARK, lineHeight: 18 },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactNumber: { fontSize: 13, fontWeight: '700', color: RED_ACCENT },
});
