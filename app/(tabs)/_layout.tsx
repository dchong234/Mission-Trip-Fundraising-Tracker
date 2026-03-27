import { Tabs, useRouter } from 'expo-router';
import { View, Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const icons: Record<string, string> = {
    index: '🏠',
    history: '🕐',
    chat: '💬',
    profile: '👤',
  };

  const labels: Record<string, string> = {
    index: 'Home',
    history: 'Recent',
    chat: 'AI Chat',
    profile: 'Profile',
  };

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom }]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // Insert floating + button between history and chat
        const items = [];

        items.push(
          <Pressable key={route.name} onPress={onPress} style={styles.tabItem}>
            <Text style={[styles.tabIcon, isFocused && styles.tabIconActive]}>
              {icons[route.name] || '•'}
            </Text>
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
              {labels[route.name] || route.name}
            </Text>
          </Pressable>
        );

        // Add the floating + button after history (index 1)
        if (index === 1) {
          items.push(
            <Pressable
              key="add-button"
              onPress={() => router.push('/add-donation')}
              style={styles.addButton}
            >
              <View style={styles.addButtonInner}>
                <Text style={styles.addButtonIcon}>+</Text>
              </View>
            </Pressable>
          );
        }

        return items;
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="history" />
      <Tabs.Screen name="chat" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    height: 74,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 2,
  },
  tabIcon: { fontSize: 22, color: '#9CA3AF' },
  tabIconActive: { color: '#4aa0c4' },
  tabLabel: { fontSize: 11, color: '#9CA3AF' },
  tabLabelActive: { fontSize: 11, fontWeight: '600', color: '#4aa0c4' },
  addButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -24,
  },
  addButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4aa0c4',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonIcon: { fontSize: 28, color: 'white', lineHeight: 32 },
});
