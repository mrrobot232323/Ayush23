import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { COLORS, FONT } from "../src/constants/theme";
import { IconButton, Provider as PaperProvider } from "react-native-paper";

export default function SignupEmail() {
    const router = useRouter();

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
                <Text style={styles.headerTitle}>What's your email?</Text>
                <Text style={styles.subHeader}>
                    We’ll send a verification link to continue.
                </Text>

                {/* INPUT */}
                <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Email address</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter email"
                        placeholderTextColor={COLORS.MUTED}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                {/* BUTTON */}
                <TouchableOpacity
                    style={styles.btn}
                    onPress={() => router.push("/signup-wizard/step-1")}
                >
                    <Text style={styles.btnText}>Verify & Continue</Text>
                </TouchableOpacity>

            </View>
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

    btnText: {
        fontFamily: FONT.UI_BOLD,
        color: "#191A23",
        fontSize: 16,
    },
});
