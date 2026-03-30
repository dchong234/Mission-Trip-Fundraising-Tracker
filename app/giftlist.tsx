import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

type AmountFilter = 'all' | 'under50' | '50to100' | 'over100';

const initialGiftList = [
  { id: '1', name: 'Mom', amount: 100, date: 'Nov 16, 2025', autoAdded: false },
  { id: '2', name: 'Dad', amount: 250, date: 'Nov 15, 2025', autoAdded: true },
  { id: '3', name: 'Aunt Linda', amount: 75, date: 'Nov 12, 2025', autoAdded: true },
  { id: '4', name: 'Sarah Johnson', amount: 50, date: 'Nov 10, 2025', autoAdded: true },
];

export default function GiftList() {
  const router = useRouter();
  const [autoAdd, setAutoAdd] = useState(true);
  const [showAbout, setShowAbout] = useState(true);
  const [amountFilter, setAmountFilter] = useState<AmountFilter>('all');
  const [giftList, setGiftList] = useState(initialGiftList);

  const filtered = giftList.filter(s => {
    if (amountFilter === 'all') return true;
    if (amountFilter === 'under50') return s.amount < 50;
    if (amountFilter === '50to100') return s.amount >= 50 && s.amount <= 100;
    if (amountFilter === 'over100') return s.amount > 100;
    return true;
  });

  const filterOptions: { key: AmountFilter; label: string }[] = [
    { key: 'all', label: 'All Donors' },
    { key: 'under50', label: 'Under $50' },
    { key: '50to100', label: '$50–$100' },
    { key: 'over100', label: 'Over $100' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header gradient */}
      <LinearGradient
        colors={['#4aa0c4', '#7bb7d1', '#a4c9df']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>‹</Text>
        </Pressable>
        <View style={styles.headerRow}>
          <View style={styles.headerIcon}>
            <Text style={styles.headerIconEmoji}>🎁</Text>
          </View>
          <Text style={styles.headerTitle}>Sponsor Gift List</Text>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* About section */}
        {showAbout && (
          <View style={styles.aboutCard}>
            <Pressable onPress={() => setShowAbout(false)} style={styles.aboutClose}>
              <Text style={styles.aboutCloseText}>✕</Text>
            </Pressable>
            <Text style={styles.aboutTitle}>About Gift Lists</Text>
            <Text style={styles.aboutBody}>
              Use this list to track sponsors you'd like to send thank-you gifts or personal notes to. You can add donors manually from your history or let the app automatically add donors who contribute $50 or more.
            </Text>
          </View>
        )}

        {/* Auto-add card */}
        <View style={styles.autoAddCard}>
          <View style={styles.autoAddRow}>
            <View style={styles.autoAddIconCircle}>
              <Text style={styles.autoAddIconEmoji}>🎁</Text>
            </View>
            <View style={styles.autoAddText}>
              <Text style={styles.autoAddTitle}>Auto-Add $50+ Donors</Text>
              <Text style={styles.autoAddSubtitle}>Automatically add generous supporters</Text>
            </View>
            <Pressable
              onPress={() => setAutoAdd(!autoAdd)}
              style={[styles.toggle, autoAdd && styles.toggleOn]}
            >
              <View style={[styles.toggleThumb, autoAdd && styles.toggleThumbOn]} />
            </Pressable>
          </View>
          <Text style={styles.autoAddDescription}>
            When enabled, donors who contribute $50 or more will automatically be added to your gift list.
          </Text>
        </View>

        {/* Summary */}
        {giftList.length > 0 && (
          <View style={styles.summaryCard}>
            <View>
              <Text style={styles.summaryLabel}>Total Sponsors</Text>
              <Text style={styles.summaryValue}>{giftList.length}</Text>
            </View>
            {autoAdd && (
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.summaryLabel}>Auto-Added</Text>
                <Text style={[styles.summaryValue, { color: '#4aa0c4' }]}>
                  {giftList.filter(s => s.autoAdded).length}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Filter buttons */}
        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {filterOptions.map(opt => (
              <Pressable
                key={opt.key}
                onPress={() => setAmountFilter(opt.key)}
                style={[styles.filterPill, amountFilter === opt.key && styles.filterPillActive]}
              >
                <Text style={[styles.filterPillText, amountFilter === opt.key && styles.filterPillTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Sponsor list */}
        <View style={styles.sponsorList}>
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🎁</Text>
              <Text style={styles.emptyTitle}>No sponsors on gift list yet</Text>
              <Text style={styles.emptySubtitle}>
                Add donors manually from your donation history or enable auto-add for $50+ donations
              </Text>
            </View>
          ) : (
            filtered.map((sponsor, idx) => (
              <View
                key={sponsor.id}
                style={[styles.sponsorRow, idx < filtered.length - 1 && styles.sponsorRowBorder]}
              >
                <View style={styles.sponsorAvatar}>
                  <Text style={styles.sponsorAvatarEmoji}>👤</Text>
                </View>
                <View style={styles.sponsorInfo}>
                  <View style={styles.sponsorNameRow}>
                    <Text style={styles.sponsorName}>{sponsor.name}</Text>
                    {sponsor.autoAdded && (
                      <View style={styles.autoBadge}>
                        <Text style={styles.autoBadgeText}>AUTO</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.sponsorMeta}>${sponsor.amount} · {sponsor.date}</Text>
                </View>
                <Pressable
                  onPress={() => setGiftList(giftList.filter(s => s.id !== sponsor.id))}
                  style={styles.removeBtn}
                >
                  <Text style={styles.removeBtnText}>✕</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8faf9' },
  headerGradient: { paddingHorizontal: 24, paddingBottom: 24, paddingTop: 12, overflow: 'hidden' },
  decorCircle1: { position: 'absolute', top: 40, right: 40, width: 128, height: 128, borderRadius: 64, backgroundColor: 'rgba(255,255,255,0.1)' },
  decorCircle2: { position: 'absolute', top: -40, left: 40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.05)' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  backBtnText: { fontSize: 28, color: 'white', lineHeight: 36 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  headerIconEmoji: { fontSize: 22 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: 'white' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24 },
  aboutCard: {
    backgroundColor: 'rgba(214,228,245,0.4)', borderRadius: 18, padding: 20,
    marginBottom: 20, borderWidth: 1, borderColor: 'rgba(123,183,209,0.2)', position: 'relative',
  },
  aboutClose: { position: 'absolute', top: 14, right: 14, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center' },
  aboutCloseText: { fontSize: 14, color: 'rgba(29,58,109,0.6)' },
  aboutTitle: { fontSize: 15, fontWeight: '700', color: '#1d3a6d', marginBottom: 6, paddingRight: 24 },
  aboutBody: { fontSize: 13, color: 'rgba(29,58,109,0.7)', lineHeight: 20 },
  autoAddCard: {
    backgroundColor: '#d6e4f5', borderRadius: 20, padding: 20,
    marginBottom: 16, borderWidth: 1, borderColor: 'rgba(123,183,209,0.3)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  autoAddRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  autoAddIconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  autoAddIconEmoji: { fontSize: 22 },
  autoAddText: { flex: 1 },
  autoAddTitle: { fontSize: 16, fontWeight: '700', color: '#1d3a6d' },
  autoAddSubtitle: { fontSize: 13, color: 'rgba(29,58,109,0.7)' },
  toggle: { width: 56, height: 32, borderRadius: 16, backgroundColor: '#D1D5DB', justifyContent: 'center', paddingHorizontal: 4 },
  toggleOn: { backgroundColor: '#4aa0c4' },
  toggleThumb: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 },
  toggleThumbOn: { transform: [{ translateX: 24 }] },
  autoAddDescription: { fontSize: 12, color: 'rgba(29,58,109,0.6)' },
  summaryCard: {
    backgroundColor: 'white', borderRadius: 18, padding: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  summaryLabel: { fontSize: 13, color: '#6B7280', fontWeight: '500', marginBottom: 2 },
  summaryValue: { fontSize: 24, fontWeight: '700', color: '#1d3a6d' },
  filterRow: { marginBottom: 12 },
  filterScroll: { gap: 8 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'white', borderWidth: 1, borderColor: '#E5E7EB' },
  filterPillActive: { backgroundColor: '#4aa0c4', borderColor: '#4aa0c4', shadowColor: '#4aa0c4', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  filterPillText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  filterPillTextActive: { color: 'white' },
  sponsorList: {
    backgroundColor: 'white', borderRadius: 20, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  sponsorRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 20, gap: 16 },
  sponsorRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  sponsorAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(74,160,196,0.15)', alignItems: 'center', justifyContent: 'center' },
  sponsorAvatarEmoji: { fontSize: 22 },
  sponsorInfo: { flex: 1 },
  sponsorNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  sponsorName: { fontSize: 17, fontWeight: '700', color: '#111' },
  autoBadge: { backgroundColor: 'rgba(74,160,196,0.1)', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  autoBadgeText: { fontSize: 10, fontWeight: '700', color: '#4aa0c4' },
  sponsorMeta: { fontSize: 14, color: '#6B7280' },
  removeBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  removeBtnText: { fontSize: 16, color: '#9CA3AF' },
  emptyState: { padding: 48, alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', lineHeight: 20 },
});
