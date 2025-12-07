import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { FONT } from '../../src/constants/theme';
import { useUser } from '../../src/context/UserContext';
import { supabase } from '../../src/lib/supabase';

const PALETTE = {
  active: '#000000',
  inactive: '#717171',
  bg: '#ffffff',
  border: '#EBEBEB',
  accent: '#FF5864', // Matches the red/pink in the design
};

const TabIcon = ({
  focused,
  label,
  iconName,
  profileUri,
  isMainAction = false,
  badgeCount = 0,
}: {
  focused: boolean;
  label: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  profileUri?: string;
  isMainAction?: boolean;
  badgeCount?: number;
}) => {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withSpring(focused ? 1.1 : 1, { damping: 10 });
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.tabItem}>
      <Animated.View style={animatedStyle}>
        {profileUri ? (
          <View style={[styles.profileContainer, focused && styles.profileFocused]}>
            <Image source={{ uri: profileUri }} style={styles.profilePic} />
          </View>
        ) : (
          <View>
            <Ionicons
              name={focused ? iconName : (`${iconName}-outline` as any)}
              size={isMainAction ? 32 : 26}
              color={isMainAction ? PALETTE.accent : (focused ? PALETTE.active : PALETTE.inactive)}
            />
            {badgeCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badgeCount > 99 ? '99+' : badgeCount}</Text>
              </View>
            )}
          </View>
        )}
      </Animated.View>

      <Text
        style={[
          styles.label,
          {
            color: isMainAction
              ? PALETTE.accent
              : (focused ? PALETTE.active : PALETTE.inactive),
            fontWeight: focused || isMainAction ? '600' : '400',
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

export default function TabLayout() {
  const { session } = useUser();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchUnread = async () => {
      // Count unread messages
      const { count: msgCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', session.user.id)
        .is('seen_at', null);

      // Count unread notifications
      const { count: notifCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
        .eq('read', false); // Assuming there's a 'read' column, otherwise we might need to rely only on messages

      setUnreadCount((msgCount || 0)); // + (notifCount || 0) if notifications have read state
    };

    fetchUnread();

    const msgSub = supabase
      .channel('layout-badges')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages', filter: `receiver_id=eq.${session.user.id}` },
        fetchUnread
      )
      .subscribe();

    return () => {
      supabase.removeChannel(msgSub);
    };
  }, [session]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Discover" iconName="compass" />
          ),
        }}
      />
      <Tabs.Screen
        name="near-me"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Near Me" iconName="location" />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="New Trip" iconName="add-circle" isMainAction={true} />
          ),
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Inbox" iconName="chatbubble" badgeCount={unreadCount} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Profile" iconName="person" />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 85,
    paddingTop: 8,
    backgroundColor: PALETTE.bg,
    borderTopWidth: 1,
    borderTopColor: PALETTE.border,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 65,
  },
  label: {
    fontSize: 10,
    marginTop: 4,
    fontFamily: FONT.UI_REGULAR,
    letterSpacing: 0.2,
  },
  profileContainer: {
    padding: 2,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  profileFocused: {
    borderColor: PALETTE.active,
  },
  profilePic: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ddd',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: PALETTE.accent,
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: FONT.UI_BOLD,
  },
});