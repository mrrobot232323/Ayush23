import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import DOBPicker from "../../src/components/DOBPicker";
import WizardProgress from "../../src/components/WizardProgress";
import { COLORS, FONT } from "../../src/constants/theme";

import { useUser } from "../../src/context/UserContext";

export default function Step1() {
    const router = useRouter();
    const { updateProfile } = useUser();
    const [name, setName] = useState("");
    const [dobData, setDobData] = useState<{ dob: string, age: number } | null>(null);

    const handleNext = () => {
        if (name && dobData) {
            updateProfile({ name, dob: dobData.dob, age: dobData.age });
            router.push("/signup-wizard/step-2-gender");
        }
    };

    return (
        <View style={styles.container}>

            {/* Progress Bar */}
            <WizardProgress currentStep={1} totalSteps={8} />

            {/* Better Header Text */}
            <Text style={styles.header}>
                Your journey starts with your name — ready?
            </Text>

            {/* Name Input */}
            <Text style={styles.label}>Your first name</Text>
            <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={COLORS.MUTED}
            />

            {/* DOB Picker */}
            <Text style={styles.label}>Your birthday</Text>
            <DOBPicker onConfirm={(dob, age) => setDobData({ dob, age })} />

            {dobData && (
                <Text style={styles.ageText}>Age: {dobData.age}</Text>
            )}

            <Text style={styles.subtext}>The best adventures begin with you.</Text>

            {/* Continue Button */}
            <TouchableOpacity
                style={[
                    styles.continue,
                    { backgroundColor: name && dobData ? "#B9FF66" : COLORS.BORDER }
                ]}
                onPress={handleNext}
                disabled={!name || !dobData}
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
        fontSize: 28,
        fontFamily: FONT.UI_BOLD,
        color: COLORS.TEXT,
        marginBottom: 25,
        marginTop: 10,
        lineHeight: 32
    },

    label: {
        fontSize: 16,
        fontFamily: FONT.UI_MEDIUM,
        color: COLORS.TEXT,
        marginBottom: 8,
        marginTop: 20
    },

    input: {
        backgroundColor: COLORS.WHITE,
        padding: 16,
        borderRadius: 14,
        borderWidth: 1.2,
        borderColor: "#D5D5D5",
        fontSize: 16,
        fontFamily: FONT.UI_REGULAR,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
    },

    ageText: {
        marginTop: 10,
        color: COLORS.MUTED,
        fontSize: 14,
        fontFamily: FONT.UI_MEDIUM,
    },

    subtext: {
        color: COLORS.MUTED,
        marginTop: 20,
        fontSize: 14,
        fontFamily: FONT.UI_REGULAR,
    },

    continue: {
        marginTop: "auto",
        paddingVertical: 16,
        borderRadius: 999,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
        marginBottom: 20,
    },

    continueText: {
        fontFamily: FONT.UI_BOLD,
        color: "#191A23",
        fontSize: 16
    },
});
