import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import PromptRow from "../../src/components/PromptRow";
import WizardProgress from "../../src/components/WizardProgress";
import { COLORS, FONT } from "../../src/constants/theme";

import { useUser } from "../../src/context/UserContext";

export default function PromptsStep() {
    const router = useRouter();
    const { updateProfile } = useUser();
    const [prompts, setPrompts] = useState([
        { id: 1, question: "A travel moment I'll never forget…", answer: "" },
        { id: 2, question: "Two things I always pack…", answer: "" },
        { id: 3, question: "My ideal travel buddy is someone who…", answer: "" }
    ]);

    const updateAnswer = (index: number, txt: string) => {
        const copy = [...prompts];
        copy[index].answer = txt;
        setPrompts(copy);
    };

    const isValid = prompts.some((p) => p.answer.trim().length > 0);

    const handleNext = () => {
        if (isValid) {
            updateProfile({ prompts: prompts.filter(p => p.answer.trim().length > 0) });
            router.push("/signup-wizard/step-7-photos");
        }
    };

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
        >
            <WizardProgress currentStep={6} totalSteps={8} />

            <Text style={styles.header}>What makes you, you?</Text>
            <Text style={styles.sub}>
                Add at least one prompt so your personality can shine through.
            </Text>

            {/* Prompt Cards */}
            {prompts.map((p, i) => (
                <View key={p.id} style={styles.card}>
                    <PromptRow
                        placeholder={p.question}
                        value={p.answer}
                        onChange={(t: string) => updateAnswer(i, t)}
                        onAdd={() => { }}
                        canAdd={false}
                    />
                </View>
            ))}

            {/* Tip Box */}
            <View style={styles.tipBox}>
                <Text style={styles.tipTitle}>✨ Pro tip</Text>
                <Text style={styles.tipText}>
                    People with strong prompts get *2× more matches*.
                    Share details — it helps others connect with you.
                </Text>
            </View>

            {/* Continue Button */}
            <TouchableOpacity
                style={[styles.continue, !isValid && styles.disabled]}
                onPress={handleNext}
                disabled={!isValid}
            >
                <Text style={[styles.continueText, !isValid && styles.disabledText]}>
                    Continue
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

/* ---------------------- STYLES ---------------------- */

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        paddingBottom: 100,
        backgroundColor: "#F3F3F3",
    },

    header: {
        fontSize: 30,
        fontFamily: FONT.UI_BOLD,
        color: COLORS.TEXT,
        marginTop: 12,
    },

    sub: {
        marginTop: 6,
        fontSize: 16,
        fontFamily: FONT.UI_REGULAR,
        color: COLORS.MUTED,
        marginBottom: 24,
    },

    /* Prompt card wrapper */
    card: {
        backgroundColor: "#FFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#E5E5E5",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },

    /* Premium Tip Card */
    tipBox: {
        marginTop: 16,
        backgroundColor: "#FFF8E8",
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#F2D39B",
    },
    tipTitle: {
        fontFamily: FONT.UI_BOLD,
        fontSize: 15,
        marginBottom: 4,
        color: "#B68A2C",
    },
    tipText: {
        fontFamily: FONT.UI_REGULAR,
        fontSize: 14,
        color: "#7A6220",
        lineHeight: 20,
    },

    /* Continue Button */
    continue: {
        marginTop: 40,
        backgroundColor: COLORS.PRIMARY_BTN,
        paddingVertical: 16,
        borderRadius: 999,
        alignItems: "center",
    },

    continueText: {
        fontFamily: FONT.UI_BOLD,
        color: COLORS.TEXT,
        fontSize: 16,
    },

    disabled: {
        backgroundColor: "#D8D8D8",
    },
    disabledText: {
        color: "#A0A0A0",
    },
});
