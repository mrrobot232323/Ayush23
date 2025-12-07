import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Animated,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import WizardProgress from "../../src/components/WizardProgress";
import { COLORS, FONT } from "../../src/constants/theme";
import { useUser } from "../../src/context/UserContext";
import { supabase } from "../../src/lib/supabase";

export default function PhotosStep() {
    const router = useRouter();
    const { updateProfile, session, profile } = useUser();

    const [photos, setPhotos] = useState<(string | null)[]>(Array(6).fill(null));

    // Load existing photos from profile
    React.useEffect(() => {
        if (profile.photos && profile.photos.length > 0) {
            const existing = [...profile.photos];
            const filled = Array(6).fill(null).map((_, i) => existing[i] || null);
            setPhotos(filled);
        }
    }, [profile.photos]);

    const [uploading, setUploading] = useState(false);
    const scaleAnim = new Animated.Value(1);

    const animate = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.95, duration: 80, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
        ]).start();
    };

    /* -------------------- UPLOAD TO SUPABASE STORAGE -------------------- */
    const uploadToSupabase = async (uri: string) => {
        if (!session?.user) return null;

        try {
            setUploading(true);

            const response = await fetch(uri);
            const blob = await response.blob();

            const fileName = `${session.user.id}/${Date.now()}.jpg`;

            const { error } = await supabase.storage
                .from("user_photos")
                .upload(fileName, blob, {
                    contentType: "image/jpeg",
                });

            if (error) {
                console.log("Upload Error:", error);
                setUploading(false);
                return null;
            }

            // GET PUBLIC URL
            const { data } = supabase.storage
                .from("user_photos")
                .getPublicUrl(fileName);

            setUploading(false);
            return data.publicUrl;
        } catch (err) {
            console.log("Upload Failed:", err);
            setUploading(false);
            return null;
        }
    };

    /* -------------------- PICK IMAGE -------------------- */
    const pickImage = async (index: number) => {
        animate();

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 5],
            quality: 0.9,
        });

        if (!result.canceled) {
            const localUri = result.assets[0].uri;

            // Upload to Supabase + get public URL
            const publicUrl = await uploadToSupabase(localUri);

            if (publicUrl) {
                const newPhotos = [...photos];
                newPhotos[index] = publicUrl;
                setPhotos(newPhotos);
            }
        }
    };

    /* -------------------- DELETE PHOTO -------------------- */
    const deletePhoto = (index: number) => {
        const copy = [...photos];
        copy[index] = null;
        setPhotos(copy);
    };

    /* -------------------- NEXT BUTTON -------------------- */
    const handleNext = () => {
        const validPhotos = photos.filter((p): p is string => p !== null);

        updateProfile({ photos: validPhotos });

        router.push("/signup-wizard/step-8-location");
    };

    const filledCount = photos.filter(Boolean).length;

    return (
        <View style={styles.container}>
            <WizardProgress currentStep={7} totalSteps={8} />

            <Text style={styles.header}>Add your photos</Text>
            <Text style={styles.sub}>Show your best moments — add at least 2 photos.</Text>

            <View style={styles.grid}>
                {photos.map((uri, index) => (
                    <TouchableOpacity
                        key={index}
                        activeOpacity={0.8}
                        onPress={() => pickImage(index)}
                        style={styles.card}
                        disabled={uploading}
                    >
                        {uri ? (
                            <>
                                <Image source={{ uri }} style={styles.image} />

                                <TouchableOpacity
                                    style={styles.deleteBtn}
                                    onPress={() => deletePhoto(index)}
                                >
                                    <Text style={styles.deleteText}>×</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <View style={styles.placeholder}>
                                <Text style={styles.plus}>{uploading ? "..." : "＋"}</Text>
                                <Text style={styles.smallText}>
                                    {uploading ? "Uploading..." : "Add Photo"}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.info}>
                Tap a tile to upload. Long press to reorder (coming soon).
            </Text>

            {/* Continue */}
            <TouchableOpacity
                disabled={filledCount < 2 || uploading}
                onPress={handleNext}
                style={[
                    styles.fab,
                    (filledCount < 2 || uploading) && styles.fabDisabled
                ]}
            >
                <Text style={styles.fabArrow}>{">"}</Text>
            </TouchableOpacity>
        </View>
    );
}

/* -------------------- STYLES -------------------- */
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.BG, padding: 20 },

    header: {
        fontSize: 28,
        fontFamily: FONT.UI_BOLD,
        color: COLORS.TEXT,
        marginTop: 10,
    },
    sub: {
        fontSize: 16,
        fontFamily: FONT.UI_REGULAR,
        color: COLORS.MUTED,
        marginBottom: 18,
    },

    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },

    card: {
        width: "31%",
        aspectRatio: 3 / 4,
        borderRadius: 14,
        backgroundColor: "#F4F4F4",
        borderWidth: 1,
        borderColor: "#DCDCDC",
        marginBottom: 14,
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
    },

    image: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },

    placeholder: {
        justifyContent: "center",
        alignItems: "center",
    },

    plus: { fontSize: 32, color: "#191A23", marginBottom: 4 },

    smallText: {
        fontSize: 12,
        color: COLORS.MUTED,
        fontFamily: FONT.UI_REGULAR,
    },

    deleteBtn: {
        position: "absolute",
        top: 6,
        right: 6,
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: "rgba(0,0,0,0.55)",
        alignItems: "center",
        justifyContent: "center",
    },

    deleteText: { color: "#fff", fontSize: 18, marginTop: -2, fontWeight: "bold" },

    info: {
        textAlign: "center",
        marginTop: 8,
        fontSize: 14,
        color: COLORS.MUTED,
        fontFamily: FONT.UI_REGULAR,
    },

    fab: {
        position: "absolute",
        bottom: 26,
        right: 26,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#191A23",
        alignItems: "center",
        justifyContent: "center",
        elevation: 6,
    },

    fabDisabled: {
        backgroundColor: "#BDBDBD",
    },

    fabArrow: { color: "#FFF", fontSize: 26, marginLeft: 2 },
});
