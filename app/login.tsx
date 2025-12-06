import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { IconButton, Provider as PaperProvider } from "react-native-paper";
import * as yup from "yup";
import { COLORS, FONT } from "../src/constants/theme";

const loginSchema = yup.object().shape({
    emailOrPhone: yup.string().required("Email or phone number is required"),
    password: yup.string().required("Password is required"),
});

export default function LoginScreen() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(loginSchema),
        defaultValues: {
            emailOrPhone: "",
            password: "",
        },
    });

    const onSubmit = (data: any) => {
        console.log("Login Data:", data);
        router.replace("/(tabs)");
    };

    return (
        <PaperProvider>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                <StatusBar style="dark" />

                {/* Back Button */}
                <View style={styles.backButtonWrapper}>
                    <IconButton
                        icon="arrow-left"
                        size={22}
                        iconColor="#191A23"
                        style={styles.backCircle}
                        onPress={() => router.back()}
                    />
                </View>

                {/* Main Content */}
                <View style={styles.content}>
                    <Text style={styles.title}>Welcome back</Text>
                    <Text style={styles.subtitle}>
                        Enter your phone number or email to sign in.
                    </Text>

                    {/* Input Field */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Phone or Email</Text>
                        <Controller
                            control={control}
                            name="emailOrPhone"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={[
                                        styles.input,
                                        errors.emailOrPhone && styles.inputError,
                                    ]}
                                    placeholder="Enter your details"
                                    placeholderTextColor={COLORS.MUTED}
                                    autoCapitalize="none"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                />
                            )}
                        />
                        {errors.emailOrPhone && (
                            <Text style={styles.errorText}>
                                {errors.emailOrPhone.message}
                            </Text>
                        )}
                    </View>

                    {/* Password Input Field */}
                    <View style={styles.inputContainer}>
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
                                        placeholder="Enter your password"
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
                            <Text style={styles.errorText}>
                                {errors.password.message}
                            </Text>
                        )}
                    </View>

                    {/* Forgot Password */}
                    <TouchableOpacity
                        style={styles.forgotPasswordContainer}
                        onPress={() => {
                            // TODO: Navigate to forgot password screen
                            console.log("Navigate to Forgot Password");
                        }}
                    >
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    {/* Continue Button */}
                    <TouchableOpacity
                        style={styles.btn}
                        onPress={handleSubmit(onSubmit)}
                    >
                        <Text style={styles.btnText}>Continue</Text>
                    </TouchableOpacity>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <TouchableOpacity onPress={() => router.push("/signup-email")}>
                            <Text style={styles.linkText}>
                                Don't have an account?{" "}
                                <Text style={{ color: "#293b14ff" }}>Sign up</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </PaperProvider>
    );
}

/* -------------------- STYLES -------------------- */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F3F3F3",
    },

    /* Back button wrapper */
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
    content: {
        flex: 1,
        padding: 24,
        justifyContent: "center",
    },

    title: {
        fontSize: 32,
        fontFamily: FONT.UI_BOLD,
        color: COLORS.TEXT,
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: FONT.UI_REGULAR,
        color: COLORS.MUTED,
        marginBottom: 32,
    },

    /* Input Field */
    inputContainer: {
        marginBottom: 24,
    },
    label: {
        fontFamily: FONT.UI_MEDIUM,
        fontSize: 14,
        color: COLORS.TEXT,
        marginBottom: 8,
    },
    input: {
        backgroundColor: "#FFFFFF",
        padding: 16,
        borderRadius: 14,
        fontFamily: FONT.UI_REGULAR,
        fontSize: 16,
        borderWidth: 1.2,
        borderColor: "#DADADA",
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
        borderWidth: 1.2,
        borderColor: "#DADADA",
        paddingRight: 8,
    },
    passwordInput: {
        flex: 1,
        padding: 16,
        fontFamily: FONT.UI_REGULAR,
        fontSize: 16,
    },

    forgotPasswordContainer: {
        alignSelf: "flex-end",
        marginBottom: 24,
    },
    forgotPasswordText: {
        fontFamily: FONT.UI_MEDIUM,
        fontSize: 14,
        color: COLORS.MUTED,
    },

    /* Continue Button */
    btn: {
        backgroundColor: "#B9FF66",
        padding: 18,
        borderRadius: 999,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
    },
    btnText: {
        fontFamily: FONT.UI_BOLD,
        color: "#191A23",
        fontSize: 16,
    },

    /* Footer */
    footer: {
        marginTop: 24,
        alignItems: "center",
    },
    linkText: {
        fontFamily: FONT.UI_MEDIUM,
        color: COLORS.TEXT,
        fontSize: 14,
    },
});
