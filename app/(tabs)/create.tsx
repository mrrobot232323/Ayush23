import { MaterialCommunityIcons } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    FlatList,
    Image,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import * as yup from "yup";
import { COLORS, FONT } from "../../src/constants/theme";
import { useUser } from "../../src/context/UserContext";
import { useLocationSearch } from "../../src/hooks/useLocationSearch";

const tripSchema = yup.object().shape({
    destination: yup.string().required("Destination is required"),
    tripType: yup.string().required(),
});

const { width } = Dimensions.get("window");

const TRENDING_DESTINATIONS = [
    { id: "1", city: "Bali", country: "Indonesia", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1000" },
    { id: "2", city: "Paris", country: "France", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1000" },
    { id: "3", city: "Kyoto", country: "Japan", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1000" },
    { id: "4", city: "New York", country: "USA", image: "https://images.unsplash.com/photo-1496442226666-8d4a0e62e6e9?q=80&w=1000" },
];

export default function CreateTripScreen() {
    const { profile, addTrip, editTrip, deleteTrip } = useUser();
    const [viewMode, setViewMode] = React.useState<'list' | 'create'>('list');
    const [activeTab, setActiveTab] = React.useState<'upcoming' | 'past'>('upcoming');
    const [editingTrip, setEditingTrip] = React.useState<any | null>(null);
    const [startDate, setStartDate] = React.useState(new Date());
    const [endDate, setEndDate] = React.useState(new Date(Date.now() + 86400000)); // +1 day
    const [showStartPicker, setShowStartPicker] = React.useState(false);
    const [showEndPicker, setShowEndPicker] = React.useState(false);

    const [selectedCountry, setSelectedCountry] = React.useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = React.useState(false);

    // Location API State
    const { results, loading, searchPlaces } = useLocationSearch();
    const [showLocationModal, setShowLocationModal] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");

    const openLocationModal = () => {
        setSearchQuery("");
        setShowLocationModal(true);
        searchPlaces("");
    };

    const handleLocationSelect = (item: any, onChange: (val: string) => void) => {
        const addr = item.address;
        const city = addr.city || addr.town || addr.village || addr.county || addr.state_district;
        const state = addr.state;
        const country = addr.country;

        setSelectedCountry(country);

        const parts = [city, state, country].filter(Boolean);
        const fullLocation = parts.join(", ");

        onChange(fullLocation);
        setShowLocationModal(false);
    };

    // Animation for success modal
    const scaleAnim = React.useRef(new Animated.Value(0)).current;

    const {
        control,
        handleSubmit,
        setValue,
        reset,
        watch,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(tripSchema),
        defaultValues: {
            destination: "",
            tripType: "national",
        },
    });

    const tripType = watch("tripType");

    // Populate form when editing
    React.useEffect(() => {
        if (viewMode === 'create') {
            if (editingTrip) {
                setValue('destination', editingTrip.destination);
                setValue('tripType', editingTrip.tripType);
                setStartDate(editingTrip.startDate ? new Date(editingTrip.startDate) : new Date());
                setEndDate(editingTrip.endDate ? new Date(editingTrip.endDate) : new Date(Date.now() + 86400000));
                // We don't verify country on edit start, but validation will run on submit using string parsing if variable is null
                setSelectedCountry(null);
            } else {
                reset({ destination: '', tripType: 'national' });
                setStartDate(new Date());
                setEndDate(new Date(Date.now() + 86400000));
                setSelectedCountry(null);
            }
        }
    }, [viewMode, editingTrip]);

    const onSubmit = (data: any) => {
        // Validation: Cannot be international if in home country
        const userParts = profile.location ? profile.location.split(', ') : [];
        const userCountry = userParts.length > 0 ? userParts[userParts.length - 1] : "";

        let destCountry = selectedCountry;
        if (!destCountry && data.destination) {
            const destParts = data.destination.split(', ');
            destCountry = destParts[destParts.length - 1];
        }

        if (data.tripType === 'international' && userCountry && destCountry) {
            if (userCountry.trim().toLowerCase() === destCountry.trim().toLowerCase()) {
                Alert.alert("Invalid Selection", `You cannot select International for a trip in ${userCountry}. Please select National.`);
                return;
            }
        }

        console.log("Submit Trip:", { ...data, startDate, endDate });



        if (editingTrip) {
            // Edit Existing Trip
            const updatedTrip = {
                ...editingTrip,
                destination: data.destination,
                tripType: data.tripType,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
            };
            editTrip(updatedTrip);
        } else {
            // Create New Trip
            const newTrip = {
                id: Date.now().toString(),
                destination: data.destination,
                tripType: data.tripType,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
            };
            addTrip(newTrip);
        }

        // Switch back to list after short delay or immediately
        setTimeout(() => {
            setViewMode("list");
        }, 1500);

        // Show success modal with animation
        setShowSuccessModal(true);
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 5,
            useNativeDriver: true,
        }).start();

        // Hide after delay (optional)
        setTimeout(() => {
            // Close modal or navigate away if needed
            // setShowSuccessModal(false); 
        }, 3000);
    };

    const onStartChange = (event: any, selectedDate?: Date) => {
        setShowStartPicker(false);
        if (selectedDate) {
            setStartDate(selectedDate);
            if (selectedDate > endDate) setEndDate(selectedDate);
        }
    };

    const onEndChange = (event: any, selectedDate?: Date) => {
        setShowEndPicker(false);
        if (selectedDate) {
            setEndDate(selectedDate);
        }
    };

    const handleEdit = (trip: any) => {
        setEditingTrip(trip);
        setViewMode('create');
    };

    const handleDelete = (tripId: string) => {
        Alert.alert(
            "Delete Trip",
            "Are you sure you want to delete this trip?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => deleteTrip(tripId)
                }
            ]
        );
    };

    const renderTrendingItem = ({ item }: { item: typeof TRENDING_DESTINATIONS[0] }) => (
        <TouchableOpacity style={styles.trendCard} activeOpacity={0.9}>
            <Image source={{ uri: item.image }} style={styles.trendImage} />
            <View style={styles.trendOverlay} />
            <View style={styles.trendContent}>
                <Text style={styles.trendCity}>{item.city}</Text>
                <Text style={styles.trendCountry}>{item.country}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderTripItem = ({ item }: { item: any }) => (
        <View style={styles.tripListCard}>
            <Image
                source={{ uri: `https://source.unsplash.com/featured/?${item.destination},travel` }}
                style={styles.tripListImage}
            />
            <View style={styles.tripListOverlay} />
            <View style={styles.tripListContent}>
                <View style={styles.tripListHeader}>
                    <Text style={styles.tripListDest}>{item.destination}</Text>
                    <View style={styles.tripListBadge}>
                        <Text style={styles.tripListBadgeText}>{item.tripType}</Text>
                    </View>
                </View>
                <Text style={styles.tripListDate}>
                    {item.startDate ? format(new Date(item.startDate), "MMM dd") : ""} - {item.endDate ? format(new Date(item.endDate), "MMM dd, yyyy") : ""}
                </Text>
            </View>

            {/* Actions Layer */}
            <View style={styles.tripActions}>
                <TouchableOpacity onPress={() => handleEdit(item)} style={[styles.actionBtn, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                    <MaterialCommunityIcons name="pencil" size={18} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={[styles.actionBtn, { backgroundColor: 'rgba(255, 50, 50, 0.6)', marginTop: 8 }]}>
                    <MaterialCommunityIcons name="trash-can-outline" size={18} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );

    // Filter Trips
    const now = new Date();
    const trips = profile.trips || [];
    const upcomingTrips = trips.filter(t => t.startDate && new Date(t.startDate) >= now);
    const pastTrips = trips.filter(t => t.startDate && new Date(t.startDate) < now);
    const displayTrips = activeTab === 'upcoming' ? upcomingTrips : pastTrips;

    return (
        <>
            {viewMode === 'list' ? (
                /* ---------------- DASHBOARD VIEW ---------------- */
                <View style={styles.container}>
                    <StatusBar barStyle="dark-content" />
                    <View style={styles.dashHeader}>
                        <Text style={styles.dashTitle}>My Trips</Text>
                        <TouchableOpacity style={styles.addTripBtn} onPress={() => { setEditingTrip(null); setViewMode('create'); }}>
                            <MaterialCommunityIcons name="plus" size={24} color="#fff" />
                            <Text style={styles.addTripText}>New Trip</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Tabs */}
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tabBtn, activeTab === 'upcoming' && styles.tabBtnActive]}
                            onPress={() => setActiveTab('upcoming')}
                        >
                            <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>Upcoming</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tabBtn, activeTab === 'past' && styles.tabBtnActive]}
                            onPress={() => setActiveTab('past')}
                        >
                            <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>History</Text>
                        </TouchableOpacity>
                    </View>

                    {/* List */}
                    <FlatList
                        data={displayTrips}
                        renderItem={renderTripItem}
                        keyExtractor={(item, index) => item.id ?? index.toString()}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <MaterialCommunityIcons name="bag-suitcase-off" size={48} color={COLORS.MUTED} />
                                <Text style={styles.emptyText}>No {activeTab} trips found.</Text>
                                {activeTab === 'upcoming' && (
                                    <TouchableOpacity onPress={() => { setEditingTrip(null); setViewMode('create'); }}>
                                        <Text style={styles.emptyLink}>Plan your next adventure!</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        }
                    />
                </View>
            ) : (
                /* ---------------- CREATE FORM VIEW ---------------- */
                <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                    <StatusBar barStyle="dark-content" />

                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <TouchableOpacity onPress={() => setViewMode('list')} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                                <MaterialCommunityIcons name="arrow-left" size={20} color={COLORS.MUTED} />
                                <Text style={{ color: COLORS.MUTED, marginLeft: 4, fontFamily: FONT.UI_MEDIUM }}>Back</Text>
                            </TouchableOpacity>
                            <Text style={styles.title}>{editingTrip ? "Edit Trip" : "Where to next?"}</Text>
                            <Text style={styles.subtitle}>{editingTrip ? "Update your plans." : "Plan your next adventure together."}</Text>
                        </View>
                        <View style={styles.iconBox}>
                            <MaterialCommunityIcons name="airplane-takeoff" size={28} color={COLORS.PRIMARY} />
                        </View>
                    </View>

                    {/* Input Section */}
                    <View style={styles.formSection}>
                        {/* Destination Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>DESTINATION</Text>
                            <View style={[styles.inputContainer, errors.destination && { borderColor: "red", borderWidth: 1 }]}>
                                <MaterialCommunityIcons name="map-marker-outline" size={24} color={COLORS.MUTED} style={styles.inputIcon} />
                                <Controller
                                    control={control}
                                    name="destination"
                                    render={({ field: { onChange, value } }) => (
                                        <>
                                            <TouchableOpacity
                                                style={{ flex: 1, justifyContent: 'center' }}
                                                onPress={openLocationModal}
                                            >
                                                <Text style={[styles.input, !value && { color: "#999" }]}>
                                                    {value || "Search Destination (e.g. Paris)..."}
                                                </Text>
                                            </TouchableOpacity>

                                            {/* LOCATION SEARCH MODAL */}
                                            <Modal visible={showLocationModal} animationType="slide" presentationStyle="pageSheet">
                                                <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
                                                    <View style={styles.modalHeader}>
                                                        <TouchableOpacity onPress={() => setShowLocationModal(false)} style={styles.backBtn}>
                                                            <MaterialCommunityIcons name="close" size={24} color={COLORS.TEXT} />
                                                        </TouchableOpacity>
                                                        <Text style={styles.modalTitle}>Select Destination</Text>
                                                        <View style={{ width: 24 }} />
                                                    </View>

                                                    <View style={styles.searchContainer}>
                                                        <MaterialCommunityIcons name="magnify" size={20} color={COLORS.MUTED} style={{ marginRight: 8 }} />
                                                        <TextInput
                                                            style={styles.searchInput}
                                                            placeholder="Search (e.g. Kyoto)..."
                                                            placeholderTextColor="#999"
                                                            value={searchQuery}
                                                            onChangeText={(text) => {
                                                                setSearchQuery(text);
                                                                searchPlaces(text);
                                                            }}
                                                            autoFocus
                                                        />
                                                        {searchQuery.length > 0 && (
                                                            <TouchableOpacity onPress={() => setSearchQuery("")}>
                                                                <MaterialCommunityIcons name="close-circle" size={18} color={COLORS.MUTED} />
                                                            </TouchableOpacity>
                                                        )}
                                                    </View>

                                                    {loading ? (
                                                        <View style={{ paddingTop: 40, alignItems: "center" }}>
                                                            <ActivityIndicator size="large" color={COLORS.PRIMARY} />
                                                        </View>
                                                    ) : (
                                                        <FlatList
                                                            data={results}
                                                            keyExtractor={(item: any) => item.place_id.toString()}
                                                            contentContainerStyle={{ padding: 20 }}
                                                            ListEmptyComponent={() => (
                                                                <View style={{ alignItems: "center", marginTop: 50 }}>
                                                                    <Text style={{ color: COLORS.MUTED }}>
                                                                        {searchQuery.length < 2 ? "Type to search..." : "No results found."}
                                                                    </Text>
                                                                </View>
                                                            )}
                                                            renderItem={({ item }) => (
                                                                <TouchableOpacity
                                                                    style={styles.listItem}
                                                                    onPress={() => handleLocationSelect(item, onChange)}
                                                                >
                                                                    <View>
                                                                        <Text style={styles.listItemText}>{item.display_name}</Text>
                                                                    </View>
                                                                    <MaterialCommunityIcons name="chevron-right" size={20} color="#E0E0E0" />
                                                                </TouchableOpacity>
                                                            )}
                                                        />
                                                    )}
                                                </SafeAreaView>
                                            </Modal>
                                        </>
                                    )}
                                />
                            </View>
                            {errors.destination && <Text style={{ color: "red", fontSize: 12, marginTop: 4 }}>{errors.destination.message}</Text>}
                        </View>

                        {/* Date Selection */}
                        <View style={[styles.inputGroup, { marginTop: 20 }]}>
                            <Text style={styles.inputLabel}>DATES</Text>
                            <View style={styles.dateRow}>
                                <TouchableOpacity
                                    style={styles.dateBox}
                                    onPress={() => setShowStartPicker(true)}
                                >
                                    <MaterialCommunityIcons name="calendar" size={20} color={COLORS.MUTED} />
                                    <Text style={styles.dateText}>{format(startDate, "MMM dd, yyyy")}</Text>
                                </TouchableOpacity>

                                <View style={{ width: 10 }} />

                                <TouchableOpacity
                                    style={styles.dateBox}
                                    onPress={() => setShowEndPicker(true)}
                                >
                                    <MaterialCommunityIcons name="calendar-arrow-right" size={20} color={COLORS.MUTED} />
                                    <Text style={styles.dateText}>{format(endDate, "MMM dd, yyyy")}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Trip Type Selector */}
                        <View style={styles.typeSelector}>
                            <TouchableOpacity
                                style={[styles.typeBtn, tripType === "national" && styles.typeBtnActive]}
                                onPress={() => setValue("tripType", "national")}
                            >
                                <MaterialCommunityIcons
                                    name="flag-variant-outline"
                                    size={20}
                                    color={tripType === "national" ? "#fff" : COLORS.MUTED}
                                />
                                <Text style={[styles.typeText, tripType === "national" && styles.typeTextActive]}>National</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.typeBtn, tripType === "international" && styles.typeBtnActive]}
                                onPress={() => setValue("tripType", "international")}
                            >
                                <MaterialCommunityIcons
                                    name="earth"
                                    size={20}
                                    color={tripType === "international" ? "#fff" : COLORS.MUTED}
                                />
                                <Text style={[styles.typeText, tripType === "international" && styles.typeTextActive]}>International</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.createBtn} onPress={handleSubmit(onSubmit)}>
                            <Text style={styles.createBtnText}>{editingTrip ? "Update Trip" : "Create Trip"}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Trending Section */}
                    <View style={styles.trendingSection}>
                        <Text style={styles.sectionTitle}>Trending Now</Text>
                        <FlatList
                            data={TRENDING_DESTINATIONS}
                            renderItem={renderTrendingItem}
                            keyExtractor={(item) => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingLeft: 20, paddingRight: 10 }}
                        />
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>
            )}
            {/* Date Picker Modals */}
            {
                showStartPicker && (
                    <DateTimePicker
                        value={startDate}
                        mode="date"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={onStartChange}
                        minimumDate={new Date()}
                    />
                )
            }
            {
                showEndPicker && (
                    <DateTimePicker
                        value={endDate}
                        mode="date"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={onEndChange}
                        minimumDate={startDate}
                    />
                )
            }

            {/* Success Modal */}
            <Modal transparent visible={showSuccessModal} animationType="fade">
                <View style={styles.modalOverlay}>
                    <Animated.View style={[styles.modalContent, { transform: [{ scale: scaleAnim }] }]}>
                        <View style={styles.successIcon}>
                            <MaterialCommunityIcons name="check" size={40} color="#fff" />
                        </View>
                        <Text style={styles.successTitle}>{editingTrip ? "Trip Updated!" : "Trip Created!"}</Text>
                        <Text style={styles.successSub}>Get ready for your adventure.</Text>
                        <TouchableOpacity onPress={() => setShowSuccessModal(false)} style={styles.closeModalBtn}>
                            <Text style={styles.closeModalText}>Awesome</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.BG || "#FAFAFA",
    },
    header: {
        paddingHorizontal: 20,
        marginTop: 60,
        marginBottom: 30,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    title: {
        fontSize: 32,
        fontFamily: FONT.UI_BOLD,
        color: COLORS.TEXT,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.MUTED,
        marginTop: 8,
        fontFamily: FONT.UI_REGULAR,
    },
    iconBox: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#F2E7FF",
        alignItems: "center",
        justifyContent: "center",
    },

    formSection: {
        paddingHorizontal: 20,
    },
    inputGroup: {},
    inputLabel: {
        fontSize: 12,
        fontFamily: FONT.UI_BOLD,
        color: COLORS.MUTED,
        marginBottom: 8,
        letterSpacing: 1,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F7F7F7",
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 64,
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
    inputIcon: {
        marginRight: 14,
    },
    input: {
        flex: 1,
        fontSize: 17,
        fontFamily: FONT.UI_MEDIUM,
        color: COLORS.TEXT,
    },

    dateRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
    },
    dateBox: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F7F7F7",
        borderRadius: 16,
        paddingHorizontal: 12,
        height: 64,
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
    dateText: {
        fontSize: 15,
        fontFamily: FONT.UI_MEDIUM,
        color: COLORS.TEXT,
        marginLeft: 10,
    },

    typeSelector: {
        flexDirection: "row",
        marginTop: 24,
        backgroundColor: "#EFF0F3",
        borderRadius: 14,
        padding: 4,
    },
    typeBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        borderRadius: 12,
    },
    typeBtnActive: {
        backgroundColor: COLORS.TEXT,
        elevation: 2,
    },
    typeText: {
        marginLeft: 8,
        fontSize: 14,
        fontFamily: FONT.UI_MEDIUM,
        color: COLORS.MUTED,
    },
    typeTextActive: {
        color: "#fff",
        fontFamily: FONT.UI_BOLD,
    },

    createBtn: {
        marginTop: 30,
        backgroundColor: COLORS.PRIMARY,
        height: 60,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        elevation: 4,
        shadowColor: "#110428ff",
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 8 },
    },
    createBtnText: {
        color: "#fff",
        fontSize: 18,
        fontFamily: FONT.UI_BOLD,
    },

    trendingSection: {
        marginTop: 40,
    },
    sectionTitle: {
        fontSize: 20,
        fontFamily: FONT.UI_BOLD,
        color: COLORS.TEXT,
        marginLeft: 20,
        marginBottom: 20,
    },
    trendCard: {
        width: width * 0.45,
        height: 220,
        borderRadius: 20,
        marginRight: 16,
        backgroundColor: "#ccc",
        overflow: "hidden",
    },
    trendImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    trendOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.3)",
    },
    trendContent: {
        position: "absolute",
        bottom: 0,
        left: 0,
        padding: 16,
    },
    trendCity: {
        fontSize: 18,
        fontFamily: FONT.UI_BOLD,
        color: "#fff",
    },
    trendCountry: {
        fontSize: 14,
        color: "rgba(255,255,255,0.9)",
    },

    /* Modal Styles */
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    modalContent: {
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: 24,
        padding: 30,
        alignItems: "center",
        elevation: 10,
    },
    successIcon: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: "#4CAF50",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
        elevation: 4,
    },
    successTitle: {
        fontSize: 24,
        fontFamily: FONT.UI_BOLD,
        color: COLORS.TEXT,
        marginBottom: 8,
    },
    successSub: {
        fontSize: 16,
        fontFamily: FONT.UI_REGULAR,
        color: COLORS.MUTED,
        textAlign: "center",
        marginBottom: 24,
    },
    closeModalBtn: {
        backgroundColor: COLORS.TEXT,
        paddingHorizontal: 30,
        paddingVertical: 14,
        borderRadius: 99,
    },
    closeModalText: {
        color: "#fff",
        fontFamily: FONT.UI_BOLD,
        fontSize: 16,
    },

    /* API Search Modal Styles */
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#EEE",
    },
    backBtn: { padding: 4 },
    modalTitle: { fontSize: 18, fontFamily: FONT.UI_BOLD, color: COLORS.TEXT },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F5F5F5",
        margin: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        fontFamily: FONT.UI_REGULAR,
        color: COLORS.TEXT,
    },
    listItem: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F5F5F5",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    listItemText: {
        fontSize: 16,
        color: COLORS.TEXT,
        fontFamily: FONT.UI_REGULAR,
    },

    upcomingSection: {
        marginTop: 40,
        marginBottom: 10,
    },
    upcomingCard: {
        marginHorizontal: 20,
        height: 160,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: '#000',
        elevation: 5,
        shadowColor: COLORS.PRIMARY,
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 8 },
    },
    uBg: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.8,
    },
    uOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        zIndex: -1,
    },
    upcomingContent: {
        padding: 24,
        flex: 1,
        justifyContent: 'flex-end',
        zIndex: 10,
    },
    uRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
    },
    uIconBox: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    uBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#fff',
        borderRadius: 12,
    },
    uBadgeText: {
        fontSize: 12,
        fontFamily: FONT.UI_BOLD,
        color: COLORS.TEXT,
    },
    uDest: {
        fontSize: 28,
        fontFamily: FONT.UI_BOLD,
        color: '#fff',
        marginBottom: 4,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    uDate: {
        fontSize: 16,
        fontFamily: FONT.UI_MEDIUM,
        color: 'rgba(255,255,255,0.9)',
    },

    /* Dashboard Styles */
    dashHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: 60,
        marginBottom: 20,
    },
    dashTitle: {
        fontSize: 34,
        fontFamily: FONT.UI_BOLD,
        color: COLORS.TEXT,
    },
    addTripBtn: {
        flexDirection: 'row',
        backgroundColor: COLORS.PRIMARY || "#7C3AED",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        alignItems: 'center',
        elevation: 4,
    },
    addTripText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 4,
    },
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        backgroundColor: '#EFF0F3',
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
    },
    tabBtn: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    tabBtnActive: {
        backgroundColor: '#fff',
        elevation: 2,
    },
    tabText: {
        fontFamily: FONT.UI_MEDIUM,
        color: COLORS.MUTED,
    },
    tabTextActive: {
        color: COLORS.TEXT,
        fontFamily: FONT.UI_BOLD,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    tripListCard: {
        height: 180,
        borderRadius: 20,
        backgroundColor: '#000',
        marginBottom: 16,
        overflow: 'hidden',
        justifyContent: 'flex-end',
        elevation: 4,
    },
    tripListImage: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.8,
    },
    tripListOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    tripListContent: {
        padding: 20,
    },
    tripListHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    tripListDest: {
        fontSize: 24,
        fontFamily: FONT.UI_BOLD,
        color: '#fff',
    },
    tripListBadge: {
        backgroundColor: 'rgba(255,255,255,0.25)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    tripListBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    tripListDate: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        fontFamily: FONT.UI_MEDIUM,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.MUTED,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyLink: {
        fontSize: 16,
        color: COLORS.PRIMARY,
        fontFamily: FONT.UI_BOLD,
    },
    tripActions: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    actionBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(10px)',
    },
});
