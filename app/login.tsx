import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
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
import { COLORS, FONT } from "../src/constants/theme";

export default function LoginScreen() {
    const router = useRouter();

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
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your details"
                            placeholderTextColor={COLORS.MUTED}
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Continue Button */}
                    <TouchableOpacity style={styles.btn} onPress={() => router.replace("/(tabs)")}>
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
        zIndex: 20,
    },

    /* Floating back icon styling */
    backCircle: {
        backgroundColor: "#f2ededff",
        borderRadius: 40,
        margin: 0,
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
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
