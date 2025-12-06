import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Dimensions,
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

const { width } = Dimensions.get("window");

const TRENDING_DESTINATIONS = [
    { id: "1", city: "Bali", country: "Indonesia", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1000" },
    { id: "2", city: "Paris", country: "France", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1000" },
    { id: "3", city: "Kyoto", country: "Japan", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1000" },
    { id: "4", city: "New York", country: "USA", image: "https://images.unsplash.com/photo-1496442226666-8d4a0e62e6e9?q=80&w=1000" },
];

export default function CreateTripScreen() {
    const [tripType, setTripType] = useState<"leisure" | "business">("leisure");
    const [destination, setDestination] = useState("");

    const renderTrendingItem = ({ item }: { item: typeof TRENDING_DESTINATIONS[0] }) => (
        <TouchableOpacity style={styles.trendCard} activeOpacity={0.9}>
            <Image source={{ uri: item.image }} style={styles.trendImage} />
            <View style={styles.trendOverlay} />
            <View style={styles.trendContent}>
                <Text style={styles.trendCity}>{item.city}</Text>
                <Text style={styles.trendCountry}>{item.country}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Where to next?</Text>
                    <Text style={styles.subtitle}>Plan your next adventure together.</Text>
                </View>
                <View style={styles.iconBox}>
                    <MaterialCommunityIcons name="airplane-takeoff" size={28} color={COLORS.PRIMARY || "#7C3AED"} />
                </View>
            </View>

            {/* Input Section */}
            <View style={styles.formSection}>
                {/* Destination Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>DESTINATION</Text>
                    <View style={styles.inputContainer}>
                        <MaterialCommunityIcons name="map-marker-outline" size={22} color={COLORS.MUTED} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. London, Tokyo..."
                            placeholderTextColor="#999"
                            value={destination}
                            onChangeText={setDestination}
                        />
                    </View>
                </View>

                {/* Date Placeholder */}
                <View style={[styles.inputGroup, { marginTop: 20 }]}>
                    <Text style={styles.inputLabel}>DATES</Text>
                    <TouchableOpacity style={styles.datePickerBtn}>
                        <MaterialCommunityIcons name="calendar-range" size={20} color={COLORS.TEXT} />
                        <Text style={styles.dateText}>Select dates</Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.MUTED} style={{ marginLeft: "auto" }} />
                    </TouchableOpacity>
                </View>

                {/* Trip Type Selector */}
                <View style={styles.typeSelector}>
                    <TouchableOpacity
                        style={[styles.typeBtn, tripType === "leisure" && styles.typeBtnActive]}
                        onPress={() => setTripType("leisure")}
                    >
                        <MaterialCommunityIcons
                            name="beach"
                            size={20}
                            color={tripType === "leisure" ? "#fff" : COLORS.MUTED}
                        />
                        <Text style={[styles.typeText, tripType === "leisure" && styles.typeTextActive]}>Leisure</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.typeBtn, tripType === "business" && styles.typeBtnActive]}
                        onPress={() => setTripType("business")}
                    >
                        <MaterialCommunityIcons
                            name="briefcase-outline"
                            size={20}
                            color={tripType === "business" ? "#fff" : COLORS.MUTED}
                        />
                        <Text style={[styles.typeText, tripType === "business" && styles.typeTextActive]}>Business</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.createBtn}>
                    <Text style={styles.createBtnText}>Create Trip</Text>
                </TouchableOpacity>
            </View>

            {/* Trending Section */}
            <View style={styles.trendingSection}>
                <Text style={styles.sectionTitle}>Trending Now</Text>
                <FlatList
                    data={TRENDING_DESTINATIONS}
                    renderItem={renderTrendingItem}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingLeft: 20, paddingRight: 10 }}
                />
            </View>

            <View style={{ height: 100 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.BG || "#FAFAFA",
    },
    header: {
        paddingHorizontal: 20,
        marginTop: 60,
        marginBottom: 30,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    title: {
        fontSize: 32,
        fontFamily: FONT.UI_BOLD,
        color: COLORS.TEXT,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.MUTED,
        marginTop: 8,
        fontFamily: FONT.UI_REGULAR,
    },
    iconBox: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#F2E7FF",
        alignItems: "center",
        justifyContent: "center",
    },

    formSection: {
        paddingHorizontal: 20,
    },
    inputGroup: {},
    inputLabel: {
        fontSize: 12,
        fontFamily: FONT.UI_BOLD,
        color: COLORS.MUTED,
        marginBottom: 8,
        letterSpacing: 1,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 60,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        fontFamily: FONT.UI_MEDIUM,
        color: COLORS.TEXT,
    },

    datePickerBtn: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 60,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    dateText: {
        fontSize: 16,
        fontFamily: FONT.UI_MEDIUM,
        color: COLORS.TEXT,
        marginLeft: 12,
    },

    typeSelector: {
        flexDirection: "row",
        marginTop: 24,
        backgroundColor: "#EFF0F3",
        borderRadius: 14,
        padding: 4,
    },
    typeBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        borderRadius: 12,
    },
    typeBtnActive: {
        backgroundColor: COLORS.TEXT,
        elevation: 2,
    },
    typeText: {
        marginLeft: 8,
        fontSize: 14,
        fontFamily: FONT.UI_MEDIUM,
        color: COLORS.MUTED,
    },
    typeTextActive: {
        color: "#fff",
        fontFamily: FONT.UI_BOLD,
    },

    createBtn: {
        marginTop: 30,
        backgroundColor: COLORS.PRIMARY || "#7C3AED",
        height: 60,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        elevation: 4,
        shadowColor: "#110428ff",
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 8 },
    },
    createBtnText: {
        color: "#fff",
        fontSize: 18,
        fontFamily: FONT.UI_BOLD,
    },

    trendingSection: {
        marginTop: 40,
    },
    sectionTitle: {
        fontSize: 20,
        fontFamily: FONT.UI_BOLD,
        color: COLORS.TEXT,
        marginLeft: 20,
        marginBottom: 20,
    },
    trendCard: {
        width: width * 0.45,
        height: 220,
        borderRadius: 20,
        marginRight: 16,
        backgroundColor: "#ccc",
        overflow: "hidden",
    },
    trendImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    trendOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.3)",
    },
    trendContent: {
        position: "absolute",
        bottom: 0,
        left: 0,
        padding: 16,
    },
    trendCity: {
        fontSize: 18,
        fontFamily: FONT.UI_BOLD,
        color: "#fff",
    },
    trendCountry: {
        fontSize: 14,
        color: "rgba(255,255,255,0.9)",
    },
});
