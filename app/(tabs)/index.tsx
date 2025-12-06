// DiscoverScreen.tsx
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  PanResponder,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS, FONT } from "../../src/constants/theme";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_W * 0.25;
const SUPERLIKE_THRESHOLD = -120;
const CARD_WIDTH = SCREEN_W - 32;

/* ---------------- DEMO DATA (supports multiple prompts) ---------------- */
const demoProfiles = [
  {
    id: "p1",
    name: "Poorva",
    pronouns: "she/her",
    verified: true,
    badges: ["Foodie", "Beach lover", "Nightlife"],
    photos: [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2000",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=2000",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=2000",
    ],
    prompts: [
      { q: "I go crazy for", a: "Good food and cricket" },
      { q: "My type is", a: "Someone who loves sunsets & long walks" },
      { q: "A fun fact", a: "I’ve backpacked across 11 countries" },
    ],
    distanceKm: 4.6,
    travelCompatibility: 82,
    bio: "Coffee, beaches, and spontaneous road trips. Always packing snacks.",
  },
  {
    id: "p2",
    name: "Arjun",
    pronouns: "he/him",
    verified: false,
    badges: ["Hiker", "Street Food", "Ramen"],
    photos: [
      "https://images.unsplash.com/photo-1545996124-1a61c1d7a5a9?q=80",
      "https://images.unsplash.com/photo-1544006659-f0b21884ce1d?q=80",
    ],
    prompts: [
      { q: "My weekend looks like", a: "Hiking and trying street food" },
      { q: "Most likely to", a: "Book a last-minute weekend trip" },
      { q: "Favorite snack", a: "Gobi Manchurian" },
    ],
    distanceKm: 12.3,
    travelCompatibility: 68,
    bio: "UX designer who loves ramen & roadtrips.",
  },
];

/* ------------------ DiscoverScreen Component ------------------ */
import { useUser } from "../../src/context/UserContext";

