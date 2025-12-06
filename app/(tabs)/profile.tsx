import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONT, STYLE_EMOJIS } from '../../src/constants/theme';
import { useUser } from '../../src/context/UserContext';

export default function ProfileScreen() {
    const { profile } = useUser();
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.avatarPlaceholder}>
                        {profile.photos && profile.photos.length > 0 ? (
                            <Image
                                source={{ uri: profile.photos[0] }}
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
                </View>

                {/* Photos Section */}
                {profile.photos && profile.photos.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Photos</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
                            {profile.photos.map((uri, index) => (
                                <Image key={index} source={{ uri }} style={styles.photoItem} />
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
                                <MaterialCommunityIcons name="airplane" size={24} color={COLORS.PRIMARY || "#7C3AED"} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.tripDest}>{profile.recentTrip.destination}</Text>
                                <Text style={styles.tripDate}>
                                    {format(new Date(profile.recentTrip.startDate), "MMM dd")} - {format(new Date(profile.recentTrip.endDate), "MMM dd, yyyy")}
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
                        <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/edit-profile')}>
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
                            <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/edit-profile')}>
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
                            <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/edit-profile')}>
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
});
