// DiscoverScreen.tsx
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  PanResponder,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { COLORS, FONT } from "../../src/constants/theme";
import { useUser } from "../../src/context/UserContext";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_W * 0.25;
const CARD_WIDTH = SCREEN_W - 32;

/* ---------------- TYPES ---------------- */
type Profile = {
  id: string;
  name: string;
  pronouns: string;
  verified: boolean;
  badges: string[];
  photos: string[];
  prompts: { q: string; a: string }[];
  distanceKm: number;
  travelCompatibility: number;
  bio: string;
  recentTrip?: any;
};

/* ---------------- DEMO DATA ---------------- */
const demoProfiles: Profile[] = [
  {
    id: "p1",
    name: "Poorva",
    pronouns: "she/her",
    verified: true,
    badges: ["Foodie", "Beach Lover", "Nightlife"],
    photos: [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1",
    ],
    prompts: [
      { q: "A travel moment I'll never forget…", a: "Sunrise in Varanasi." },
      { q: "Two things I always pack…", a: "Sunscreen & a good book." },
      { q: "My ideal travel buddy is someone who…", a: "Knows the best food spots." },
    ],
    distanceKm: 4.6,
    travelCompatibility: 82,
    bio: "Coffee, beaches, and spontaneous road trips.",
  },
  {
    id: "p2",
    name: "Arjun",
    pronouns: "he/him",
    verified: false,
    badges: ["Hiker", "Street Food", "Ramen"],
    photos: [
      "https://images.unsplash.com/photo-1545996124-1a61c1d7a5a9",
      "https://images.unsplash.com/photo-1544006659-f0b21884ce1d",
    ],
    prompts: [
      { q: "A travel moment I'll never forget…", a: "Getting lost in Tokyo." },
      { q: "Two things I always pack…", a: "Camera & power bank." },
      { q: "My ideal travel buddy is someone who…", a: "Is down for hiking." },
    ],
    distanceKm: 12.3,
    travelCompatibility: 68,
    bio: "UX designer who loves ramen & travel.",
  },
];

