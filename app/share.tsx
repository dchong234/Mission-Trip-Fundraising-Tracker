import { useState, useRef } from 'react';
import {
  View, Text, Pressable, StyleSheet, Dimensions, ScrollView,
  PanResponder, Animated, Share, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const raised = 2700;
const goal = 3600;
const percentage = Math.round((raised / goal) * 100);

const slides = [
  {
    id: 'pink',
    colors: ['#ff6b9d', '#ffc371'] as const,
    topText: '💗 Grateful Heart 💗',
    middleText: 'of my goal!',
    bottomText: 'Your support means everything 🙌 Tap to donate!',
  },
  {
    id: 'blue',
    colors: ['#667eea', '#764ba2'] as const,
    topText: '✈️ Adventure Awaits ✈️',
    middleText: 'funded!',
    bottomText: '🌟 Join me on this journey! DM for details 💫',
  },
  {
    id: 'brand',
    colors: ['#d6e4f5', '#4aa0c4', '#1d3a6d'] as const,
    topText: '🙏 Faith & Action 🙏',
    middleText: 'raised!',
    bottomText: '💙 Believing for the full amount! Support link below 👇',
  },
  {
    id: 'teal',
    colors: ['#3C5E55', '#008F7A', '#287AB8'] as const,
    topText: '✨ Big Dreams ✨',
    middleText: 'raised so far!',
    bottomText: '🙏 Help me reach my goal! Swipe up to give 💛',
  },
  {
    id: 'warm',
    colors: ['#f7971e', '#ffd200'] as const,
    topText: '🌍 Going Global 🌍',
    middleText: 'and counting...',
    bottomText: 'Every dollar brings me closer! Link in bio ✨',
  },
];

function StoryCard({ slide }: { slide: typeof slides[0] }) {
  return (
    <LinearGradient
      colors={slide.colors}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={styles.storyCard}
    >
      {/* Top text */}
      <View style={styles.storyTop}>
        <Text style={styles.storyTopText}>{slide.topText}</Text>
        <View style={styles.storyDivider} />
      </View>

      {/* Amount */}
      <View style={styles.storyMiddle}>
        <View style={styles.storyAmountRow}>
          <Text style={styles.storyDollar}>$</Text>
          <Text style={styles.storyAmount}>{raised.toLocaleString()}</Text>
        </View>
        <Text style={styles.storyMiddleText}>{slide.middleText}</Text>
        <View style={styles.storyPercentBadge}>
          <Text style={styles.storyPercentText}>{percentage}% Complete</Text>
        </View>
      </View>

      {/* Bottom */}
      <View style={styles.storyBottom}>
        <View style={styles.storyDivider} />
        <Text style={styles.storyBottomText}>{slide.bottomText}</Text>
      </View>
    </LinearGradient>
  );
}

export default function ShareScreen() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleShare = async (platform: string) => {
    try {
      await Share.share({
        message: `I've raised $${raised.toLocaleString()} toward my mission trip goal of $${goal.toLocaleString()}! That's ${percentage}% complete! Help me reach the finish line! 🙏`,
        title: 'Support My Mission Trip',
      });
    } catch {
      Alert.alert('Share', `Shared to ${platform}!`);
    }
  };

  const handleScrollEnd = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentSlide(idx);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Share Your Progress</Text>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </Pressable>
      </View>

      {/* Story cards swiper */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        style={styles.sliderScroll}
        contentContainerStyle={styles.sliderContent}
        decelerationRate="fast"
      >
        {slides.map(slide => (
          <View key={slide.id} style={styles.slideWrapper}>
            <StoryCard slide={slide} />
          </View>
        ))}
      </ScrollView>

      {/* Pagination dots */}
      <View style={styles.pagination}>
        {slides.map((_, i) => (
          <Pressable
            key={i}
            onPress={() => {
              setCurrentSlide(i);
              scrollRef.current?.scrollTo({ x: i * SCREEN_WIDTH, animated: true });
            }}
            style={[styles.dot, i === currentSlide && styles.dotActive]}
          />
        ))}
      </View>

      {/* Share options */}
      <View style={styles.shareOptions}>
        <View style={styles.shareGrid}>
          {/* Instagram */}
          <Pressable onPress={() => handleShare('Instagram')} style={styles.shareItem}>
            <LinearGradient
              colors={['#833AB4', '#E1306C', '#FD1D1D']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.shareCircle}
            >
              <Text style={styles.shareCircleText}>📷</Text>
            </LinearGradient>
            <Text style={styles.shareLabel}>Instagram</Text>
          </Pressable>

          {/* Facebook */}
          <Pressable onPress={() => handleShare('Facebook')} style={styles.shareItem}>
            <View style={[styles.shareCircle, { backgroundColor: '#1877F2' }]}>
              <Text style={styles.shareCircleText}>f</Text>
            </View>
            <Text style={styles.shareLabel}>Facebook</Text>
          </Pressable>

          {/* iMessage */}
          <Pressable onPress={() => handleShare('iMessage')} style={styles.shareItem}>
            <View style={[styles.shareCircle, { backgroundColor: '#4aa0c4' }]}>
              <Text style={styles.shareCircleText}>💬</Text>
            </View>
            <Text style={styles.shareLabel}>iMessage</Text>
          </Pressable>

          {/* Save */}
          <Pressable onPress={() => handleShare('Save Image')} style={styles.shareItem}>
            <View style={[styles.shareCircle, { backgroundColor: '#374151' }]}>
              <Text style={styles.shareCircleText}>⬇️</Text>
            </View>
            <Text style={styles.shareLabel}>Save</Text>
          </Pressable>

          {/* Copy Link */}
          <Pressable onPress={() => handleShare('Copy Link')} style={styles.shareItem}>
            <View style={[styles.shareCircle, { backgroundColor: '#D1D5DB' }]}>
              <Text style={[styles.shareCircleText, { color: '#374151' }]}>🔗</Text>
            </View>
            <Text style={styles.shareLabel}>Copy Link</Text>
          </Pressable>

          {/* More */}
          <Pressable onPress={() => handleShare('More')} style={styles.shareItem}>
            <View style={[styles.shareCircle, { backgroundColor: '#F3F4F6' }]}>
              <Text style={[styles.shareCircleText, { color: '#374151' }]}>•••</Text>
            </View>
            <Text style={styles.shareLabel}>More</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 16,
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#111' },
  closeBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { fontSize: 18, color: '#9CA3AF' },
  sliderScroll: { flexGrow: 0 },
  sliderContent: {},
  slideWrapper: { width: SCREEN_WIDTH, paddingHorizontal: 24 },
  storyCard: {
    borderRadius: 24, overflow: 'hidden', height: 400,
    justifyContent: 'space-between', padding: 24,
  },
  storyTop: { alignItems: 'center' },
  storyTopText: { fontSize: 22, fontWeight: '700', color: 'black', marginBottom: 8, textAlign: 'center' },
  storyDivider: { width: 48, height: 3, backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 2 },
  storyMiddle: { alignItems: 'center' },
  storyAmountRow: { flexDirection: 'row', alignItems: 'flex-end' },
  storyDollar: { fontSize: 40, fontWeight: '700', color: 'black', lineHeight: 72 },
  storyAmount: { fontSize: 64, fontWeight: '700', color: 'black', lineHeight: 72 },
  storyMiddleText: { fontSize: 16, fontWeight: '700', color: 'black', marginBottom: 12 },
  storyPercentBadge: {
    backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 24,
    paddingHorizontal: 20, paddingVertical: 8,
    borderWidth: 2, borderColor: 'rgba(0,0,0,0.25)',
  },
  storyPercentText: { fontSize: 18, fontWeight: '700', color: 'black' },
  storyBottom: { alignItems: 'center' },
  storyBottomText: { fontSize: 17, fontWeight: '700', color: 'black', textAlign: 'center', marginTop: 8 },
  pagination: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D9D9D9' },
  dotActive: { width: 24, backgroundColor: '#4aa0c4' },
  shareOptions: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 8 },
  shareGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 24, maxWidth: 300 },
  shareItem: { alignItems: 'center', gap: 6, width: 64 },
  shareCircle: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
  },
  shareCircleText: { fontSize: 24, color: 'white', fontWeight: '700' },
  shareLabel: { fontSize: 13, fontWeight: '600', color: '#374151' },
});
