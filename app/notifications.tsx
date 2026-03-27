import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

function Toggle({ value, onChange, color = '#008F7A' }: { value: boolean; onChange: () => void; color?: string }) {
  return (
    <Pressable
      onPress={onChange}
      style={[styles.toggle, value && { backgroundColor: color }]}
    >
      <View style={[styles.toggleThumb, value && styles.toggleThumbOn]} />
    </Pressable>
  );
}

function SettingRow({ label, subtitle, value, onChange, color, isLast = false }: {
  label: string; subtitle: string; value: boolean; onChange: () => void;
  color?: string; isLast?: boolean;
}) {
  return (
    <View style={[styles.settingRow, !isLast && styles.settingRowBorder]}>
      <View style={styles.settingText}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      <Toggle value={value} onChange={onChange} color={color} />
    </View>
  );
}

export default function Notifications() {
  const router = useRouter();
  const [donationAlerts, setDonationAlerts] = useState(true);
  const [tripUpdates, setTripUpdates] = useState(true);
  const [milestoneReminders, setMilestoneReminders] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

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
            <Text style={styles.headerIconEmoji}>🔔</Text>
          </View>
          <Text style={styles.headerTitle}>Notification Alerts</Text>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Alert Types */}
        <Text style={styles.sectionHeader}>ALERT TYPES</Text>
        <View style={styles.card}>
          <SettingRow label="Donation Alerts" subtitle="Get notified when you receive donations" value={donationAlerts} onChange={() => setDonationAlerts(!donationAlerts)} />
          <SettingRow label="Trip Updates" subtitle="Important mission trip information" value={tripUpdates} onChange={() => setTripUpdates(!tripUpdates)} />
          <SettingRow label="Milestone Reminders" subtitle="Track your fundraising progress" value={milestoneReminders} onChange={() => setMilestoneReminders(!milestoneReminders)} />
          <SettingRow label="Weekly Reports" subtitle="Summary of your fundraising activity" value={weeklyReports} onChange={() => setWeeklyReports(!weeklyReports)} isLast />
        </View>

        {/* Delivery Methods */}
        <Text style={styles.sectionHeader}>DELIVERY METHODS</Text>
        <View style={styles.card}>
          <SettingRow label="Email Notifications" subtitle="Receive alerts via email" value={emailNotifications} onChange={() => setEmailNotifications(!emailNotifications)} color="#287AB8" />
          <SettingRow label="Push Notifications" subtitle="Receive alerts on your device" value={pushNotifications} onChange={() => setPushNotifications(!pushNotifications)} color="#287AB8" isLast />
        </View>

        {/* DND Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>🔕</Text>
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Do Not Disturb</Text>
            <Text style={styles.infoBody}>
              You can enable Do Not Disturb mode in your device settings to temporarily pause all notifications.
            </Text>
          </View>
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
  sectionHeader: { fontSize: 14, fontWeight: '600', color: '#6B7280', letterSpacing: 0.5, marginBottom: 10, paddingLeft: 4 },
  card: {
    backgroundColor: 'white', borderRadius: 20, marginBottom: 20, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  settingRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  settingText: { flex: 1 },
  settingLabel: { fontSize: 16, fontWeight: '600', color: '#111', marginBottom: 2 },
  settingSubtitle: { fontSize: 13, color: '#6B7280' },
  toggle: { width: 56, height: 32, borderRadius: 16, backgroundColor: '#D1D5DB', justifyContent: 'center', paddingHorizontal: 4 },
  toggleThumb: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 },
  toggleThumbOn: { transform: [{ translateX: 24 }] },
  infoCard: {
    backgroundColor: 'rgba(214,228,245,0.4)', borderRadius: 18, padding: 20,
    borderWidth: 1, borderColor: 'rgba(123,183,209,0.2)',
    flexDirection: 'row', gap: 12, marginBottom: 12,
  },
  infoIcon: { fontSize: 20, marginTop: 2 },
  infoText: { flex: 1 },
  infoTitle: { fontSize: 15, fontWeight: '700', color: '#1d3a6d', marginBottom: 6 },
  infoBody: { fontSize: 13, color: 'rgba(29,58,109,0.7)', lineHeight: 20 },
});
