import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as yup from "yup";
import WizardButton from "../../src/components/WizardButton";
import WizardProgress from "../../src/components/WizardProgress";
import { COLORS, FONT } from "../../src/constants/theme";
import { useUser } from "../../src/context/UserContext";

const options = ["Woman", "Man", "Non-binary", "Prefer not to say", "More"];

const step2Schema = yup.object().shape({
    gender: yup.string().required("Please select an option"),
});

export default function GenderStep() {
    const { updateProfile } = useUser();
    const router = useRouter();

    const {
        handleSubmit,
        setValue,
        watch,
        formState: { isValid },
    } = useForm({
        resolver: yupResolver(step2Schema),
        defaultValues: {
            gender: "",
        },
        mode: "onChange",
    });

    const selected = watch("gender");

    const onSubmit = (data: any) => {
        updateProfile({ gender: data.gender });
        router.push("/signup-wizard/step-3-style");
    };

    return (
        <View style={styles.container}>
            <WizardProgress currentStep={2} totalSteps={8} />

            <Text style={styles.header}>How do you identify?</Text>

            <View style={styles.list}>
                {options.map((o) => {
                    const isSelected = selected === o;
                    return (
                        <TouchableOpacity
                            key={o}
                            style={[styles.pill, isSelected && styles.pillSelected]}
                            onPress={() => setValue("gender", o, { shouldValidate: true })}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                                {o}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* FIXED BOTTOM BUTTON */}
            <View style={styles.bottomContainer}>
                <WizardButton
                    title="Continue"
                    onPress={handleSubmit(onSubmit)}
                    disabled={!isValid}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F3F3F3",
        padding: 22,
        paddingBottom: 100, // ensures list doesn’t overlap button
    },

    header: {
        fontSize: 26,
        fontFamily: FONT.UI_BOLD,
        color: COLORS.TEXT,
        marginTop: 30,
        marginBottom: 20,
    },

    list: {
        gap: 14,
        marginTop: 10,
    },

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

    /* FIXED BOTTOM BUTTON CONTAINER */
    bottomContainer: {
        position: "absolute",
        left: 22,
        right: 22,
        bottom: 30,
    },
});
