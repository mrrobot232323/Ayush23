import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    FlatList,
    Modal,
    Platform,
    SafeAreaView,
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
import { useLocationSearch } from "../../src/hooks/useLocationSearch";

export default function AddTripStep() {
    const router = useRouter();
    const { addTrip } = useUser();

    const [destination, setDestination] = useState("");
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000));
    const [description, setDescription] = useState("");

    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    // Location Search State
    const { results, loading, searchPlaces } = useLocationSearch();
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const openLocationModal = () => {
        setSearchQuery("");
        setShowLocationModal(true);
        // optional: clear results when opening
        searchPlaces("");
    };

    const handleLocationSelect = (item: any) => {
        // item is LocationResult from Nominatim
        // Construct a nice string: "City, State, Country"
        const addr = item.address;
        const city = addr.city || addr.town || addr.village || addr.county || addr.state_district;
        const state = addr.state;
        const country = addr.country;

        const parts = [city, state, country].filter(Boolean);
        const fullLocation = parts.join(", ");

        setDestination(fullLocation);
        setShowLocationModal(false);
    };


    // Button press animation
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const animatePress = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.97, duration: 80, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true })
        ]).start();
    };

    const tripLength = Math.max(
        1,
        Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    );

    const longTrip = tripLength >= 14;

    const onStartChange = (_: any, selectedDate?: Date) => {
        if (selectedDate) {
            setStartDate(selectedDate);
            if (selectedDate > endDate) setEndDate(selectedDate);
        }
        setShowStartPicker(false);
    };

    const onEndChange = (_: any, selectedDate?: Date) => {
        if (selectedDate) setEndDate(selectedDate);
        setShowEndPicker(false);
    };

    const handleAddTrip = () => {
        if (!destination) return;

        const newTrip = {
            id: Date.now().toString(),
            destination,
            tripType: "Leisure", // Default type
            startDate: format(startDate, "yyyy-MM-dd"),
            endDate: format(endDate, "yyyy-MM-dd"),
            description: description // Although not in Trip type strictly, passing it might be useful if type allows or for future
        };

        addTrip(newTrip);
        router.push("/signup-wizard/step-5-lookingfor");
    };

    return (
        <View style={styles.container}>
            <WizardProgress currentStep={5} totalSteps={8} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <Text style={styles.header}>Add your upcoming trip</Text>
                <Text style={styles.subHeader}>
                    Let others know where you’ll be — find travel buddies along the way.
                </Text>

                {/* DESTINATION CARD */}
                <View style={styles.card}>
                    <Text style={styles.label}>Destination</Text>

                    <TouchableOpacity onPress={openLocationModal} activeOpacity={0.8} style={styles.inputRow}>
                        <MaterialCommunityIcons
                            name="map-marker-outline"
                            size={22}
                            color={COLORS.TEXT}
                            style={styles.icon}
                        />

                        <Text style={[styles.input, !destination && { color: "#A9A9A9" }]}>
                            {destination || "Select City, Country"}
                        </Text>
                        <MaterialCommunityIcons name="chevron-down" size={20} color={COLORS.MUTED} />
                    </TouchableOpacity>
                </View>

                {/* DATE SELECTION */}
                <View style={styles.card}>
                    <Text style={styles.label}>Trip Dates</Text>

                    <View style={styles.dateRow}>

                        <TouchableOpacity
                            onPress={() => {
                                animatePress();
                                setShowStartPicker(true);
                            }}
                            activeOpacity={0.75}
                            style={styles.dateBox}
                        >
                            <MaterialCommunityIcons name="calendar" size={20} color={COLORS.TEXT} />
                            <Text style={styles.dateText}>{format(startDate, "MMM dd, yyyy")}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                animatePress();
                                setShowEndPicker(true);
                            }}
                            activeOpacity={0.75}
                            style={styles.dateBox}
                        >
                            <MaterialCommunityIcons name="calendar-arrow-right" size={20} color={COLORS.TEXT} />
                            <Text style={styles.dateText}>{format(endDate, "MMM dd, yyyy")}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Trip Length Badge */}
                    <View style={styles.badgeRow}>
                        <View style={styles.tripBadge}>
                            <Text style={styles.tripBadgeText}>{tripLength}-day trip</Text>
                        </View>

                        {longTrip && (
                            <View style={styles.longTripBadge}>
                                <Text style={styles.longTripText}>Long-term traveler</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* DESCRIPTION */}
                <View style={styles.card}>
                    <Text style={styles.label}>Trip Details (Optional)</Text>

                    <View style={[styles.inputRow, styles.textArea]}>
                        <MaterialCommunityIcons
                            name="pencil-outline"
                            size={20}
                            color={COLORS.MUTED}
                            style={styles.iconTop}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Plans, mood, goals, expectations…"
                            placeholderTextColor="#A9A9A9"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                        />
                    </View>
                </View>

                {/* DATE PICKERS */}
                {showStartPicker && (
                    <DateTimePicker
                        value={startDate}
                        mode="date"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={onStartChange}
                        minimumDate={new Date()}
                    />
                )}
                {showEndPicker && (
                    <DateTimePicker
                        value={endDate}
                        mode="date"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={onEndChange}
                        minimumDate={startDate}
                    />
                )}
            </ScrollView>

            {/* FOOTER BUTTONS */}
            <View style={styles.footer}>
                <TouchableOpacity
                    onPress={handleAddTrip}
                    disabled={!destination}
                    activeOpacity={0.85}
                    style={[
                        styles.addTripBtn,
                        !destination && styles.disabledAddTrip
                    ]}
                >
                    <Text style={styles.addTripText}>Add Trip</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.push("/signup-wizard/step-5-lookingfor")}
                    activeOpacity={0.7}
                >
                    <Text style={styles.skipText}>I don't have a trip planned yet</Text>
                </TouchableOpacity>
            </View>
            {/* LOCATION SELECTOR MODAL */}
            <Modal visible={showLocationModal} animationType="slide" presentationStyle="pageSheet">
                <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setShowLocationModal(false)} style={styles.backBtn}>
                            <MaterialCommunityIcons name="close" size={24} color={COLORS.TEXT} />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Select Destination</Text>
                        <View style={{ width: 24 }} />
                    </View>

                    {/* SEARCH BAR */}
                    <View style={styles.searchContainer}>
                        <MaterialCommunityIcons name="magnify" size={20} color={COLORS.MUTED} style={{ marginRight: 8 }} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search (e.g. Jaipur)..."
                            placeholderTextColor="#999"
                            value={searchQuery}
                            onChangeText={(text) => {
                                setSearchQuery(text);
                                searchPlaces(text);
                            }}
                            autoFocus
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery("")}>
                                <MaterialCommunityIcons name="close-circle" size={18} color={COLORS.MUTED} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {loading ? (
                        <View style={{ paddingTop: 40, alignItems: "center" }}>
                            <ActivityIndicator size="large" color={COLORS.PRIMARY_BTN} />
                        </View>
                    ) : (
                        <FlatList
                            data={results}
                            keyExtractor={(item: any) => item.place_id.toString()}
                            contentContainerStyle={{ padding: 20 }}
                            ListEmptyComponent={() => (
                                <View style={{ alignItems: "center", marginTop: 50 }}>
                                    <Text style={{ color: COLORS.MUTED }}>
                                        {searchQuery.length < 2 ? "Type to search..." : "No results found."}
                                    </Text>
                                </View>
                            )}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.listItem}
                                    onPress={() => handleLocationSelect(item)}
                                >
                                    <View>
                                        <Text style={styles.listItemText}>{item.display_name}</Text>
                                    </View>
                                    <MaterialCommunityIcons name="chevron-right" size={20} color="#E0E0E0" />
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </SafeAreaView>
            </Modal>
        </View>
    );
}

