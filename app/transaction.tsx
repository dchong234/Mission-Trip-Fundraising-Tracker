import { useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function Transaction() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [amount, setAmount] = useState('150.00');
  const [thankYouSent, setThankYouSent] = useState(true);
  const [method, setMethod] = useState('Zelle');

  const paymentMethods = ['Zelle', 'Venmo', 'Cash', 'Check', 'Other'];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Donation Details</Text>
        <Pressable style={styles.shareBtn}>
          <Text style={styles.shareBtnText}>↗</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile */}
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>SJ</Text>
            </View>
          </View>
          <Text style={styles.donorName}>Sarah Jenkins</Text>
        </View>

        {/* Amount Card */}
        <View style={styles.amountCard}>
          <Text style={styles.amountCardLabel}>TOTAL CONTRIBUTION</Text>
          {isEditing ? (
            <View style={styles.amountEditRow}>
              <Text style={styles.amountDollarEdit}>$</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
            </View>
          ) : (
            <Text style={styles.amountValue}>
              <Text style={styles.amountDollar}>$</Text>
              {parseFloat(amount).toFixed(2)}
            </Text>
          )}
          {!isEditing && (
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Transaction Complete</Text>
            </View>
          )}
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
              <Text style={styles.detailRowValue}>Oct 24, 2023</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Payment Method */}
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <View style={styles.zelleIcon}>
                <Text style={styles.zelleIconText}>Z</Text>
              </View>
            </View>
            <View style={styles.detailText}>
              <Text style={styles.detailRowLabel}>PAYMENT METHOD</Text>
              {isEditing ? (
                <View style={styles.methodPills}>
                  {paymentMethods.map(m => (
                    <Pressable
                      key={m}
                      onPress={() => setMethod(m)}
                      style={[styles.methodPill, method === m && styles.methodPillActive]}
                    >
                      <Text style={[styles.methodPillText, method === m && styles.methodPillTextActive]}>{m}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <Text style={styles.detailRowValue}>{method} Transfer</Text>
              )}
            </View>
            <View style={styles.methodBadge}>
              <Text style={styles.methodBadgeText}>{method.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Thank You */}
          <Pressable
            style={styles.detailRow}
            onPress={() => isEditing && setThankYouSent(!thankYouSent)}
          >
            <View style={styles.detailIcon}>
              <Text style={styles.detailIconEmoji}>✉️</Text>
            </View>
            <View style={styles.detailText}>
              <Text style={styles.detailRowLabel}>THANK YOU MESSAGE</Text>
              <Text style={[styles.detailRowValue, thankYouSent && { color: '#008F7A' }]}>
                {thankYouSent ? 'Sent' : 'Not Sent'}
              </Text>
            </View>
            {isEditing && <Text style={styles.chevron}>›</Text>}
          </Pressable>
        </View>

        {/* Action buttons */}
        <View style={styles.actionsRow}>
          <Pressable
            onPress={() => router.push('/(tabs)/chat')}
            style={({ pressed }) => [styles.primaryAction, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.primaryActionIcon}>💬</Text>
            <Text style={styles.primaryActionText}>
              {thankYouSent ? 'View Recent' : 'Draft Thank You'}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setIsEditing(!isEditing)}
            style={({ pressed }) => [styles.secondaryAction, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.secondaryActionIcon}>✏️</Text>
            <Text style={styles.secondaryActionText}>{isEditing ? 'Done' : 'Edit'}</Text>
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
  amountEditRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  amountDollarEdit: { fontSize: 32, fontWeight: '700', color: '#6B7280' },
  amountInput: {
    fontSize: 42, fontWeight: '700', color: '#111',
    borderWidth: 2, borderColor: '#4aa0c4', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4, minWidth: 140,
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
  methodPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  methodPill: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12,
    backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB',
  },
  methodPillActive: { backgroundColor: '#4aa0c4', borderColor: '#4aa0c4' },
  methodPillText: { fontSize: 13, fontWeight: '500', color: '#374151' },
  methodPillTextActive: { color: 'white' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 16 },
  chevron: { fontSize: 22, color: '#9CA3AF' },
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
