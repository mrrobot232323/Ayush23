import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import WizardProgress from "../../src/components/WizardProgress";
import { COLORS, FONT } from "../../src/constants/theme";

import { useUser } from "../../src/context/UserContext";

export default function LocationStep() {
    const router = useRouter();
    const { updateProfile } = useUser();
    const [location, setLocation] = useState("");

    const handleNext = () => {
        updateProfile({ location });
        router.push("/(tabs)/profile");
    };

    return (
        <View style={styles.container}>
            <WizardProgress currentStep={8} totalSteps={8} />

            <Text style={styles.header}>Where are you?</Text>
            <Text style={styles.sub}>Your location helps us find people near you.</Text>

            <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="map-marker" size={24} color={COLORS.MUTED} style={styles.icon} />
                <TextInput
                    style={styles.input}
                    value={location}
                    onChangeText={setLocation}
                    placeholder="Enter your city"
                    placeholderTextColor={COLORS.MUTED}
                />
            </View>

            <TouchableOpacity style={styles.currentLocationBtn}>
                <MaterialCommunityIcons name="crosshairs-gps" size={20} color={COLORS.TEXT} style={{ marginRight: 8 }} />
                <Text style={styles.currentLocationText}>Use current location</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.continue, { backgroundColor: location ? COLORS.PRIMARY_BTN : COLORS.BORDER }]}
                onPress={handleNext}
                disabled={!location}
            >
                <Text style={styles.continueText}>Continue</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.BG, padding: 20 },
    header: { fontSize: 32, fontFamily: FONT.UI_BOLD, color: COLORS.TEXT, marginTop: 10, marginBottom: 10 },
    sub: { fontSize: 16, fontFamily: FONT.UI_REGULAR, color: COLORS.MUTED, marginBottom: 30 },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.WHITE,
        borderRadius: 12,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: COLORS.BORDER,
        marginBottom: 20,
    },
    icon: { marginRight: 10 },
    input: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 16,
        fontFamily: FONT.UI_REGULAR,
        color: COLORS.TEXT,
    },

    currentLocationBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        marginBottom: 20,
    },
    currentLocationText: {
        fontFamily: FONT.UI_BOLD,
        color: COLORS.TEXT,
        fontSize: 16,
    },

    continue: {
        marginTop: "auto",
        paddingVertical: 16,
        borderRadius: 999,
        alignItems: "center",
    },
    continueText: { fontFamily: FONT.UI_BOLD, color: COLORS.TEXT, fontSize: 16 },
});
