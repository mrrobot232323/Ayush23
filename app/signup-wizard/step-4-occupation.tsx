import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "expo-router";
import React, { useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    Animated,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import * as yup from "yup";
import WizardProgress from "../../src/components/WizardProgress";
import { COLORS, FONT } from "../../src/constants/theme";
import { useUser } from "../../src/context/UserContext";
import { useCollegeSearch } from "../../src/hooks/useCollegeSearch";

/* ------------------- VALIDATION ------------------- */
const occupationSchema = yup.object().shape({
    occupation: yup.string().required("Select an option"),

    college: yup.string().when("occupation", {
        is: "Student",
        then: (schema) => schema.required("Enter your college"),
        otherwise: (schema) => schema.optional(),
    }),

    company: yup.string().when("occupation", {
        is: "Employed",
        then: (schema) => schema.required("Enter your company"),
        otherwise: (schema) => schema.optional(),
    }),
});

export default function OccupationStep() {
    const router = useRouter();
    const { updateProfile } = useUser();

    const options = ["Employed", "Student", "Entrepreneur", "Freelancer", "Retired"];

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { isValid, errors },
    } = useForm({
        resolver: yupResolver(occupationSchema),
        defaultValues: {
            occupation: "",
            college: "",
            company: "",
        },
        mode: "onChange",
    });

    const occupation = watch("occupation");
    const collegeValue = watch("college");
    const { results, loading } = useCollegeSearch(collegeValue || "");
    const [showSuggestions, setShowSuggestions] = React.useState(false);

    const scaleAnim = useRef(
        options.reduce((acc, o) => {
            acc[o] = new Animated.Value(1);
            return acc;
        }, {} as Record<string, Animated.Value>)
    ).current;

    const toggle = (o: string) => {
        const anim = scaleAnim[o];

        Animated.sequence([
            Animated.timing(anim, { toValue: 0.95, duration: 90, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 1, duration: 120, useNativeDriver: true }),
        ]).start();

        setValue("occupation", o, { shouldValidate: true });
    };

    const onSubmit = (data: any) => {
        updateProfile({
            occupation: data.occupation,
            company: data.company,
            college: data.college,
        });
        router.push("/signup-wizard/step-5-addtrip");
    };

    return (
        <View style={styles.container}>
            <WizardProgress currentStep={4.5} totalSteps={8} />

            <Text style={styles.header}>What's your occupation?</Text>
            <Text style={styles.sub}>Let others know what keeps you busy.</Text>

            {/* OPTIONS */}
            {options.map((o) => {
                const isSelected = occupation === o;

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

                            <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                                {isSelected && <View style={styles.radioInner} />}
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                );
            })}

            {/* ----------------- EMPLOYED ------------------ */}
            {occupation === "Employed" && (
                <View style={styles.extraBox}>
                    <Text style={styles.extraLabel}>Company Name</Text>

                    <Controller
                        control={control}
                        name="company"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                style={styles.input}
                                placeholder="Where do you work?"
                                placeholderTextColor="#999"
                                value={value}
                                onChangeText={onChange}
                            />
                        )}
                    />

                    {errors.company && <Text style={styles.error}>{errors.company.message}</Text>}
                </View>
            )}

            {/* ----------------- STUDENT ------------------ */}
            {occupation === "Student" && (
                <View style={styles.extraBox}>
                    <Text style={styles.extraLabel}>College / University</Text>

                    <Controller
                        control={control}
                        name="college"
                        render={({ field: { onChange, value } }) => {
                            return (
                                <View>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Which college do you attend?"
                                        placeholderTextColor="#999"
                                        value={value}
                                        onChangeText={(text) => {
                                            onChange(text);
                                            setShowSuggestions(true);
                                        }}
                                    />

                                    {loading && (
                                        <Text style={{ fontSize: 12, marginTop: 4, color: "#191A23" }}>
                                            Searching…
                                        </Text>
                                    )}

                                    {showSuggestions && results.length > 0 && (
                                        <View style={styles.suggestionBox}>
                                            {results.slice(0, 8).map((item, index) => (
                                                <TouchableOpacity
                                                    key={index}
                                                    onPress={() => {
                                                        onChange(item.name);
                                                        setShowSuggestions(false);
                                                    }}
                                                    style={styles.suggestionItem}
                                                >
                                                    <Text style={styles.suggestionText}>{item.name}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            );
                        }}
                    />

                    {errors.college && <Text style={styles.error}>{errors.college.message}</Text>}
                </View>
            )}

            {/* CONTINUE BUTTON */}
            <TouchableOpacity
                style={[styles.continueBtn, !isValid && styles.continueDisabled]}
                disabled={!isValid}
                onPress={handleSubmit(onSubmit)}
            >
                <Text style={styles.continueText}>Continue</Text>
            </TouchableOpacity>
        </View>
    );
}

/* ---------------------- STYLES -------------------------- */
const styles = StyleSheet.create({
    container: { flex: 1, padding: 22, backgroundColor: "#F3F3F3" },

    header: {
        fontSize: 28,
        fontFamily: FONT.UI_BOLD,
        color: COLORS.TEXT,
        marginTop: 10,
        marginBottom: 6,
    },

    sub: {
        fontSize: 15,
        color: COLORS.MUTED,
        marginBottom: 24,
    },

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
        backgroundColor: "#B9FF66",
        borderColor: "#B9FF66",
    },

    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#08080aff",
    },

    extraBox: {
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 16,
        borderWidth: 1.4,
        borderColor: "#D9D9D9",
        marginTop: 6,
        marginBottom: 16,
    },

    extraLabel: {
        fontSize: 14,
        marginBottom: 6,
        fontFamily: FONT.UI_MEDIUM,
        color: COLORS.TEXT,
    },

    input: {
        paddingVertical: 10,
        fontSize: 15,
        borderBottomWidth: 1,
        borderColor: "#E0E0E0",
        color: COLORS.TEXT,
        fontFamily: FONT.UI_REGULAR,
    },

    suggestionBox: {
        backgroundColor: "#FFF",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#D9D9D9",
        marginTop: 6,
        maxHeight: 180,
        overflow: "hidden",
    },

    suggestionItem: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderColor: "#F0F0F0",
    },

    suggestionText: {
        fontSize: 14,
        color: "#191A23",
        fontFamily: FONT.UI_REGULAR,
    },

    error: {
        color: "red",
        fontSize: 12,
        marginTop: 4,
    },

    continueBtn: {
        marginTop: "auto",
        marginBottom: 10,
        paddingVertical: 16,
        backgroundColor: "#B9FF66",
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
    },

    continueDisabled: {
        backgroundColor: "#C4C4C4",
    },

    continueText: {
        color: "#000000ff",
        fontFamily: FONT.UI_BOLD,
        fontSize: 16,
    },
});
