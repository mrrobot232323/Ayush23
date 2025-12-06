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

// Same categories — unchanged
const categories = [
    {
        title: "Adventure & Outdoors",
        items: [
            { id: "adventurer", label: "Adventurer" },
            { id: "mountain", label: "Mountain Hiker" },
            { id: "camper", label: "Nature Camper" },
            { id: "thrill", label: "Thrill Seeker" },
            { id: "trail", label: "Trail Rider" },
            { id: "volcano", label: "Volcano Chaser" },
        ]
    },
    {
        title: "Beach & Chill",
        items: [
            { id: "chill", label: "Chill & Relax" },
            { id: "island", label: "Island Hopper" },
            { id: "sun", label: "Sun Chaser" },
            { id: "waves", label: "Wave Lover" },
            { id: "zen", label: "Zen Mode" },
        ]
    },
    {
        title: "Food & Culture",
        items: [
            { id: "foodie", label: "Foodie" },
            { id: "wine", label: "Wine Explorer" },
            { id: "sushi", label: "Sushi Lover" },
            { id: "cheese", label: "Cheese Addict" },
            { id: "cultural", label: "Cultural Explorer" },
            { id: "museum", label: "Museum Lover" },
        ]
    },
    {
        title: "Nightlife & Social",
        items: [
            { id: "party", label: "Party Animal" },
            { id: "festival", label: "Festival Fan" },
            { id: "club", label: "Club Vibes" },
            { id: "casino", label: "Casino Cruiser" },
            { id: "karaoke", label: "Karaoke Champ" },
        ]
    },
    {
        title: "Luxury & Comfort",
        items: [
            { id: "luxury", label: "Luxury" },
            { id: "firstclass", label: "First Class Only" },
            { id: "boutique", label: "Boutique Hotel Lover" },
            { id: "spa", label: "Spa & Wellness" },
        ]
    },
    {
        title: "Road & Offbeat",
        items: [
            { id: "vanlife", label: "Van Life Dreamer" },
            { id: "roadtrip", label: "Road Tripper" },
            { id: "scenic", label: "Scenic Route Lover" },
            { id: "highway", label: "Highway Nomad" },
        ]
    },
    {
        title: "Seasonal Vibes",
        items: [
            { id: "snow", label: "Snow Adventurer" },
            { id: "ski", label: "Ski & Snowboarder" },
            { id: "winter", label: "Winter Cozy Type" },
        ]
    },
    {
        title: "Connection-Oriented",
        items: [
            { id: "locals", label: "Meet-the-Locals Type" },
            { id: "love", label: "Travel for Love" },
            { id: "buddy", label: "Travel Buddy Seeker" },
        ]
    }
];

import { useUser } from "../../src/context/UserContext";

