import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONT } from "../src/constants/theme";
import { useUser } from "../src/context/UserContext";
import { supabase } from "../src/lib/supabase";

export default function Notifications() {
    const router = useRouter();
    const { session } = useUser();
    const [list, setList] = useState<any[]>([]);

    const loadNotifs = async () => {
        if (!session?.user) return;

        const { data, error } = await supabase
            .from("notifications")
            .select("*, sender:profiles(name, photos)")
            .eq("user_id", session.user.id)
            .order("created_at", { ascending: false });

        if (!error) setList(data || []);
    };

    useEffect(() => {
        if (!session?.user) return;
        loadNotifs();

        const sub = supabase
            .channel("notif-realtime")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "notifications" },
                loadNotifs
            )
            .subscribe();

        return () => {
            supabase.removeChannel(sub);
        };
    }, [session]);

    const openChatForMatch = async (notification: any) => {
        // Try to find chat for the match between current user and sender
        if (!notification.sender_id || !session?.user) return router.push("/(tabs)/chats");

        // Search matches table for a match between the two users and then lookup chat
        const { data: matchRows } = await supabase
            .from("matches")
            .select("id, user1, user2")
            .or(`user1.eq.${session.user.id},user2.eq.${session.user.id}`)
            .or(`user1.eq.${notification.sender_id},user2.eq.${notification.sender_id}`)
            .limit(1);

        if (matchRows && matchRows.length > 0) {
            const matchId = matchRows[0].id;
            const { data: chatRows } = await supabase.from("chats").select("id").eq("match_id", matchId).limit(1);
            if (chatRows && chatRows.length > 0) {
                return router.push(`/chat-room?chat=${chatRows[0].id}&other=${notification.sender_id}`);
            }
        }

        // fallback
        router.push("/(tabs)/chats");
    };

    const renderNotification = ({ item, index }: { item: any, index: number }) => {
        const avatar = item.sender?.photos?.[0];

        return (
            <Animated.View
                entering={FadeInDown.delay(index * 80).springify()}
                style={styles.card}
            >
                <View style={styles.row}>
                    <View>
                        {avatar ? (
                            <Image source={{ uri: avatar }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Ionicons name="person" size={26} color="#fff" />
                            </View>
                        )}
                    </View>

                    <View style={{ marginLeft: 14, flex: 1 }}>
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.msg}>{item.message}</Text>
                        <Text style={styles.time}>
                            {new Date(item.created_at).toLocaleTimeString()}
                        </Text>
                    </View>

                    {item.type === "match" ? (
                        <TouchableOpacity style={styles.chatBtn} onPress={() => openChatForMatch(item)}>
                            <Ionicons name="chatbubble-ellipses" size={18} color="#fff" />
                        </TouchableOpacity>
                    ) : null}
                </View>
            </Animated.View>
        );
    };



    const uniqueList = useMemo(() => {
        const seen = new Set();
        return list.filter(item => {
            const id = String(item.id);
            if (seen.has(id)) return false;
            seen.add(id);
            return true;
        });
    }, [list]);

    return (
        <SafeAreaView style={styles.wrapper}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.TEXT} />
                </TouchableOpacity>
                <Text style={styles.headerText}>Notifications</Text>
                <Ionicons name="ellipsis-horizontal" size={24} color={COLORS.TEXT} />
            </View>

            <FlatList
                data={uniqueList}
                keyExtractor={(item) => item.id}
                renderItem={renderNotification}
                contentContainerStyle={{ padding: 16 }}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="notifications-off-outline" size={64} color={COLORS.MUTED} />
                        <Text style={styles.emptyText}>No notifications yet</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    wrapper: { flex: 1, backgroundColor: COLORS.BG },
    header: {
        padding: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    headerText: {
        fontSize: 20,
        fontFamily: FONT.UI_BOLD,
        color: COLORS.TEXT,
    },

    card: {
        padding: 14,
        backgroundColor: COLORS.WHITE,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
    },
    row: { flexDirection: "row", alignItems: "center" },

    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
    },
    avatarPlaceholder: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: COLORS.PRIMARY_BTN,
        justifyContent: "center",
        alignItems: "center",
    },

    title: { fontSize: 16, fontFamily: FONT.UI_BOLD, color: COLORS.TEXT },
    msg: { fontSize: 14, color: COLORS.MUTED, marginTop: 2 },
    time: { fontSize: 12, color: "#999", marginTop: 4 },

    chatBtn: {
        padding: 8,
        backgroundColor: COLORS.PRIMARY_BTN,
        borderRadius: 10,
    },

    empty: { marginTop: 100, alignItems: "center" },
    emptyText: { marginTop: 14, fontSize: 16, color: COLORS.MUTED },
});
