import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

function SettingsRow({
  icon, label, subtitle, onPress, isLast = false,
}: {
  icon: string; label: string; subtitle?: string;
  onPress?: () => void; isLast?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingsRow,
        !isLast && styles.settingsRowBorder,
        pressed && { backgroundColor: '#F9FAFB' },
      ]}
    >
      <View style={styles.settingsIcon}>
        <Text style={styles.settingsIconEmoji}>{icon}</Text>
      </View>
      <View style={styles.settingsText}>
        <Text style={styles.settingsLabel}>{label}</Text>
        {subtitle && <Text style={styles.settingsSubtitle}>{subtitle}</Text>}
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

export default function Profile() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <LinearGradient
          colors={['#3C5E55', '#008F7A', '#287AB8']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          {/* Decorative circles */}
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />
          <Text style={styles.headerTitle}>Jordan's Profile</Text>
        </LinearGradient>

        {/* Profile picture */}
        <View style={styles.profilePicSection}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarEmoji}>👤</Text>
            </View>
            <Pressable style={styles.editAvatarBtn}>
              <Text style={styles.editAvatarIcon}>✏️</Text>
            </Pressable>
          </View>
          <Text style={styles.profileName}>Jordan Smith</Text>
          <View style={styles.locationRow}>
            <Text style={styles.countryFlag}>🇭🇳</Text>
            <Text style={styles.locationText}>Honduras</Text>
          </View>
        </View>

        {/* Stats cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statHeaderLabel}>TOTAL RAISED</Text>
              <Text style={styles.statHeaderIcon}>📈</Text>
            </View>
            <Text style={styles.statValue}>$18,750</Text>
            <Text style={styles.statSub}>+12% from goal</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statHeaderLabel}>DAYS TO TRIP</Text>
              <Text style={styles.statHeaderIcon}>✈️</Text>
            </View>
            <Text style={styles.statValue}>47</Text>
            <View style={styles.progressBarBg}>
              <LinearGradient
                colors={['#008F7A', '#287AB8']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[styles.progressBarFill, { width: '65%' }]}
              />
            </View>
          </View>
        </View>

        {/* Sponsor Gift List */}
        <View style={styles.section}>
          <Pressable
            onPress={() => router.push('/giftlist')}
            style={({ pressed }) => [styles.giftListCard, pressed && { opacity: 0.9 }]}
          >
            <View style={styles.giftListIcon}>
              <Text style={styles.giftListIconEmoji}>🎁</Text>
            </View>
            <View style={styles.giftListText}>
              <Text style={styles.giftListTitle}>Sponsor Gift List</Text>
              <Text style={styles.giftListSubtitle}>Track donors for thank-you gifts</Text>
            </View>
            <Text style={[styles.chevron, { color: '#1d3a6d' }]}>›</Text>
          </Pressable>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>ACCOUNT SETTINGS</Text>
          <View style={styles.settingsCard}>
            <SettingsRow
              icon="🔔" label="Notification Alerts"
              subtitle="Donation and trip updates"
              onPress={() => router.push('/notifications')}
            />
            <SettingsRow
              icon="🎯" label="Goal Tracking"
              subtitle="Manage milestones and targets"
              onPress={() => router.push('/goaltracking')}
              isLast
            />
          </View>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>APP SETTINGS</Text>
          <View style={styles.settingsCard}>
            <SettingsRow icon="👤" label="Personal Information" />
            <SettingsRow
              icon="💳" label="Payment Methods"
              onPress={() => router.push('/paymentmethods')}
            />
            <SettingsRow icon="❓" label="Help & Support" isLast />
          </View>
        </View>

        {/* Log Out */}
        <View style={[styles.section, { marginBottom: 32 }]}>
          <Pressable
            style={({ pressed }) => [styles.logoutBtn, pressed && { backgroundColor: '#FEE2E2' }]}
          >
            <Text style={styles.logoutIcon}>👋</Text>
            <Text style={styles.logoutText}>Log Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8faf9' },
  scrollContent: { paddingBottom: 16 },
  headerGradient: {
    height: 180, alignItems: 'center', justifyContent: 'center',
    borderBottomLeftRadius: 12, borderBottomRightRadius: 12,
    overflow: 'hidden', position: 'relative',
  },
  decorCircle1: {
    position: 'absolute', top: 40, right: 40,
    width: 128, height: 128, borderRadius: 64,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  decorCircle2: {
    position: 'absolute', top: -40, left: 40,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: { fontSize: 28, fontWeight: '700', color: 'white', zIndex: 1 },
  profilePicSection: {
    alignItems: 'center', marginTop: -64, marginBottom: 16, paddingHorizontal: 20,
  },
  avatarWrapper: { position: 'relative', marginBottom: 12 },
  avatarCircle: {
    width: 128, height: 128, borderRadius: 64,
    backgroundColor: 'white', borderWidth: 4, borderColor: 'white',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 56 },
  editAvatarBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#008F7A', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4,
    elevation: 4,
  },
  editAvatarIcon: { fontSize: 18 },
  profileName: { fontSize: 20, fontWeight: '700', color: '#111', marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  countryFlag: { fontSize: 24 },
  locationText: { fontSize: 14, fontWeight: '500', color: '#6B7280' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1, backgroundColor: 'white', borderRadius: 18, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  statHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  statHeaderLabel: { fontSize: 11, fontWeight: '600', color: '#9CA3AF', letterSpacing: 0.5 },
  statHeaderIcon: { fontSize: 14 },
  statValue: { fontSize: 28, fontWeight: '700', color: '#111', marginBottom: 4 },
  statSub: { fontSize: 11, color: '#008F7A', fontWeight: '500' },
  progressBarBg: { height: 6, backgroundColor: '#F3F4F6', borderRadius: 3, overflow: 'hidden', marginTop: 4 },
  progressBarFill: { height: '100%', borderRadius: 3 },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionHeader: {
    fontSize: 13, fontWeight: '600', color: '#9CA3AF',
    letterSpacing: 0.5, marginBottom: 10, paddingLeft: 4,
  },
  giftListCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: '#d6e4f5', borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: 'rgba(123,183,209,0.3)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  giftListIcon: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center',
  },
  giftListIconEmoji: { fontSize: 22 },
  giftListText: { flex: 1 },
  giftListTitle: { fontSize: 17, fontWeight: '700', color: '#1d3a6d', marginBottom: 2 },
  giftListSubtitle: { fontSize: 13, color: 'rgba(29,58,109,0.7)' },
  settingsCard: {
    backgroundColor: 'white', borderRadius: 20, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  settingsRow: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    paddingHorizontal: 20, paddingVertical: 16,
  },
  settingsRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  settingsIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#F0F9F7', alignItems: 'center', justifyContent: 'center',
  },
  settingsIconEmoji: { fontSize: 18 },
  settingsText: { flex: 1 },
  settingsLabel: { fontSize: 16, fontWeight: '600', color: '#111' },
  settingsSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 1 },
  chevron: { fontSize: 22, color: '#9CA3AF', lineHeight: 24 },
  logoutBtn: {
    backgroundColor: '#FEF2F2', borderRadius: 16,
    paddingVertical: 16, paddingHorizontal: 24,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  logoutIcon: { fontSize: 20 },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#DC2626' },
});
