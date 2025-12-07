import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    FlatList,
    Image,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { COLORS, FONT } from "../../src/constants/theme";
import { useUser } from "../../src/context/UserContext";
import { supabase } from "../../src/lib/supabase";

export default function ChatsScreen() {
    const router = useRouter();
    const { session } = useUser();

    const [recentMatches, setRecentMatches] = useState<any[]>([]);
    const [chatList, setChatList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [myProfile, setMyProfile] = useState<any>(null);
    const [hasUnreadNotifs, setHasUnreadNotifs] = useState(false);

    const loadData = async () => {
        if (!session?.user) return;
        setLoading(true);

        try {
            // 1. Get My Profile (for Name)
            const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", session.user.id)
                .single();
            setMyProfile(profile);

            // 2. Get Matches (for Stories/Top Row)
            const { data: matchRows } = await supabase
                .from("matches")
                .select("id, user1, user2, created_at")
                .or(`user1.eq.${session.user.id},user2.eq.${session.user.id}`)
                .order("created_at", { ascending: false })
                .limit(10);

            const rawIds = (matchRows || []).map(m => m.user1 === session.user.id ? m.user2 : m.user1);
            const otherIds = Array.from(new Set(rawIds));
            if (otherIds.length > 0) {
                const { data: matchProfiles } = await supabase.from("profiles").select("*").in("id", otherIds);
                // Map back to maintain order
                const ordered = otherIds.map(id => matchProfiles?.find(p => p.id === id)).filter(Boolean);
                setRecentMatches(ordered as any[]);
            } else {
                setRecentMatches([]);
            }

            // 3. Get Chats (Active Conversations)
            // fetch matches again (all of them) or reuse
            // For the list, we specifically want chats that exist
            const { data: allMatches } = await supabase
                .from("matches")
                .select("id, user1, user2")
                .or(`user1.eq.${session.user.id},user2.eq.${session.user.id}`);

            if (allMatches && allMatches.length > 0) {
                const matchIds = allMatches.map(m => m.id);
                // fetch chat rows
                const { data: chats } = await supabase
                    .from("chats")
                    .select("id, match_id, created_at")
                    .in("match_id", matchIds);

                // For each chat, fetch:
                // a. The other user's profile
                // b. The last message
                // c. Unread count
                // This is N queries, acceptable for MVP.
                const processed = await Promise.all((chats || []).map(async (chat) => {
                    const match = allMatches.find(m => m.id === chat.match_id);
                    if (!match) return null;
                    const otherId = match.user1 === session.user.id ? match.user2 : match.user1;

                    const [userRes, msgRes, unreadRes] = await Promise.all([
                        supabase.from("profiles").select("*").eq("id", otherId).single(),
                        supabase.from("messages").select("*").eq("chat_id", chat.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
                        supabase.from("messages").select("*", { count: 'exact', head: true }).eq("chat_id", chat.id).eq("receiver_id", session.user.id).is("seen_at", null)
                    ]);

                    return {
                        ...chat,
                        otherUser: userRes.data,
                        lastMessage: msgRes.data,
                        unreadCount: unreadRes.count || 0
                    };
                }));

                // Filter out empty/nulls and sort by last message time
                const validChats = processed.filter(Boolean).sort((a: any, b: any) => {
                    const tA = new Date(a.lastMessage?.created_at || a.created_at).getTime();
                    const tB = new Date(b.lastMessage?.created_at || b.created_at).getTime();
                    return tB - tA;
                });

                setChatList(validChats as any[]);
            } else {
                setChatList([]);
            }

            // 4. Check for unread notifications
            const { count: notifCount } = await supabase
                .from("notifications")
                .select("id", { count: 'exact', head: true })
                .eq("user_id", session.user.id)
                .is("read_at", null);

            setHasUnreadNotifs(!!notifCount && notifCount > 0);

        } catch (e) {
            console.log("Error loading chats:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        // Subscribe to messages and notifications to update list/dot real-time
        const sub = supabase.channel('chats-screen-updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
                loadData();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
                loadData();
            })
            .subscribe();
        return () => { supabase.removeChannel(sub); };
    }, [session]);

    const uniqueChats = useMemo(() => {
        const seen = new Set();
        return chatList.filter(c => {
            // Deduplicate by the other user's ID to ensure distinct people in the list
            const otherId = c.otherUser?.id;
            if (!otherId || seen.has(otherId)) return false;
            seen.add(otherId);
            return true;
        });
    }, [chatList]);

    const uniqueStories = useMemo(() => {
        const seen = new Set();
        return recentMatches.filter(m => {
            const id = String(m.id);
            if (seen.has(id)) return false;
            seen.add(id);
            return true;
        });
    }, [recentMatches]);

    const renderStory = ({ item, index }: { item: any, index: number }) => {
        const uri = item.photos?.[0] || "https://placehold.co/100x100";
        return (
            <View style={styles.storyContainer}>
                <View style={[styles.storyCircle, { borderColor: COLORS.PRIMARY_BTN }]}>
                    <Image source={{ uri }} style={styles.storyAvatar} />
                </View>
                <Text style={styles.storyName} numberOfLines={1}>
                    {item.name?.split(' ')[0]}
                </Text>
            </View>
        );
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.headerTop}>
                <View>
                    <Text style={styles.greeting}>Hi {myProfile?.name?.split(' ')[0]}</Text>
                    <Text style={styles.subGreeting}>
                        {chatList.reduce((acc, c) => acc + (c.unreadCount || 0), 0)} unread messages
                    </Text>
                </View>
                <TouchableOpacity style={styles.notifBtn} onPress={() => router.push('/notifications')}>
                    <Ionicons name="notifications-outline" size={24} color={COLORS.TEXT} />
                    {hasUnreadNotifs && <View style={styles.redDot} />}
                </TouchableOpacity>
            </View>

            {/* Stories Row */}
            <View style={styles.storiesRow}>
                {/* Add Story Button (Mock) */}
                <View style={styles.storyContainer}>
                    <TouchableOpacity style={styles.addStoryCircle}>
                        <Ionicons name="add" size={28} color="#666" />
                    </TouchableOpacity>
                    <Text style={styles.storyName}>Add Story</Text>
                </View>

                {/* Recent matches as stories */}
                <FlatList
                    data={uniqueStories}
                    horizontal
                    renderItem={renderStory}
                    keyExtractor={item => item.id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingLeft: 8 }}
                />
            </View>
        </View>
    );

    const renderChatItem = ({ item }: { item: any }) => {
        const uri = item.otherUser?.photos?.[0] || "https://placehold.co/100x100";
        const lastMsg = item.lastMessage?.content || "No messages yet";
        const time = item.lastMessage?.created_at
            ? new Date(item.lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : "";
        const isUnread = (item.unreadCount || 0) > 0;

        return (
            <TouchableOpacity
                style={styles.chatRow}
                onPress={() => router.push(`/chat-room?chat=${item.id}&other=${item.otherUser?.id}`)}
            >
                <Image source={{ uri }} style={styles.chatAvatar} />

                <View style={styles.chatContent}>
                    <View style={styles.chatHeader}>
                        <Text style={styles.chatName}>{item.otherUser?.name}</Text>
                        <Text style={[styles.chatTime, isUnread && styles.chatTimeUnread]}>{time}</Text>
                    </View>

                    <View style={styles.chatFooter}>
                        <Text
                            style={[styles.chatLastMsg, isUnread && styles.chatLastMsgUnread]}
                            numberOfLines={1}
                        >
                            {/* Assuming text contentType for now */}
                            {lastMsg}
                        </Text>

                        {isUnread && (
                            <View style={styles.unreadBadge}>
                                <Text style={styles.unreadText}>{item.unreadCount}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={{ flex: 1 }}>
                <FlatList
                    data={uniqueChats}
                    keyExtractor={item => item.id}
                    renderItem={renderChatItem}
                    ListHeaderComponent={renderHeader}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
                    ListEmptyComponent={
                        !loading ? (
                            <View style={styles.emptyState}>
                                <Text style={{ color: '#999' }}>No chats yet. Start matching!</Text>
                            </View>
                        ) : null
                    }
                />
            </View>
        </SafeAreaView>
    );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.BG,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 12,
        marginBottom: 8,
    },
    headerTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    greeting: {
        fontSize: 32,
        fontFamily: FONT.UI_BOLD,
        color: COLORS.TEXT,
        letterSpacing: -0.5,
    },
    subGreeting: {
        fontSize: 14,
        fontFamily: FONT.UI_MEDIUM,
        color: COLORS.MUTED,
        marginTop: 4,
    },
    notifBtn: {
        padding: 12,
        borderRadius: 50,
        backgroundColor: COLORS.WHITE,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    redDot: {
        position: "absolute",
        top: 10,
        right: 12,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#EF4444",
        borderWidth: 2,
        borderColor: COLORS.WHITE,
    },

    storiesRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingBottom: 24,
    },
    storyContainer: {
        alignItems: "center",
        marginRight: 20,
        width: 72,
    },
    addStoryCircle: {
        width: 68,
        height: 68,
        borderRadius: 34,
        borderWidth: 2,
        borderColor: "#E5E7EB",
        borderStyle: "dashed",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.WHITE,
        marginBottom: 8,
    },
    storyCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        padding: 3,
        borderWidth: 2,
        marginBottom: 8,
    },
    storyAvatar: {
        flex: 1,
        borderRadius: 36,
        backgroundColor: "#F3F4F6",
    },
    storyName: {
        fontSize: 12,
        fontFamily: FONT.UI_MEDIUM,
        color: COLORS.TEXT,
        textAlign: "center",
    },

    // Chat List
    chatRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingVertical: 16,
        backgroundColor: COLORS.WHITE,
        marginBottom: 1, // Separator line effect
    },
    chatAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#F3F4F6",
    },
    chatContent: {
        flex: 1,
        marginLeft: 16,
        justifyContent: "center",
    },
    chatHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },
    chatName: {
        fontSize: 16,
        fontFamily: FONT.UI_BOLD,
        color: COLORS.TEXT,
    },
    chatTime: {
        fontSize: 12,
        fontFamily: FONT.UI_MEDIUM,
        color: COLORS.MUTED,
    },
    chatTimeUnread: {
        color: COLORS.PRIMARY,
        fontFamily: FONT.UI_BOLD,
    },
    chatFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    chatLastMsg: {
        fontSize: 14,
        fontFamily: FONT.UI_MEDIUM,
        color: COLORS.MUTED,
        flex: 1,
        marginRight: 16,
        lineHeight: 20,
    },
    chatLastMsgUnread: {
        color: COLORS.TEXT,
        fontFamily: FONT.UI_BOLD,
    },
    unreadBadge: {
        backgroundColor: COLORS.PRIMARY,
        minWidth: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 6,
    },
    unreadText: {
        fontSize: 11,
        color: COLORS.WHITE,
        fontFamily: FONT.UI_BOLD,
    },

    emptyState: {
        padding: 60,
        alignItems: "center",
    },
});
