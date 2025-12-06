import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import WizardProgress from "../../src/components/WizardProgress";
import { COLORS, FONT } from "../../src/constants/theme";

import { useUser } from "../../src/context/UserContext";

export default function LookingForStep() {
    const router = useRouter();
    const { updateProfile } = useUser();
    const [selected, setSelected] = useState<string | null>(null);

    // As per user request: "searching for long distance ,short term etc"
    const options = [
        "Long-term partner",
        "Short-term fun",
        "New friends",
        "Long distance relationship",
        "Casual dating",
        "Still figuring it out"
    ];

    const scaleAnim = useRef(options.reduce((acc, o) => {
        acc[o] = new Animated.Value(1);
        return acc;
    }, {} as Record<string, Animated.Value>)).current;

    const toggle = (o: string) => {
        const anim = scaleAnim[o];

        // Press animation
        Animated.sequence([
            Animated.timing(anim, { toValue: 0.96, duration: 90, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 1, duration: 120, useNativeDriver: true }),
        ]).start();

        setSelected(o);
    };

    const handleNext = () => {
        if (selected) {
            updateProfile({ lookingFor: selected });
            router.push("/signup-wizard/step-6-prompts");
        }
    };

    return (
        <View style={styles.container}>

            {/* Progress Bar - Let's call this 5.5 in terms of visual */}
            <WizardProgress currentStep={5.5} totalSteps={8} />

            {/* Title */}
            <Text style={styles.header}>What are you looking for?</Text>
            <Text style={styles.sub}>
                Be honest — it helps you find what you want.
            </Text>

            {/* Options */}
            {options.map((o) => {
                const isSelected = selected === o;

                return (
                    <Animated.View key={o} style={{ transform: [{ scale: scaleAnim[o] }] }}>
                        <TouchableOpacity
                            style={[styles.option, isSelected && styles.optionSelected]}
                            onPress={() => toggle(o)}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                                {o}
                            </Text>

                            {/* Radio Circle */}
                            <View style={[
                                styles.radioCircle,
                                isSelected && styles.radioCircleSelected
                            ]}>
                                {isSelected && <View style={styles.radioInner} />}
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                );
            })}


            {/* Floating Next Button */}
            <TouchableOpacity
                style={[styles.nextBtn, !selected && styles.nextBtnDisabled]}
                disabled={!selected}
                onPress={handleNext}
            >
                <MaterialCommunityIcons name="arrow-right" size={26} color="#fff" />
            </TouchableOpacity>

        </View>
    );
}

/* ---------------------- STYLES -------------------------- */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 22,
        backgroundColor: "#F3F3F3",
    },

    header: {
        fontSize: 28,
        fontFamily: FONT.UI_BOLD,
        color: COLORS.TEXT,
        marginTop: 10,
        marginBottom: 6,
    },

    sub: {
        fontSize: 15,
        fontFamily: FONT.UI_REGULAR,
        color: COLORS.MUTED,
        marginBottom: 24,
        lineHeight: 20,
    },

    /* Option Pills */
    option: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 18,
        backgroundColor: "#fff",
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: "#D9D9D9",
        marginBottom: 12,
    },

    optionSelected: {
        backgroundColor: "#191A23",
        borderColor: "#191A23",
    },

    optionText: {
        fontSize: 16,
        fontFamily: FONT.UI_MEDIUM,
        color: COLORS.TEXT,
    },

    optionTextSelected: {
        color: "#fff",
        fontFamily: FONT.UI_BOLD,
    },

    /* Radio Circle */
    radioCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: COLORS.MUTED,
        justifyContent: "center",
        alignItems: "center",
    },

    radioCircleSelected: {
        borderColor: "#B9FF66",
        backgroundColor: "#B9FF66",
    },

    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#191A23",
    },

    /* Floating Next Button */
    nextBtn: {
        position: "absolute",
        bottom: 30,
        right: 24,
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: "#191A23",
        justifyContent: "center",
        alignItems: "center",
        elevation: 8,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
    },

    nextBtnDisabled: {
        backgroundColor: "#C4C4C4",
        elevation: 0,
    }
});
