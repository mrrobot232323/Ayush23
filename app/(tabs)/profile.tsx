import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React from 'react';
import { Alert, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ROUTES } from '../../src/constants/routes';
import { COLORS, FONT, STYLE_EMOJIS } from '../../src/constants/theme';
import { useUser } from '../../src/context/UserContext';
import { supabase } from '../../src/lib/supabase';
import { useNavigation } from '../../src/utils/navigation';

export default function ProfileScreen() {
    const { profile } = useUser();
    const nav = useNavigation();

    // Helper function to fix photos format (similar to index.tsx)
    const fixPhotos = (photosRaw: any): string[] => {
        // 1. Handle Null/Undefined
        if (!photosRaw) return [];

        // 2. Handle Arrays
        if (Array.isArray(photosRaw)) {
            return photosRaw.length > 0 ? photosRaw.filter((p): p is string => typeof p === 'string' && p.length > 0) : [];
        }

        // 3. Handle Strings
        if (typeof photosRaw === "string") {
            let clean = photosRaw.trim();
            if (!clean) return [];

            // Handle Postgres format {url,url} -> [url,url]
            if (clean.startsWith("{") && clean.endsWith("}")) {
                clean = "[" + clean.substring(1, clean.length - 1) + "]";
            }

            try {
                const parsed = JSON.parse(clean);
                if (Array.isArray(parsed)) {
                    return parsed.length > 0 ? parsed.filter((p): p is string => typeof p === 'string' && p.length > 0) : [];
                }
                // If it parses to a string (e.g. "http...")
                return [parsed].filter((p): p is string => typeof p === 'string' && p.length > 0);
            } catch (e) {
                // If JSON parse fails, it might be a raw string URL
                if (clean.startsWith("http")) return [clean];
                return [];
            }
        }

        return [];
    };

    const processedPhotos = fixPhotos(profile.photos);

    const handleLogout = async () => {
        Alert.alert(
            "Log Out",
            "Are you sure you want to log out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Log Out",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const { error } = await supabase.auth.signOut();
                            if (error) {
                                Alert.alert("Error", error.message);
                            } else {
                                console.log("Logged out successfully");
                                // Navigate to login page after logout
                                nav.replace(ROUTES.LOGIN);
                            }
                        } catch (err: any) {
                            console.log("Logout error", err);
                            Alert.alert("Error", err.message);
                        }
                    }
                }
            ]
        );
    };

    const handleDeleteAccount = async () => {
        Alert.alert(
            "Delete Account",
            "Are you sure? This will PERMANENTLY delete your profile and all data. This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete My Account",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const { data: { session } } = await supabase.auth.getSession();
                            if (!session?.user) return;

                            // 1. Delete Profile row
                            const { error } = await supabase.from('profiles').delete().eq('id', session.user.id);

                            if (error) {
                                throw error;
                            }

                            // 2. Sign Out
                            await supabase.auth.signOut();
                            Alert.alert("Account Deleted", "We're sorry to see you go.");
                            nav.replace(ROUTES.LOGIN);

                        } catch (e: any) {
                            Alert.alert("Error", "Could not delete account: " + e.message);
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>


            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.avatarPlaceholder}>
                        {processedPhotos && processedPhotos.length > 0 ? (
                            <Image
                                source={{ uri: processedPhotos[0] }}
                                style={styles.avatarImage}
                            />
                        ) : (
                            <Text style={styles.avatarText}>
                                {profile.name ? profile.name[0].toUpperCase() : "U"}
                            </Text>
                        )}
                    </View>
                    <Text style={styles.name}>
                        {profile.name || "Guest User"}
                        {profile.age ? `, ${profile.age}` : ""}
                    </Text>
                    <Text style={styles.location}>
                        {profile.location || "No location set"}
                    </Text>
                    {profile.email && (
                        <Text style={styles.emailText}>
                            {profile.email}
                        </Text>
                    )}
                </View>

                {/* Photos Section */}
                {processedPhotos && processedPhotos.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Photos</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
                            {processedPhotos.map((uri, index) => (
                                <Image
                                    key={index}
                                    source={{ uri }}
                                    style={styles.photoItem}
                                    resizeMode="cover"
                                    onError={(e) => {
                                        console.log('Image load error:', uri, e.nativeEvent.error);
                                    }}
                                />
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Upcoming Trip Section */}
                {profile.recentTrip && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Upcoming Trip ✈️</Text>
                        </View>
                        <View style={styles.tripCard}>
                            <View style={styles.tripIconBox}>
                                <MaterialCommunityIcons name="airplane" size={24} color={COLORS.PRIMARY} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.tripDest}>{profile.recentTrip.destination}</Text>
                                <Text style={styles.tripDate}>
                                    {profile.recentTrip.startDate && profile.recentTrip.endDate ? (
                                        `${format(new Date(profile.recentTrip.startDate), "MMM dd")} - ${format(new Date(profile.recentTrip.endDate), "MMM dd, yyyy")}`
                                    ) : (
                                        "Date TBD"
                                    )}
                                </Text>
                                <View style={styles.tripBadge}>
                                    <Text style={styles.tripBadgeText}>{(profile.recentTrip.tripType || "Trip").toUpperCase()}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                {/* Info Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>About</Text>
                        <TouchableOpacity style={styles.editBtn} onPress={() => nav.toEditProfile()}>
                            <Text style={styles.editText}>Edit</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Gender:</Text>
                        <Text style={styles.value}>{profile.gender || "Not specified"}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Occupation:</Text>
                        <Text style={styles.value}>{profile.occupation || "Not specified"}</Text>
                    </View>
                    <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                        <Text style={styles.label}>Looking For:</Text>
                        <Text style={styles.value}>{profile.lookingFor || "Not specified"}</Text>
                    </View>
                </View>

                {/* Styles Section */}
                {profile.styles && profile.styles.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>My Vibe</Text>
                            <TouchableOpacity style={styles.editBtn} onPress={() => nav.toEditProfile()}>
                                <Text style={styles.editText}>Edit</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.tagsContainer}>
                            {profile.styles.map((style, index) => {
                                const emoji = STYLE_EMOJIS[style.toLowerCase()] || "✨";
                                return (
                                    <View key={index} style={styles.tag}>
                                        <Text style={styles.tagText}>{emoji} {style}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                )}

                {/* Prompts Section */}
                {profile.prompts && profile.prompts.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>My Prompts</Text>
                            <TouchableOpacity style={styles.editBtn} onPress={() => nav.toEditProfile()}>
                                <Text style={styles.editText}>Edit</Text>
                            </TouchableOpacity>
                        </View>
                        {profile.prompts.map((prompt, index) => (
                            <View key={index} style={styles.promptCard}>
                                <Text style={styles.promptQuestion}>{prompt.question}</Text>
                                <Text style={styles.promptAnswer}>{prompt.answer}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Logout Section */}
                <View style={styles.section}>
                    <TouchableOpacity style={styles.logoutRow} onPress={handleLogout}>
                        <MaterialCommunityIcons name="logout" size={20} color="#FF4D4F" />
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity>
                </View>

                {/* Delete Account Section */}
                <View style={[styles.section, { marginTop: 10, backgroundColor: 'transparent', elevation: 0, shadowOpacity: 0 }]}>
                    <TouchableOpacity onPress={handleDeleteAccount}>
                        <Text style={styles.deleteAccountText}>Delete Account</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.BG,
    },
    scrollContent: {
        paddingBottom: 100, // Space for tab bar
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 30,
    },
    avatarPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.PRIMARY_BTN, // Using existing color
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 4,
        borderColor: COLORS.WHITE,
        // Shadow for depth
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    avatarText: {
        fontSize: 48,
        fontFamily: FONT.UI_BOLD,
        color: COLORS.BG,
    },
    name: {
        fontFamily: FONT.UI_BOLD,
        fontSize: 28,
        color: COLORS.TEXT,
        marginBottom: 5,
    },
    location: {
        fontFamily: FONT.UI_REGULAR,
        fontSize: 16,
        color: "gray",
    },
    section: {
        width: '90%',
        backgroundColor: COLORS.WHITE,
        borderRadius: 20,
        padding: 20,
        marginTop: 15,
        // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: FONT.UI_BOLD,
        color: COLORS.TEXT,
        marginBottom: 15,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    label: {
        fontSize: 16,
        fontFamily: FONT.UI_MEDIUM,
        color: "gray",
    },
    value: {
        fontSize: 16,
        fontFamily: FONT.UI_BOLD,
        color: COLORS.TEXT,
    },
    photosScroll: {
        flexDirection: 'row',
        marginTop: 10,
    },
    photoItem: {
        width: 100,
        height: 100,
        borderRadius: 12,
        marginRight: 10,
        backgroundColor: '#F0F0F0',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        backgroundColor: '#F3F4F6',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    tagText: {
        fontSize: 14,
        fontFamily: FONT.UI_MEDIUM,
        color: COLORS.TEXT,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    editBtn: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
    },
    editText: {
        fontSize: 12,
        fontFamily: FONT.UI_BOLD,
        color: COLORS.TEXT,
    },
    promptCard: {
        backgroundColor: '#F9FAFB',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
    },
    promptQuestion: {
        fontSize: 14,
        fontFamily: FONT.UI_MEDIUM,
        color: COLORS.TEXT,
        marginBottom: 5,
    },
    promptAnswer: {
        fontSize: 14,
        fontFamily: FONT.UI_REGULAR,
        color: COLORS.MUTED || 'gray',
    },
    tripCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 16,
        gap: 16,
    },
    tripIconBox: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F3E8FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tripDest: {
        fontSize: 18,
        fontFamily: FONT.UI_BOLD,
        color: COLORS.TEXT,
    },
    tripDate: {
        fontSize: 14,
        fontFamily: FONT.UI_MEDIUM,
        color: COLORS.MUTED,
        marginVertical: 4,
    },
    tripBadge: {
        alignSelf: 'flex-start',
        backgroundColor: COLORS.TEXT,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginTop: 4,
    },
    tripBadgeText: {
        fontSize: 10,
        color: '#fff',
        fontFamily: FONT.UI_BOLD,
    },
    logoutRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
        gap: 8,
    },
    logoutText: {
        fontSize: 16,
        fontFamily: FONT.UI_BOLD,
        color: '#FF4D4F',
    },
    deleteAccountText: {
        fontSize: 14,
        fontFamily: FONT.UI_BOLD,
        color: COLORS.MUTED,
        textDecorationLine: 'underline',
        textAlign: 'center',
    },
    emailText: {
        fontSize: 14,
        fontFamily: FONT.UI_REGULAR,
        color: COLORS.MUTED,
        marginTop: 4,
    }
});
