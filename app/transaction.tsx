import { useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApp } from '../lib/context';

export default function Transaction() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { donations, toggleThankYou, toggleFavorite, removeDonation } = useApp();

  const donation = donations.find(d => d.id === id);

  const [isEditing, setIsEditing] = useState(false);

  if (!donation) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Donation Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 16, color: '#9CA3AF' }}>Donation not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const initials = donation.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const handleDelete = () => {
    removeDonation(donation.id);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Donation Details</Text>
        <Pressable onPress={handleDelete} style={styles.shareBtn}>
          <Text style={styles.shareBtnText}>🗑</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile */}
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </View>
          <Text style={styles.donorName}>{donation.name}</Text>
          {donation.isFavorite && <Text style={{ fontSize: 18, marginTop: 4 }}>❤️</Text>}
        </View>

        {/* Amount Card */}
        <View style={styles.amountCard}>
          <Text style={styles.amountCardLabel}>TOTAL CONTRIBUTION</Text>
          <Text style={styles.amountValue}>
            <Text style={styles.amountDollar}>$</Text>
            {donation.amount.toFixed(2)}
          </Text>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Transaction Complete</Text>
          </View>
        </View>

        {/* Details Card */}
        <View style={styles.detailsCard}>
          {/* Date */}
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Text style={styles.detailIconEmoji}>📅</Text>
            </View>
            <View style={styles.detailText}>
              <Text style={styles.detailRowLabel}>DATE</Text>
              <Text style={styles.detailRowValue}>{donation.date}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Payment Method */}
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <View style={styles.zelleIcon}>
                <Text style={styles.zelleIconText}>{donation.method[0]}</Text>
              </View>
            </View>
            <View style={styles.detailText}>
              <Text style={styles.detailRowLabel}>PAYMENT METHOD</Text>
              <Text style={styles.detailRowValue}>{donation.method} Transfer</Text>
            </View>
            <View style={styles.methodBadge}>
              <Text style={styles.methodBadgeText}>{donation.method.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Thank You */}
          <Pressable
            style={styles.detailRow}
            onPress={() => toggleThankYou(donation.id)}
          >
            <View style={styles.detailIcon}>
              <Text style={styles.detailIconEmoji}>✉️</Text>
            </View>
            <View style={styles.detailText}>
              <Text style={styles.detailRowLabel}>THANK YOU MESSAGE</Text>
              <Text style={[styles.detailRowValue, donation.thankYouSent && { color: '#008F7A' }]}>
                {donation.thankYouSent ? 'Sent ✓' : 'Not Sent — tap to mark'}
              </Text>
            </View>
          </Pressable>

          {donation.comments ? (
            <>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Text style={styles.detailIconEmoji}>📝</Text>
                </View>
                <View style={styles.detailText}>
                  <Text style={styles.detailRowLabel}>NOTES</Text>
                  <Text style={styles.detailRowValue}>{donation.comments}</Text>
                </View>
              </View>
            </>
          ) : null}
        </View>

        {/* Action buttons */}
        <View style={styles.actionsRow}>
          <Pressable
            onPress={() => router.push('/(tabs)/chat')}
            style={({ pressed }) => [styles.primaryAction, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.primaryActionIcon}>💬</Text>
            <Text style={styles.primaryActionText}>
              {donation.thankYouSent ? 'View Recent' : 'Draft Thank You'}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => toggleFavorite(donation.id)}
            style={({ pressed }) => [styles.secondaryAction, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.secondaryActionIcon}>{donation.isFavorite ? '❤️' : '🤍'}</Text>
            <Text style={styles.secondaryActionText}>{donation.isFavorite ? 'Favorited' : 'Favorite'}</Text>
          </Pressable>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7F6' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12, backgroundColor: 'white',
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontSize: 28, color: '#111', lineHeight: 36 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  shareBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6' },
  shareBtnText: { fontSize: 18, color: '#111' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },
  profileSection: { alignItems: 'center', paddingVertical: 24, backgroundColor: 'white', marginBottom: 0, marginHorizontal: -20, paddingHorizontal: 20 },
  avatarWrapper: { marginBottom: 12 },
  avatar: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: '#d6e4f5', borderWidth: 4, borderColor: '#287AB8',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 28, fontWeight: '700', color: '#287AB8' },
  donorName: { fontSize: 26, fontWeight: '700', color: '#111' },
  amountCard: {
    backgroundColor: 'white', borderRadius: 24, padding: 32, marginTop: 16,
    alignItems: 'center', marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  amountCardLabel: {
    fontSize: 13, fontWeight: '600', color: '#9CA3AF',
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12,
  },
  amountValue: { fontSize: 42, fontWeight: '700', color: '#111', marginBottom: 16 },
  amountDollar: { color: '#6B7280' },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#D1FAE5', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10,
  },
  statusDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#008F7A' },
  statusText: { fontSize: 14, fontWeight: '700', color: '#008F7A' },
  detailsCard: {
    backgroundColor: 'white', borderRadius: 24, padding: 24, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  detailIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#D1FAE5', alignItems: 'center', justifyContent: 'center' },
  detailIconEmoji: { fontSize: 22 },
  zelleIcon: {
    width: 28, height: 28, borderRadius: 6,
    backgroundColor: '#008F7A', alignItems: 'center', justifyContent: 'center',
  },
  zelleIconText: { fontSize: 14, fontWeight: '700', color: 'white' },
  detailText: { flex: 1 },
  detailRowLabel: { fontSize: 12, fontWeight: '600', color: '#9CA3AF', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 2 },
  detailRowValue: { fontSize: 16, fontWeight: '700', color: '#111' },
  methodBadge: { backgroundColor: '#F3F4F6', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6 },
  methodBadgeText: { fontSize: 11, fontWeight: '700', color: '#111', letterSpacing: 0.5 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 16 },
  actionsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  primaryAction: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#008F7A', borderRadius: 14, paddingVertical: 14,
  },
  primaryActionIcon: { fontSize: 16 },
  primaryActionText: { fontSize: 15, fontWeight: '600', color: 'white' },
  secondaryAction: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: 'white', borderRadius: 14, paddingVertical: 14,
    borderWidth: 2, borderColor: '#E5E7EB',
  },
  secondaryActionIcon: { fontSize: 16 },
  secondaryActionText: { fontSize: 15, fontWeight: '600', color: '#111' },
});
