import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
    Animated,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import WizardProgress from "../../src/components/WizardProgress";
import { COLORS, FONT } from "../../src/constants/theme";

export default function WhoMeetStep() {
    const router = useRouter();
    const [openToAll, setOpenToAll] = useState(false);
    const [selected, setSelected] = useState<string[]>([]);
    const options = ["Men", "Women", "Nonbinary people"];

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

        if (selected.includes(o)) setSelected(selected.filter(x => x !== o));
        else setSelected([...selected, o]);
    };

    return (
        <View style={styles.container}>

            {/* Progress Bar */}
            <WizardProgress currentStep={4} totalSteps={8} />

            {/* Title */}
            <Text style={styles.header}>Who would you like to meet?</Text>
            <Text style={styles.sub}>
                You can pick more than one — and change it anytime.
            </Text>

            {/* Open to all switch */}
            <View style={styles.toggleRow}>
                <Text style={styles.toggleText}>I'm open to everyone</Text>
                <Switch
                    value={openToAll}
                    onValueChange={setOpenToAll}
                    trackColor={{ false: "#D3D3D3", true: "#191A23" }}
                    thumbColor="#fff"
                />
            </View>

            {/* Options */}
            {!openToAll && options.map((o) => {
                const isSelected = selected.includes(o);

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

                            {/* Checkmark */}
                            <View style={[
                                styles.checkCircle,
                                isSelected && styles.checkCircleSelected
                            ]}>
                                {isSelected && (
                                    <MaterialCommunityIcons
                                        name="check"
                                        size={16}
                                        color="#fff"
                                    />
                                )}
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                );
            })}

            {/* Info Box */}
            <View style={styles.infoBox}>
                <MaterialCommunityIcons name="information-outline" color={COLORS.MUTED} size={18} />
                <Text style={styles.infoText}>
                    You’ll only be shown to people open to dating your gender.
                </Text>
            </View>

            {/* Floating Next Button */}
            <TouchableOpacity
                style={styles.nextBtn}
                onPress={() => router.push("/signup-wizard/step-4-occupation")}
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

    /* Toggle Row */
    toggleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 14,
        marginBottom: 20,
    },

    toggleText: {
        fontSize: 16,
        fontFamily: FONT.UI_MEDIUM,
        color: COLORS.TEXT,
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

    /* Check circle */
    checkCircle: {
        width: 26,
        height: 26,
        borderRadius: 13,
        borderWidth: 2,
        borderColor: COLORS.TEXT,
        justifyContent: "center",
        alignItems: "center",
    },

    checkCircleSelected: {
        backgroundColor: "#B9FF66",
        borderColor: "#B9FF66",
    },

    /* Info Box */
    infoBox: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginTop: 20,
        paddingRight: 20,
    },

    infoText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
        color: COLORS.MUTED,
        fontFamily: FONT.UI_REGULAR,
        lineHeight: 20,
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
});
