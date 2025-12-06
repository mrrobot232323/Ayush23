import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    FlatList,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { COLORS, FONT } from "../../src/constants/theme";

const NEW_MATCHES = [
    { id: "1", name: "Jessica", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200" },
    { id: "2", name: "David", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200" },
    { id: "3", name: "Sarah", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200" },
    { id: "4", name: "Mike", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200" },
    { id: "5", name: "Emily", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200" },
];

const MESSAGES = [
    {
        id: "1",
        name: "Aarav Patel",
        message: "Hey! Are you also going to Bali?",
        time: "2m ago",
        unread: 2,
        img: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200",
    },
    {
        id: "2",
        name: "Sofia Martinez",
        message: "I loved the itinerary you shared!",
        time: "1h ago",
        unread: 0,
        img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200",
    },
    {
        id: "3",
        name: "James Wilson",
        message: "Let's meet at the airport.",
        time: "3h ago",
        unread: 0,
        img: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?q=80&w=200",
    },
    {
        id: "4",
        name: "Priya Sharma",
        message: "Can we reschedule the call?",
        time: "Yesterday",
        unread: 0,
        img: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=200",
    },
];

export default function ChatsScreen() {
    const router = useRouter();
    const renderMatch = ({ item }: { item: typeof NEW_MATCHES[0] }) => (
        <TouchableOpacity style={styles.matchItem}>
            <Image source={{ uri: item.img }} style={styles.matchAvatar} />
            <View style={styles.onlineDot} />
            <Text style={styles.matchName}>{item.name}</Text>
        </TouchableOpacity>
    );

    const renderMessage = ({ item }: { item: typeof MESSAGES[0] }) => (
        <TouchableOpacity style={styles.messageItem}>
            <Image source={{ uri: item.img }} style={styles.messageAvatar} />
            <View style={styles.messageContent}>
                <View style={styles.messageHeader}>
                    <Text style={[styles.userName, item.unread > 0 && styles.userNameBold]}>
                        {item.name}
                    </Text>
                    <Text style={styles.time}>{item.time}</Text>
                </View>
                <Text
                    numberOfLines={1}
                    style={[styles.lastMessage, item.unread > 0 && styles.lastMessageBold]}
                >
                    {item.message}
                </Text>
            </View>
            {item.unread > 0 && (
                <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{item.unread}</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.pageTitle}>Messages</Text>
                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity
                        style={[styles.iconBtn, { marginRight: 10 }]}
                        onPress={() => router.push('/notifications')}
                    >
                        <MaterialCommunityIcons name="bell-outline" size={26} color={COLORS.TEXT} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn}>
                        <MaterialCommunityIcons name="pencil-box-outline" size={26} color={COLORS.TEXT} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <MaterialCommunityIcons name="magnify" size={20} color={COLORS.MUTED} style={styles.searchIcon} />
                <TextInput
                    placeholder="Search conversations"
                    placeholderTextColor={COLORS.MUTED}
                    style={styles.searchInput}
                />
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                {/* New Matches */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>New Matches</Text>
                    <FlatList
                        data={NEW_MATCHES}
                        renderItem={renderMatch}
                        keyExtractor={item => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.matchesList}
                    />
                </View>

                {/* Messages List */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent</Text>
                    <FlatList
                        data={MESSAGES}
                        renderItem={renderMessage}
                        keyExtractor={item => item.id}
                        scrollEnabled={false} // Let parent ScrollView handle scrolling
                    />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.BG || "#fff",
        paddingTop: 60,
    },
    header: {
        paddingHorizontal: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    pageTitle: {
        fontSize: 28,
        fontFamily: FONT.UI_BOLD,
        color: COLORS.TEXT,
    },
    iconBtn: {
        padding: 8,
        backgroundColor: "#F5F5F5",
        borderRadius: 50,
    },

    searchContainer: {
        marginHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#EFF0F3",
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 50,
        marginBottom: 24,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        fontFamily: FONT.UI_MEDIUM,
        color: COLORS.TEXT,
    },

    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: FONT.UI_BOLD,
        color: COLORS.TEXT,
        marginLeft: 20,
        marginBottom: 16,
    },

    matchesList: {
        paddingLeft: 20,
        paddingRight: 10,
    },
    matchItem: {
        alignItems: "center",
        marginRight: 20,
        position: "relative",
    },
    matchAvatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        borderColor: "#fff", // or primary color
    },
    onlineDot: {
        position: "absolute",
        bottom: 20,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: "#22C55E", // Green
        borderWidth: 2,
        borderColor: "#fff",
    },
    matchName: {
        marginTop: 6,
        fontSize: 12,
        fontFamily: FONT.UI_MEDIUM,
        color: COLORS.TEXT,
    },

    messageItem: {
        flexDirection: "row",
        paddingHorizontal: 20,
        paddingVertical: 12,
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#F5F5F5",
    },
    messageAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    messageContent: {
        flex: 1,
        marginLeft: 16,
    },
    messageHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 4,
    },
    userName: {
        fontSize: 16,
        fontFamily: FONT.UI_BOLD, // or SemiBold
        color: COLORS.TEXT,
    },
    userNameBold: {
        fontFamily: FONT.UI_BOLD,
    },
    time: {
        fontSize: 12,
        color: COLORS.MUTED,
    },
    lastMessage: {
        fontSize: 14,
        color: COLORS.MUTED,
        fontFamily: FONT.UI_REGULAR,
    },
    lastMessageBold: {
        color: COLORS.TEXT,
        fontFamily: FONT.UI_MEDIUM,
    },
    unreadBadge: {
        backgroundColor: COLORS.PRIMARY || "#7C3AED",
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 8,
    },
    unreadText: {
        color: "#fff",
        fontSize: 10,
        fontFamily: FONT.UI_BOLD,
    },
});
