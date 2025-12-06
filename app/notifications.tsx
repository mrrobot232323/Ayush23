import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONT, SIZES } from '../src/constants/theme';

const NOTIFICATIONS = [
    {
        id: '1',
        type: 'match',
        title: 'It’s a Match!',
        message: 'You and Sarah liked each other.',
        time: '2m ago',
        read: false,
        avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
    },
    {
        id: '2',
        type: 'message',
        title: 'New Message',
        message: 'Jake sent you a message.',
        time: '1h ago',
        read: false,
        avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    },
    {
        id: '3',
        type: 'system',
        title: 'Welcome to meetMiles',
        message: 'Start exploring new trips today!',
        time: '1d ago',
        read: true,
        icon: 'airplane', // System icon
    },
    {
        id: '4',
        type: 'match',
        title: 'New Like',
        message: 'Someone liked your trip to Bali.',
        time: '2d ago',
        read: true,
        avatar: 'https://i.pravatar.cc/150?u=a048581f4e29026701d',
    },
];

const NotificationItem = ({ item, index }: { item: any, index: number }) => {
    const router = useRouter();

    const getIcon = () => {
        switch (item.type) {
            case 'match':
                return <Ionicons name="heart" size={16} color={COLORS.WHITE} />;
            case 'message':
                return <Ionicons name="chatbubble" size={16} color={COLORS.WHITE} />;
            case 'system':
            default:
                return <Ionicons name="notifications" size={16} color={COLORS.WHITE} />;
        }
    };

    const getIconColor = () => {
        switch (item.type) {
            case 'match':
                return '#FF4B4B'; // Redish
            case 'message':
                return '#4B7BFF'; // Blueish
            default:
                return COLORS.PRIMARY_BTN; // Brand
        }
    };

    return (
        <Animated.View
            entering={FadeInDown.delay(index * 100).springify()}
            style={[
                styles.notificationItem,
                !item.read && styles.unreadItem
            ]}
        >
            <TouchableOpacity
                style={styles.contentContainer}
                onPress={() => {
                    // Handle navigation based on type
                    if (item.type === 'match') {
                        router.push('/matches');
                    } else if (item.type === 'message') {
                        router.push('/(tabs)/chats');
                    }
                }}
            >
                <View style={styles.iconContainer}>
                    {item.avatar ? (
                        <Image source={{ uri: item.avatar }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.systemIcon, { backgroundColor: getIconColor() }]}>
                            <Ionicons name={item.icon as any || "notifications"} size={22} color={COLORS.TEXT} />
                        </View>
                    )}

                    {/* Small Badge Icon */}
                    {item.avatar && (
                        <View style={[styles.badge, { backgroundColor: getIconColor() }]}>
                            {getIcon()}
                        </View>
                    )}
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
                    <Text style={styles.time}>{item.time}</Text>
                </View>

                {!item.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
        </Animated.View>
    );
};

export default function Notifications() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.TEXT} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <TouchableOpacity>
                    <Ionicons name="ellipsis-horizontal" size={24} color={COLORS.TEXT} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={NOTIFICATIONS}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => <NotificationItem item={item} index={index} />}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="notifications-off-outline" size={64} color={COLORS.MUTED} />
                        <Text style={styles.emptyText}>No notifications yet</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.BG,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.spacing,
        paddingVertical: 16,
        backgroundColor: COLORS.BG,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontFamily: FONT.UI_BOLD,
        fontSize: 20,
        color: COLORS.TEXT,
    },
    listContent: {
        padding: SIZES.spacing,
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 12,
        backgroundColor: COLORS.WHITE,
        borderRadius: SIZES.radius,
        // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    unreadItem: {
        borderLeftWidth: 4,
        borderLeftColor: COLORS.PRIMARY_BTN,
    },
    contentContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        position: 'relative',
        marginRight: 16,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.BORDER,
    },
    systemIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.WHITE,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontFamily: FONT.UI_BOLD,
        fontSize: 16,
        color: COLORS.TEXT,
        marginBottom: 2,
    },
    message: {
        fontFamily: FONT.UI_REGULAR,
        fontSize: 14,
        color: COLORS.MUTED,
        marginBottom: 4,
    },
    time: {
        fontFamily: FONT.UI_REGULAR,
        fontSize: 12,
        color: '#999',
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.PRIMARY_BTN,
        marginLeft: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontFamily: FONT.UI_MEDIUM,
        fontSize: 16,
        color: COLORS.MUTED,
        marginTop: 16,
    },
});
