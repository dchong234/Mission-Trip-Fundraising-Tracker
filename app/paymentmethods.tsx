import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const initialMethods = [
  { id: '1', type: 'Zelle', icon: '💳', info: 'jordan.smith@email.com', isPrimary: true },
  { id: '2', type: 'Venmo', icon: '📱', info: '@jordansmith', isPrimary: false },
  { id: '3', type: 'Cash App', icon: '💵', info: '$JordanSmith', isPrimary: false },
];

export default function PaymentMethods() {
  const router = useRouter();
  const [methods, setMethods] = useState(initialMethods);

  const handleSetPrimary = (id: string) => {
    setMethods(methods.map(m => ({ ...m, isPrimary: m.id === id })));
  };

  const handleRemove = (id: string) => {
    setMethods(methods.filter(m => m.id !== id));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#3C5E55', '#008F7A', '#287AB8']}
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
            <Text style={styles.headerIconEmoji}>💳</Text>
          </View>
          <Text style={styles.headerTitle}>Payment Methods</Text>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Add New */}
        <Pressable style={({ pressed }) => [styles.addCard, pressed && { opacity: 0.85 }]}>
          <View style={styles.addCardIcon}>
            <Text style={styles.addCardIconText}>+</Text>
          </View>
          <Text style={styles.addCardText}>Add Payment Method</Text>
        </Pressable>

        {/* Methods list */}
        <Text style={styles.sectionHeader}>YOUR PAYMENT METHODS</Text>
        {methods.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💳</Text>
            <Text style={styles.emptyTitle}>No payment methods yet</Text>
            <Text style={styles.emptySubtitle}>Add a payment method to start receiving donations</Text>
          </View>
        ) : (
          methods.map(method => (
            <View key={method.id} style={styles.methodCard}>
              <View style={styles.methodCardHeader}>
                <View style={styles.methodIcon}>
                  <Text style={styles.methodIconEmoji}>{method.icon}</Text>
                </View>
                <View style={styles.methodInfo}>
                  <View style={styles.methodNameRow}>
                    <Text style={styles.methodType}>{method.type}</Text>
                    {method.isPrimary && (
                      <View style={styles.primaryBadge}>
                        <Text style={styles.primaryBadgeText}>PRIMARY</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.methodDetail}>{method.info}</Text>
                </View>
                <Pressable onPress={() => handleRemove(method.id)} style={styles.removeBtn}>
                  <Text style={styles.removeBtnText}>✕</Text>
                </Pressable>
              </View>
              {!method.isPrimary && (
                <Pressable onPress={() => handleSetPrimary(method.id)} style={styles.setPrimaryBtn}>
                  <Text style={styles.setPrimaryBtnText}>Set as Primary</Text>
                </Pressable>
              )}
            </View>
          ))
        )}

        {/* Info cards */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>About Payment Methods</Text>
          <Text style={styles.infoBody}>
            Add multiple ways for supporters to send you donations. Your primary method will be featured prominently on your fundraising page.
          </Text>
        </View>

        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>🔒 Security Notice</Text>
          <Text style={styles.warningBody}>
            Never share passwords or login credentials. Only add payment information you're comfortable sharing publicly.
          </Text>
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
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  backBtnText: { fontSize: 28, color: 'white', lineHeight: 36 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  headerIconEmoji: { fontSize: 22 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: 'white' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24 },
  addCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    backgroundColor: '#4aa0c4', borderRadius: 16, padding: 16, marginBottom: 24,
    shadowColor: '#4aa0c4', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  addCardIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  addCardIconText: { fontSize: 22, color: '#4aa0c4', fontWeight: '700' },
  addCardText: { fontSize: 17, fontWeight: '700', color: 'white' },
  sectionHeader: { fontSize: 14, fontWeight: '600', color: '#6B7280', letterSpacing: 0.5, marginBottom: 12, paddingLeft: 4 },
  emptyState: {
    backgroundColor: 'white', borderRadius: 20, padding: 48, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    marginBottom: 20,
  },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: '#9CA3AF', textAlign: 'center' },
  methodCard: {
    backgroundColor: 'white', borderRadius: 18, padding: 20, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  methodCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 0 },
  methodIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(74,160,196,0.1)', alignItems: 'center', justifyContent: 'center' },
  methodIconEmoji: { fontSize: 22 },
  methodInfo: { flex: 1 },
  methodNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  methodType: { fontSize: 17, fontWeight: '700', color: '#111' },
  primaryBadge: { backgroundColor: 'rgba(74,160,196,0.1)', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  primaryBadgeText: { fontSize: 10, fontWeight: '700', color: '#4aa0c4' },
  methodDetail: { fontSize: 14, color: '#6B7280' },
  removeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  removeBtnText: { fontSize: 16, color: '#9CA3AF' },
  setPrimaryBtn: {
    backgroundColor: 'rgba(74,160,196,0.1)', borderRadius: 10, paddingVertical: 10,
    alignItems: 'center', marginTop: 12,
  },
  setPrimaryBtnText: { fontSize: 14, fontWeight: '600', color: '#4aa0c4' },
  infoCard: {
    backgroundColor: 'rgba(214,228,245,0.4)', borderRadius: 18, padding: 20, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(123,183,209,0.2)',
  },
  infoTitle: { fontSize: 15, fontWeight: '700', color: '#1d3a6d', marginBottom: 6 },
  infoBody: { fontSize: 13, color: 'rgba(29,58,109,0.7)', lineHeight: 20 },
  warningCard: {
    backgroundColor: 'rgba(255,244,229,0.6)', borderRadius: 18, padding: 20, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)',
  },
  warningTitle: { fontSize: 15, fontWeight: '700', color: '#B45309', marginBottom: 6 },
  warningBody: { fontSize: 13, color: 'rgba(180,83,9,0.7)', lineHeight: 20 },
});
