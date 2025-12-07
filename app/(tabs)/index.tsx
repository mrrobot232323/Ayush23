import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ROUTES } from "../../src/constants/routes";
import { COLORS, FONT } from "../../src/constants/theme";
import { useUser } from "../../src/context/UserContext";
import { getPushTokensForUser, sendPushNotification } from "../../src/lib/push";
import { supabase } from "../../src/lib/supabase";
import { useNavigation } from "../../src/utils/navigation";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_W - 32;
const SWIPE_THRESHOLD = SCREEN_W * 0.25;

type Profile = {
  id: string;
  name: string;
  pronouns: string;
  badges: string[];
  photos: string[];
  prompts: { q: string; a: string }[];
  bio: string;
  recentTrip?: { place: string; vibe: string } | null;
};

export default function DiscoverScreen() {
  const nav = useNavigation();
  const { setViewedProfile, session } = useUser();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMatchRequiredModal, setShowMatchRequiredModal] = useState(false);

  const position = useRef(new Animated.ValueXY()).current;
  const photoScrollRef = useRef<ScrollView>(null);
  const currentPhoto = useRef(0);

  const indexRef = useRef(0);
  const profilesRef = useRef<Profile[]>([]);

  useEffect(() => { indexRef.current = index; }, [index]);
  useEffect(() => { profilesRef.current = profiles; }, [profiles]);

  /* ---------------- FETCH PROFILES ---------------- */
  useEffect(() => {
    let mounted = true;

    const fixPhotos = (photosRaw: any): string[] => {
      // 1. Handle Null/Undefined
      if (!photosRaw) {
        console.log('fixPhotos: photosRaw is null/undefined');
        return ["https://placehold.co/600x800/png?text=No+Photo"];
      }

      // 2. Handle Arrays
      if (Array.isArray(photosRaw)) {
        const filtered = photosRaw.filter((p): p is string =>
          typeof p === 'string' && p.length > 0 && (p.startsWith('http') || p.startsWith('https'))
        );
        if (filtered.length > 0) {
          console.log('fixPhotos: returning array with', filtered.length, 'photos');
          return filtered;
        }
        console.log('fixPhotos: array is empty or invalid');
        return ["https://placehold.co/600x800/png?text=No+Photo"];
      }

      // 3. Handle Strings
      if (typeof photosRaw === "string") {
        let clean = photosRaw.trim();
        if (!clean) {
          console.log('fixPhotos: string is empty');
          return ["https://placehold.co/600x800/png?text=No+Photo"];
        }

        // Handle Postgres format {url,url} -> [url,url]
        if (clean.startsWith("{") && clean.endsWith("}")) {
          clean = "[" + clean.substring(1, clean.length - 1) + "]";
        }

        try {
          const parsed = JSON.parse(clean);
          if (Array.isArray(parsed)) {
            const filtered = parsed.filter((p): p is string =>
              typeof p === 'string' && p.length > 0 && (p.startsWith('http') || p.startsWith('https'))
            );
            if (filtered.length > 0) {
              console.log('fixPhotos: parsed JSON array with', filtered.length, 'photos');
              return filtered;
            }
            return ["https://placehold.co/600x800/png?text=No+Photo"];
          }
          // If it parses to a string (e.g. "http...")
          if (typeof parsed === 'string' && parsed.startsWith('http')) {
            console.log('fixPhotos: parsed single URL');
            return [parsed];
          }
        } catch (e) {
          // If JSON parse fails, it might be a raw string URL
          if (clean.startsWith("http") || clean.startsWith("https")) {
            console.log('fixPhotos: returning raw URL string');
            return [clean];
          }
          console.log('fixPhotos: JSON parse failed and not a URL:', clean);
        }
      }

      console.log('fixPhotos: falling back to placeholder');
      return ["https://placehold.co/600x800/png?text=No+Photo"];
    };

    const fetchProfiles = async () => {
      if (!session?.user) return;

      setLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .limit(50);

      if (error) {
        console.log("Profile fetch error:", error);
        return setLoading(false);
      }

      const others = data?.filter((p) => p.id !== session.user.id) || [];

      const mapped: Profile[] = others.map((p: any) => {
        const photoArray = fixPhotos(p.photos);
        console.log(`Profile ${p.id} (${p.name}): Processed ${photoArray.length} photos`, photoArray);

        const trip = p.recent_trip || {};
        const dest = trip.place || "";
        const vibe = trip.vibe || "chill";

        const prompts = [];
        if (p.prompts?.bio) prompts.push({ q: "About Me", a: p.prompts.bio });
        if (dest) prompts.push({ q: "Trip", a: `Going to ${dest} for a ${vibe} vibe!` });
        if (p.occupation) prompts.push({ q: "Work", a: p.occupation });
        if (p.location) prompts.push({ q: "From", a: p.location });

        return {
          id: p.id,
          name: p.name || "Traveller",
          pronouns:
            p.gender === "female"
              ? "she/her"
              : p.gender === "male"
                ? "he/him"
                : "they/them",
          badges: p.styles || [],
          photos: photoArray,
          prompts,
          bio: p.prompts?.bio || "",
          recentTrip: dest ? { place: dest, vibe } : null,
        };
      });

      if (mounted) {
        setProfiles(mapped.sort(() => Math.random() - 0.5));
        setLoading(false);
      }
    };

    fetchProfiles();
    return () => { mounted = false; };
  }, [session]);

  /* ---------------- CHECK MATCH ---------------- */
  const checkIfMatched = async (profileId: string): Promise<boolean> => {
    if (!session?.user?.id) return false;

    try {
      const myId = session.user.id;

      // Check both possible match combinations
      // Match 1: current user is user1, profile is user2
      const { data: match1 } = await supabase
        .from("matches")
        .select("id")
        .eq("user1", myId)
        .eq("user2", profileId)
        .maybeSingle();

      // Match 2: profile is user1, current user is user2
      const { data: match2 } = await supabase
        .from("matches")
        .select("id")
        .eq("user1", profileId)
        .eq("user2", myId)
        .maybeSingle();

      // Return true if either match exists
      return !!(match1 || match2);
    } catch (err) {
      console.log("Match check error:", err);
      return false;
    }
  };

  /* ---------------- HANDLE VIEW PROFILE ---------------- */
  const handleViewProfile = async (profile: Profile) => {
    if (!session?.user?.id) {
      Alert.alert("Error", "Please log in to view profiles");
      return;
    }

    // Check if they've matched
    const hasMatched = await checkIfMatched(profile.id);

    if (!hasMatched) {
      // Show security modal
      setShowMatchRequiredModal(true);
      return;
    }

    // If matched, allow viewing
    setViewedProfile(profile);
    nav.navigate(ROUTES.PROFILE_DETAIL);
  };

  /* ---------------- NEXT CARD ---------------- */
  const nextCard = () => {
    photoScrollRef.current?.scrollTo({ x: 0, animated: false });
    currentPhoto.current = 0;

    setTimeout(() => {
      setIndex((prev) => prev + 1);
      position.setValue({ x: 0, y: 0 });
    }, 120);
  };

  /* ---------------- PHOTO TAP ---------------- */
  const handlePhotoTap = () => {
    const p = profilesRef.current[indexRef.current];
    if (!p) return;

    currentPhoto.current =
      (currentPhoto.current + 1) % p.photos.length;

    photoScrollRef.current?.scrollTo({
      x: CARD_WIDTH * currentPhoto.current,
      animated: true,
    });
  };

  /* ---------------- LIKE / NOPE / MATCH ---------------- */
  const swipeAction = async (dir: "left" | "right") => {
    const p = profilesRef.current[indexRef.current];
    if (!p || !session?.user) return;

    const myId = session.user.id;
    nextCard();

    if (dir !== "right") return;

    try {
      await supabase.from("likes").upsert({
        sender_id: myId,
        receiver_id: p.id,
        type: "like",
      });

      const { data: likedMe } = await supabase
        .from("likes")
        .select("*")
        .eq("sender_id", p.id)
        .eq("receiver_id", myId)
        .maybeSingle();

      if (likedMe) {
        const { data: matchRow } = await supabase
          .from("matches")
          .insert({ user1: myId, user2: p.id })
          .select()
          .maybeSingle();

        if (matchRow?.id) {
          await supabase.from("chats").insert({
            match_id: matchRow.id,
          });
        }

        await supabase.from("notifications").insert([
          {
            user_id: p.id,
            sender_id: myId,
            type: "match",
            title: "You matched! 🎉",
            message: `${session.user.user_metadata?.name || "Someone"} matched with you.`,
          },
          {
            user_id: myId,
            sender_id: p.id,
            type: "match",
            title: "You matched! 🎉",
            message: `You matched with ${p.name}.`,
          },
        ]);

        const tokens = await getPushTokensForUser(p.id);
        for (const t of tokens) {
          await sendPushNotification(
            t,
            "You matched! 🎉",
            `You matched with ${session.user.user_metadata?.name || "Someone"}`
          );
        }
      } else {
        await supabase.from("notifications").insert({
          user_id: p.id,
          sender_id: myId,
          type: "like",
          title: "New Like ❤️",
          message: `${session.user.user_metadata?.name || "Someone"} liked your profile.`,
        });

        const tokens = await getPushTokensForUser(p.id);
        for (const t of tokens) {
          await sendPushNotification(
            t,
            "New Like ❤️",
            `${session.user.user_metadata?.name || "Someone"} liked you!`
          );
        }
      }
    } catch (err) {
      console.log("Swipe error:", err);
    }
  };

  /* ---------------- PAN RESPONDER ---------------- */
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) =>
        position.setValue({ x: g.dx, y: g.dy }),
      onPanResponderRelease: (_, g) => {
        if (g.dx > SWIPE_THRESHOLD) {
          Animated.timing(position, {
            toValue: { x: SCREEN_W * 1.5, y: g.dy },
            duration: 250,
            useNativeDriver: false,
          }).start(() => swipeAction("right"));
        } else if (g.dx < -SWIPE_THRESHOLD) {
          Animated.timing(position, {
            toValue: { x: -SCREEN_W * 1.5, y: g.dy },
            duration: 250,
            useNativeDriver: false,
          }).start(() => swipeAction("left"));
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  /* ---------------- UI ---------------- */
  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_W / 2, 0, SCREEN_W / 2],
    outputRange: ["-10deg", "0deg", "10deg"],
  });

  const likeOp = position.x.interpolate({
    inputRange: [0, SCREEN_W * 0.25],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const nopeOp = position.x.interpolate({
    inputRange: [-SCREEN_W * 0.25, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const p = profiles[index];

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text>Loading travellers...</Text>
      </View>
    );

  if (!p)
    return (
      <View style={styles.center}>
        <MaterialCommunityIcons
          name="check-circle-outline"
          color="#999"
          size={64}
        />
        <Text>No more profiles</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.name}>{p.name}</Text>
          <Text style={styles.sub}>{p.pronouns}</Text>
        </View>

        <TouchableOpacity
          onPress={async () => {
            await handleViewProfile(p);
          }}
          style={styles.iconBtn}
        >
          <MaterialCommunityIcons
            name="card-account-details-outline"
            size={26}
            color="#333"
          />
        </TouchableOpacity>
      </View>

      {/* CARD */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.card,
          {
            transform: [
              { translateX: position.x },
              { translateY: position.y },
              { rotate },
            ],
          },
        ]}
      >
        {/* LIKE / NOPE */}
        <Animated.View style={[styles.likeBadge, { opacity: likeOp }]}>
          <Text style={styles.likeText}>LIKE</Text>
        </Animated.View>

        <Animated.View style={[styles.nopeBadge, { opacity: nopeOp }]}>
          <Text style={styles.nopeText}>NOPE</Text>
        </Animated.View>

        {/* PHOTOS */}
        <Pressable onPress={handlePhotoTap} style={styles.photoContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            scrollEnabled={false}
            ref={photoScrollRef}
            showsHorizontalScrollIndicator={false}
            style={styles.photoScrollView}
          >
            {p.photos && p.photos.length > 0 ? (
              p.photos.map((uri, i) => (
                <View key={`${p.id}-photo-wrapper-${i}`} style={styles.photoWrapper}>
                  <Image
                    key={`${p.id}-photo-${i}`}
                    source={{ uri: uri }}
                    style={styles.photo}
                    resizeMode="cover"
                    onError={(e) => {
                      console.log('Image load error for profile:', p.id, 'photo index:', i, 'URI:', uri);
                    }}
                    onLoad={() => {
                      console.log('Image loaded successfully:', uri);
                    }}
                  />
                </View>
              ))
            ) : (
              <View style={styles.photoWrapper}>
                <Image
                  source={{ uri: "https://placehold.co/600x800/png?text=No+Photo" }}
                  style={styles.photo}
                  resizeMode="cover"
                />
              </View>
            )}
          </ScrollView>
        </Pressable>

        {/* DETAILS */}
        <View style={styles.content}>
          {p.recentTrip && (
            <View style={styles.tripBanner}>
              <MaterialCommunityIcons
                name="airplane-takeoff"
                size={14}
                color="#fff"
              />
              <Text style={styles.tripText}>
                {p.recentTrip.place} • {p.recentTrip.vibe}
              </Text>
            </View>
          )}

          {/* Badges */}
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {p.badges.map((b, i) => (
              <View key={`${p.id}-badge-${i}`} style={styles.tag}>
                <Text style={styles.tagText}>{b}</Text>
              </View>
            ))}
          </View>

          {/* Prompts */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {p.prompts.map((pr, i) => (
              <View key={`${p.id}-prompt-${i}`} style={styles.prompt}>
                <Text style={styles.q}>{pr.q}</Text>
                <Text style={styles.a}>{pr.a}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </Animated.View>

      {/* FOOTER BUTTONS */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() =>
            Animated.timing(position, {
              toValue: { x: -SCREEN_W * 1.5, y: 0 },
              duration: 250,
              useNativeDriver: false,
            }).start(() => swipeAction("left"))
          }
          style={styles.roundBtn}
        >
          <MaterialCommunityIcons name="close" size={32} color="#E64646" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            Animated.timing(position, {
              toValue: { x: SCREEN_W * 1.5, y: 0 },
              duration: 250,
              useNativeDriver: false,
            }).start(() => swipeAction("right"))
          }
          style={[styles.roundBtn, { backgroundColor: "#18181b" }]}
        >
          <MaterialCommunityIcons name="heart" size={32} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Match Required Modal */}
      <Modal
        visible={showMatchRequiredModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMatchRequiredModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons
                name="lock"
                size={48}
                color={COLORS.PRIMARY}
              />
              <Text style={styles.modalTitle}>Profile Locked</Text>
            </View>

            <Text style={styles.modalMessage}>
              You can only see full profiles when you've matched with someone.
            </Text>
            <Text style={styles.modalSubMessage}>
              Swipe right to like them and if they like you back, you'll be able to view their complete profile!
            </Text>

            <View style={styles.modalFeatures}>
              <View style={styles.featureRow}>
                <MaterialCommunityIcons name="heart" size={20} color="#FF5864" />
                <Text style={styles.featureText}>Swipe right to like</Text>
              </View>
              <View style={styles.featureRow}>
                <MaterialCommunityIcons name="check-circle" size={20} color="#22C55E" />
                <Text style={styles.featureText}>Get matched to unlock</Text>
              </View>
              <View style={styles.featureRow}>
                <MaterialCommunityIcons name="eye" size={20} color={COLORS.PRIMARY} />
                <Text style={styles.featureText}>View full profile after match</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowMatchRequiredModal(false)}
            >
              <Text style={styles.modalButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG, paddingTop: 50 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 16,
  },

  name: {
    fontSize: 28,
    fontFamily: FONT.UI_BOLD,
    color: COLORS.TEXT,
    marginBottom: 4,
  },
  sub: {
    fontSize: 14,
    fontFamily: FONT.UI_MEDIUM,
    color: COLORS.MUTED,
  },
  iconBtn: {
    padding: 12,
    backgroundColor: COLORS.WHITE,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  card: {
    width: CARD_WIDTH,
    height: SCREEN_H * 0.72,
    backgroundColor: COLORS.WHITE,
    borderRadius: 24,
    alignSelf: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },

  photoContainer: {
    width: CARD_WIDTH,
    height: SCREEN_H * 0.72,
    backgroundColor: "#F0F0F0",
    overflow: "hidden",
  },
  photoScrollView: {
    width: CARD_WIDTH,
    height: "100%",
  },
  photoWrapper: {
    width: CARD_WIDTH,
    height: "100%",
  },
  photo: {
    width: CARD_WIDTH,
    height: "100%",
    backgroundColor: "#F0F0F0",
  },

  content: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 24,
    backgroundColor: "rgba(255,255,255,0.98)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  tripBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.LINK,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 100,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  tripText: {
    color: COLORS.WHITE,
    marginLeft: 8,
    fontSize: 12,
    fontFamily: FONT.UI_MEDIUM,
  },

  tag: {
    backgroundColor: "#F6F6F6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    fontFamily: FONT.UI_MEDIUM,
    color: COLORS.TEXT,
  },

  prompt: {
    marginRight: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#F9F9F9",
    borderWidth: 1,
    borderColor: "#EAEAEA",
    maxWidth: 240,
  },

  q: {
    fontSize: 11,
    color: COLORS.MUTED,
    marginBottom: 4,
    fontFamily: FONT.UI_MEDIUM,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  a: {
    fontSize: 14,
    fontFamily: FONT.UI_BOLD,
    color: COLORS.TEXT,
    lineHeight: 20,
  },

  likeBadge: {
    position: "absolute",
    top: 50,
    left: 40,
    borderWidth: 4,
    borderColor: "#22C55E",
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
    transform: [{ rotate: "-15deg" }],
    zIndex: 10,
  },
  likeText: {
    fontSize: 32,
    color: "#22C55E",
    fontFamily: FONT.UI_BOLD,
    letterSpacing: 2,
  },

  nopeBadge: {
    position: "absolute",
    top: 50,
    right: 40,
    borderWidth: 4,
    borderColor: "#EF4444",
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
    transform: [{ rotate: "15deg" }],
    zIndex: 10,
  },
  nopeText: {
    fontSize: 32,
    color: "#EF4444",
    fontFamily: FONT.UI_BOLD,
    letterSpacing: 2,
  },

  footer: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },

  roundBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.WHITE,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: FONT.UI_BOLD,
    color: COLORS.TEXT,
    marginTop: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    fontFamily: FONT.UI_MEDIUM,
    color: COLORS.TEXT,
    textAlign: "center",
    marginBottom: 8,
  },
  modalSubMessage: {
    fontSize: 14,
    fontFamily: FONT.UI_REGULAR,
    color: COLORS.MUTED,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  modalFeatures: {
    width: "100%",
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    fontFamily: FONT.UI_MEDIUM,
    color: COLORS.TEXT,
    marginLeft: 12,
  },
  modalButton: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.PRIMARY || "#7C3AED",
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: FONT.UI_BOLD,
    color: "#fff",
  },
});
