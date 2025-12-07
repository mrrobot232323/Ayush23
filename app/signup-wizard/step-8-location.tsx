import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import SuccessModal from "../../src/components/SuccessModal";
import WizardProgress from "../../src/components/WizardProgress";
import { COLORS, FONT } from "../../src/constants/theme";
import { useUser } from "../../src/context/UserContext";
import { useLocationSearch } from "../../src/hooks/useLocationSearch";


export default function LocationStep() {
    const router = useRouter();
    const { updateProfile } = useUser();
    const [location, setLocation] = useState("");
    const { results, loading, searchPlaces } = useLocationSearch();
    const [showResults, setShowResults] = useState(false);
    const [isSuccessVisible, setIsSuccessVisible] = useState(false);

    // Ensure modal is hidden on mount
    React.useEffect(() => {
        setIsSuccessVisible(false);
    }, []);

    const handleNext = () => {
        if (!location) return;
        updateProfile({ location });
        setIsSuccessVisible(true);
    };

    const onFinish = () => {
        setIsSuccessVisible(false);
        router.push("/(tabs)/profile");
    };

    const handleLocationSelect = (item: any) => {
        const addr = item.address;
        const city = addr.city || addr.town || addr.village || addr.county || addr.state_district;
        const state = addr.state;
        const country = addr.country;

        const parts = [city, state, country].filter(Boolean);
        const fullLocation = parts.join(", ");

        setLocation(fullLocation);
        setShowResults(false);
    };

    return (
        <View style={styles.container}>
            <WizardProgress currentStep={8} totalSteps={8} />

            <Text style={styles.header}>Where are you?</Text>
            <Text style={styles.sub}>Your location helps us find people near you.</Text>

            <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="map-marker" size={24} color={COLORS.MUTED} style={styles.icon} />
                <TextInput
                    style={styles.input}
                    value={location}
                    onChangeText={(text) => {
                        setLocation(text);
                        searchPlaces(text);
                        setShowResults(true);
                    }}
                    placeholder="Enter your city"
                    placeholderTextColor={COLORS.MUTED}
                />
            </View>

            {/* SEARCH RESULTS */}
            {showResults && (location.length > 2) && (
                <View style={styles.resultsContainer}>
                    {loading ? (
                        <ActivityIndicator size="small" color={COLORS.PRIMARY_BTN} style={{ margin: 20 }} />
                    ) : (
                        <FlatList
                            data={results}
                            keyExtractor={(item: any) => item.place_id.toString()}
                            keyboardShouldPersistTaps="handled"
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.resultItem}
                                    onPress={() => handleLocationSelect(item)}
                                >
                                    <View>
                                        <Text style={styles.resultMain}>{item.display_name.split(",")[0]}</Text>
                                        <Text style={styles.resultSub} numberOfLines={1}>{item.display_name}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </View>
            )}

            <TouchableOpacity style={styles.currentLocationBtn}>
                <MaterialCommunityIcons name="crosshairs-gps" size={20} color={COLORS.TEXT} style={{ marginRight: 8 }} />
                <Text style={styles.currentLocationText}>Use current location</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.continue, { backgroundColor: location ? COLORS.PRIMARY_BTN : COLORS.BORDER }]}
                onPress={handleNext}
                disabled={!location}
            >
                <Text style={styles.continueText}>Continue</Text>
            </TouchableOpacity>

            {/* Success Modal */}
            <SuccessModal
                visible={isSuccessVisible}
                onClose={onFinish}
                title="Profile Ready!"
                subtitle="Your profile has been created successfully. Let's find your travel partner."
                buttonText="Start Exploring"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.BG, padding: 20 },
    header: { fontSize: 32, fontFamily: FONT.UI_BOLD, color: COLORS.TEXT, marginTop: 10, marginBottom: 10 },
    sub: { fontSize: 16, fontFamily: FONT.UI_REGULAR, color: COLORS.MUTED, marginBottom: 30 },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.WHITE,
        borderRadius: 12,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: COLORS.BORDER,
        marginBottom: 20,
    },
    icon: { marginRight: 10 },
    input: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 16,
        fontFamily: FONT.UI_REGULAR,
        color: COLORS.TEXT,
    },

    currentLocationBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        marginBottom: 20,
    },
    currentLocationText: {
        fontFamily: FONT.UI_BOLD,
        color: COLORS.TEXT,
        fontSize: 16,
    },

    continue: {
        marginTop: "auto",
        paddingVertical: 16,
        borderRadius: 999,
        alignItems: "center",
    },
    continueText: { fontFamily: FONT.UI_BOLD, color: COLORS.TEXT, fontSize: 16 },

    resultsContainer: {
        maxHeight: 300,
        backgroundColor: "#fff",
        borderRadius: 12,
        marginTop: -10,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#EAEAEA",
    },
    resultItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F5F5F5",
    },
    resultMain: {
        fontSize: 15,
        fontFamily: FONT.UI_BOLD,
        color: COLORS.TEXT,
    },
    resultSub: {
        fontSize: 13,
        color: COLORS.MUTED,
        fontFamily: FONT.UI_REGULAR,
    },
});
