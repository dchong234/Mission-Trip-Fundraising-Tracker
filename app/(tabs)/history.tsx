import { useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView,
  TextInput, Modal, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApp, Donation } from '../../lib/context';

type FilterType = 'none' | 'a-z' | 'amount' | 'date' | 'thankYou' | 'favorites';

export default function History() {
  const router = useRouter();
  const { donations } = useApp();
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
      case 'a-z': filtered.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'amount': filtered.sort((a, b) => b.amount - a.amount); break;
      case 'date': filtered.sort((a, b) => parseInt(b.id) - parseInt(a.id)); break;
      case 'thankYou': filtered = filtered.filter(d => d.thankYouSent); break;
      case 'favorites': filtered = filtered.filter(d => d.isFavorite); break;
    }
    return filtered;
  };

  const filteredDonations = getFilteredDonations();
  const total = filteredDonations.reduce((sum, d) => sum + d.amount, 0);

  const filterOptions: { key: FilterType; label: string; icon: string }[] = [
    { key: 'none', label: 'All Donations', icon: '⚙️' },
    { key: 'a-z', label: 'A–Z', icon: '🔤' },
    { key: 'amount', label: 'By Amount', icon: '💵' },
    { key: 'date', label: 'By Date', icon: '📅' },
    { key: 'thankYou', label: 'Thank You Sent', icon: '✉️' },
    { key: 'favorites', label: 'Favorites', icon: '❤️' },
  ];

  const DonationCard = ({ donation }: { donation: Donation }) => (
    <Pressable
      onPress={() => router.push({ pathname: '/transaction', params: { id: donation.id } })}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={[styles.avatar, { backgroundColor: '#d6e4f5' }]}>
        <Text style={[styles.avatarInitials, { color: '#4aa0c4' }]}>
          {donation.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
        </Text>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={1}>{donation.name}</Text>
        <View style={styles.cardMeta}>
          <Text style={styles.cardDate}>{donation.date}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.cardMethod}>{donation.method.toUpperCase()}</Text>
        </View>
        {donation.thankYouSent && (
          <View style={styles.thankYouRow}>
            <Text style={styles.checkIcon}>✓</Text>
            <Text style={styles.thankYouText}>Thank You Sent</Text>
          </View>
        )}
      </View>
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
          {activeFilter === 'none'
            ? `${filteredDonations.length} donation${filteredDonations.length !== 1 ? 's' : ''} total`
            : `Filtered: ${filterOptions.find(f => f.key === activeFilter)?.label}`}
        </Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredDonations.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎁</Text>
            <Text style={styles.emptyText}>No donations yet</Text>
            <Text style={styles.emptySubtext}>Tap + to record your first donation</Text>
          </View>
        ) : (
          filteredDonations.map(d => <DonationCard key={d.id} donation={d} />)
        )}
        <View style={{ height: 16 }} />
      </ScrollView>

      {/* Total Footer */}
      <View style={styles.totalFooter}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalAmount}>${total.toLocaleString()}.00</Text>
      </View>

      {/* Filter Modal */}
      <Modal visible={showFilterMenu} transparent animationType="fade" onRequestClose={() => setShowFilterMenu(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowFilterMenu(false)}>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: 'white' },
  headerLeft: { width: 40 },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB' },
  iconBtnText: { fontSize: 18 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 24, paddingHorizontal: 14, paddingVertical: 8 },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: '#111' },
  clearSearch: { fontSize: 16, color: '#9CA3AF', paddingLeft: 8 },
  titleSection: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 20, backgroundColor: 'white' },
  title: { fontSize: 32, fontWeight: '700', color: '#111', letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: '#6B7280', marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  card: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardPressed: { opacity: 0.85 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarInitials: { fontSize: 16, fontWeight: '700' },
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
  amountBadge: { backgroundColor: '#D1FAE5', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 },
  amountText: { fontSize: 14, fontWeight: '700', color: '#008F7A' },
  chevron: { fontSize: 22, color: '#9CA3AF', lineHeight: 24 },
  emptyState: { alignItems: 'center', paddingVertical: 64 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 4 },
  emptySubtext: { fontSize: 14, color: '#9CA3AF' },
  totalFooter: { backgroundColor: '#E8F5F3', paddingHorizontal: 24, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(0,143,122,0.1)' },
  totalLabel: { fontSize: 18, fontWeight: '600', color: '#374151' },
  totalAmount: { fontSize: 24, fontWeight: '700', color: '#111' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 120, paddingRight: 20 },
  filterMenu: { backgroundColor: 'white', borderRadius: 16, minWidth: 220, paddingVertical: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 24, elevation: 12, borderWidth: 1, borderColor: '#F3F4F6' },
  filterOption: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  filterOptionActive: { backgroundColor: '#E8F5F3' },
  filterIcon: { fontSize: 16 },
  filterLabel: { flex: 1, fontSize: 15, color: '#374151' },
  filterLabelActive: { color: '#008F7A', fontWeight: '600' },
  filterCheck: { fontSize: 14, color: '#008F7A', fontWeight: '700' },
});