export default function StyleStep() {
    const router = useRouter();
    const { updateProfile } = useUser();
    const [selected, setSelected] = useState<string[]>([]);
    const [search, setSearch] = useState("");

    const MAX = 5;

    const animatedScale = useRef<Record<string, Animated.Value>>({}).current;

    const filteredCategories = useMemo(() => {
        if (!search.trim()) return categories;
        return categories
            .map((cat) => ({
                ...cat,
                items: cat.items.filter((v) =>
                    v.label.toLowerCase().includes(search.toLowerCase())
                )
            }))
            .filter((cat) => cat.items.length > 0);
    }, [search]);

    const toggle = (id: string, animRef: Animated.Value) => {
        Animated.sequence([
            Animated.timing(animRef, { toValue: 0.94, duration: 70, useNativeDriver: true }),
            Animated.timing(animRef, { toValue: 1, duration: 120, useNativeDriver: true }),
        ]).start();

        if (selected.includes(id)) {
            setSelected(selected.filter((x) => x !== id));
        } else if (selected.length < MAX) {
            setSelected([...selected, id]);
        }
    };

    const handleNext = () => {
        updateProfile({ styles: selected });
        router.push("/signup-wizard/step-4-whomeet");
    };

    return (
        <View style={styles.container}>
            <WizardProgress currentStep={3} totalSteps={8} />

            <Text style={styles.header}>What's your travel vibe?</Text>
            <Text style={styles.sub}>Pick up to {MAX}</Text>

            {/* Search Box */}
            <TextInput
                style={styles.search}
                placeholder="Search travel vibes..."
                placeholderTextColor="#999"
                value={search}
                onChangeText={setSearch}
            />

            <ScrollView contentContainerStyle={styles.scrollWrap}>
                {filteredCategories.map((section) => (
                    <View key={section.title} style={{ marginBottom: 30 }}>
                        <Text style={styles.category}>{section.title}</Text>

                        <View style={styles.pillWrap}>
                            {section.items.map((v) => {
                                if (!animatedScale[v.id]) {
                                    animatedScale[v.id] = new Animated.Value(1);
                                }
                                const scale = animatedScale[v.id];
                                const isSelected = selected.includes(v.id);

                                return (
                                    <Animated.View
                                        key={v.id}
                                        style={{ transform: [{ scale }] }}
                                    >
                                        <TouchableOpacity
                                            onPress={() => toggle(v.id, scale)}
                                            activeOpacity={0.7}
                                            style={[
                                                styles.pill,
                                                isSelected && styles.pillSelected
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.pillText,
                                                    isSelected && styles.pillTextSelected
                                                ]}
                                            >
                                                {v.label}
                                            </Text>

                                            <Text style={styles.plus}>
                                                {isSelected ? "✓" : "+"}
                                            </Text>
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
                <TouchableOpacity onPress={handleNext}>
                    <Text style={styles.skip}>Skip</Text>
                </TouchableOpacity>

                <Text style={styles.count}>{selected.length}/{MAX} selected</Text>

                <TouchableOpacity
                    disabled={selected.length === 0}
                    onPress={handleNext}
                    style={[
                        styles.nextBtn,
                        selected.length === 0 && styles.nextDisabled
                    ]}
                >
                    <MaterialCommunityIcons name="arrow-right" size={22} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FDFDFD", padding: 20 },

    header: {
        fontSize: 26,
        fontFamily: FONT.UI_BOLD,
        color: COLORS.TEXT,
        marginBottom: 6,
        marginTop: 10,
    },
    sub: {
        fontSize: 15,
        color: COLORS.MUTED,
        marginBottom: 14,
    },

    search: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: "#DCDCDC",
        marginBottom: 16,
        fontFamily: FONT.UI_REGULAR,
        fontSize: 15,
    },

    scrollWrap: {
        paddingBottom: 150,
    },

    category: {
        fontSize: 17,
        fontFamily: FONT.UI_BOLD,
        color: COLORS.TEXT,
        marginBottom: 10,
    },

    pillWrap: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 14,
    },

    pill: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",

        paddingVertical: 12,
        paddingHorizontal: 18,

        backgroundColor: "#fff",
        borderRadius: 12,
        borderWidth: 1.4,
        borderColor: "#CFCFCF",

        minWidth: 130,
    },

    pillSelected: {
        borderColor: "#000",
    },

    pillText: {
        fontSize: 15,
        fontFamily: FONT.UI_MEDIUM,
        color: "#000",
    },

    pillTextSelected: {
        fontFamily: FONT.UI_BOLD,
        color: "#000",
    },

    plus: {
        fontSize: 18,
        marginLeft: 10,
        color: "#000",
    },

    bottom: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 85,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#E5E5E5",

        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 24,
    },

    skip: {
        fontSize: 15,
        fontFamily: FONT.UI_MEDIUM,
        color: COLORS.TEXT,
    },

    count: {
        fontSize: 15,
        fontFamily: FONT.UI_REGULAR,
        color: COLORS.MUTED,
    },

    nextBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#191A23",
    },

    nextDisabled: {
        backgroundColor: "#D8D8D8",
    },
});
