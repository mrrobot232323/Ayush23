import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, TextInput, View } from "react-native";
import * as yup from "yup";
import DOBPicker from "../../src/components/DOBPicker";
import WizardButton from "../../src/components/WizardButton";
import WizardProgress from "../../src/components/WizardProgress";
import { COLORS, FONT } from "../../src/constants/theme";

import { useUser } from "../../src/context/UserContext";

const step1Schema = yup.object().shape({
    name: yup.string().required("Name is required"),
    dob: yup.string().required("Date of birth is required"),
    age: yup.number().required().min(18, "You must be 18 or older"),
});

export default function Step1() {
    const router = useRouter();
    const { updateProfile } = useUser();

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isValid },
    } = useForm({
        resolver: yupResolver(step1Schema),
        defaultValues: {
            name: "",
            dob: "",
            age: 0,
        },
        mode: "onChange",
    });

    const dobData = watch(["dob", "age"]);
    const dob = dobData[0];
    const age = dobData[1];

    const onSubmit = (data: any) => {
        updateProfile({ name: data.name, dob: data.dob, age: data.age });
        router.push("/signup-wizard/step-2-gender");
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
            <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        style={[styles.input, errors.name && styles.inputError]}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="Enter your name"
                        placeholderTextColor={COLORS.MUTED}
                    />
                )}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}

            {/* DOB Picker */}
            <Text style={styles.label}>Your birthday</Text>
            <DOBPicker
                onConfirm={(d, a) => {
                    setValue("dob", d, { shouldValidate: true });
                    setValue("age", a, { shouldValidate: true });
                }}
            />

            {dob ? (
                <Text style={styles.ageText}>Age: {age}</Text>
            ) : null}
            {errors.age && <Text style={styles.errorText}>{errors.age.message}</Text>}

            <Text style={styles.subtext}>The best adventures begin with you.</Text>

            {/* Continue Button */}
            <WizardButton
                title="Continue"
                onPress={handleSubmit(onSubmit)}
                disabled={!isValid}
                style={{ marginTop: "auto" }}
            />
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
    inputError: {
        borderColor: "#FF4D4F",
    },
    errorText: {
        color: "#FF4D4F",
        fontSize: 12,
        marginTop: 4,
        fontFamily: FONT.UI_REGULAR,
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
});