/* ------------------ DiscoverScreen Component ------------------ */
export default function DiscoverScreen() {
  const router = useRouter();
  const { profile } = useUser();

  // Calculate compatibility dynamically
  const [profiles, setProfiles] = useState(() => {
    return demoProfiles.map(p => {
      // Simple match logic: count shared interest vs total user interests
      let matchCount = 0;
      if (profile?.styles) {
        const pTags = new Set([...p.badges, ...(p.prompts?.map(x => x.a) || [])].map(s => s.toLowerCase()));
        profile.styles.forEach(s => {
          // Loose matching to simulate hits
          if (pTags.has(s.toLowerCase()) || Math.random() > 0.7) matchCount++;
        });
      }
      // Base score 60 + bonus
      const score = Math.min(99, 60 + (matchCount * 10) + Math.floor(Math.random() * 10));
      return { ...p, travelCompatibility: score };
    });
  });

  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMatch, setShowMatch] = useState({ visible: false, title: "" });

  // Animated values
  const position = useRef(new Animated.ValueXY()).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(1)).current;
  const matchScale = useRef(new Animated.Value(0)).current;

  // Carousel helper
  const photoScrollRef = useRef<ScrollView>(null);
  const photoIndex = useRef(0);

  // Bottom sheet
  const sheetAnim = useRef(new Animated.Value(SCREEN_H)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const dragSheetResponder = useRef<any>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  /* ------------------ Loading / fade in ------------------ */
  useEffect(() => {
    // Simulate finding people near your location
    const t = setTimeout(() => {
      setLoading(false);
      Animated.timing(fadeIn, { toValue: 1, duration: 350, useNativeDriver: true }).start();
    }, 800);
    return () => clearTimeout(t);
  }, []);

  /* ------------------ Tap to change photo ------------------ */
  const handlePhotoTap = (e: any) => {
    const p = profiles[index];
    if (!p) return;

    // reset auto rotation if we had one? No we removed it.

    const x = e.nativeEvent.locationX;
    const isRight = x > CARD_WIDTH / 2;

    let nextIndex = photoIndex.current;
    if (isRight) {
      if (nextIndex < p.photos.length - 1) nextIndex++;
      else nextIndex = 0; // Loop or stop? Dating apps usually stop or loop. Loop is fine.
    } else {
      if (nextIndex > 0) nextIndex--;
      else nextIndex = p.photos.length - 1;
    }

    photoIndex.current = nextIndex;
    photoScrollRef.current?.scrollTo({ x: nextIndex * CARD_WIDTH, animated: true });
    // Force update to re-render dots if needed, but we used ref for index tracking in render... 
    // Wait, the dots rely on 'photoIndex.current' which isn't state. We need to trigger re-render or use state for dots.
    // Let's use setTick to force render.
    setTick(t => t + 1);
  };
  const [tick, setTick] = useState(0); // force re-render for dots

  /* ------------------ Card lift micro-interaction ------------------ */
  const lift = () => {
    Animated.spring(cardScale, { toValue: 1.04, useNativeDriver: true }).start();
  };
  const drop = () => {
    Animated.spring(cardScale, { toValue: 1, useNativeDriver: true }).start();
  };

  /* ------------------ PanResponder (swipe + superlike) ------------------ */
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => lift(),
      onPanResponderMove: Animated.event([null, { dx: position.x, dy: position.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, g) => {
        drop();

        // Super-like (swipe up)
        if (g.dy < SUPERLIKE_THRESHOLD && Math.abs(g.dx) < 80) {
          Animated.timing(position, {
            toValue: { x: 0, y: -SCREEN_H },
            duration: 240,
            useNativeDriver: true,
          }).start(() => {
            handleSuperLike();
          });
          return;
        }

        if (g.dx > SWIPE_THRESHOLD) {
          Animated.timing(position, {
            toValue: { x: SCREEN_W * 1.4, y: g.dy },
            duration: 220,
            useNativeDriver: true,
          }).start(() => handleSwipe("right"));
        } else if (g.dx < -SWIPE_THRESHOLD) {
          Animated.timing(position, {
            toValue: { x: -SCREEN_W * 1.4, y: g.dy },
            duration: 220,
            useNativeDriver: true,
          }).start(() => handleSwipe("left"));
        } else {
          Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  /* ------------------ Swipe handlers ------------------ */
  const handleSwipe = (dir: "left" | "right") => {
    const popped = profiles[index];
    setIndex((s) => s + 1);
    position.setValue({ x: 0, y: 0 });

    if (dir === "right") {
      // simulate match chance
      if (Math.random() < 0.36) openMatch(`${popped.name} matched!`);
    }
  };
  const handleSuperLike = () => {
    const popped = profiles[index];
    openMatch(`Super Like — ${popped.name}`);
    setIndex((s) => s + 1);
    position.setValue({ x: 0, y: 0 });
  };

  /* ------------------ Match animation ------------------ */
  const openMatch = (title: string) => {
    setShowMatch({ visible: true, title });
    matchScale.setValue(0);
    Animated.timing(matchScale, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(matchScale, { toValue: 0, duration: 260, useNativeDriver: true }).start(() =>
          setShowMatch({ visible: false, title: "" })
        );
      }, 1100);
    });
  };

  /* ------------------ Bottom sheet open/close & drag ------------------ */
  const openSheet = () => {
    setSheetOpen(true);
    Animated.parallel([
      Animated.timing(sheetAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(backdropOpacity, { toValue: 1, duration: 260, useNativeDriver: true }),
    ]).start();
  };
  const closeSheet = () => {
    Animated.parallel([
      Animated.timing(sheetAnim, { toValue: SCREEN_H, duration: 260, useNativeDriver: true }),
      Animated.timing(backdropOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => setSheetOpen(false));
  };

  dragSheetResponder.current = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, g) => {
      if (g.dy > 0) sheetAnim.setValue(g.dy);
    },
    onPanResponderRelease: (_, g) => {
      if (g.dy > 120) closeSheet();
      else openSheet();
    },
  });

  /* ------------------ Helpers: current profile ------------------ */
  const p = profiles[index];

  /* ------------------ Skeleton while loading ------------------ */
  if (loading) {
    return (
      <View style={styles.skeletonWrapper}>
        <View style={styles.skeletonCard} />
        <View style={styles.skeletonLine} />
        <View style={[styles.skeletonLine, { width: "60%" }]} />
      </View>
    );
  }

  if (!p) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>You’re all caught up 🎉</Text>
      </View>
    );
  }

  /* ------------------ Interpolations ------------------ */
  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_W / 2, 0, SCREEN_W / 2],
    outputRange: ["-12deg", "0deg", "12deg"],
  });

  const likeOpacity = position.x.interpolate({ inputRange: [0, SCREEN_W * 0.25], outputRange: [0, 1], extrapolate: "clamp" });
  const nopeOpacity = position.x.interpolate({ inputRange: [-SCREEN_W * 0.25, 0], outputRange: [1, 0], extrapolate: "clamp" });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* TOP BAR */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.name}>{p.name}</Text>
          <View style={styles.row}>
            <Text style={styles.pronouns}>{p.pronouns}</Text>
            {p.verified && <View style={styles.verified}><MaterialCommunityIcons name="check-decagram" size={14} color="#7C3AED" /></View>}
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={openSheet} style={styles.iconBtn}>
            <MaterialCommunityIcons name="account-circle" size={26} color={COLORS.TEXT} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialCommunityIcons name="dots-horizontal" size={22} color={COLORS.MUTED} />
          </TouchableOpacity>
        </View>
      </View>

      {/* CARD (swipeable) */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.card,
          {
            transform: [
              { translateX: position.x },
              { translateY: position.y },
              { rotate },
              { scale: cardScale },
            ],
            opacity: fadeIn,
          },
        ]}
      >
        {/* LIKE / NOPE badges */}
        <Animated.View style={[styles.likeBadge, { opacity: likeOpacity }]}>
          <Text style={styles.likeText}>LIKE</Text>
        </Animated.View>
        <Animated.View style={[styles.nopeBadge, { opacity: nopeOpacity }]}>
          <Text style={styles.nopeText}>NOPE</Text>
        </Animated.View>

        {/* Photo carousel */}
        {/* Photo carousel with Tap Navigation */}
        <Pressable onPress={handlePhotoTap}>
          <ScrollView
            ref={photoScrollRef}
            horizontal
            pagingEnabled
            scrollEnabled={false} // Disable manual scroll to allow card swipe
            showsHorizontalScrollIndicator={false}
            style={styles.photoScroll}
          >
            {p.photos.map((u, i) => (
              <Image key={i} source={{ uri: u }} style={styles.photo} />
            ))}
          </ScrollView>
        </Pressable>

        {/* Photo dots */}
        <View style={styles.dots}>
          {p.photos.map((_, i) => (
            <View key={i} style={i === photoIndex.current ? styles.dotActive : styles.dot} />
          ))}
        </View>

        {/* Card content */}
        <View style={styles.cardContent}>
          {/* Hinge-style horizontal prompts */}
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.promptScroll}
          >
            {p.prompts.map((pr, idx) => (
              <View key={idx} style={styles.promptCard}>
                <Text style={styles.promptQ}>{pr.q}</Text>
                <Text style={styles.promptA}>{pr.a}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Badges row */}
          <View style={styles.badgeRow}>
            {p.badges.map((b, i) => (
              <View key={i} style={styles.badge}>
                <Text style={styles.badgeText}>{b}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity onPress={openSheet} style={styles.seeProfile}>
            <Text style={styles.seeProfileText}>See full profile →</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Bottom action buttons */}
      <View style={styles.bottomRow}>
        <TouchableOpacity onPress={() => { Animated.timing(position, { toValue: { x: -SCREEN_W * 1.2, y: 0 }, duration: 240, useNativeDriver: true }).start(() => handleSwipe("left")); }} style={styles.circleBtn}>
          <MaterialCommunityIcons name="close" size={28} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { Animated.timing(position, { toValue: { x: SCREEN_W * 1.2, y: 0 }, duration: 240, useNativeDriver: true }).start(() => handleSwipe("right")); }} style={[styles.circleBtn, styles.likeBtn]}>
          <MaterialCommunityIcons name="heart" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Match overlay */}
      {showMatch.visible && (
        <Animated.View style={[styles.matchOverlay, { transform: [{ scale: matchScale }] }]}>
          <Text style={styles.matchTitle}>{showMatch.title}</Text>
          <Text style={styles.matchSubtitle}>You both liked each other 💫</Text>
        </Animated.View>
      )}

      {/* Backdrop */}
      {sheetOpen && (
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={{ flex: 1 }} onPress={closeSheet} />
        </Animated.View>
      )}

      {/* Full profile bottom sheet (Hinge-style) */}
      <Animated.View {...dragSheetResponder.current?.panHandlers} style={[styles.sheet, { transform: [{ translateY: sheetAnim }] }]}>
        <View style={styles.sheetHandle} />
        <ScrollView style={{ flex: 1 }}>
          {/* Hero image (first photo) */}
          <Image source={{ uri: p.photos[0] }} style={styles.sheetHero} />

          <View style={{ padding: 20 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View>
                <Text style={styles.sheetName}>{p.name}</Text>
                <Text style={styles.sheetMeta}>{p.distanceKm} km • {p.travelCompatibility}% travel match</Text>
              </View>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {p.verified && <View style={styles.verifiedBadge}><MaterialCommunityIcons name="check-decagram" size={16} color="#7C3AED" /></View>}
              </View>
            </View>

            {/* badges */}
            <Text style={styles.sectionTitle}>My Vibe</Text>
            <View style={styles.sheetBadges}>
              {p.badges.map((b, i) => <View key={i} style={styles.sheetBadge}><Text style={styles.sheetBadgeText}>{b}</Text></View>)}
            </View>

            {/* About / Bio */}
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.sheetBio}>{p.bio}</Text>

            {/* Photos grid */}
            <Text style={styles.sectionTitle}>Photos</Text>
            <View style={styles.photoGrid}>
              {p.photos.map((u, i) => (
                <Image key={i} source={{ uri: u }} style={styles.gridPhoto} />
              ))}
            </View>

            {/* Prompts */}
            <Text style={styles.sectionTitle}>Prompts</Text>
            {p.prompts.map((pr, i) => (
              <View key={i} style={styles.sheetPrompt}>
                <Text style={styles.sheetPromptQ}>{pr.q}</Text>
                <Text style={styles.sheetPromptA}>{pr.a}</Text>
              </View>
            ))}

            <TouchableOpacity
              style={styles.primarySheetBtn}
              onPress={() => {
                closeSheet();
                // In a real app, this would navigate to a specific chat room ID
                // router.push({ pathname: "/chat/[id]", params: { id: p.id } });
                // For now, go to the Chats tab
                router.push("/(tabs)/chats");
              }}
            >
              <Text style={styles.primarySheetBtnText}>Message {p.name}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={closeSheet} style={styles.ghostSheetBtn}>
              <Text style={styles.ghostSheetText}>Close</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

/* ---------------------- STYLES ---------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG, paddingTop: 40 },

  /* skeleton */
  skeletonWrapper: { padding: 20 },
  skeletonCard: { width: CARD_WIDTH, height: 300, borderRadius: 18, backgroundColor: "#EAEAEA", alignSelf: "center" },
  skeletonLine: { height: 14, backgroundColor: "#EAEAEA", borderRadius: 8, marginTop: 12, width: "80%", alignSelf: "center" },

  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { fontSize: 20, fontFamily: FONT.UI_BOLD, color: COLORS.MUTED },

  topBar: { paddingHorizontal: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  name: { fontSize: 26, fontFamily: FONT.UI_BOLD, color: COLORS.TEXT },
  row: { flexDirection: "row", alignItems: "center" },
  pronouns: { fontSize: 12, color: COLORS.MUTED, marginRight: 8 },
  iconBtn: { marginLeft: 10, padding: 6 },

  verified: { width: 20, height: 20, borderRadius: 5, backgroundColor: "#F2E7FF", alignItems: "center", justifyContent: "center" },

  /* card */
  card: { width: CARD_WIDTH, alignSelf: "center", borderRadius: 18, backgroundColor: "#fff", overflow: "hidden", elevation: 6 },
  photoScroll: { width: CARD_WIDTH, height: 380 },
  photo: { width: CARD_WIDTH, height: 380, resizeMode: "cover" },

  dots: { position: "absolute", bottom: 12, width: CARD_WIDTH, flexDirection: "row", justifyContent: "center" },
  dot: { width: 8, height: 8, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.45)", marginHorizontal: 4 },
  dotActive: { width: 10, height: 10, borderRadius: 6, backgroundColor: "#fff", marginHorizontal: 4 },

  likeBadge: { position: "absolute", left: 18, top: 44, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: "rgba(0,200,120,0.9)" },
  likeText: { color: "#fff", fontFamily: FONT.UI_BOLD },
  nopeBadge: { position: "absolute", right: 18, top: 44, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: "rgba(230,70,70,0.95)" },
  nopeText: { color: "#fff", fontFamily: FONT.UI_BOLD },

  cardContent: { padding: 14 },

  // Hinge-style prompt area
  promptScroll: { paddingVertical: 6, paddingLeft: 0 },
  promptCard: { width: CARD_WIDTH - 48, marginRight: 14, backgroundColor: "#F6F6F6", borderRadius: 12, padding: 12 },
  promptQ: { fontSize: 12, color: COLORS.MUTED },
  promptA: { fontSize: 18, fontFamily: FONT.UI_BOLD, color: COLORS.TEXT, marginTop: 6 },

  badgeRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 12 },
  badge: { backgroundColor: "#F3F3F3", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, marginRight: 8, marginBottom: 8 },
  badgeText: { fontSize: 12 },

  seeProfile: { marginTop: 12 },
  seeProfileText: { color: COLORS.MUTED, fontFamily: FONT.UI_MEDIUM },

  bottomRow: { position: "absolute", bottom: 26, width: "100%", flexDirection: "row", justifyContent: "space-evenly" },
  circleBtn: { width: 68, height: 68, borderRadius: 40, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", elevation: 6 },
  likeBtn: { backgroundColor: COLORS.TEXT },

  /* match overlay */
  matchOverlay: { position: "absolute", left: 36, right: 36, top: SCREEN_H * 0.28, padding: 20, backgroundColor: "#fff", borderRadius: 14, alignItems: "center", elevation: 10 },
  matchTitle: { fontSize: 20, fontFamily: FONT.UI_BOLD },
  matchSubtitle: { fontSize: 14, color: COLORS.MUTED, marginTop: 6 },

  /* backdrop */
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },

  /* sheet */
  sheet: { position: "absolute", left: 0, right: 0, height: SCREEN_H * 0.80, backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, elevation: 14 },
  sheetHandle: { width: 60, height: 6, borderRadius: 3, backgroundColor: "#E6E6E6", alignSelf: "center", marginTop: 10, marginBottom: 8 },
  sheetHero: { width: "100%", height: 360 },
  sheetName: { fontSize: 26, fontFamily: FONT.UI_BOLD, marginTop: 6 },
  sheetMeta: { fontSize: 12, color: COLORS.MUTED, marginTop: 4 },

  verifiedBadge: { backgroundColor: "#F2E7FF", padding: 8, borderRadius: 10 },

  sheetBadges: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
  sheetBadge: { backgroundColor: "#F3F3F3", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, marginRight: 8, marginBottom: 8 },
  sheetBadgeText: { fontSize: 12 },

  sectionTitle: { fontSize: 18, fontFamily: FONT.UI_BOLD, marginTop: 18, marginBottom: 8 },
  photoGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  gridPhoto: { width: "48%", height: 160, borderRadius: 12, marginBottom: 12 },

  sheetPrompt: { backgroundColor: "#F6F6F6", padding: 14, borderRadius: 12, marginBottom: 10 },
  sheetPromptQ: { fontSize: 12, color: COLORS.MUTED },
  sheetPromptA: { fontSize: 16, fontFamily: FONT.UI_BOLD, marginTop: 6 },

  sheetBio: { fontSize: 15, lineHeight: 22, marginTop: 6 },
  primarySheetBtn: { marginTop: 18, backgroundColor: COLORS.TEXT, paddingVertical: 14, borderRadius: 999, alignItems: "center" },
  primarySheetBtnText: { color: "#fff", fontFamily: FONT.UI_BOLD },
  ghostSheetBtn: { marginTop: 12, paddingVertical: 12, alignItems: "center" },
  ghostSheetText: { color: COLORS.MUTED },
});
