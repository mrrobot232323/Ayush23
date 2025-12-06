import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { COLORS, FONT, STYLE_EMOJIS } from '../src/constants/theme';
import { useUser } from '../src/context/UserContext';

export default function EditProfileScreen() {
    const router = useRouter();
    const { profile, updateProfile } = useUser();

    const [occupation, setOccupation] = useState(profile.occupation || '');
    const [company, setCompany] = useState(profile.company || '');
    const [lookingFor, setLookingFor] = useState(profile.lookingFor || '');
    const [location, setLocation] = useState(profile.location || '');
    const [photos, setPhotos] = useState<string[]>(profile.photos || []);

    const [stylesList, setStylesList] = useState<string[]>(profile.styles || []);
    const [newStyle, setNewStyle] = useState("");

    // Prompts
    const [prompts, setPrompts] = useState<{ question: string, answer: string }[]>(profile.prompts || []);

    const addTag = () => {
        if (newStyle.trim().length > 0) {
            setStylesList([...stylesList, newStyle.trim()]);
            setNewStyle("");
        }
    };

    const removeTag = (index: number) => {
        const updated = [...stylesList];
        updated.splice(index, 1);
        setStylesList(updated);
    };

    const addPrompt = () => {
        setPrompts([...prompts, { question: "", answer: "" }]);
    };

    const removePrompt = (index: number) => {
        const updated = [...prompts];
        updated.splice(index, 1);
        setPrompts(updated);
    };

    const updatePrompt = (index: number, field: 'question' | 'answer', text: string) => {
        const updated = [...prompts];
        updated[index] = { ...updated[index], [field]: text };
        setPrompts(updated);
    };

    const handleSave = () => {
        updateProfile({
            occupation,
            company,
            lookingFor,
            location,
            photos,
            styles: stylesList,
            prompts: prompts,
        });
        router.back();
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [3, 4],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setPhotos([...photos, result.assets[0].uri]);
        }
    };

    const removePhoto = (index: number) => {
        Alert.alert(
            "Remove Photo",
            "Are you sure you want to remove this photo?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: () => {
                        const newPhotos = [...photos];
                        newPhotos.splice(index, 1);
                        setPhotos(newPhotos);
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.TEXT} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Photos Section */}
                <View style={styles.section}>
                    <Text style={styles.label}>Profile Photos</Text>
                    <Text style={styles.subLabel}>First photo is your main profile picture</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
                        {photos.map((uri, index) => (
                            <View key={index} style={styles.photoContainer}>
                                <Image source={{ uri }} style={styles.photo} />
                                <TouchableOpacity
                                    style={styles.removePhotoBtn}
                                    onPress={() => removePhoto(index)}
                                >
                                    <MaterialCommunityIcons name="close" size={16} color="#fff" />
                                </TouchableOpacity>
                                {index === 0 && (
                                    <View style={styles.mainBadge}>
                                        <Text style={styles.mainBadgeText}>Main</Text>
                                    </View>
                                )}
                            </View>
                        ))}
                        <TouchableOpacity style={styles.addPhotoBtn} onPress={pickImage}>
                            <MaterialCommunityIcons name="plus" size={32} color={COLORS.MUTED} />
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                {/* Occupation Section */}
                <View style={styles.section}>
                    <Text style={styles.label}>Occupation</Text>
                    <TextInput
                        style={styles.input}
                        value={occupation}
                        onChangeText={setOccupation}
                        placeholder="What do you do?"
                        placeholderTextColor={COLORS.MUTED}
                    />
                </View>

                {/* Company Section */}
                <View style={styles.section}>
                    <Text style={styles.label}>Company / School</Text>
                    <TextInput
                        style={styles.input}
                        value={company}
                        onChangeText={setCompany}
                        placeholder="Where do you work/study?"
                        placeholderTextColor={COLORS.MUTED}
                    />
                </View>

                {/* Location Section */}
                <View style={styles.section}>
                    <Text style={styles.label}>Location</Text>
                    <TextInput
                        style={styles.input}
                        value={location}
                        onChangeText={setLocation}
                        placeholder="City, Country"
                        placeholderTextColor={COLORS.MUTED}
                    />
                </View>

                {/* Looking For Section */}
                <View style={styles.section}>
                    <Text style={styles.label}>Looking For</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={lookingFor}
                        onChangeText={setLookingFor}
                        placeholder="What brings you here?"
                        placeholderTextColor={COLORS.MUTED}
                        multiline
                    />
                </View>

                {/* My Vibe (Styles) Section */}
                <View style={styles.section}>
                    <Text style={styles.label}>My Vibe</Text>
                    <View style={styles.addTagContainer}>
                        <TextInput
                            style={[styles.input, { flex: 1, marginRight: 10 }]}
                            value={newStyle}
                            onChangeText={setNewStyle}
                            placeholder="Add a vibe (e.g. Foodie)"
                            placeholderTextColor={COLORS.MUTED}
                        />
                        <TouchableOpacity style={styles.addTagBtn} onPress={addTag}>
                            <MaterialCommunityIcons name="plus" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.tagsContainer}>
                        {stylesList.map((tag, index) => {
                            const emoji = STYLE_EMOJIS[tag.toLowerCase()] || "✨";
                            return (
                                <View key={index} style={styles.tag}>
                                    <Text style={styles.tagText}>{emoji} {tag}</Text>
                                    <TouchableOpacity onPress={() => removeTag(index)} style={styles.removeTagBtn}>
                                        <MaterialCommunityIcons name="close" size={12} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Prompts Section */}
                <View style={styles.section}>
                    <Text style={styles.label}>My Prompts</Text>
                    {prompts.map((prompt, index) => (
                        <View key={index} style={styles.promptEditCard}>
                            <View style={styles.promptHeader}>
                                <Text style={styles.promptIndex}>Prompt {index + 1}</Text>
                                <TouchableOpacity onPress={() => removePrompt(index)}>
                                    <MaterialCommunityIcons name="trash-can-outline" size={20} color="red" />
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                style={[styles.input, { marginBottom: 10 }]}
                                value={prompt.question}
                                onChangeText={(text) => updatePrompt(index, 'question', text)}
                                placeholder="Question (e.g. My travel essential is...)"
                                placeholderTextColor={COLORS.MUTED}
                            />
                            <TextInput
                                style={[styles.input, styles.textArea, { height: 80 }]}
                                value={prompt.answer}
                                onChangeText={(text) => updatePrompt(index, 'answer', text)}
                                placeholder="Answer..."
                                placeholderTextColor={COLORS.MUTED}
                                multiline
                            />
                        </View>
                    ))}
                    <TouchableOpacity style={styles.addPromptBtn} onPress={addPrompt}>
                        <Text style={styles.addPromptText}>+ Add New Prompt</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                    <Text style={styles.saveBtnText}>Save Changes</Text>
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
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
        backgroundColor: COLORS.WHITE,
    },
    backBtn: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: FONT.UI_BOLD,
        color: COLORS.TEXT,
    },
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    section: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontFamily: FONT.UI_BOLD,
        color: COLORS.TEXT,
        marginBottom: 8,
    },
    subLabel: {
        fontSize: 12,
        fontFamily: FONT.UI_REGULAR,
        color: COLORS.MUTED,
        marginBottom: 10,
    },
    input: {
        backgroundColor: COLORS.WHITE,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 15,
        fontSize: 16,
        fontFamily: FONT.UI_REGULAR,
        color: COLORS.TEXT,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    photosScroll: {
        flexDirection: 'row',
    },
    photoContainer: {
        marginRight: 15,
        position: 'relative',
    },
    photo: {
        width: 100,
        height: 120,
        borderRadius: 12,
        resizeMode: 'cover',
    },
    removePhotoBtn: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 10,
        padding: 4,
    },
    mainBadge: {
        position: 'absolute',
        bottom: 5,
        left: 5,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    mainBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontFamily: FONT.UI_BOLD,
    },
    addPhotoBtn: {
        width: 100,
        height: 120,
        backgroundColor: '#F0F0F0',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderStyle: 'dashed',
    },
    footer: {
        padding: 20,
        backgroundColor: COLORS.WHITE,
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
    },
    saveBtn: {
        backgroundColor: COLORS.PRIMARY_BTN,
        paddingVertical: 16,
        borderRadius: 999,
        alignItems: 'center',
    },
    saveBtnText: {
        fontSize: 16,
        fontFamily: FONT.UI_BOLD,
        color: COLORS.TEXT,
    },

    /* Styles / Vibe Section */
    addTagContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    addTagBtn: {
        width: 48,
        height: 48,
        backgroundColor: COLORS.PRIMARY_BTN,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        paddingVertical: 8,
        paddingLeft: 12,
        paddingRight: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    tagText: {
        fontSize: 14,
        fontFamily: FONT.UI_MEDIUM,
        color: COLORS.TEXT,
        marginRight: 6,
    },
    removeTagBtn: {
        backgroundColor: '#C8C8C8',
        borderRadius: 10,
        padding: 2,
    },

    /* Prompts Section */
    promptEditCard: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
    },
    promptHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    promptIndex: {
        fontSize: 12,
        fontFamily: FONT.UI_BOLD,
        color: COLORS.MUTED,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    addPromptBtn: {
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: COLORS.PRIMARY_BTN,
        borderRadius: 12,
        borderStyle: 'dashed',
        alignItems: 'center',
    },
    addPromptText: {
        fontFamily: FONT.UI_BOLD,
        color: COLORS.PRIMARY_BTN,
    },
});
