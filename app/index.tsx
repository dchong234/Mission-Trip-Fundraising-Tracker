import { useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, Dimensions, SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';

const { width } = Dimensions.get('window');

const screens = [
  {
    id: 0,
    title: 'Ready for Takeoff?',
    description: "Your mission trip is more than a journey—it's a calling. Let's start tracking your impact together.",
    illustration: 'takeoff',
  },
  {
    id: 1,
    title: 'Steady Progress',
    description: 'Easily record donations from Zelle, Venmo, or cash and see your goal getting closer every day.',
    illustration: 'tracking',
  },
  {
    id: 2,
    title: 'Reach Your Destination',
    description: 'Complete your goal, send thank-yous with AI help, and go change the world.',
    illustration: 'destination',
  },
];

function TakeoffIllustration() {
  return (
    <LinearGradient
      colors={['#C8F0E9', '#A8D5F2']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.illustrationCard}
    >
      <Svg width="100%" height="100%" viewBox="0 0 360 220">
        <Path
          d="M 20 180 Q 180 100 340 180"
          stroke="#00BFA6"
          strokeWidth="3"
          strokeDasharray="8 8"
          fill="none"
          opacity="0.4"
        />
        {/* Plane at start of path */}
        <G transform="translate(40, 170) rotate(-25)">
          <Path d="M-14 -4 L 14 -4 L 20 0 L 14 4 L-14 4 L-8 0 Z" fill="#00BFA6" />
          <Path d="M-8 -10 L 4 -4 L 4 4 L-8 10 Z" fill="#00BFA6" />
        </G>
      </Svg>
    </LinearGradient>
  );
}

function TrackingIllustration() {
  const circleSize = 220;
  const cx = circleSize / 2;
  const cy = circleSize / 2;
  return (
    <View style={styles.trackingContainer}>
      <View style={{ width: circleSize, height: circleSize, position: 'relative' }}>
        <View style={[styles.outerCircle, { width: circleSize, height: circleSize, borderRadius: circleSize / 2 }]} />
        <View style={[styles.innerCircle, { width: circleSize - 64, height: circleSize - 64, borderRadius: (circleSize - 64) / 2, top: 32, left: 32 }]} />
        <Svg width={circleSize} height={circleSize} style={StyleSheet.absoluteFill}>
          <Circle
            cx={cx}
            cy={cy}
            r={cx - 8}
            stroke="#00BFA6"
            strokeWidth="3"
            strokeDasharray="8 8"
            fill="none"
            opacity="0.3"
          />
        </Svg>
        {/* Plane icon in center */}
        <View style={styles.planeCenterContainer}>
          <Text style={styles.planeCenterEmoji}>✈</Text>
        </View>
        {/* Floating +$25 badge */}
        <View style={styles.floatingBadgeTop}>
          <Text style={styles.floatingBadgeText}>$ +$25.00</Text>
        </View>
        {/* Zelle badge */}
        <View style={styles.floatingBadgeBottom}>
          <View style={styles.zelleBadgeIcon}><Text style={styles.zelleBadgeText}>Z</Text></View>
          <Text style={styles.zelleLabelText}>Zelle</Text>
        </View>
      </View>
    </View>
  );
}

function DestinationIllustration() {
  return (
    <LinearGradient
      colors={['#C8F0E9', '#A8D5F2']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.illustrationCard}
    >
      <Svg width="100%" height="100%" viewBox="0 0 360 220">
        <Path
          d="M 60 190 Q 180 80 300 140"
          stroke="#00BFA6"
          strokeWidth="3"
          strokeDasharray="8 8"
          fill="none"
          opacity="0.4"
        />
      </Svg>
      {/* Checkmark circle bottom-left */}
      <View style={styles.checkCircleOuter}>
        <View style={styles.checkCircleInner}>
          <Text style={styles.checkText}>✓</Text>
        </View>
      </View>
      {/* Globe + plane badge top-right */}
      <View style={styles.globeContainer}>
        <View style={styles.globeCircle}>
          <Text style={styles.globeEmoji}>🌍</Text>
        </View>
        <View style={styles.planeBadge}>
          <Text style={styles.planeBadgeEmoji}>✈</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

export default function Onboarding() {
  const [currentScreen, setCurrentScreen] = useState(0);
  const router = useRouter();

  const handleNext = () => {
    if (currentScreen < screens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      router.replace('/signin');
    }
  };

  const handleBack = () => {
    if (currentScreen > 0) setCurrentScreen(currentScreen - 1);
  };

  const handleSkip = () => router.replace('/signin');

  const screen = screens[currentScreen];

  return (
    <SafeAreaView style={styles.container}>
      {/* Back button */}
      {currentScreen > 0 && (
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backArrow}>‹</Text>
        </Pressable>
      )}

      {/* Skip button */}
      {currentScreen < screens.length - 1 && (
        <Pressable onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      )}

      {/* Progress indicator */}
      <View style={styles.progressRow}>
        {screens.map((s, index) => (
          <View key={s.id}>
            {index === currentScreen ? (
              <Text style={styles.planeIcon}>✈</Text>
            ) : (
              <View style={[styles.dot, index < currentScreen ? styles.dotPassed : styles.dotInactive]} />
            )}
          </View>
        ))}
      </View>

      {/* Illustration */}
      <View style={styles.illustrationWrapper}>
        {screen.illustration === 'takeoff' && <TakeoffIllustration />}
        {screen.illustration === 'tracking' && <TrackingIllustration />}
        {screen.illustration === 'destination' && <DestinationIllustration />}
      </View>

      {/* Text */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{screen.title}</Text>
        <Text style={styles.description}>{screen.description}</Text>
      </View>

      {/* Screen counter */}
      {currentScreen > 0 && currentScreen < screens.length - 1 && (
        <Text style={styles.screenCounter}>
          SCREEN {currentScreen + 1} OF {screens.length}
        </Text>
      )}

      <View style={{ flex: 1 }} />

      {/* Next button */}
      <Pressable
        onPress={handleNext}
        style={({ pressed }) => [styles.nextButton, pressed && styles.nextButtonPressed]}
      >
        <Text style={styles.nextButtonText}>
          {currentScreen === screens.length - 1 ? 'Get Started' : 'Next'} →
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F6',
    paddingHorizontal: 24,
  },
  backButton: {
    position: 'absolute',
    top: 72,
    left: 16,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  backArrow: { fontSize: 28, color: '#111', lineHeight: 32 },
  skipButton: {
    position: 'absolute',
    top: 76,
    right: 24,
    zIndex: 10,
  },
  skipText: { fontSize: 15, fontWeight: '600', color: '#555' },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    marginBottom: 24,
  },
  planeIcon: { fontSize: 20, color: '#00BFA6' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotPassed: { backgroundColor: 'rgba(0,191,166,0.4)' },
  dotInactive: { backgroundColor: '#D0D0D0' },
  illustrationWrapper: { width: '100%', marginBottom: 32 },
  illustrationCard: {
    width: '100%',
    height: 220,
    borderRadius: 32,
    overflow: 'hidden',
  },
  trackingContainer: {
    alignItems: 'center',
    height: 260,
    justifyContent: 'center',
  },
  outerCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(200,240,233,0.4)',
  },
  innerCircle: {
    position: 'absolute',
    backgroundColor: '#C8F0E9',
  },
  planeCenterContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planeCenterEmoji: { fontSize: 60, color: '#00BFA6' },
  floatingBadgeTop: {
    position: 'absolute',
    top: -16,
    left: 40,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  floatingBadgeText: { fontSize: 14, fontWeight: '700', color: '#111' },
  floatingBadgeBottom: {
    position: 'absolute',
    bottom: 40,
    left: -16,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  zelleBadgeIcon: {
    width: 20, height: 20, backgroundColor: '#00BFA6',
    borderRadius: 4, alignItems: 'center', justifyContent: 'center',
  },
  zelleBadgeText: { fontSize: 10, fontWeight: '700', color: 'white' },
  zelleLabelText: { fontSize: 14, fontWeight: '600', color: '#111' },
  checkCircleOuter: {
    position: 'absolute',
    bottom: 48,
    left: 48,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,191,166,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#00BFA6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { fontSize: 24, color: 'white', fontWeight: '700' },
  globeContainer: { position: 'absolute', top: 40, right: 48 },
  globeCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#00BFA6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  globeEmoji: { fontSize: 36 },
  planeBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#287AB8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  planeBadgeEmoji: { fontSize: 14, color: 'white' },
  textContainer: { alignItems: 'center', paddingHorizontal: 8 },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  screenCounter: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'center',
    letterSpacing: 1.2,
    marginTop: 16,
    textTransform: 'uppercase',
  },
  nextButton: {
    backgroundColor: '#008F7A',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  nextButtonPressed: { backgroundColor: '#007566' },
  nextButtonText: { color: 'white', fontSize: 18, fontWeight: '700' },
});
