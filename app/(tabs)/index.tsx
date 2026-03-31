import { useState, useEffect, useRef } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, G, Rect, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { useApp } from '../../lib/context';

const VERSES = [
  '"Go therefore and make disciples of all nations..." - Matthew 28:19',
  '"Go into all the world and preach the gospel to all creation." - Mark 16:15',
  '"You will receive power when the Holy Spirit comes on you..." - Acts 1:8',
  '"How beautiful are the feet of those who bring good news!" - Romans 10:15',
  '"The harvest is plentiful but the workers are few." - Matthew 9:37',
  '"As the Father has sent me, I am sending you." - John 20:21',
];

function getBezierPoint(t: number) {
  const x = (1 - t) ** 2 * 20 + 2 * (1 - t) * t * 180 + t ** 2 * 340;
  const y = (1 - t) ** 2 * 90 + 2 * (1 - t) * t * 20 + t ** 2 * 90;
  return { x, y };
}

export default function Home() {
  const router = useRouter();
  const { donations, goal, deadlines } = useApp();
  const [animPaused, setAnimPaused] = useState(false);
  const [currentVerse, setCurrentVerse] = useState(VERSES[0]);
  const cloud1 = useRef(new Animated.Value(0)).current;
  const cloud2 = useRef(new Animated.Value(1)).current;

  const RAISED = donations.reduce((s, d) => s + d.amount, 0);
  const GOAL = goal;
  const PROGRESS = GOAL > 0 ? Math.min(RAISED / GOAL, 1) : 0;
  const planePos = getBezierPoint(PROGRESS);

  // Build fund breakdown by method
  const methodTotals: Record<string, number> = {};
  donations.forEach(d => {
    const key = d.method || 'Other';
    methodTotals[key] = (methodTotals[key] || 0) + d.amount;
  });
  const METHOD_COLORS: Record<string, string> = {
    Zelle: '#4aa0c4', Venmo: '#7bb7d1', Cash: '#1d3a6d', Check: '#287AB8', Other: '#a4c9df',
  };
  const METHOD_ICONS: Record<string, string> = {
    Zelle: '💳', Venmo: '📱', Cash: '💵', Check: '✍️', Other: '📊',
  };
  const FUND_LOCATIONS = Object.entries(methodTotals).map(([label, amount]) => ({
    label, amount, color: METHOD_COLORS[label] || '#a4c9df', icon: METHOD_ICONS[label] || '📊',
  }));
  const total = RAISED;

  useEffect(() => {
    const a1 = Animated.loop(Animated.timing(cloud1, { toValue: 1, duration: 30000, useNativeDriver: true }));
    const a2 = Animated.loop(Animated.timing(cloud2, { toValue: 0, duration: 40000, useNativeDriver: true }));
    a1.start(); a2.start();
    return () => { a1.stop(); a2.stop(); };
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.greeting}>Welcome Jordan</Text>
        <Text style={styles.subGreeting}>Let's see your progress</Text>

        {/* Progress Card */}
        <LinearGradient colors={['#7bb7d1', '#a4c9df', '#d6e4f5']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.progressCard}>
          <Animated.View style={[styles.cloud1, { transform: [{ translateX: cloud1.interpolate({ inputRange: [0, 1], outputRange: [-80, 420] }) }] }]}>
            <Svg width="80" height="40" viewBox="0 0 80 40"><G opacity="0.5"><Circle cx="20" cy="25" r="18" fill="white" /><Circle cx="40" cy="20" r="20" fill="white" /><Circle cx="60" cy="25" r="16" fill="white" /></G></Svg>
          </Animated.View>
          <Animated.View style={[styles.cloud2, { transform: [{ translateX: cloud2.interpolate({ inputRange: [0, 1], outputRange: [-60, 420] }) }] }]}>
            <Svg width="60" height="30" viewBox="0 0 60 30"><G opacity="0.4"><Circle cx="15" cy="18" r="14" fill="white" /><Circle cx="30" cy="15" r="16" fill="white" /><Circle cx="45" cy="18" r="13" fill="white" /></G></Svg>
          </Animated.View>

          <Pressable onPress={() => setAnimPaused(!animPaused)} style={styles.controlBtn}>
            <Text style={styles.controlBtnText}>{animPaused ? '▶' : '⏸'}</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/share')} style={[styles.controlBtn, { right: 12, left: undefined }]}>
            <Text style={styles.controlBtnText}>↗</Text>
          </Pressable>

          <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
            <Svg width="100%" height="110" viewBox="0 0 360 110">
              <Defs>
                <SvgGradient id="traj" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor="#1d3a6d" />
                  <Stop offset="50%" stopColor="#4aa0c4" />
                  <Stop offset="100%" stopColor="#7bb7d1" />
                </SvgGradient>
              </Defs>
              <Path d="M 20 90 Q 180 20 340 90" fill="none" stroke="white" strokeWidth="8" strokeDasharray="12 10" strokeLinecap="round" opacity="0.5" />
              <Path d="M 20 90 Q 180 20 340 90" fill="none" stroke="url(#traj)" strokeWidth="10" strokeDasharray="12 10" strokeLinecap="round" strokeDashoffset={1000 - PROGRESS * 1000} />
              <Circle cx="20" cy="90" r="6" fill="#1d3a6d" />
              <Circle cx="20" cy="90" r="4" fill="white" />
              <Circle cx="340" cy="90" r="8" fill="#1d3a6d" />
              <Rect x="338.5" y="85" width="3" height="10" fill="white" rx="0.5" />
              <Rect x="336" y="87.5" width="8" height="3" fill="white" rx="0.5" />
              <G transform={`translate(${planePos.x}, ${planePos.y})`}>
                <Path d="M -10 -4 L 14 -4 L 20 0 L 14 4 L -10 4 L -5 0 Z" fill="white" stroke="black" strokeWidth="1.5" />
                <Path d="M -5 -10 L 3 -4 L 3 4 L -5 10 Z" fill="white" stroke="black" strokeWidth="1.5" />
                <Circle cx="-6" cy="0" r="2.5" fill="#4aa0c4" opacity="0.7" />
              </G>
            </Svg>
          </View>
          <View style={styles.amountArea}>
            <Text style={styles.amountText}>${RAISED.toLocaleString()}</Text>
            <Text style={styles.goalText}>of ${GOAL.toLocaleString()} goal</Text>
            <View style={styles.progressBadge}>
              <Text style={styles.progressBadgeText}>{Math.round(PROGRESS * 100)}% Complete · ${(GOAL - RAISED).toLocaleString()} to go</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Daily Mission Verse */}
        <Text style={styles.sectionTitle}>Daily Mission Verse</Text>
        <LinearGradient colors={['#E8F5F3', '#F0F9FF']} style={styles.verseCard}>
          <View style={styles.verseHeaderRow}>
            <Text style={styles.verseQuoteIcon}>❝</Text>
            <Text style={styles.verseLabel}>GUIDING WORD</Text>
          </View>
          <Text style={styles.verseText}>{currentVerse}</Text>
          <Pressable onPress={() => setCurrentVerse(VERSES[Math.floor(Math.random() * VERSES.length)])}>
            <Text style={styles.changeVerse}>⇄  Change Verse</Text>
          </Pressable>
        </LinearGradient>

        {/* Recent Donations */}
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Recent</Text>
          <Pressable onPress={() => router.push('/(tabs)/history')}>
            <Text style={styles.viewAll}>View All</Text>
          </Pressable>
        </View>
        {donations.length === 0 ? (
          <View style={styles.emptyDonations}>
            <Text style={styles.emptyDonationsText}>No donations yet — tap + to add one!</Text>
          </View>
        ) : (
          donations.slice(0, 3).map((d) => (
            <Pressable key={d.id} onPress={() => router.push({ pathname: '/transaction', params: { id: d.id } })} style={({ pressed }) => [styles.donationRow, pressed && { opacity: 0.8 }]}>
              <View>
                <Text style={styles.donorName}>{d.name}</Text>
                <Text style={styles.donorDate}>{d.date}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Text style={styles.donationAmt}>+${d.amount.toLocaleString()}</Text>
                <Text style={styles.chevron}>›</Text>
              </View>
            </Pressable>
          ))
        )}

        {/* Upcoming Deadlines */}
        {deadlines.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Upcoming Deadlines</Text>
            {deadlines.slice(0, 1).map((dl) => {
              const daysLeft = Math.ceil((new Date(dl.date).getTime() - Date.now()) / 86400000);
              const onTrack = RAISED >= dl.amount * 0.5;
              return (
                <View key={dl.id} style={styles.deadlineMain}>
                  <View style={styles.deadlineBadge}>
                    <Text style={styles.deadlineBadgeText}>{daysLeft > 0 ? `T-${daysLeft} days` : 'Past'}</Text>
                  </View>
                  <Text style={styles.deadlineLabel}>{dl.name.toUpperCase()}</Text>
                  <Text style={styles.deadlineDate}>{dl.date}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={styles.checkDot}><Text style={{ color: 'white', fontSize: 11, fontWeight: '700' }}>✓</Text></View>
                    <Text style={styles.onTrack}>{onTrack ? "You're on track" : `$${dl.amount.toLocaleString()} needed`}</Text>
                  </View>
                </View>
              );
            })}
            {deadlines.length > 1 && (
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
                {deadlines.slice(1, 3).map((dl, i) => {
                  const daysLeft = Math.ceil((new Date(dl.date).getTime() - Date.now()) / 86400000);
                  return (
                    <View key={dl.id} style={[styles.deadlineSmall, i === 0 ? styles.deadlineSmallLeft : styles.deadlineSmallRight]}>
                      <Text style={styles.deadlineSmallLabel}>{dl.name.toUpperCase()}</Text>
                      <Text style={styles.deadlineSmallDate}>{dl.date}</Text>
                      <View style={styles.amberBadge}><Text style={styles.amberBadgeText}>{daysLeft > 0 ? `T-${daysLeft} days` : 'Past'}</Text></View>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}

        {/* Fund Allocation */}
        <Text style={styles.sectionTitle}>Fund Allocation</Text>
        <View style={styles.fundCard}>
          <Text style={styles.fundTotalLabel}>Total Raised</Text>
          <Text style={styles.fundTotalAmt}>${total.toLocaleString()}</Text>
          {FUND_LOCATIONS.map((f) => {
            const pct = (f.amount / total) * 100;
            return (
              <View key={f.label} style={{ marginBottom: 16 }}>
                <View style={styles.rowBetween}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Text style={{ fontSize: 20 }}>{f.icon}</Text>
                    <Text style={styles.fundLabel}>{f.label}</Text>
                  </View>
                  <Text style={styles.fundAmt}>${f.amount.toLocaleString()}</Text>
                </View>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${pct}%` as any, backgroundColor: f.color }]} />
                </View>
              </View>
            );
          })}
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7F6' },
  scroll: { paddingHorizontal: 20, paddingTop: 16 },
  greeting: { fontSize: 34, fontWeight: '700', color: '#111', letterSpacing: -0.5 },
  subGreeting: { fontSize: 15, color: '#9CA3AF', fontWeight: '500', marginBottom: 24, marginTop: 4 },
  progressCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 24 },
  cloud1: { position: 'absolute', top: 8, left: 0 },
  cloud2: { position: 'absolute', top: 20, right: 0 },
  controlBtn: {
    position: 'absolute', top: 12, left: 12, zIndex: 10,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  controlBtnText: { fontSize: 14, color: '#1d3a6d' },
  amountArea: { alignItems: 'center', paddingBottom: 20, paddingTop: 8 },
  amountText: { fontSize: 40, fontWeight: '700', color: '#1d3a6d', letterSpacing: -1 },
  goalText: { fontSize: 14, color: 'rgba(29,58,109,0.8)', fontWeight: '600', marginTop: 4 },
  progressBadge: { backgroundColor: '#1d3a6d', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginTop: 12 },
  progressBadgeText: { fontSize: 13, fontWeight: '700', color: 'white' },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#111', marginBottom: 12 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  viewAll: { fontSize: 14, fontWeight: '600', color: '#4aa0c4' },
  verseCard: { borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(74,160,196,0.2)' },
  verseHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  verseQuoteIcon: { fontSize: 16, color: '#4aa0c4' },
  verseLabel: { fontSize: 11, fontWeight: '700', color: '#4aa0c4', letterSpacing: 1 },
  verseText: { fontSize: 15, color: '#374151', lineHeight: 24, fontStyle: 'italic', marginBottom: 16 },
  changeVerse: { fontSize: 13, fontWeight: '600', color: '#4aa0c4' },
  donationRow: {
    backgroundColor: 'white', borderRadius: 10, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  donorName: { fontSize: 16, fontWeight: '600', color: '#111' },
  donorDate: { fontSize: 13, color: '#9CA3AF', fontWeight: '500', marginTop: 2 },
  donationAmt: { fontSize: 17, fontWeight: '700', color: '#4aa0c4' },
  chevron: { fontSize: 20, color: '#D1D5DB' },
  deadlineMain: {
    backgroundColor: '#d6e4f5', borderRadius: 16, padding: 20, marginBottom: 12,
    borderWidth: 1, borderColor: '#a4c9df',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  deadlineBadge: {
    position: 'absolute', top: 16, right: 16,
    backgroundColor: 'rgba(74,160,196,0.15)', borderWidth: 1, borderColor: 'rgba(74,160,196,0.3)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6,
  },
  deadlineBadgeText: { fontSize: 15, fontWeight: '700', color: '#1d3a6d' },
  deadlineLabel: { fontSize: 11, fontWeight: '700', color: '#4aa0c4', letterSpacing: 1, marginBottom: 4 },
  deadlineDate: { fontSize: 28, fontWeight: '700', color: '#1d3a6d', letterSpacing: -0.5, marginBottom: 12 },
  checkDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#4aa0c4', alignItems: 'center', justifyContent: 'center' },
  onTrack: { fontSize: 14, fontWeight: '600', color: '#1d3a6d' },
  deadlineSmall: {
    flex: 1, backgroundColor: 'white', padding: 16,
    borderWidth: 1, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  deadlineSmallLeft: { borderTopLeftRadius: 10, borderBottomLeftRadius: 10, borderTopRightRadius: 16, borderBottomRightRadius: 16 },
  deadlineSmallRight: { borderTopLeftRadius: 16, borderBottomLeftRadius: 16, borderTopRightRadius: 10, borderBottomRightRadius: 10 },
  deadlineSmallLabel: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1, marginBottom: 4 },
  deadlineSmallDate: { fontSize: 19, fontWeight: '700', color: '#111', letterSpacing: -0.3, marginBottom: 10 },
  amberBadge: { backgroundColor: '#FFF4E5', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start' },
  amberBadgeText: { fontSize: 12, fontWeight: '700', color: '#F59E0B' },
  fundCard: {
    backgroundColor: 'white', borderRadius: 10, padding: 20,
    borderWidth: 1, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  fundTotalLabel: { fontSize: 12, color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  fundTotalAmt: { fontSize: 36, fontWeight: '700', color: '#111', letterSpacing: -0.5, marginBottom: 20 },
  fundLabel: { fontSize: 15, fontWeight: '600', color: '#111' },
  fundAmt: { fontSize: 17, fontWeight: '700', color: '#111' },
  barBg: { height: 10, backgroundColor: '#F3F4F6', borderRadius: 5, overflow: 'hidden', marginTop: 6 },
  barFill: { height: 10, borderRadius: 5 },
  emptyDonations: { backgroundColor: 'white', borderRadius: 10, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 10 },
  emptyDonationsText: { fontSize: 14, color: '#9CA3AF' },
});