/* ---------------------- STYLES ---------------------- */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.BG,
        padding: 20,
    },

    scrollContent: {
        paddingBottom: 180,
    },

    header: {
        fontSize: 28,
        fontFamily: FONT.UI_BOLD,
        color: COLORS.TEXT,
        marginBottom: 4,
    },

    subHeader: {
        fontSize: 15,
        fontFamily: FONT.UI_REGULAR,
        color: COLORS.MUTED,
        marginBottom: 22,
    },

    card: {
        backgroundColor: "#fff",
        padding: 18,
        borderRadius: 18,
        marginBottom: 22,
        borderWidth: 1,
        borderColor: "#EAEAEA",
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },

    label: {
        fontSize: 15,
        fontFamily: FONT.UI_BOLD,
        marginBottom: 12,
        color: COLORS.TEXT,
    },

    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FAFAFA",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E5E5",
        paddingHorizontal: 12,
        paddingVertical: 8,
    },

    textArea: {
        height: 110,
        alignItems: "flex-start",
        paddingVertical: 10,
    },

    input: {
        flex: 1,
        fontSize: 16,
        fontFamily: FONT.UI_REGULAR,
        color: COLORS.TEXT,
    },

    icon: { marginRight: 10 },
    iconTop: { marginRight: 10, marginTop: 6 },

    dateRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
    },

    dateBox: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FAFAFA",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E1E1E1",
        paddingHorizontal: 12,
        paddingVertical: 14,
        gap: 10,
    },

    dateText: {
        fontSize: 15,
        fontFamily: FONT.UI_MEDIUM,
        color: COLORS.TEXT,
    },

    badgeRow: {
        flexDirection: "row",
        marginTop: 12,
        gap: 10,
        alignItems: "center",
    },

    tripBadge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
        backgroundColor: "#F2F2F2",
    },

    tripBadgeText: {
        fontFamily: FONT.UI_MEDIUM,
        color: COLORS.TEXT,
        fontSize: 13,
    },

    longTripBadge: {
        backgroundColor: "#D9FDD3",
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
    },

    longTripText: {
        fontFamily: FONT.UI_MEDIUM,
        fontSize: 13,
        color: "#245D1F",
    },

    footer: {
        position: "absolute",
        bottom: 30,
        left: 20,
        right: 20,
        alignItems: "center",
    },

    addTripBtn: {
        width: "100%",
        paddingVertical: 16,
        backgroundColor: COLORS.PRIMARY_BTN,
        borderRadius: 999,
        alignItems: "center",
        marginBottom: 10,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },

    disabledAddTrip: {
        backgroundColor: "#C7C7C7",
        shadowOpacity: 0,
    },

    addTripText: {
        fontFamily: FONT.UI_BOLD,
        fontSize: 16,
        color: COLORS.TEXT,
    },

    skipText: {
        fontFamily: FONT.UI_MEDIUM,
        fontSize: 15,
        color: COLORS.MUTED,
        textDecorationLine: "underline",
    },

    /* Modal Styles */
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#EEE",
    },
    backBtn: { padding: 4 },
    modalTitle: { fontSize: 18, fontFamily: FONT.UI_BOLD, color: COLORS.TEXT },
    listItem: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F5F5F5",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    listItemText: {
        fontSize: 16,
        color: COLORS.TEXT,
        fontFamily: FONT.UI_REGULAR,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F5F5F5",
        margin: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        fontFamily: FONT.UI_REGULAR,
        color: COLORS.TEXT,
    },
});
