import { useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const paymentMethods = [
  { id: 'zelle', label: 'Zelle', emoji: '⚡' },
  { id: 'venmo', label: 'Venmo', emoji: '💸' },
  { id: 'cash', label: 'Cash', emoji: '💵' },
  { id: 'check', label: 'Check', emoji: '✍️' },
  { id: 'other', label: 'Other', emoji: '💳' },
];

function formatAmount(cents: string): string {
  const padded = cents.padStart(3, '0');
  const dollars = padded.slice(0, -2) || '0';
  const centsOnly = padded.slice(-2);
  return `${dollars}.${centsOnly}`;
}

export default function AddDonation() {
  const router = useRouter();
  const [amountCents, setAmountCents] = useState('0');
  const [donorName, setDonorName] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('zelle');
  const [addToSponsor, setAddToSponsor] = useState(false);
  const [comments, setComments] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleDigit = (digit: string) => {
    if (digit === 'DEL') {
      const newCents = amountCents.slice(0, -1);
      setAmountCents(newCents || '0');
    } else {
      const newCents = amountCents === '0' ? digit : amountCents + digit;
      if (newCents.length <= 9) setAmountCents(newCents);
    }
  };

  const displayAmount = formatAmount(amountCents);
  const selectedMethodObj = paymentMethods.find(m => m.id === selectedMethod);

  if (showConfirmation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.confirmSheet}>
          {/* Close */}
          <Pressable onPress={() => router.back()} style={styles.confirmClose}>
            <Text style={styles.confirmCloseIcon}>✕</Text>
          </Pressable>

          {/* Success icon */}
          <View style={styles.successRing}>
            <View style={styles.successCircle}>
              <Text style={styles.successCheck}>✓</Text>
            </View>
          </View>

          <Text style={styles.confirmTitle}>Donation Saved!</Text>
          <Text style={styles.confirmSubtitle}>
            Thank you for your stewardship and commitment to the mission.
          </Text>

          {/* Details */}
          <View style={styles.confirmDetails}>
            <View style={styles.confirmRow}>
              <Text style={styles.confirmRowLabel}>DONOR</Text>
              <Text style={styles.confirmRowValue}>{donorName || 'Anonymous'}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={styles.confirmRowLabel}>AMOUNT</Text>
              <Text style={[styles.confirmRowValue, { color: '#4aa0c4', fontSize: 22 }]}>${displayAmount}</Text>
            </View>
            <View style={[styles.confirmRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.confirmRowLabel}>PAYMENT METHOD</Text>
              <Text style={styles.confirmRowValue}>{selectedMethodObj?.label}</Text>
            </View>
          </View>

          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.doneBtn, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.doneBtnText}>Done</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Handle bar */}
        <View style={styles.handleBar} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Record Donation</Text>
          <Pressable onPress={() => router.back()} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Amount display */}
          <View style={styles.amountSection}>
            <Text style={styles.amountLabel}>GIFT AMOUNT</Text>
            <View style={styles.amountDisplay}>
              <Text style={styles.dollarSign}>$</Text>
              <Text style={styles.amountValue}>{displayAmount}</Text>
            </View>
          </View>

          {/* Numpad */}
          <View style={styles.numpad}>
            {[['1','2','3'],['4','5','6'],['7','8','9'],['','0','DEL']].map((row, ri) => (
              <View key={ri} style={styles.numpadRow}>
                {row.map((key, ki) => (
                  <Pressable
                    key={ki}
                    onPress={() => key && handleDigit(key)}
                    style={({ pressed }) => [
                      styles.numpadKey,
                      key === 'DEL' && styles.numpadKeyDel,
                      !key && styles.numpadKeyEmpty,
                      pressed && key && styles.numpadKeyPressed,
                    ]}
                  >
                    <Text style={[styles.numpadKeyText, key === 'DEL' && styles.numpadKeyDelText]}>
                      {key === 'DEL' ? '⌫' : key}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ))}
          </View>

          {/* Donor */}
          <Text style={styles.fieldLabel}>DONOR</Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputIcon}>👤</Text>
            <TextInput
              style={styles.textInput}
              value={donorName}
              onChangeText={setDonorName}
              placeholder="Who is this donation from?"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Payment Method */}
          <Text style={styles.fieldLabel}>PAYMENT METHOD</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.methodsScroll}
          >
            {paymentMethods.map((method) => (
              <Pressable
                key={method.id}
                onPress={() => setSelectedMethod(method.id)}
                style={[styles.methodPill, selectedMethod === method.id && styles.methodPillActive]}
              >
                <Text style={styles.methodEmoji}>{method.emoji}</Text>
                <Text style={[styles.methodLabel, selectedMethod === method.id && styles.methodLabelActive]}>
                  {method.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Comments */}
          <Text style={styles.fieldLabel}>ADDITIONAL COMMENTS (OPTIONAL)</Text>
          <TextInput
            style={styles.commentsInput}
            value={comments}
            onChangeText={setComments}
            placeholder="Add any notes or details about this donation..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
          />

          {/* Sponsor Gift List toggle */}
          <Pressable
            onPress={() => setAddToSponsor(!addToSponsor)}
            style={[styles.sponsorToggle, addToSponsor && styles.sponsorToggleActive]}
          >
            <Text style={[styles.sponsorHeart, addToSponsor && { color: '#4aa0c4' }]}>
              {addToSponsor ? '♥' : '♡'}
            </Text>
            <Text style={[styles.sponsorLabel, addToSponsor && styles.sponsorLabelActive]}>
              {addToSponsor ? 'Added to Sponsor Gift List' : 'Add to Sponsor Gift List'}
            </Text>
          </Pressable>

          {/* Save */}
          <Pressable
            onPress={() => setShowConfirmation(true)}
            style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.saveBtnCheck}>✓</Text>
            <Text style={styles.saveBtnText}>Save Transaction</Text>
          </Pressable>

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  handleBar: {
    width: 48, height: 4, backgroundColor: '#D1D5DB',
    borderRadius: 2, alignSelf: 'center', marginTop: 8, marginBottom: 16,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingBottom: 20,
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#101828' },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6',
  },
  closeBtnText: { fontSize: 16, color: '#6B7280' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24 },
  amountSection: { alignItems: 'center', marginBottom: 24 },
  amountLabel: {
    fontSize: 11, fontWeight: '600', color: '#6a7282',
    letterSpacing: 0.55, textTransform: 'uppercase', marginBottom: 8,
  },
  amountDisplay: { flexDirection: 'row', alignItems: 'flex-end' },
  dollarSign: { fontSize: 36, fontWeight: '700', color: '#1d3a6d', lineHeight: 56, marginRight: 4 },
  amountValue: { fontSize: 56, fontWeight: '700', color: '#1d3a6d', lineHeight: 68 },
  numpad: { marginBottom: 28 },
  numpadRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 12 },
  numpadKey: {
    width: 88, height: 56, borderRadius: 14,
    backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  numpadKeyDel: { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' },
  numpadKeyEmpty: { backgroundColor: 'transparent', borderColor: 'transparent' },
  numpadKeyPressed: { backgroundColor: '#E5E7EB' },
  numpadKeyText: { fontSize: 22, fontWeight: '500', color: '#374151' },
  numpadKeyDelText: { fontSize: 22, color: '#EF4444' },
  fieldLabel: {
    fontSize: 11, fontWeight: '600', color: '#6a7282',
    letterSpacing: 0.55, textTransform: 'uppercase', marginBottom: 10, marginTop: 4,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#F9FAFB', borderRadius: 14, paddingHorizontal: 17, paddingVertical: 17,
    borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 20,
  },
  inputIcon: { fontSize: 18 },
  textInput: { flex: 1, fontSize: 16, color: '#101828' },
  methodsScroll: { paddingBottom: 8, gap: 10, marginBottom: 8 },
  methodPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24,
    backgroundColor: '#F3F4F6', borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  methodPillActive: {
    backgroundColor: '#4aa0c4', borderColor: '#4aa0c4',
    shadowColor: '#4aa0c4', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6,
    elevation: 4,
  },
  methodEmoji: { fontSize: 16 },
  methodLabel: { fontSize: 15, fontWeight: '600', color: '#364153' },
  methodLabelActive: { color: 'white' },
  commentsInput: {
    backgroundColor: '#F9FAFB', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 16,
    borderWidth: 1, borderColor: '#E5E7EB', fontSize: 16, color: '#101828',
    textAlignVertical: 'top', minHeight: 88, marginBottom: 20,
  },
  sponsorToggle: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 2, borderStyle: 'dashed', borderColor: '#D1D5DB',
    borderRadius: 14, paddingVertical: 16, marginBottom: 20,
  },
  sponsorToggleActive: {
    backgroundColor: '#d6e4f5', borderStyle: 'solid', borderColor: '#4aa0c4',
  },
  sponsorHeart: { fontSize: 20, color: '#9CA3AF' },
  sponsorLabel: { fontSize: 15, fontWeight: '600', color: '#4a5565' },
  sponsorLabelActive: { color: '#1d3a6d' },
  saveBtn: {
    backgroundColor: '#4aa0c4', borderRadius: 14, paddingVertical: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: '#4aa0c4', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12,
    elevation: 6,
  },
  saveBtnCheck: { fontSize: 20, color: 'white' },
  saveBtnText: { fontSize: 18, fontWeight: '600', color: 'white' },
  // Confirmation screen
  confirmSheet: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24,
    backgroundColor: 'white',
  },
  confirmClose: {
    position: 'absolute', top: 24, right: 24,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center',
  },
  confirmCloseIcon: { fontSize: 16, color: '#6B7280' },
  successRing: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(74,160,196,0.15)', alignItems: 'center', justifyContent: 'center',
    marginBottom: 28,
  },
  successCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: '#4aa0c4', alignItems: 'center', justifyContent: 'center',
  },
  successCheck: { fontSize: 44, color: 'white', fontWeight: '700' },
  confirmTitle: { fontSize: 28, fontWeight: '700', color: '#111', marginBottom: 8 },
  confirmSubtitle: {
    fontSize: 15, color: '#6B7280', textAlign: 'center',
    lineHeight: 22, marginBottom: 32, maxWidth: 280,
  },
  confirmDetails: {
    width: '100%', backgroundColor: '#F9FAFB', borderRadius: 16, padding: 20, marginBottom: 28,
  },
  confirmRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  confirmRowLabel: { fontSize: 11, fontWeight: '600', color: '#9CA3AF', letterSpacing: 0.5 },
  confirmRowValue: { fontSize: 16, fontWeight: '600', color: '#111' },
  doneBtn: {
    width: '100%', backgroundColor: '#4aa0c4', borderRadius: 14, paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#4aa0c4', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
    elevation: 4,
  },
  doneBtnText: { fontSize: 18, fontWeight: '600', color: 'white' },
});
