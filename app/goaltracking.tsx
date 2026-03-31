import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp, Deadline } from '../lib/context';

function formatDateLabel(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default function GoalTracking() {
  const router = useRouter();
  const { goal, updateGoal, deadlines, updateDeadlines } = useApp();
  const [fundGoal, setFundGoal] = useState(goal > 0 ? goal.toString() : '');
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null);
  const [showAddDeadline, setShowAddDeadline] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newAmount, setNewAmount] = useState('');

  const handleSaveGoal = () => {
    const parsed = parseFloat(fundGoal);
    if (!isNaN(parsed)) updateGoal(parsed);
    setIsEditingGoal(false);
  };

  const handleSaveDeadline = () => {
    if (editingDeadline && editingId) {
      updateDeadlines(deadlines.map(d => d.id === editingId ? editingDeadline : d));
      setEditingId(null);
      setEditingDeadline(null);
    }
  };

  const handleAddDeadline = () => {
    if (newDate && newAmount) {
      const newDeadline: Deadline = {
        id: Date.now().toString(),
        name: newName || `Deadline ${deadlines.length + 1}`,
        date: newDate,
        amount: parseFloat(newAmount) || 0,
      };
      updateDeadlines([...deadlines, newDeadline]);
      setNewName(''); setNewDate(''); setNewAmount('');
      setShowAddDeadline(false);
    }
  };

  const handleDeleteDeadline = (id: string) => {
    updateDeadlines(deadlines.filter(d => d.id !== id));
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
            <Text style={styles.headerIconEmoji}>🎯</Text>
          </View>
          <Text style={styles.headerTitle}>Goal Tracking</Text>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Funding Goal */}
        <Text style={styles.sectionHeader}>FUNDING GOAL</Text>
        <View style={styles.goalCard}>
          <View style={styles.goalRow}>
            <View style={styles.goalIcon}>
              <Text style={styles.goalIconEmoji}>💵</Text>
            </View>
            <View style={styles.goalInfo}>
              <Text style={styles.goalInfoLabel}>Target Amount</Text>
              {isEditingGoal ? (
                <View style={styles.goalEditRow}>
                  <Text style={styles.goalEditDollar}>$</Text>
                  <TextInput
                    style={styles.goalInput}
                    value={fundGoal}
                    onChangeText={setFundGoal}
                    keyboardType="numeric"
                    autoFocus
                  />
                </View>
              ) : (
                <Text style={styles.goalValue}>${parseInt(fundGoal).toLocaleString()}</Text>
              )}
            </View>
            {isEditingGoal ? (
              <Pressable onPress={handleSaveGoal} style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>Save</Text>
              </Pressable>
            ) : (
              <Pressable onPress={() => setIsEditingGoal(true)} style={styles.editBtn}>
                <Text style={styles.editBtnText}>Edit</Text>
              </Pressable>
            )}
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>💡 Tip: Set a realistic goal based on your trip expenses and timeline</Text>
          </View>
        </View>

        {/* Deadlines */}
        <View style={styles.deadlinesHeader}>
          <Text style={styles.sectionHeader}>DEADLINES</Text>
          <Pressable onPress={() => setShowAddDeadline(true)} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ Add New</Text>
          </Pressable>
        </View>

        {showAddDeadline && (
          <View style={styles.deadlineCard}>
            <Text style={styles.editFieldLabel}>Name (optional)</Text>
            <TextInput style={styles.editInput} value={newName} onChangeText={setNewName} placeholder={`Deadline ${deadlines.length + 1}`} placeholderTextColor="#9CA3AF" />
            <Text style={styles.editFieldLabel}>Date (YYYY-MM-DD)</Text>
            <TextInput style={styles.editInput} value={newDate} onChangeText={setNewDate} placeholder="2026-04-01" placeholderTextColor="#9CA3AF" />
            <Text style={styles.editFieldLabel}>Target Amount</Text>
            <View style={styles.editAmountRow}>
              <Text style={styles.editDollar}>$</Text>
              <TextInput style={[styles.editInput, { flex: 1, marginBottom: 0 }]} value={newAmount} onChangeText={setNewAmount} keyboardType="numeric" placeholder="1000" placeholderTextColor="#9CA3AF" />
            </View>
            <View style={[styles.editActions, { marginTop: 12 }]}>
              <Pressable onPress={handleAddDeadline} style={styles.saveChangesBtn}><Text style={styles.saveChangesBtnText}>Add Deadline</Text></Pressable>
              <Pressable onPress={() => setShowAddDeadline(false)} style={styles.cancelBtn}><Text style={styles.cancelBtnText}>Cancel</Text></Pressable>
            </View>
          </View>
        )}

        {deadlines.map(deadline => {
          const isEditing = editingId === deadline.id;
          return (
            <View key={deadline.id} style={styles.deadlineCard}>
              {isEditing && editingDeadline ? (
                <>
                  <Text style={styles.editFieldLabel}>Name</Text>
                  <TextInput
                    style={styles.editInput}
                    value={editingDeadline.name}
                    onChangeText={v => setEditingDeadline({ ...editingDeadline, name: v })}
                  />
                  <Text style={styles.editFieldLabel}>Date (YYYY-MM-DD)</Text>
                  <TextInput
                    style={styles.editInput}
                    value={editingDeadline.date}
                    onChangeText={v => setEditingDeadline({ ...editingDeadline, date: v })}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#9CA3AF"
                  />
                  <Text style={styles.editFieldLabel}>Target Amount</Text>
                  <View style={styles.editAmountRow}>
                    <Text style={styles.editDollar}>$</Text>
                    <TextInput
                      style={[styles.editInput, { flex: 1, marginBottom: 0 }]}
                      value={editingDeadline.amount.toString()}
                      onChangeText={v => setEditingDeadline({ ...editingDeadline, amount: parseInt(v) || 0 })}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.editActions}>
                    <Pressable onPress={handleSaveDeadline} style={styles.saveChangesBtn}>
                      <Text style={styles.saveChangesBtnText}>Save Changes</Text>
                    </Pressable>
                    <Pressable onPress={() => { setEditingId(null); setEditingDeadline(null); }} style={styles.cancelBtn}>
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                    </Pressable>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.deadlineCardHeader}>
                    <View style={styles.deadlineCardLeft}>
                      <View style={styles.deadlineIcon}>
                        <Text style={styles.deadlineIconEmoji}>📅</Text>
                      </View>
                      <View>
                        <Text style={styles.deadlineName}>{deadline.name}</Text>
                        <Text style={styles.deadlineDate}>{formatDateLabel(deadline.date)}</Text>
                      </View>
                    </View>
                    <Pressable onPress={() => handleDeleteDeadline(deadline.id)}>
                      <Text style={styles.deleteIcon}>✕</Text>
                    </Pressable>
                  </View>
                  <View style={styles.deadlineAmountRow}>
                    <Text style={styles.deadlineAmountLabel}>Target Amount</Text>
                    <Text style={styles.deadlineAmount}>${deadline.amount.toLocaleString()}</Text>
                  </View>
                  <Pressable
                    onPress={() => { setEditingId(deadline.id); setEditingDeadline({ ...deadline }); }}
                    style={styles.editDeadlineBtn}
                  >
                    <Text style={styles.editDeadlineBtnText}>✏️ Edit Deadline</Text>
                  </Pressable>
                </>
              )}
            </View>
          );
        })}

        {/* Info card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>About Milestones</Text>
          <Text style={styles.infoBody}>
            Set deadlines to help you stay on track with your fundraising. You'll receive reminder notifications as each deadline approaches.
          </Text>
          <Text style={[styles.infoBody, { marginTop: 8 }]}>
            Adjust your targets anytime as your trip plans evolve.
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
  sectionHeader: { fontSize: 14, fontWeight: '600', color: '#6B7280', letterSpacing: 0.5, marginBottom: 10, paddingLeft: 4 },
  goalCard: {
    backgroundColor: 'white', borderRadius: 20, padding: 20, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  goalIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(0,143,122,0.1)', alignItems: 'center', justifyContent: 'center' },
  goalIconEmoji: { fontSize: 22 },
  goalInfo: { flex: 1 },
  goalInfoLabel: { fontSize: 13, color: '#6B7280', fontWeight: '500', marginBottom: 2 },
  goalEditRow: { flexDirection: 'row', alignItems: 'center' },
  goalEditDollar: { fontSize: 24, fontWeight: '700', color: '#111', marginRight: 4 },
  goalInput: { fontSize: 24, fontWeight: '700', color: '#111', borderBottomWidth: 2, borderBottomColor: '#008F7A', minWidth: 100 },
  goalValue: { fontSize: 28, fontWeight: '700', color: '#111' },
  saveBtn: { backgroundColor: '#008F7A', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  saveBtnText: { fontSize: 14, fontWeight: '600', color: 'white' },
  editBtn: { backgroundColor: 'rgba(0,143,122,0.1)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  editBtnText: { fontSize: 14, fontWeight: '600', color: '#008F7A' },
  tipCard: { backgroundColor: 'rgba(0,143,122,0.05)', borderRadius: 12, padding: 12 },
  tipText: { fontSize: 12, color: '#008F7A', fontWeight: '500' },
  deadlinesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingHorizontal: 4 },
  addBtn: {},
  addBtnText: { fontSize: 14, fontWeight: '600', color: '#008F7A' },
  deadlineCard: {
    backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  deadlineCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  deadlineCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  deadlineIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(40,122,184,0.1)', alignItems: 'center', justifyContent: 'center' },
  deadlineIconEmoji: { fontSize: 18 },
  deadlineName: { fontSize: 16, fontWeight: '700', color: '#111' },
  deadlineDate: { fontSize: 13, color: '#6B7280' },
  deleteIcon: { fontSize: 16, color: '#9CA3AF' },
  deadlineAmountRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#F9FAFB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 8,
  },
  deadlineAmountLabel: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  deadlineAmount: { fontSize: 16, fontWeight: '700', color: '#008F7A' },
  editDeadlineBtn: { backgroundColor: 'rgba(0,143,122,0.1)', borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  editDeadlineBtnText: { fontSize: 14, fontWeight: '600', color: '#008F7A' },
  editFieldLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500', marginBottom: 4 },
  editInput: {
    fontSize: 16, fontWeight: '700', color: '#111',
    borderBottomWidth: 2, borderBottomColor: '#008F7A', paddingVertical: 6, marginBottom: 12,
  },
  editAmountRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  editDollar: { fontSize: 16, fontWeight: '700', color: '#111' },
  editActions: { flexDirection: 'row', gap: 8 },
  saveChangesBtn: { flex: 1, backgroundColor: '#008F7A', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  saveChangesBtnText: { fontSize: 14, fontWeight: '600', color: 'white' },
  cancelBtn: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  cancelBtnText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  infoCard: {
    backgroundColor: 'rgba(214,228,245,0.4)', borderRadius: 18, padding: 20,
    borderWidth: 1, borderColor: 'rgba(123,183,209,0.2)', marginBottom: 12,
  },
  infoTitle: { fontSize: 15, fontWeight: '700', color: '#1d3a6d', marginBottom: 8 },
  infoBody: { fontSize: 13, color: 'rgba(29,58,109,0.7)', lineHeight: 20 },
});
