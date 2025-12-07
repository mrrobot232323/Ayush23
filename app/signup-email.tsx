import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { IconButton, Provider as PaperProvider } from "react-native-paper";
import * as yup from "yup";
import SuccessModal from "../src/components/SuccessModal";
import { COLORS, FONT } from "../src/constants/theme";
import { supabase } from "../src/lib/supabase";

const signupSchema = yup.object().shape({
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

export default function SignupEmail() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(signupSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            // 1. Sign up with Supabase
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
            });

            if (authError) {
                // Supabase error for existing user (when email confirm is OFF)
                if (authError.message.includes("User already registered") || authError.message.includes("already registered")) {
                    Alert.alert("Account Exists", "This email is already registered. Please login instead.");
                } else {
                    Alert.alert("Signup Failed", authError.message);
                }
                setIsLoading(false);
                return;
            }

            if (authData.user) {
                // 2. Create entry in profiles table
                const { error: profileError } = await supabase
                    .from('profiles')
                    .upsert([
                        {
                            id: authData.user.id,
                            email: data.email,
                            name: '', // Initialize empty fields that might be required
                        }
                    ]);

                if (profileError) {
                    console.error("Profile creation error:", profileError);
                    Alert.alert("Profile Error", "Account created but profile setup failed. Please contact support.");
                } else {
                    // Alert.alert("Success", "Profile created successfully");
                    // Show custom success modal instead
                    setShowSuccess(true);
                }
            }
        } catch (error: any) {
            Alert.alert("Error", error.message || "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuccessClose = () => {
        setShowSuccess(false);
        router.push("/signup-wizard/step-1");
    };

    return (
        <PaperProvider>
            <View style={styles.container}>

                {/* BACK BUTTON */}
                <View style={styles.backButtonWrapper}>
                    <IconButton
                        icon="arrow-left"
                        size={22}
                        iconColor="#191A23"
                        style={styles.backCircle}
                        onPress={() => router.back()}
                    />
                </View>

                {/* HEADER */}
                <Text style={styles.headerTitle}>Create your account</Text>
                <Text style={styles.subHeader}>
                    Enter your email and chose a password to get started.
                </Text>

                {/* INPUT */}
                <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Email address</Text>
                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={[
                                    styles.input,
                                    errors.email && styles.inputError,
                                ]}
                                placeholder="Enter email"
                                placeholderTextColor={COLORS.MUTED}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                            />
                        )}
                    />
                    {errors.email && (
                        <Text style={styles.errorText}>{errors.email.message}</Text>
                    )}
                </View>

                {/* PASSWORD INPUT */}
                <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Password</Text>
                    <View
                        style={[
                            styles.passwordInputContainer,
                            errors.password && styles.inputError,
                        ]}
                    >
                        <Controller
                            control={control}
                            name="password"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder="Create a password"
                                    placeholderTextColor={COLORS.MUTED}
                                    autoCapitalize="none"
                                    secureTextEntry={!showPassword}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                />
                            )}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <IconButton
                                icon={showPassword ? "eye-off" : "eye"}
                                size={20}
                                iconColor={COLORS.MUTED}
                            />
                        </TouchableOpacity>
                    </View>
                    {errors.password && (
                        <Text style={styles.errorText}>{errors.password.message}</Text>
                    )}
                </View>

                {/* BUTTON */}
                <TouchableOpacity
                    style={[styles.btn, isLoading && styles.btnDisabled]}
                    onPress={handleSubmit(onSubmit)}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#191A23" />
                    ) : (
                        <Text style={styles.btnText}>Continue</Text>
                    )}
                </TouchableOpacity>

            </View>

            {/* Success Modal */}
            <SuccessModal
                visible={showSuccess}
                onClose={handleSuccessClose}
                title="You're In!"
                subtitle="Your account has been successfully created. Let's build your profile."
            />
        </PaperProvider>
    );
}

/* -------------------- STYLES -------------------- */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F3F3F3",
        paddingHorizontal: 24,
        justifyContent: "center",
    },

    /* Back Button */
    backButtonWrapper: {
        position: "absolute",
        top: 60,
        left: 20,
        zIndex: 50,
    },

    backCircle: {
        backgroundColor: "#FFFFFF",
        borderRadius: 40,
        margin: 0,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },

    /* Header Text */
    headerTitle: {
        fontSize: 28,
        fontFamily: FONT.UI_BOLD,
        color: COLORS.TEXT,
        marginBottom: 8,
    },

    subHeader: {
        fontSize: 15,
        fontFamily: FONT.UI_REGULAR,
        color: COLORS.MUTED,
        marginBottom: 32,
    },

    /* Input Block */
    inputWrapper: {
        marginBottom: 24,
    },

    label: {
        fontSize: 14,
        fontFamily: FONT.UI_MEDIUM,
        color: COLORS.TEXT,
        marginBottom: 8,
    },

    input: {
        backgroundColor: "#FFFFFF",
        padding: 16,
        borderRadius: 14,
        fontFamily: FONT.UI_REGULAR,
        fontSize: 16,
        borderWidth: 1.4,
        borderColor: "#D5D5D5",
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
    },
    inputError: {
        borderColor: "#FF4D4F", // Red border for error
    },
    errorText: {
        color: "#FF4D4F",
        fontSize: 12,
        marginTop: 4,
        fontFamily: FONT.UI_REGULAR,
    },

    passwordInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        borderWidth: 1.4,
        borderColor: "#D5D5D5",
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
        paddingRight: 8,
    },
    passwordInput: {
        flex: 1,
        padding: 16,
        fontFamily: FONT.UI_REGULAR,
        fontSize: 16,
    },

    /* Continue Button */
    btn: {
        backgroundColor: "#B9FF66",
        padding: 18,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
        marginTop: 10,
    },
    btnDisabled: {
        opacity: 0.7,
        backgroundColor: "#E0E0E0",
    },

    btnText: {
        fontFamily: FONT.UI_BOLD,
        color: "#191A23",
        fontSize: 16,
    },
});
