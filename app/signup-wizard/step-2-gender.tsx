import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import WizardProgress from "../../src/components/WizardProgress";
import { COLORS, FONT } from "../../src/constants/theme";

const options = ["Woman", "Man", "Non-binary", "Prefer not to say", "More"];

import { useUser } from "../../src/context/UserContext";

export default function GenderStep() {
    const { updateProfile } = useUser();
    const [selected, setSelected] = useState<string | null>(null);
    const router = useRouter();

    return (
        <View style={styles.container}>

            {/* Progress Bar */}
            <WizardProgress currentStep={2} totalSteps={8} />

            {/* Simple Header */}
            <Text style={styles.header}>How do you identify?</Text>

            {/* Minimal Pills */}
            <View style={styles.list}>
                {options.map((o) => {
                    const isSelected = selected === o;
                    return (
                        <TouchableOpacity
                            key={o}
                            style={[
                                styles.pill,
                                isSelected && styles.pillSelected,
                            ]}
                            onPress={() => setSelected(o)}
                            activeOpacity={0.7}
                        >
                            <Text style={[
                                styles.pillText,
                                isSelected && styles.pillTextSelected
                            ]}>
                                {o}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Continue Button */}
            <TouchableOpacity
                style={[
                    styles.continue,
                    { backgroundColor: selected ? "#B9FF66" : COLORS.BORDER }
                ]}
                onPress={() => {
                    if (selected) {
                        updateProfile({ gender: selected });
                        router.push("/signup-wizard/step-3-style")
                    }
                }}
                disabled={!selected}
            >
                <Text style={styles.continueText}>Continue</Text>
            </TouchableOpacity>

        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F3F3F3",
        padding: 22
    },

    header: {
        fontSize: 26,
        fontFamily: FONT.UI_BOLD,
        color: COLORS.TEXT,
        marginTop: 30,
        marginBottom: 20,
    },

    /* Minimal List Layout */
    list: {
        gap: 14,
        marginTop: 10,
    },

    /* Simple B&W Pills */
    pill: {
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: "#000",
        backgroundColor: "#FFF",
        alignItems: "center",
    },

    pillSelected: {
        backgroundColor: "#000",
        borderColor: "#000",
    },

    pillText: {
        fontSize: 16,
        fontFamily: FONT.UI_MEDIUM,
        color: "#000",
    },

    pillTextSelected: {
        color: "#FFF",
        fontFamily: FONT.UI_BOLD,
    },

    /* Continue Button */
    continue: {
        marginTop: "auto",
        paddingVertical: 16,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
    },

    continueText: {
        fontFamily: FONT.UI_BOLD,
        color: "#191A23",
        fontSize: 16,
    },
});
