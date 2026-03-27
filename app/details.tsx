import { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const COUNTRIES = [
  { name: 'North India', flag: '🇮🇳' },
  { name: 'South India', flag: '🇮🇳' },
  { name: 'Cambodia', flag: '🇰🇭' },
  { name: 'Japan', flag: '🇯🇵' },
  { name: 'Taiwan', flag: '🇹🇼' },
  { name: 'Nicaragua', flag: '🇳🇮' },
  { name: 'Philippines', flag: '🇵🇭' },
];

interface Deadline { id: string; date: string; amount: string; }

export default function Details() {
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [fundraisingGoal, setFundraisingGoal] = useState('');
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [showAddDeadline, setShowAddDeadline] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newAmount, setNewAmount] = useState('');

  const handleAddDeadline = () => {
    if (newDate && newAmount) {
      setDeadlines([...deadlines, { id: Date.now().toString(), date: newDate, amount: newAmount }]);
      setNewDate('');
      setNewAmount('');
      setShowAddDeadline(false);
    }
  };

  const handleRemove = (id: string) => setDeadlines(deadlines.filter(d => d.id !== id));

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Mission Details</Text>
          <Text style={styles.subtitle}>Tell us about your mission journey</Text>

          {/* Country selection */}
          <Text style={styles.label}>Mission Country</Text>
          <View style={styles.countryGrid}>
            {COUNTRIES.map((c) => (
              <Pressable
                key={c.name}
                onPress={() => setSelectedCountry(c.name)}
                style={[styles.countryButton, selectedCountry === c.name && styles.countryButtonSelected]}
              >
                <Text style={styles.countryFlag}>{c.flag}</Text>
                <Text style={[styles.countryName, selectedCountry === c.name && styles.countryNameSelected]}>
                  {c.name}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Departure date */}
          <Text style={styles.label}>Departure Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#aaa"
            value={departureDate}
            onChangeText={setDepartureDate}
          />

          {/* Fundraising goal */}
          <Text style={styles.label}>Fundraising Goal</Text>
          <View style={styles.dollarInputRow}>
            <Text style={styles.dollarSign}>$</Text>
            <TextInput
              style={styles.dollarInput}
              placeholder="5000"
              placeholderTextColor="#aaa"
              value={fundraisingGoal}
              onChangeText={setFundraisingGoal}
              keyboardType="numeric"
            />
          </View>

          {/* Deadlines */}
          <Text style={styles.label}>Financial Deadlines (Optional)</Text>
          {deadlines.map((d) => (
            <View key={d.id} style={styles.deadlineRow}>
              <Text style={styles.deadlineText}>📅 {d.date}</Text>
              <Text style={styles.deadlineAmount}>${d.amount}</Text>
              <Pressable onPress={() => handleRemove(d.id)}>
                <Text style={styles.removeText}>✕</Text>
              </Pressable>
            </View>
          ))}

          {showAddDeadline ? (
            <View style={styles.addDeadlineBox}>
              <Text style={styles.smallLabel}>Date</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#aaa"
                value={newDate}
                onChangeText={setNewDate}
              />
              <Text style={styles.smallLabel}>Amount</Text>
              <View style={styles.dollarInputRow}>
                <Text style={styles.dollarSign}>$</Text>
                <TextInput
                  style={styles.dollarInput}
                  placeholder="1000"
                  placeholderTextColor="#aaa"
                  value={newAmount}
                  onChangeText={setNewAmount}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.addDeadlineButtons}>
                <Pressable onPress={handleAddDeadline} style={styles.addBtn}>
                  <Text style={styles.addBtnText}>Add</Text>
                </Pressable>
                <Pressable onPress={() => setShowAddDeadline(false)} style={styles.cancelBtn}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable onPress={() => setShowAddDeadline(true)} style={styles.addDeadlineTrigger}>
              <Text style={styles.addDeadlineTriggerText}>+ Add Deadline</Text>
            </Pressable>
          )}

          <Pressable
            onPress={() => router.replace('/(tabs)')}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
          >
            <Text style={styles.primaryButtonText}>Get Started →</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  scroll: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 48 },
  title: { fontSize: 32, fontWeight: '700', color: '#111', marginBottom: 6, letterSpacing: -0.5 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 32 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 12, marginTop: 4 },
  smallLabel: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#111',
    marginBottom: 16,
  },
  dollarInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  dollarSign: { fontSize: 16, color: '#666', marginRight: 4 },
  dollarInput: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#111' },
  countryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  countryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  countryButtonSelected: { borderColor: '#4aa0c4', backgroundColor: 'rgba(74,160,196,0.05)' },
  countryFlag: { fontSize: 22 },
  countryName: { fontSize: 14, fontWeight: '600', color: '#374151' },
  countryNameSelected: { color: '#4aa0c4' },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  deadlineText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#111' },
  deadlineAmount: { fontSize: 13, color: '#555' },
  removeText: { fontSize: 16, color: '#999' },
  addDeadlineBox: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  addDeadlineButtons: { flexDirection: 'row', gap: 8 },
  addBtn: {
    flex: 1,
    backgroundColor: '#4aa0c4',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  addBtnText: { fontSize: 15, fontWeight: '600', color: 'white' },
  cancelBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  addDeadlineTrigger: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  addDeadlineTriggerText: { fontSize: 15, fontWeight: '500', color: '#555' },
  primaryButton: {
    backgroundColor: '#4aa0c4',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonPressed: { backgroundColor: '#1d3a6d' },
  primaryButtonText: { fontSize: 17, fontWeight: '600', color: 'white' },
});
