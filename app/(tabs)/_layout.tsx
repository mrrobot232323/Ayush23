import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, View, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const PALETTE = {
  active: '#000000',
  inactive: '#717171',
  bg: '#ffffff',
  border: '#EBEBEB',
  accent: '#46740eff', // Airbnb Red/Pink for the + button
};

const TabIcon = ({
  focused,
  label,
  iconName,
  profileUri,
  isMainAction = false,
}: {
  focused: boolean;
  label: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  profileUri?: string;
  isMainAction?: boolean;
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
          <Ionicons
            name={focused ? iconName : (`${iconName}-outline` as any)}
            // Make the middle (+) icon bigger (30) than others (26)
            size={isMainAction ? 32 : 26} 
            // Use Accent color for the + button, black/grey for others
            color={isMainAction ? PALETTE.accent : (focused ? PALETTE.active : PALETTE.inactive)}
          />
        )}
      </Animated.View>

      <Text
        style={[
          styles.label,
          {
            // Use Accent color for the "New Trip" label too
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
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      {/* 1. HOME (New 1st Tab) */}
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon 
              focused={focused} 
              label="Discover" 
              iconName="compass" 
            />
          ),
        }}
      />

      {/* 2. EXPLORE (Moved to 2nd) */}
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon 
              focused={focused} 
              label="Wishlist" 
              iconName="heart" // Compass fits "Explore World" well
            />
          ),
        }}
      />

      {/* 3. NEW TRIP (+ Middle with Label) */}
      <Tabs.Screen
        name="create"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon 
              focused={focused} 
              label="New Trip" 
              iconName="add-circle" 
              isMainAction={true} // Triggers special styling
            />
          ),
        }}
      />

      {/* 4. INBOX (2nd Last) */}
      <Tabs.Screen
        name="chats"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon 
              focused={focused} 
              label="Inbox" 
              iconName="chatbox" 
            />
          ),
        }}
      />

      {/* 5. PROFILE (Last) */}
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              label="Profile"
                iconName="person" 
            />
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
    width: 65, // Slightly wider to fit "New Trip" text
  },
  label: {
    fontSize: 10,
    marginTop: 4,
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
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
});