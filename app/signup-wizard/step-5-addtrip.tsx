import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
    Animated,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import WizardProgress from "../../src/components/WizardProgress";
import { COLORS, FONT } from "../../src/constants/theme";

export default function AddTripStep() {
    const router = useRouter();

    const [destination, setDestination] = useState("");
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000));
    const [description, setDescription] = useState("");

    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    // Animation for calendar buttons
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const animatePress = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.97, duration: 80, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true })
        ]).start();
    };

    const tripLength =
        Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

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

    const handleNext = () => router.push("/signup-wizard/step-6-prompts");
    const handleSkip = () => router.push("/signup-wizard/step-6-prompts");

    return (
        <View style={styles.container}>
            <WizardProgress currentStep={5} totalSteps={8} />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.header}>Add your upcoming trip!</Text>
                <Text style={styles.subHeader}>
                    Let others know where you’ll be — you may find travel buddies on the way.
                </Text>

                {/* Destination Input */}
                <View style={styles.card}>
                    <Text style={styles.label}>Destination</Text>
                    <View style={styles.inputRow}>
                        <MaterialCommunityIcons
                            name="map-marker"
                            size={22}
                            color={COLORS.TEXT}
                            style={styles.icon}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="City, Country"
                            placeholderTextColor="#999"
                            value={destination}
                            onChangeText={setDestination}
                        />
                    </View>
                </View>

                {/* Dates */}
                <View style={styles.card}>
                    <Text style={styles.label}>Trip Dates</Text>

                    <View style={styles.row}>
                        {/* FROM */}
                        <TouchableOpacity
                            onPress={() => {
                                animatePress();
                                setShowStartPicker(true);
                            }}
                            activeOpacity={0.7}
                            style={styles.dateBox}
                        >
                            <MaterialCommunityIcons
                                name="calendar-range"
                                size={20}
                                color={COLORS.TEXT}
                            />
                            <Text style={styles.dateText}>
                                {format(startDate, "MMM dd, yyyy")}
                            </Text>
                        </TouchableOpacity>

                        {/* TO */}
                        <TouchableOpacity
                            onPress={() => {
                                animatePress();
                                setShowEndPicker(true);
                            }}
                            activeOpacity={0.7}
                            style={styles.dateBox}
                        >
                            <MaterialCommunityIcons
                                name="calendar-arrow-right"
                                size={20}
                                color={COLORS.TEXT}
                            />
                            <Text style={styles.dateText}>
                                {format(endDate, "MMM dd, yyyy")}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Trip Length Badge */}
                    <View style={styles.badgeRow}>
                        <Text style={styles.lengthText}>{tripLength}-day trip</Text>

                        {longTrip && (
                            <View style={styles.longTripBadge}>
                                <Text style={styles.longTripText}>Long-term traveler</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Description */}
                <View style={styles.card}>
                    <Text style={styles.label}>Trip Details (Optional)</Text>
                    <View style={[styles.inputRow, styles.textArea]}>
                        <MaterialCommunityIcons
                            name="pencil-outline"
                            size={20}
                            color={COLORS.MUTED}
                            style={styles.icon}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Plans, goals, mood, or expectations…"
                            placeholderTextColor="#999"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                        />
                    </View>
                </View>

                {/* Date Pickers */}
                {showStartPicker && (
                    <DateTimePicker
                        value={startDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? "spinner" : "default"}
                        onChange={onStartChange}
                        minimumDate={new Date()}
                    />
                )}
                {showEndPicker && (
                    <DateTimePicker
                        value={endDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? "spinner" : "default"}
                        onChange={onEndChange}
                        minimumDate={startDate}
                    />
                )}
            </ScrollView>

            {/* Bottom Buttons */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.primaryBtn,
                        !destination && styles.btnDisabled
                    ]}
                    disabled={!destination}
                    onPress={() => router.push("/signup-wizard/step-5-lookingfor")}
                >
                    <Text style={styles.primaryBtnText}>Add Trip</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.push("/signup-wizard/step-5-lookingfor")}
                    activeOpacity={0.7}
                    style={styles.skipBtn}
                >
                    <Text style={styles.skipBtnText}>I don’t have a trip planned yet</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

/* ---------------------- STYLES ---------------------- */

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.BG, padding: 20 },

    scrollContent: { paddingBottom: 160 },

    header: {
        fontSize: 28,
        fontFamily: FONT.UI_BOLD,
        color: COLORS.TEXT,
        marginBottom: 6,
    },
    subHeader: {
        fontSize: 16,
        fontFamily: FONT.UI_REGULAR,
        color: COLORS.MUTED,
        marginBottom: 22,
    },

    /* Card wrappers for a premium look */
    card: {
        backgroundColor: "#fff",
        padding: 18,
        borderRadius: 16,
        marginBottom: 22,
        borderWidth: 1,
        borderColor: "#E6E6E6",
    },

    label: {
        fontSize: 15,
        fontFamily: FONT.UI_BOLD,
        marginBottom: 10,
        color: COLORS.TEXT,
    },

    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FAFAFA",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E1E1E1",
        paddingHorizontal: 12,
    },

    textArea: {
        height: 110,
        paddingVertical: 12,
        alignItems: "flex-start",
    },

    input: {
        flex: 1,
        fontSize: 16,
        fontFamily: FONT.UI_REGULAR,
        paddingVertical: 10,
        color: COLORS.TEXT,
    },

    icon: { marginRight: 10 },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
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
        gap: 8,
        marginHorizontal: 4,
    },

    dateText: {
        fontSize: 15,
        fontFamily: FONT.UI_MEDIUM,
        color: COLORS.TEXT,
    },

    badgeRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
        gap: 12,
    },

    lengthText: {
        fontFamily: FONT.UI_MEDIUM,
        color: COLORS.TEXT,
    },

    longTripBadge: {
        backgroundColor: "#191A2310",
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 20,
    },
    longTripText: {
        fontSize: 12,
        fontFamily: FONT.UI_MEDIUM,
        color: COLORS.TEXT,
    },

    footer: {
        position: "absolute",
        bottom: 34,
        left: 20,
        right: 20,
        alignItems: "center",
    },

    primaryBtn: {
        width: "100%",
        paddingVertical: 16,
        borderRadius: 999,
        backgroundColor: COLORS.PRIMARY_BTN,
        alignItems: "center",
        marginBottom: 10,
        elevation: 2,
    },
    primaryBtnText: {
        fontFamily: FONT.UI_BOLD,
        fontSize: 16,
        color: COLORS.TEXT,
    },

    btnDisabled: { backgroundColor: "#D9D9D9", elevation: 0 },

    skipBtn: {
        padding: 12,
        borderRadius: 8,
    },

    skipBtnText: {
        fontFamily: FONT.UI_MEDIUM,
        fontSize: 15,
        color: COLORS.MUTED,
        textDecorationLine: "underline",
    },
});
