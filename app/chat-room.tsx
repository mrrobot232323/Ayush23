import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS, FONT } from "../src/constants/theme";
import { useUser } from "../src/context/UserContext";
import { supabase } from "../src/lib/supabase";

/* Tinder-style bubbles:
   - full-width bubble with large avatar pinned to bottom (we'll show small avatar beside incoming messages)
   - typing dots at bottom when other user is typing
   - message delivered_at / seen_at indicators next to last sent message
*/

export default function ChatRoom() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { session } = useUser();
  const chatId = (params as any)?.chat;
  const otherId = (params as any)?.other;

  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const flatRef = useRef<FlatList>(null);
  const myId = session?.user?.id;

  useEffect(() => {
    if (!chatId) return;

    let mounted = true;

    const loadMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      if (mounted) {
        setMessages(data || []);
        setLoading(false);

        // Mark messages as delivered for receiver side (if there are messages not from me)
        const undelivered = (data || []).filter((m: any) => m.receiver_id === myId && !m.delivered_at);
        if (undelivered.length > 0) {
          const ids = undelivered.map((m) => m.id);
          await supabase.from("messages").update({ delivered_at: new Date() }).in("id", ids);
        }
      }
    };

    loadMessages();

    // subscribe to new messages in this chat
    const channel = supabase
      .channel(`chat-${chatId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `chat_id=eq.${chatId}` },
        (payload) => {
          const msg = payload.new;
          setMessages((prev) => {
            // Deduplicate incoming realtime messages
            if (prev.some((m) => String(m.id) === String(msg.id))) return prev;
            return [...prev, msg];
          });

          // If message is for me, update delivered_at and seen_at immediately since I'm in the chat
          if (msg.receiver_id === myId) {
            const now = new Date().toISOString();
            supabase.from("messages").update({
              delivered_at: now,
              seen_at: now
            }).eq("id", msg.id);
          }

          // scroll
          setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 50);
        }
      )
      // listen to updates for seen
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages", filter: `chat_id=eq.${chatId}` },
        (payload) => {
          const updated = payload.new;
          setMessages((prev) => prev.map((m) => m.id === updated.id ? updated : m));
        }
      )
      // typing indicator changes
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "typing_indicators", filter: `chat_id=eq.${chatId}` },
        async () => {
          // reload typing indicators for this chat
          const { data } = await supabase.from("typing_indicators").select("*").eq("chat_id", chatId);
          setTypingUsers((data || []).filter((t: any) => t.is_typing && t.user_id !== myId).map((t: any) => t.user_id));
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [chatId, myId]);

  // mark all messages as seen when this chat opened / focused for messages where receiver is me
  useEffect(() => {
    const markSeen = async () => {
      if (!chatId || !myId) return;
      const { data } = await supabase
        .from("messages")
        .select("id")
        .eq("chat_id", chatId)
        .eq("receiver_id", myId)
        .is("seen_at", null);

      if (data && data.length > 0) {
        const ids = data.map((d: any) => d.id);
        await supabase.from("messages").update({ seen_at: new Date() }).in("id", ids);
      }
    };
    markSeen();
  }, [chatId, myId]);

  // Send typing status when input changes
  useEffect(() => {
    let timer: any;
    const setTyping = async (isTyping: boolean) => {
      if (!chatId || !myId) return;
      // upsert typing_indicators
      await supabase.from("typing_indicators").upsert({
        chat_id: chatId,
        user_id: myId,
        is_typing: isTyping,
        updated_at: new Date().toISOString(),
      }, { onConflict: "chat_id, user_id" });
    };

    if (text.length > 0) {
      setTyping(true);
      // clear after 2s of inactivity
      clearTimeout(timer);
      timer = setTimeout(() => setTyping(false), 1800);
    } else {
      setTyping(false);
    }

    return () => {
      clearTimeout(timer);
      // mark not typing on unmount
      setTyping(false);
    };
  }, [text, chatId, myId]);

  const sendMessage = async () => {
    if (!chatId || !myId || !otherId || text.trim().length === 0) return;
    const payload = {
      chat_id: chatId,
      sender_id: myId,
      receiver_id: otherId,
      content: text.trim(),
      content_type: "text",
    };

    // optimistic UI - use a highly unique ID to prevent collisions during rapid sends
    const optimistic = { ...payload, id: `tmp-${Date.now()}-${Math.random()}`, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, optimistic]);
    setText("");

    // insert
    const { data, error } = await supabase.from("messages").insert(payload).select().maybeSingle();
    if (error) {
      console.log("send error", error);
      // TODO: show failed state
    } else if (data) {
      // replace optimistic with real row
      setMessages((prev) => {
        // If the real message arrived via subscription already, remove the optimistic one
        if (prev.some((m) => String(m.id) === String(data.id))) {
          return prev.filter((m) => m.id !== optimistic.id);
        }
        // Otherwise replace optimistic with real
        return prev.map((m) => m.id === optimistic.id ? data : m);
      });
    }

    // mark typing false
    await supabase.from("typing_indicators").upsert({
      chat_id: chatId,
      user_id: myId,
      is_typing: false,
      updated_at: new Date().toISOString(),
    }, { onConflict: "chat_id, user_id" });
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMine = item.sender_id === myId;
    const bubbleStyle = isMine ? styles.myBubble : styles.theirBubble;
    const textStyle = isMine ? styles.myText : styles.theirText;

    return (
      <View style={[styles.messageRow, isMine ? { justifyContent: "flex-end" } : { justifyContent: "flex-start" }]}>
        {!isMine && (
          <Image source={{ uri: item.sender_avatar || "https://placehold.co/100x100" }} style={styles.theirAvatar} />
        )}

        <View style={bubbleStyle}>
          <Text style={textStyle}>{item.content}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            {isMine && (
              <Text style={styles.metaText}>
                {item.seen_at ? " • Seen" : item.delivered_at ? " • Delivered" : " • Sent"}
              </Text>
            )}
          </View>
        </View>

        {isMine && (
          <Image source={{ uri: session?.user?.user_metadata?.avatar || "https://placehold.co/100x100" }} style={styles.myAvatar} />
        )}
      </View>
    );
  };

  const uniqueMessages = useMemo(() => {
    const seen = new Set();
    return messages.filter((m) => {
      const id = String(m.id);
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [messages]);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.TEXT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat</Text>
        <View style={{ width: 32 }} />
      </View>

      <FlatList
        ref={flatRef}
        data={uniqueMessages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id ? String(item.id) : `err-${Math.random()}`}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <View style={styles.typingRow}>
          <View style={styles.typingBubble}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Send a message"
          placeholderTextColor="#888"
          value={text}
          onChangeText={setText}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const AV_SIZE = 36;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG
  },
  header: {
    height: 60,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONT.UI_BOLD,
    color: COLORS.TEXT
  },

  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 16
  },
  theirAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: "#F0F0F0",
  },
  myAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginLeft: 8,
    backgroundColor: "#F0F0F0",
  },

  theirBubble: {
    maxWidth: "75%",
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  myBubble: {
    maxWidth: "75%",
    backgroundColor: COLORS.LINK, // Dark
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomRightRadius: 4,
    alignSelf: "flex-end",
  },
  theirText: {
    color: COLORS.TEXT,
    fontSize: 15,
    fontFamily: FONT.UI_REGULAR,
    lineHeight: 22,
  },
  myText: {
    color: COLORS.WHITE,
    fontSize: 15,
    fontFamily: FONT.UI_REGULAR,
    lineHeight: 22,
  },

  metaRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 4
  },
  metaText: {
    fontSize: 10,
    color: "rgba(0,0,0,0.4)",
    fontFamily: FONT.UI_MEDIUM,
    marginLeft: 6
  },

  typingRow: {
    paddingHorizontal: 20,
    marginBottom: 12
  },
  typingBubble: {
    width: 54,
    height: 32,
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.MUTED
  },

  inputRow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24, // extra padding for safe area logic usually handled by KeyboardAvoidingView offset, but good to have breathing room
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.WHITE,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: "#F9F9F9",
    borderRadius: 24,
    paddingHorizontal: 20,
    fontSize: 16,
    fontFamily: FONT.UI_MEDIUM,
    color: COLORS.TEXT,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.LINK,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
});
