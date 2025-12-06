import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import WizardProgress from "../../src/components/WizardProgress";
import { COLORS, FONT } from "../../src/constants/theme";
import { useUser } from "../../src/context/UserContext";

/* 🔥 EMOJI ADDED to all vibes */
const categories = [
    {
        title: "Adventure & Outdoors",
        items: [
            { id: "adventurer", label: "Adventurer", emoji: "🧗‍♂️" },
            { id: "mountain", label: "Mountain Hiker", emoji: "🥾" },
            { id: "camper", label: "Nature Camper", emoji: "🏕️" },
            { id: "thrill", label: "Thrill Seeker", emoji: "🎢" },
            { id: "trail", label: "Trail Rider", emoji: "🚵‍♂️" },
            { id: "volcano", label: "Volcano Chaser", emoji: "🌋" },
        ]
    },
    {
        title: "Beach & Chill",
        items: [
            { id: "chill", label: "Chill & Relax", emoji: "😌" },
            { id: "island", label: "Island Hopper", emoji: "🏝️" },
            { id: "sun", label: "Sun Chaser", emoji: "☀️" },
            { id: "waves", label: "Wave Lover", emoji: "🌊" },
            { id: "zen", label: "Zen Mode", emoji: "🧘‍♂️" },
        ]
    },
    {
        title: "Food & Culture",
        items: [
            { id: "foodie", label: "Foodie", emoji: "🍽️" },
            { id: "wine", label: "Wine Explorer", emoji: "🍷" },
            { id: "sushi", label: "Sushi Lover", emoji: "🍣" },
            { id: "cheese", label: "Cheese Addict", emoji: "🧀" },
            { id: "cultural", label: "Cultural Explorer", emoji: "🎭" },
            { id: "museum", label: "Museum Lover", emoji: "🏛️" },
        ]
    },
    {
        title: "Nightlife & Social",
        items: [
            { id: "party", label: "Party Animal", emoji: "🎉" },
            { id: "festival", label: "Festival Fan", emoji: "🎶" },
            { id: "club", label: "Club Vibes", emoji: "🪩" },
            { id: "casino", label: "Casino Cruiser", emoji: "🎰" },
            { id: "karaoke", label: "Karaoke Champ", emoji: "🎤" },
        ]
    },
    {
        title: "Luxury & Comfort",
        items: [
            { id: "luxury", label: "Luxury", emoji: "💎" },
            { id: "firstclass", label: "First Class Only", emoji: "🛫" },
            { id: "boutique", label: "Boutique Hotel Lover", emoji: "🏨" },
            { id: "spa", label: "Spa & Wellness", emoji: "💆‍♀️" },
        ]
    },
    {
        title: "Road & Offbeat",
        items: [
            { id: "vanlife", label: "Van Life Dreamer", emoji: "🚐" },
            { id: "roadtrip", label: "Road Tripper", emoji: "🛣️" },
            { id: "scenic", label: "Scenic Route Lover", emoji: "🌄" },
            { id: "highway", label: "Highway Nomad", emoji: "🚗" },
        ]
    },
    {
        title: "Seasonal Vibes",
        items: [
            { id: "snow", label: "Snow Adventurer", emoji: "❄️" },
            { id: "ski", label: "Ski & Snowboarder", emoji: "🎿" },
            { id: "winter", label: "Winter Cozy Type", emoji: "☕" },
        ]
    },
    {
        title: "Connection-Oriented",
        items: [
            { id: "locals", label: "Meet-the-Locals Type", emoji: "👋" },
            { id: "love", label: "Travel for Love", emoji: "❤️" },
            { id: "buddy", label: "Travel Buddy Seeker", emoji: "🧭" },
        ]
    }
];