/* ---------------- MAIN COMPONENT ---------------- */
export default function DiscoverScreen() {
  const router = useRouter();
  const { profile, setViewedProfile } = useUser();

  /* Build data list including user preview */
  const [profiles, setProfiles] = useState(() => {
    let arr = [...demoProfiles];

    if (profile.name) {
      arr.unshift({
        id: "me",
        name: `${profile.name} (You)`,
        pronouns: profile.gender === "Female" ? "she/her" : "he/him",
        verified: true,
        badges: profile.styles || [],
        photos: profile.photos || ["https://via.placeholder.com/400x600"],
        prompts: profile.prompts?.map((p: any) => ({ q: p.question || p.q, a: p.answer || p.a })) || [],
        distanceKm: 0,
        travelCompatibility: 100,
        bio: profile.lookingFor || "",
        recentTrip: profile.recentTrip,
      });
    }

    return arr;
  });

  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showMatch, setShowMatch] = useState(false);

  /* 👉 FIX: p is NOW defined BEFORE handlers use it */
  const p = profiles[index];

  /* Animations */
  const position = useRef(new Animated.ValueXY()).current;
  const matchScale = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;

  /* Carousel */
  const photoScrollRef = useRef<ScrollView>(null);
  const currentPhoto = useRef(0);

  /* ---------------- HANDLERS ---------------- */

  const handlePhotoTap = () => {
    if (!p || !p.photos.length) return;
    currentPhoto.current = (currentPhoto.current + 1) % p.photos.length;

    photoScrollRef.current?.scrollTo({
      x: currentPhoto.current * CARD_WIDTH,
      animated: true,
    });
  };

  const goNextCard = () => {
    setIndex((i) => i + 1);
    position.setValue({ x: 0, y: 0 });
    currentPhoto.current = 0;
  };

  const swipeAction = (dir: "left" | "right") => {
    if (dir === "right") {
      setShowMatch(true);
      Animated.spring(matchScale, { toValue: 1, useNativeDriver: true }).start();

      setTimeout(() => {
        matchScale.setValue(0);
        setShowMatch(false);
        goNextCard();
      }, 1300);
    } else {
      goNextCard();
    }
  };

  /* PanResponder for card swipe */
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },

      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          // LIKE
          Animated.timing(position, {
            toValue: { x: SCREEN_W * 1.2, y: gesture.dy },
            duration: 200,
            useNativeDriver: false,
          }).start(() => swipeAction("right"));
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          // NOPE
          Animated.timing(position, {
            toValue: { x: -SCREEN_W * 1.2, y: gesture.dy },
            duration: 200,
            useNativeDriver: false,
          }).start(() => swipeAction("left"));
        } else {
          // RESET
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  /* ---------------- LOADING STATE ---------------- */
  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <View style={styles.skelCard} />
        <View style={styles.skelLine} />
      </View>
    );
  }

  /* ---------------- NO MORE PROFILES ---------------- */
  if (!p) {
    return (
      <View style={styles.endScreen}>
        <Text style={styles.endText}>No more profiles 🎉</Text>
      </View>
    );
  }

  /* ---------------- ANIM INTERPOLATIONS ---------------- */
  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_W / 2, 0, SCREEN_W / 2],
    outputRange: ["-12deg", "0deg", "12deg"],
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, SCREEN_W * 0.25],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-SCREEN_W * 0.25, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  /* ---------------- UI ---------------- */
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* TOP BAR */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.name}>{p.name}</Text>
          <View style={styles.row}>
            <Text style={styles.pronouns}>{p.pronouns}</Text>
            {p.verified && (
              <View style={styles.verifiedBadge}>
                <MaterialCommunityIcons name="check-decagram" size={14} color="#7C3AED" />
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => {
            setViewedProfile(p);
            router.push("/profile-detail");
          }}
        >
          <MaterialCommunityIcons name="account-circle" size={28} color={COLORS.TEXT} />
        </TouchableOpacity>
      </View>

      {/* SWIPE CARD */}
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
        {/* LIKE / NOPE BADGES */}
        <Animated.View style={[styles.likeBadge, { opacity: likeOpacity }]}>
          <Text style={styles.likeText}>LIKE</Text>
        </Animated.View>
        <Animated.View style={[styles.nopeBadge, { opacity: nopeOpacity }]}>
          <Text style={styles.nopeText}>NOPE</Text>
        </Animated.View>

        {/* PHOTO CAROUSEL */}
        <Pressable onPress={handlePhotoTap}>
          <ScrollView
            horizontal
            pagingEnabled
            ref={photoScrollRef}
            scrollEnabled={false}
            style={styles.photoScroll}
          >
            {p.photos.map((uri, i) => (
              <Image key={i} source={{ uri }} style={styles.photo} />
            ))}
          </ScrollView>
        </Pressable>

        {/* DOTS */}
        <View style={styles.dots}>
          {p.photos.map((_, i) => (
            <View
              key={i}
              style={i === currentPhoto.current ? styles.dotActive : styles.dot}
            />
          ))}
        </View>

        {/* CONTENT */}
        <View style={styles.cardContent}>
          {/* Recent Trip Banner */}
          {p.recentTrip && (
            <View style={styles.miniTripCard}>
              <View style={styles.miniTripIcon}>
                <MaterialCommunityIcons name="airplane-takeoff" size={16} color="#fff" />
              </View>
              <View>
                <Text style={styles.miniTripLabel}>UPCOMING TRIP</Text>
                <Text style={styles.miniTripDest}>
                  {p.recentTrip.destination} • {format(new Date(p.recentTrip.startDate), "MMM dd")}
                </Text>
              </View>
            </View>
          )}

          {/* Prompts */}
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.promptScroll}
          >
            {p.prompts.map((pr, idx) => (
              <View key={idx} style={styles.promptCard}>
                <Text style={styles.promptQ}>{pr.q}</Text>
                <Text style={styles.promptA}>{pr.a}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Badges */}
          <View style={styles.badgeRow}>
            {p.badges.map((b, idx) => (
              <View key={idx} style={styles.badge}>
                <Text style={styles.badgeText}>{b}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity onPress={() => router.push("/profile-detail")}>
            <Text style={styles.seeProfileText}>See full profile →</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* BOTTOM BUTTONS */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={styles.circleBtn}
          onPress={() =>
            Animated.timing(position, {
              toValue: { x: -SCREEN_W * 1.2, y: 0 },
              duration: 240,
              useNativeDriver: true,
            }).start(() => swipeAction("left"))
          }
        >
          <MaterialCommunityIcons name="close" size={30} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.circleBtn, styles.likeBtn]}
          onPress={() =>
            Animated.timing(position, {
              toValue: { x: SCREEN_W * 1.2, y: 0 },
              duration: 240,
              useNativeDriver: true,
            }).start(() => swipeAction("right"))
          }
        >
          <MaterialCommunityIcons name="heart" size={30} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* MATCH OVERLAY */}
      {showMatch && (
        <Animated.View
          style={[
            styles.matchOverlay,
            { transform: [{ scale: matchScale }] },
          ]}
        >
          <Text style={styles.matchTitle}>It's a Match! 🎉</Text>
          <Text style={styles.matchSubtitle}>You both liked each other</Text>
        </Animated.View>
      )}
    </View>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG, paddingTop: 40 },

  topBar: {
    paddingHorizontal: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  name: { fontSize: 26, fontFamily: FONT.UI_BOLD },
  row: { flexDirection: "row", alignItems: "center" },
  pronouns: { fontSize: 12, color: COLORS.MUTED, marginRight: 8 },
  verifiedBadge: {
    width: 22,
    height: 22,
    backgroundColor: "#F2E7FF",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  iconBtn: { padding: 6 },

  card: {
    width: CARD_WIDTH,
    alignSelf: "center",
    backgroundColor: "#fff",
    borderRadius: 18,
    overflow: "hidden",
    elevation: 6,
  },

  photoScroll: { width: CARD_WIDTH, height: 380 },
  photo: { width: CARD_WIDTH, height: 380 },

  dots: {
    position: "absolute",
    bottom: 12,
    width: CARD_WIDTH,
    flexDirection: "row",
    justifyContent: "center",
  },
  dot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.4)", marginHorizontal: 4,
  },
  dotActive: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: "#fff", marginHorizontal: 4,
  },

  likeBadge: {
    position: "absolute",
    left: 20,
    top: 40,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "rgba(0,200,120,0.9)",
  },
  likeText: { color: "#fff", fontFamily: FONT.UI_BOLD },

  nopeBadge: {
    position: "absolute",
    right: 20,
    top: 40,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "rgba(230,70,70,0.95)",
  },
  nopeText: { color: "#fff", fontFamily: FONT.UI_BOLD },

  cardContent: { padding: 14 },

  promptScroll: { marginBottom: 10 },
  promptCard: {
    width: CARD_WIDTH - 48,
    padding: 14,
    marginRight: 12,
    backgroundColor: "#F6F6F6",
    borderRadius: 12,
  },
  promptQ: { fontSize: 12, color: COLORS.MUTED },
  promptA: { fontSize: 18, fontFamily: FONT.UI_BOLD, marginTop: 4 },

  badgeRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
  badge: {
    backgroundColor: "#EFEFEF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
  },
  badgeText: { fontSize: 12 },

  seeProfileText: { color: COLORS.MUTED, marginTop: 8 },

  bottomButtons: {
    position: "absolute",
    bottom: 26,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  circleBtn: {
    width: 70,
    height: 70,
    borderRadius: 40,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
  likeBtn: { backgroundColor: COLORS.TEXT },

  matchOverlay: {
    position: "absolute",
    left: 50,
    right: 50,
    top: SCREEN_H * 0.28,
    backgroundColor: "#fff",
    padding: 26,
    borderRadius: 18,
    alignItems: "center",
    elevation: 12,
  },
  matchTitle: {
    fontSize: 22,
    fontFamily: FONT.UI_BOLD,
  },
  matchSubtitle: {
    marginTop: 6,
    color: COLORS.MUTED,
  },

  loadingScreen: { padding: 20 },
  skelCard: {
    width: CARD_WIDTH,
    height: 300,
    backgroundColor: "#EAEAEA",
    borderRadius: 18,
    alignSelf: "center",
  },
  skelLine: {
    marginTop: 16,
    width: "70%",
    height: 14,
    backgroundColor: "#EAEAEA",
    borderRadius: 8,
    alignSelf: "center",
  },

  endScreen: { flex: 1, justifyContent: "center", alignItems: "center" },
  endText: { fontSize: 20, fontFamily: FONT.UI_BOLD, color: COLORS.MUTED },

  miniTripCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F5FF",
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E1E8FF",
  },
  miniTripIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.PRIMARY || "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  miniTripLabel: {
    fontSize: 10,
    fontFamily: FONT.UI_BOLD,
    color: COLORS.PRIMARY || "#7C3AED",
    letterSpacing: 0.5,
  },
  miniTripDest: {
    fontSize: 14,
    fontFamily: FONT.UI_BOLD,
    color: COLORS.TEXT,
  },
});
