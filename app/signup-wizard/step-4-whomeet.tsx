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

        Animated.sequence([
            Animated.timing(anim, { toValue: 0.94, duration: 80, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 1, duration: 120, useNativeDriver: true }),
        ]).start();

        if (selected.includes(o)) setSelected(selected.filter(x => x !== o));
        else setSelected([...selected, o]);
    };

    return (
        <View style={styles.container}>
            <WizardProgress currentStep={4} totalSteps={8} />

            <Text style={styles.header}>Who would you like to meet?</Text>
            <Text style={styles.sub}>
                You can pick more than one — and change it anytime.
            </Text>

            {/* Toggle */}
            <View style={styles.toggleRow}>
                <Text style={styles.toggleText}>I'm open to everyone</Text>
                <Switch
                    value={openToAll}
                    onValueChange={setOpenToAll}
                    trackColor={{ false: "#D3D3D3", true: "#191A23" }}
                    thumbColor="#fff"
                />
            </View>

            {/* Pills */}
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

                            <View
                                style={[
                                    styles.checkCircle,
                                    isSelected && styles.checkCircleSelected
                                ]}
                            >
                                {isSelected && (
                                    <MaterialCommunityIcons
                                        name="check"
                                        size={15}
                                        color="#fff"
                                    />
                                )}
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                );
            })}

            {/* Info */}
            <View style={styles.infoBox}>
                <MaterialCommunityIcons name="information-outline" size={18} color={COLORS.MUTED} />
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

/* ---------------------- FIXED + MATCHED UI -------------------------- */

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

    toggleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 18,
    },

    toggleText: {
        fontSize: 16,
        fontFamily: FONT.UI_MEDIUM,
        color: COLORS.TEXT,
    },

    /* FIXED PILL STYLE */
    option: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",

        padding: 18,
        backgroundColor: "#fff",

        borderRadius: 14,
        borderWidth: 1.4,
        borderColor: "#CFCFCF",

        marginBottom: 12,
    },

    /* Selected pill now stays WHITE — only border & text darkens */
    optionSelected: {
        borderColor: "#000",
    },

    optionText: {
        fontSize: 16,
        fontFamily: FONT.UI_MEDIUM,
        color: COLORS.TEXT,
    },

    optionTextSelected: {
        fontFamily: FONT.UI_BOLD,
        color: "#000",
    },

    /* FIXED CHECK CIRCLE */
    checkCircle: {
        width: 26,
        height: 26,
        borderRadius: 13,
        borderWidth: 1.6,
        borderColor: "#000",
        justifyContent: "center",
        alignItems: "center",
    },

    checkCircleSelected: {
        backgroundColor: "#000",
        borderColor: "#000",
    },

    infoBox: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginTop: 16,
    },

    infoText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
        fontFamily: FONT.UI_REGULAR,
        color: COLORS.MUTED,
        lineHeight: 20,
    },

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

        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 6,
    }
});
