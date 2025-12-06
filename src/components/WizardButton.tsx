import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { COLORS, FONT } from '../constants/theme';

interface WizardButtonProps {
    onPress: () => void;
    title: string;
    disabled?: boolean;
    style?: ViewStyle | ViewStyle[];
}

export default function WizardButton({ onPress, title, disabled = false, style }: WizardButtonProps) {
    const scale = useSharedValue(1);
    const progress = useSharedValue(disabled ? 0 : 1);

    useEffect(() => {
        progress.value = withTiming(disabled ? 0 : 1, { duration: 300 });
    }, [disabled]);

    const animatedStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            progress.value,
            [0, 1],
            [COLORS.BORDER || "#E0E0E0", COLORS.PRIMARY_BTN || "#B9FF66"]
        );

        return {
            transform: [{ scale: scale.value }],
            backgroundColor,
        };
    });

    const onPressIn = () => {
        if (!disabled) {
            scale.value = withSpring(0.96, { damping: 10, stiffness: 150 });
        }
    };

    const onPressOut = () => {
        if (!disabled) {
            scale.value = withSpring(1, { damping: 10, stiffness: 150 });
        }
    };

    return (
        <Pressable
            onPress={disabled ? undefined : onPress}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            disabled={disabled}
        >
            <Animated.View style={[styles.container, animatedStyle, style]}>
                <Text style={[styles.text, { opacity: disabled ? 0.5 : 1 }]}>{title}</Text>
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
        marginBottom: 20,
    },
    text: {
        fontFamily: FONT.UI_BOLD,
        color: "#191A23",
        fontSize: 16
    }
});
