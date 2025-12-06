import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Dimensions, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useEffect, useState } from "react";
import { FONT } from "../src/constants/theme";

const { width, height } = Dimensions.get('window');

const BRAND_GREEN = "#B9FF66";
const TEXT_COLOR = "#191A23";
const LOVE_COLOR = "#bd2461ff"; // romantic love color

export default function LandingScreen() {
    const router = useRouter();

    // -------------------------
    // Typing Effect
    // -------------------------
    const fullText = "Meet Someone Worth the Mile";
    const [typedText, setTypedText] = useState("");

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

    // Split the text to color ONLY "Someone"
    const renderTypedHeadline = () => {
        const parts = typedText.split(" ");

        return (
            <Text style={styles.headline}>
              {parts.map((word, i) => {
    if (word === "Someone") {
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
            <StatusBar style="light" />

            <ImageBackground
                source={{ uri: "https://images.unsplash.com/photo-1516585427167-18e461a336bf?q=80&w=2787&auto=format&fit=crop" }}
                style={styles.background}
                resizeMode="cover"
            >
                <View style={styles.overlay} />

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

                        {/* PRIMARY BUTTON */}
                        <TouchableOpacity
                            style={styles.primaryBtn}
                            onPress={() => router.push("/signup-email")}
                        >
                            <Text style={styles.primaryBtnText}>Create an account</Text>
                        </TouchableOpacity>

                        {/* SECONDARY BUTTON */}
                        <TouchableOpacity
                            style={styles.secondaryBtn}
                            onPress={() => router.push("/login")}
                        >
                            <Text style={styles.secondaryBtnText}>I have an account</Text>
                        </TouchableOpacity>

                        <Text style={styles.termsText}>
                            By signing up, you agree to our <Text style={{ textDecorationLine: 'underline' }}>Terms</Text>.
                            See how we use your data in our <Text style={{ textDecorationLine: 'underline' }}>Privacy Policy</Text>.
                        </Text>
                    </View>

                </View>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F3F3',
    },
    background: {
        width: width,
        height: height,
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.25)',
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
        fontSize: 46,
        fontFamily: FONT.UI_BOLD,
        color: TEXT_COLOR,
        textAlign: 'center',
        lineHeight: 50,
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
    color: LOVE_COLOR,
    textShadowColor: LOVE_COLOR,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12, // glow strength
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
