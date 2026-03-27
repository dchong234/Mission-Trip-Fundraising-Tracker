import { useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView,
  TextInput, Modal, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

type FilterType = 'none' | 'a-z' | 'amount' | 'date' | 'thankYou' | 'favorites';

const donations = [
  {
    id: 1, name: 'Sarah Jenkins', date: 'Oct 13', method: 'ZELLE',
    amount: 50, thankYouSent: true, hasPhoto: false, month: 'october',
    dateSort: new Date('2024-10-13'), isFavorite: true,
    initials: 'SJ', avatarColor: '#d6e4f5', textColor: '#4aa0c4',
  },
  {
    id: 2, name: 'TechCorp Industries', date: 'Oct 22', method: 'WIRE TRANSFER',
    amount: 1200, thankYouSent: true, hasPhoto: false, month: 'october',
    dateSort: new Date('2024-10-22'), isFavorite: false,
    initials: '🏢', avatarColor: '#d6e4f5', textColor: '#4aa0c4', isOrg: true,
  },
  {
    id: 3, name: 'Michael Chen', date: 'Oct 20', method: 'CASH',
    amount: 25, thankYouSent: true, hasPhoto: false, month: 'october',
    dateSort: new Date('2024-10-20'), isFavorite: false,
    initials: 'MC', avatarColor: '#e0f0f8', textColor: '#287AB8',
  },
  {
    id: 4, name: 'Alex Rivera', date: 'Sep 30', method: 'VENMO',
    amount: 150, thankYouSent: true, hasPhoto: false, month: 'september',
    dateSort: new Date('2024-09-30'), isFavorite: true,
    initials: 'AR', avatarColor: '#E8F5F3', textColor: '#008F7A',
  },
];

export default function History() {
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('none');

  const getFilteredDonations = () => {
    let filtered = [...donations];
    if (searchQuery) {
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    switch (activeFilter) {
      case 'a-z':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'amount':
        filtered.sort((a, b) => b.amount - a.amount);
        break;
      case 'date':
        filtered.sort((a, b) => b.dateSort.getTime() - a.dateSort.getTime());
        break;
      case 'thankYou':
        filtered = filtered.filter(d => d.thankYouSent);
        break;
      case 'favorites':
        filtered = filtered.filter(d => d.isFavorite);
        break;
    }
    return filtered;
  };

  const filteredDonations = getFilteredDonations();
  const total = filteredDonations.reduce((sum, d) => sum + d.amount, 0);
  const octoberDonations = filteredDonations.filter(d => d.month === 'october');
  const septemberDonations = filteredDonations.filter(d => d.month === 'september');

  const filterOptions: { key: FilterType; label: string; icon: string }[] = [
    { key: 'none', label: 'All Donations', icon: '⚙️' },
    { key: 'a-z', label: 'A–Z', icon: '🔤' },
    { key: 'amount', label: 'By Amount', icon: '💵' },
    { key: 'date', label: 'By Date', icon: '📅' },
    { key: 'thankYou', label: 'Thank You Sent', icon: '✉️' },
    { key: 'favorites', label: 'Favorites', icon: '❤️' },
  ];

  const DonationCard = ({ donation }: { donation: typeof donations[0] }) => (
    <Pressable
      onPress={() => router.push('/transaction')}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: donation.avatarColor }]}>
        {donation.isOrg ? (
          <Text style={styles.avatarEmoji}>🏢</Text>
        ) : (
          <Text style={[styles.avatarInitials, { color: donation.textColor }]}>
            {donation.initials}
          </Text>
        )}
      </View>

      {/* Info */}
      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={1}>{donation.name}</Text>
        <View style={styles.cardMeta}>
          <Text style={styles.cardDate}>{donation.date}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.cardMethod}>{donation.method}</Text>
        </View>
        {donation.thankYouSent && (
          <View style={styles.thankYouRow}>
            <Text style={styles.checkIcon}>✓</Text>
            <Text style={styles.thankYouText}>Thank You Sent</Text>
          </View>
        )}
      </View>

      {/* Amount + chevron */}
      <View style={styles.cardRight}>
        <View style={styles.amountBadge}>
          <Text style={styles.amountText}>+${donation.amount.toLocaleString()}.00</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        {isSearching ? (
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search donations..."
              placeholderTextColor="#9CA3AF"
              autoFocus
            />
            <Pressable onPress={() => { setIsSearching(false); setSearchQuery(''); }}>
              <Text style={styles.clearSearch}>✕</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.headerLeft} />
            <View style={styles.headerActions}>
              <Pressable onPress={() => setIsSearching(true)} style={styles.iconBtn}>
                <Text style={styles.iconBtnText}>🔍</Text>
              </Pressable>
              <Pressable onPress={() => setShowFilterMenu(true)} style={styles.iconBtn}>
                <Text style={styles.iconBtnText}>⚙️</Text>
              </Pressable>
            </View>
          </>
        )}
      </View>

      {/* Title */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>Recent Donations</Text>
        <Text style={styles.subtitle}>
          {activeFilter === 'none' ? 'Showing impact for October' : `Filtered: ${filterOptions.find(f => f.key === activeFilter)?.label}`}
        </Text>
      </View>

      {/* Donations List */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {octoberDonations.length > 0 && (
          <>
            <Text style={styles.monthLabel}>October 2024</Text>
            {octoberDonations.map(d => <DonationCard key={d.id} donation={d} />)}
          </>
        )}

        {septemberDonations.length > 0 && (
          <>
            <Text style={styles.monthLabel}>September 2024</Text>
            {septemberDonations.map(d => <DonationCard key={d.id} donation={d} />)}
          </>
        )}

        {filteredDonations.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>No donations found</Text>
          </View>
        )}

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* Total Footer */}
      <View style={styles.totalFooter}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalAmount}>${total.toLocaleString()}.00</Text>
      </View>

      {/* Filter Menu Modal */}
      <Modal
        visible={showFilterMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFilterMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterMenu(false)}
        >
          <View style={styles.filterMenu}>
            {filterOptions.map(opt => (
              <Pressable
                key={opt.key}
                onPress={() => { setActiveFilter(opt.key); setShowFilterMenu(false); }}
                style={[styles.filterOption, activeFilter === opt.key && styles.filterOptionActive]}
              >
                <Text style={styles.filterIcon}>{opt.icon}</Text>
                <Text style={[styles.filterLabel, activeFilter === opt.key && styles.filterLabelActive]}>
                  {opt.label}
                </Text>
                {activeFilter === opt.key && <Text style={styles.filterCheck}>✓</Text>}
              </Pressable>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7F6' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  headerLeft: { width: 40 },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  iconBtnText: { fontSize: 18 },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1, borderColor: '#D1D5DB',
    borderRadius: 24, paddingHorizontal: 14, paddingVertical: 8,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: '#111' },
  clearSearch: { fontSize: 16, color: '#9CA3AF', paddingLeft: 8 },
  titleSection: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 20, backgroundColor: 'white' },
  title: { fontSize: 32, fontWeight: '700', color: '#111', letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: '#6B7280', marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  monthLabel: {
    fontSize: 13, fontWeight: '700', color: '#9CA3AF',
    textTransform: 'uppercase', letterSpacing: 1,
    textAlign: 'center', marginBottom: 12, marginTop: 4,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardPressed: { opacity: 0.85 },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  avatarInitials: { fontSize: 16, fontWeight: '700' },
  avatarEmoji: { fontSize: 22 },
  cardInfo: { flex: 1, minWidth: 0 },
  cardName: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 2 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  cardDate: { fontSize: 13, color: '#6B7280' },
  dot: { fontSize: 13, color: '#D1D5DB' },
  cardMethod: { fontSize: 13, fontWeight: '600', color: '#374151' },
  thankYouRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  checkIcon: { fontSize: 12, color: '#008F7A', fontWeight: '700' },
  thankYouText: { fontSize: 12, fontWeight: '600', color: '#008F7A' },
  cardRight: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0 },
  amountBadge: {
    backgroundColor: '#D1FAE5', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  amountText: { fontSize: 14, fontWeight: '700', color: '#008F7A' },
  chevron: { fontSize: 22, color: '#9CA3AF', lineHeight: 24 },
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#9CA3AF' },
  totalFooter: {
    backgroundColor: '#E8F5F3',
    paddingHorizontal: 24, paddingVertical: 14,
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1, borderTopColor: 'rgba(0,143,122,0.1)',
  },
  totalLabel: { fontSize: 18, fontWeight: '600', color: '#374151' },
  totalAmount: { fontSize: 24, fontWeight: '700', color: '#111' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start', alignItems: 'flex-end',
    paddingTop: 120, paddingRight: 20,
  },
  filterMenu: {
    backgroundColor: 'white', borderRadius: 16,
    minWidth: 220, paddingVertical: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12, shadowRadius: 24, elevation: 12,
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  filterOption: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, gap: 12,
  },
  filterOptionActive: { backgroundColor: '#E8F5F3' },
  filterIcon: { fontSize: 16 },
  filterLabel: { flex: 1, fontSize: 15, color: '#374151' },
  filterLabelActive: { color: '#008F7A', fontWeight: '600' },
  filterCheck: { fontSize: 14, color: '#008F7A', fontWeight: '700' },
});
