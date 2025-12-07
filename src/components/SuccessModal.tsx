
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useEffect } from 'react';
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { COLORS, FONT } from '../constants/theme';

const { width } = Dimensions.get('window');

type SuccessModalProps = {
    visible: boolean;
    onClose: () => void;
    title?: string;
    subtitle?: string;
    buttonText?: string;
};

export default function SuccessModal({
    visible,
    onClose,
    title = "Account Created!",
    subtitle = "Your journey begins now. Let's set up your profile.",
    buttonText = "Let's Go"
}: SuccessModalProps) {

    // Animations
    const scale = useSharedValue(0.8);
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(50);

    useEffect(() => {
        if (visible) {
            opacity.value = withTiming(1, { duration: 300 });
            scale.value = withSequence(
                withTiming(1.05, { duration: 300 }),
                withSpring(1)
            );
            translateY.value = withSpring(0);
        } else {
            // Reset for next time
            opacity.value = 0;
            scale.value = 0.8;
            translateY.value = 50;
        }
    }, [visible]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            transform: [
                { scale: scale.value },
                { translateY: translateY.value }
            ],
        };
    });

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                {/* Blur Background if compatible, else semi-transparent */}
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />

                <Animated.View style={[styles.card, animatedStyle]}>
                    <View style={styles.iconContainer}>
                        <MaterialCommunityIcons name="check-decagram" size={64} color={COLORS.PRIMARY_BTN || "#B9FF66"} />
                    </View>

                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>

                    <TouchableOpacity style={styles.button} onPress={onClose}>
                        <Text style={styles.buttonText}>{buttonText}</Text>
                        <MaterialCommunityIcons name="arrow-right" size={20} color={COLORS.TEXT} />
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)', // Fallback for no blur
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    card: {
        backgroundColor: '#fff',
        width: '100%',
        maxWidth: 340,
        borderRadius: 32,
        padding: 32,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    iconContainer: {
        marginBottom: 24,
        padding: 16,
        backgroundColor: '#F7FEE7', // Light green bg
        borderRadius: 999,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    title: {
        fontSize: 24,
        fontFamily: FONT.UI_BOLD,
        color: COLORS.TEXT,
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: FONT.UI_REGULAR,
        color: COLORS.MUTED,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 22,
    },
    button: {
        backgroundColor: COLORS.PRIMARY_BTN || "#B9FF66",
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 999,
        width: '100%',
        shadowColor: COLORS.PRIMARY_BTN || "#B9FF66",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
        gap: 8,
    },
    buttonText: {
        fontSize: 16,
        fontFamily: FONT.UI_BOLD,
        color: COLORS.TEXT,
    },
});
