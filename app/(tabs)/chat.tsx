import { useState, useRef, useEffect } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView,
  TextInput, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

const SYSTEM_PROMPT = `You are a helpful AI assistant for a missionary trip fundraising app.
You help missionaries with:
- Writing thank you messages to donors
- Crafting fundraising communication (letters, social media posts, emails)
- Brainstorming creative fundraiser ideas
- Tracking and managing donor relationships
- Providing encouragement and spiritual motivation for the mission

Keep responses warm, faith-inspired, and practical. Be concise but thorough.`;

const suggestions = [
  'Write a semi-formal thank you message to my pastor for his financial support.',
  'Create a quick message that I can send to all of my close friends.',
  'Think of 9 unique but doable ideas for a Bingo fundraiser that I can promote on my Instagram.',
];

const previousChats = [
  { id: '1', title: 'Thank you messages for donors', date: 'Yesterday', preview: 'Can you help me write...' },
  { id: '2', title: 'Fundraiser ideas', date: 'Feb 5', preview: 'I need creative ideas...' },
  { id: '3', title: 'Budget planning', date: 'Feb 3', preview: 'How can I track my...' },
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isTyping) {
      const animateDot = (dot: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dot, { toValue: -6, duration: 300, useNativeDriver: true }),
            Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          ])
        ).start();
      animateDot(dot1, 0);
      animateDot(dot2, 150);
      animateDot(dot3, 300);
    }
  }, [isTyping]);

  const sendMessage = async (text?: string) => {
    const msg = text || inputValue.trim();
    if (!msg || isTyping) return;
    setHasStarted(true);
    const userMsg: Message = { id: Date.now().toString(), text: msg, sender: 'user' };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputValue('');
    setIsTyping(true);
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...newMessages.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })),
          ],
          max_tokens: 600,
        }),
      });
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't get a response. Please try again.";
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: reply, sender: 'ai' }]);
    } catch {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: "Connection error. Please check your internet and try again.", sender: 'ai' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>✨ AI Assistant</Text>
          <Pressable
            onPress={() => setShowHistory(!showHistory)}
            style={styles.historyBtn}
          >
            <Text style={styles.historyBtnText}>🕐 History</Text>
          </Pressable>
        </View>

        {/* History dropdown */}
        {showHistory && (
          <View style={styles.historyDropdown}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>Previous Conversations</Text>
              <Pressable onPress={() => setShowHistory(false)}>
                <Text style={styles.historyClose}>✕</Text>
              </Pressable>
            </View>
            {previousChats.map((chat) => (
              <Pressable
                key={chat.id}
                onPress={() => setShowHistory(false)}
                style={styles.historyItem}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyItemTitle}>{chat.title}</Text>
                  <Text style={styles.historyItemPreview}>{chat.preview}</Text>
                </View>
                <Text style={styles.historyItemDate}>{chat.date}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Messages / Suggestions */}
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {!hasStarted ? (
            <>
              {/* Sparkle icon */}
              <View style={styles.sparkleCircle}>
                <Text style={styles.sparkleIcon}>✨</Text>
              </View>

              <Text style={styles.welcomeTitle}>
                Let AI help you track your supporters and finances.
              </Text>

              <Text style={styles.suggestionsLabel}>Things you can ask!</Text>
              {suggestions.map((s, i) => (
                <Pressable
                  key={i}
                  onPress={() => sendMessage(s)}
                  style={({ pressed }) => [styles.suggestionCard, pressed && styles.suggestionCardPressed]}
                >
                  <View style={styles.suggestionDot}>
                    <Text style={{ fontSize: 12, color: 'white' }}>✦</Text>
                  </View>
                  <Text style={styles.suggestionText}>{s}</Text>
                </Pressable>
              ))}
            </>
          ) : (
            <>
              {messages.map((msg) => (
                <View
                  key={msg.id}
                  style={[
                    styles.messageRow,
                    msg.sender === 'user' ? styles.messageRowUser : styles.messageRowAI,
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      msg.sender === 'user' ? styles.userBubble : styles.aiBubble,
                    ]}
                  >
                    {msg.sender === 'ai' && (
                      <View style={styles.aiLabel}>
                        <Text style={styles.aiLabelIcon}>✨</Text>
                        <Text style={styles.aiLabelText}>AI Assistant</Text>
                      </View>
                    )}
                    <Text style={[styles.messageText, msg.sender === 'user' && styles.userText]}>
                      {msg.text}
                    </Text>
                  </View>
                  {msg.sender === 'ai' && (
                    <Pressable
                      onPress={() => {
                        setCopiedId(msg.id);
                        setTimeout(() => setCopiedId(null), 2000);
                      }}
                      style={styles.copyBtn}
                    >
                      <Text style={styles.copyBtnIcon}>{copiedId === msg.id ? '✓' : '⎘'}</Text>
                    </Pressable>
                  )}
                </View>
              ))}

              {isTyping && (
                <View style={[styles.messageRow, styles.messageRowAI]}>
                  <View style={[styles.messageBubble, styles.aiBubble]}>
                    <View style={styles.typingRow}>
                      <Text style={styles.aiLabelIcon}>✨</Text>
                      <View style={styles.dotsRow}>
                        {[dot1, dot2, dot3].map((dot, i) => (
                          <Animated.View
                            key={i}
                            style={[styles.dot, { transform: [{ translateY: dot }] }]}
                          />
                        ))}
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </>
          )}
          <View style={{ height: 16 }} />
        </ScrollView>

        {/* Input */}
        <View style={styles.inputArea}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              value={inputValue}
              onChangeText={setInputValue}
              placeholder="Ask AI anything!"
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={500}
            />
            <Pressable
              onPress={() => sendMessage()}
              style={({ pressed }) => [styles.sendBtn, pressed && { opacity: 0.8 }]}
            >
              <Text style={styles.sendIcon}>➤</Text>
            </Pressable>
          </View>
        </View>

        {/* Copy toast */}
        {copiedId && (
          <View style={styles.copyToast} pointerEvents="none">
            <Text style={styles.copyToastText}>✓ Copied and ready to send!</Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8faf9' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, backgroundColor: 'white',
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#3C5E55' },
  historyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: 'white', borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 20,
  },
  historyBtnText: { fontSize: 13, fontWeight: '500', color: '#374151' },
  historyDropdown: {
    backgroundColor: '#F9FAFB', borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  historyHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  historyTitle: { fontSize: 15, fontWeight: '600', color: '#111' },
  historyClose: { fontSize: 16, color: '#9CA3AF' },
  historyItem: {
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  historyItemTitle: { fontSize: 14, fontWeight: '500', color: '#111', marginBottom: 2 },
  historyItemPreview: { fontSize: 12, color: '#9CA3AF' },
  historyItemDate: { fontSize: 11, color: '#9CA3AF', marginLeft: 8 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24 },
  sparkleCircle: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 2, borderColor: '#111',
    backgroundColor: 'white', alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  sparkleIcon: { fontSize: 32 },
  welcomeTitle: {
    fontSize: 24, fontWeight: '700', color: '#111',
    lineHeight: 32, marginBottom: 28,
  },
  suggestionsLabel: { fontSize: 14, fontWeight: '500', color: '#6B7280', marginBottom: 12 },
  suggestionCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6,
    elevation: 2,
  },
  suggestionCardPressed: { borderColor: '#008F7A', backgroundColor: '#f0faf8' },
  suggestionDot: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#008F7A', alignItems: 'center', justifyContent: 'center',
    marginTop: 2, flexShrink: 0,
  },
  suggestionText: { flex: 1, fontSize: 14, color: '#374151', lineHeight: 21 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 },
  messageRowUser: { justifyContent: 'flex-end' },
  messageRowAI: { justifyContent: 'flex-start', gap: 8 },
  messageBubble: { maxWidth: '80%', borderRadius: 18, padding: 14 },
  userBubble: { backgroundColor: '#008F7A' },
  aiBubble: { backgroundColor: 'white', borderWidth: 1, borderColor: '#E5E7EB' },
  aiLabel: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  aiLabelIcon: { fontSize: 14 },
  aiLabelText: { fontSize: 12, fontWeight: '600', color: '#008F7A' },
  messageText: { fontSize: 14, color: '#374151', lineHeight: 21 },
  userText: { color: 'white' },
  copyBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'white', borderWidth: 1, borderColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  copyBtnIcon: { fontSize: 14, color: '#6B7280' },
  typingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dotsRow: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#9CA3AF' },
  inputArea: {
    paddingHorizontal: 20, paddingVertical: 12,
    backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#F3F4F6',
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#F9FAFB', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  textInput: { flex: 1, fontSize: 14, color: '#111', maxHeight: 100 },
  sendBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#008F7A', alignItems: 'center', justifyContent: 'center',
  },
  sendIcon: { fontSize: 16, color: 'white' },
  copyToast: {
    position: 'absolute', top: 80, left: 0, right: 0,
    alignItems: 'center', zIndex: 999,
  },
  copyToastText: {
    backgroundColor: 'white', color: '#008F7A', fontWeight: '600', fontSize: 14,
    paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 24, borderWidth: 1, borderColor: 'rgba(0,143,122,0.2)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12,
    elevation: 8,
  },
});
