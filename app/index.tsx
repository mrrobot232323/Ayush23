import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FONT } from "../src/constants/theme";
import { useUser } from "../src/context/UserContext";
import { useNavigation } from "../src/utils/navigation";
import { ROUTES } from "../src/constants/routes";

// --- THEME COLORS ---
const BRAND_GREEN = "#B9FF66"; 
const TEXT_COLOR = "#191A23";  
const BLUE_HIGHLIGHT = "#0057ff"; // Blue for "Destination"

export default function LandingScreen() {
    const nav = useNavigation();
    const { session } = useUser();

    // -------------------------
    // Typing Effect
    // -------------------------
    // Updated text as requested
    const fullText = "Looks Not Matter Destination Does"; 
    const [typedText, setTypedText] = useState("");

    useEffect(() => {
        if (session) {
            nav.replace(ROUTES.TABS.ROOT);
        }
    }, [session]);

    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            if (index < fullText.length) {
                setTypedText(fullText.slice(0, index + 1));
                index++;
            } else {
                clearInterval(interval);
            }
        }, 70); // speed

        return () => clearInterval(interval);
    }, []);

    // Split the text to color specific words
    const renderTypedHeadline = () => {
        const parts = typedText.split(" ");

        return (
            <Text style={styles.headline}>
                {parts.map((word, i) => {
                    // Logic: Highlight "Destination" in Blue
                    // We also check for the last "Does" if you want that blue too, 
                    // but usually highlighting the main noun looks best.
                    if (word === "Destination") {
                        return (
                            <Text key={i} style={styles.glowText}>
                                {word + " "}
                            </Text>
                        );
                    }
                    return word + " ";
                })}
            </Text>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            <View style={styles.contentContainer}>

                {/* HEADER */}
                <View style={styles.header}>
                    <Text style={styles.logoText}>MeetMiles</Text>
                    <Text style={styles.subLogoText}>Where Real Connections Begin</Text>
                </View>

                {/* HEADLINE WITH TYPING */}
                <View style={styles.headlineContainer}>{renderTypedHeadline()}</View>

                {/* ACTION BUTTONS */}
                <View style={styles.actionContainer}>

                    {/* PRIMARY BUTTON (Green) */}
                    <TouchableOpacity
                        style={styles.primaryBtn}
                        onPress={() => nav.navigate(ROUTES.SIGNUP_EMAIL)}
                    >
                        <Text style={styles.primaryBtnText}>Create an account</Text>
                    </TouchableOpacity>

                    {/* SECONDARY BUTTON (White) */}
                    <TouchableOpacity
                        style={styles.secondaryBtn}
                        onPress={() => nav.navigate(ROUTES.LOGIN)}
                    >
                        <Text style={styles.secondaryBtnText}>I have an account</Text>
                    </TouchableOpacity>

                    <Text style={styles.termsText}>
                        By signing up, you agree to our <Text style={{ textDecorationLine: 'underline' }}>Terms</Text>.
                        See how we use your data in our <Text style={{ textDecorationLine: 'underline' }}>Privacy Policy</Text>.
                    </Text>
                </View>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 28,
        paddingTop: 80,
        paddingBottom: 60,
    },
    header: {
        alignItems: 'center',
        marginTop: 20,
    },
    logoText: {
        fontSize: 34,
        fontFamily: FONT.UI_BOLD,
        color: "#3d6709ff",
        letterSpacing: -0.5,
    },
    subLogoText: {
        fontSize: 16,
        fontFamily: FONT.UI_MEDIUM,
        color: "#000000ff",
        opacity: 0.9,
        marginTop: 4,
    },
    headlineContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    headline: {
        fontSize: 46, // Adjusted size slightly for longer text
        fontFamily: FONT.UI_BOLD,
        color: TEXT_COLOR,
        textAlign: 'center',
        lineHeight: 52,
    },
    actionContainer: {
        width: '100%',
        gap: 16,
    },
    primaryBtn: {
        backgroundColor: BRAND_GREEN,
        height: 58,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
    },
    glowText: {
        color: BLUE_HIGHLIGHT,
        textShadowColor: BLUE_HIGHLIGHT,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 12, 
    },
    primaryBtnText: {
        fontFamily: FONT.UI_BOLD,
        color: TEXT_COLOR,
        fontSize: 17,
    },
    secondaryBtn: {
        backgroundColor: "#FFFFFF",
        height: 56,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1.3,
        borderColor: TEXT_COLOR,
    },
    secondaryBtnText: {
        fontFamily: FONT.UI_BOLD,
        color: TEXT_COLOR,
        fontSize: 16,
    },
    termsText: {
        fontFamily: FONT.UI_REGULAR,
        color: "#000000ff",
        fontSize: 12,
        textAlign: "center",
        marginTop: 8,
        opacity: 0.85,
    },
});