export default function StyleStep() {
    const router = useRouter();
    const { updateProfile } = useUser();

    const [selected, setSelected] = useState<string[]>([]);
    const [search, setSearch] = useState("");

    const MAX = 7;

    const animatedScale = useRef<Record<string, Animated.Value>>({}).current;

    /* SEARCH FILTER */
    const filteredCategories = useMemo(() => {
        if (!search.trim()) return categories;

        return categories
            .map((cat) => ({
                ...cat,
                items: cat.items.filter((item) =>
                    item.label.toLowerCase().includes(search.toLowerCase())
                )
            }))
            .filter((cat) => cat.items.length > 0);
    }, [search]);

    /* TOGGLE WITH ANIMATION */
    const toggle = (id: string, anim: Animated.Value) => {
        Animated.sequence([
            Animated.timing(anim, { toValue: 0.9, duration: 70, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 1, duration: 120, useNativeDriver: true }),
        ]).start();

        if (selected.includes(id)) {
            setSelected(selected.filter((x) => x !== id));
        } else if (selected.length < MAX) {
            setSelected([...selected, id]);
        }
    };

    const handleNext = () => {
        if (selected.length === MAX) {
            updateProfile({ styles: selected });
            router.push("/signup-wizard/step-4-whomeet");
        }
    };

    return (
        <View style={styles.container}>
            <WizardProgress currentStep={3} totalSteps={8} />

            <Text style={styles.header}>What's your travel vibe?</Text>
            <Text style={styles.sub}>Pick exactly {MAX}</Text>

            <TextInput
                style={styles.search}
                placeholder="Search travel vibes…"
                placeholderTextColor="#999"
                value={search}
                onChangeText={setSearch}
            />

            <ScrollView contentContainerStyle={styles.scrollWrap}>
                {filteredCategories.map((section) => (
                    <View key={section.title} style={styles.section}>
                        <Text style={styles.category}>{section.title}</Text>

                        <View style={styles.pillWrap}>
                            {section.items.map((v) => {
                                if (!animatedScale[v.id]) {
                                    animatedScale[v.id] = new Animated.Value(1);
                                }

                                const anim = animatedScale[v.id];
                                const isSelected = selected.includes(v.id);

                                return (
                                    <Animated.View
                                        key={v.id}
                                        style={{ transform: [{ scale: anim }] }}
                                    >
                                        <TouchableOpacity
                                            onPress={() => toggle(v.id, anim)}
                                            activeOpacity={0.7}
                                            style={[
                                                styles.pill,
                                                isSelected && styles.pillSelected,
                                            ]}
                                        >
                                            {/* EMOJI LEFT SIDE */}
                                            <Text style={styles.emoji}>{v.emoji}</Text>

                                            <Text style={[
                                                styles.pillText,
                                                isSelected && styles.pillSelectedText
                                            ]}>
                                                {v.label}
                                            </Text>

                                            {/* INDICATOR */}
                                            <View style={[
                                                styles.indicator,
                                                isSelected && styles.indicatorSelected
                                            ]}>
                                                <Text style={[
                                                    styles.indicatorText,
                                                    isSelected && styles.indicatorTextSelected
                                                ]}>
                                                    {isSelected ? "✓" : "+"}
                                                </Text>
                                            </View>

                                        </TouchableOpacity>
                                    </Animated.View>
                                );
                            })}
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Bottom Navigation */}
            <View style={styles.bottom}>
                <Text style={styles.count}>{selected.length}/{MAX}</Text>

                <TouchableOpacity
                    disabled={selected.length !== MAX}
                    onPress={handleNext}
                    style={[
                        styles.nextBtn,
                        selected.length !== MAX && styles.nextDisabled
                    ]}
                >
                    <MaterialCommunityIcons name="arrow-right" size={22} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

/* ------------ BEAUTIFUL UPDATED UI STYLES ------------ */

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FCFCFC", padding: 20 },

    header: { fontSize: 28, fontFamily: FONT.UI_BOLD, marginBottom: 6, color: COLORS.TEXT },
    sub: { fontSize: 15, color: COLORS.MUTED, marginBottom: 14 },

    search: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: "#E3E3E3",
        marginBottom: 16,
        fontFamily: FONT.UI_REGULAR,
    },

    scrollWrap: { paddingBottom: 140 },
    section: { marginBottom: 26 },

    category: { fontSize: 18, fontFamily: FONT.UI_BOLD, color: COLORS.TEXT, marginBottom: 10 },

    pillWrap: { flexDirection: "row", flexWrap: "wrap", gap: 12 },

    pill: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: "#fff",
        borderRadius: 14,
        borderWidth: 1.4,
        borderColor: "#D3D3D3",
        minWidth: 150,

        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },

    pillSelected: {
        borderColor: "#000",
        backgroundColor: "#F1F1F1",
        shadowOpacity: 0.15,
        elevation: 5,
    },

    emoji: {
        fontSize: 20,
        marginRight: 8,
    },

    pillText: {
        flex: 1,
        fontSize: 15,
        fontFamily: FONT.UI_MEDIUM,
        color: COLORS.TEXT,
    },

    pillSelectedText: {
        fontFamily: FONT.UI_BOLD,
        color: COLORS.TEXT,
    },

    indicator: {
        width: 26,
        height: 26,
        borderRadius: 13,
        borderWidth: 1.4,
        borderColor: "#000",
        alignItems: "center",
        justifyContent: "center",
    },

    indicatorSelected: {
        backgroundColor: "#000",
        borderColor: "#000",
    },

    indicatorText: {
        fontSize: 16,
        fontFamily: FONT.UI_BOLD,
        color: "#000",
    },

    indicatorTextSelected: {
        color: "#fff",
    },

    bottom: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 85,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#E5E5E5",

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 26,
    },

    count: { fontSize: 15, color: COLORS.MUTED },

    nextBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#000",
        alignItems: "center",
        justifyContent: "center",
    },

    nextDisabled: { backgroundColor: "#BEBEBE" }
});
