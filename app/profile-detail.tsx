import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { COLORS, FONT } from '../src/constants/theme';
import { useUser } from '../src/context/UserContext';

const { width } = Dimensions.get('window');

export default function ProfileDetailScreen() {
    const router = useRouter();
    const { viewedProfile: p } = useUser();

    if (!p) {
        return (
            <SafeAreaView style={styles.container}>
                <Text>No profile data loaded.</Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text>Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header / Nav */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                    <MaterialCommunityIcons name="close" size={24} color={COLORS.TEXT} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}></Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* 1. TOP SECTION: DETAILS */}
                <View style={styles.detailsContainer}>
                    <View style={styles.topMeta}>
                        <Text style={styles.name}>{p.name}</Text>
                        {p.verified && <MaterialCommunityIcons name="check-decagram" size={20} color={COLORS.PRIMARY} style={{ marginLeft: 6 }} />}
                    </View>
                    <Text style={styles.subtitle}>{p.distanceKm !== undefined ? `${p.distanceKm} km away` : ''} {p.pronouns ? `• ${p.pronouns}` : ''}</Text>

                    {/* Bio */}
                    {p.bio ? <Text style={styles.bio}>{p.bio}</Text> : null}

                    {/* Vibe Tags */}
                    <View style={styles.badgesRow}>
                        {p.badges?.map((b: string, i: number) => (
                            <View key={i} style={styles.badge}>
                                <Text style={styles.badgeText}>{b}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Upcoming Trip Section */}
                    {p.recentTrip && (
                        <View style={styles.tripContainer}>
                            <View style={styles.tripHeader}>
                                <MaterialCommunityIcons name="airplane-takeoff" size={20} color={COLORS.PRIMARY} />
                                <Text style={styles.tripTitle}>Upcoming Trip</Text>
                            </View>
                            <View style={styles.tripCard}>
                                <Image
                                    source={{ uri: `https://source.unsplash.com/featured/?${p.recentTrip.destination},travel` }}
                                    style={styles.tripBg}
                                />
                                <View style={styles.tripOverlay} />
                                <View style={styles.tripContent}>
                                    <Text style={styles.tripDest}>{p.recentTrip.destination}</Text>
                                    <Text style={styles.tripDate}>
                                        {p.recentTrip.startDate && p.recentTrip.endDate ? (
                                            `${format(new Date(p.recentTrip.startDate), "MMM dd")} - ${format(new Date(p.recentTrip.endDate), "MMM dd")}`
                                        ) : (
                                            "Date TBD"
                                        )}
                                    </Text>
                                    <View style={styles.tripBadge}>
                                        <Text style={styles.tripBadgeText}>{(p.recentTrip.tripType || "Trip")}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Prompts (if any) */}
                    {p.prompts?.map((prom: any, idx: number) => (
                        <View key={idx} style={styles.promptBox}>
                            <Text style={styles.promptQ}>{prom.q || prom.question}</Text>
                            <Text style={styles.promptA}>{prom.a || prom.answer}</Text>
                        </View>
                    ))}
                </View>

                {/* 2. BOTTOM SECTION: IMAGES (SCROLL) */}
                <View style={styles.imagesContainer}>
                    {p.photos?.map((uri: string, imgIdx: number) => (
                        <View key={imgIdx} style={styles.imageWrapper}>
                            <Image source={{ uri }} style={styles.fullImage} />
                        </View>
                    ))}
                </View>

                <View style={styles.footerSpace} />
            </ScrollView>

            {/* Floating Action Button (Message) */}
            <View style={styles.footerAction}>
                <TouchableOpacity style={styles.messageBtn} onPress={() => { /* Chat logic */ router.push('/(tabs)/chats') }}>
                    <Text style={styles.messageBtnText}>Message</Text>
                    <MaterialCommunityIcons name="send" size={18} color="#fff" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.BG,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 10,
    },
    closeBtn: {
        padding: 8,
        backgroundColor: '#fff',
        borderRadius: 20,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 16,
        fontFamily: FONT.UI_BOLD,
    },
    scrollContent: {
        paddingBottom: 100,
    },

    /* DETAILS TOP */
    detailsContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: COLORS.BG,
    },
    topMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    name: {
        fontSize: 32,
        fontFamily: FONT.UI_BOLD,
        color: COLORS.TEXT,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: FONT.UI_MEDIUM,
        color: COLORS.MUTED,
        marginTop: 4,
        marginBottom: 16,
    },
    bio: {
        fontSize: 16,
        fontFamily: FONT.UI_REGULAR,
        color: COLORS.TEXT,
        lineHeight: 24,
        marginBottom: 16,
    },
    badgesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
    },
    badge: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#E0E0E0",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
    },
    badgeText: {
        fontSize: 13,
        fontFamily: FONT.UI_MEDIUM,
        color: COLORS.TEXT,
    },
    promptBox: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.PRIMARY_BTN || '#B9FF66',
        elevation: 1,
    },
    promptQ: {
        fontSize: 12,
        color: COLORS.MUTED,
        marginBottom: 4,
        fontFamily: FONT.UI_MEDIUM,
    },
    promptA: {
        fontSize: 16,
        color: COLORS.TEXT,
        fontFamily: FONT.UI_BOLD,
    },

    /* IMAGES BOTTOM */
    imagesContainer: {
        paddingTop: 10,
    },
    imageWrapper: {
        marginBottom: 2, // Tiny gap
        width: width,
        height: width * 1.25, // 4:5 Aspect Ratio
        backgroundColor: '#eee',
    },
    fullImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },

    footerSpace: {
        height: 60,
    },
    footerAction: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    messageBtn: {
        backgroundColor: COLORS.TEXT,
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 999,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
    },
    messageBtnText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: FONT.UI_BOLD,
    },
    tripContainer: {
        marginBottom: 20,
    },
    tripHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 8,
    },
    tripTitle: {
        fontSize: 16,
        fontFamily: FONT.UI_BOLD,
        color: COLORS.TEXT,
    },
    tripCard: {
        height: 140,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#000',
        justifyContent: 'flex-end',
    },
    tripBg: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.8,
    },
    tripOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    tripContent: {
        padding: 16,
    },
    tripDest: {
        fontSize: 22,
        fontFamily: FONT.UI_BOLD,
        color: '#fff',
    },
    tripDate: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 4,
        fontFamily: FONT.UI_MEDIUM,
    },
    tripBadge: {
        position: 'absolute',
        top: -90, // Adjust based on card height
        right: 0,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    tripBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontFamily: FONT.UI_BOLD,
        textTransform: 'capitalize',
    },
});
