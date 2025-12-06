import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { COLORS } from '../constants/theme';

interface WizardProgressProps {
    currentStep: number;
    totalSteps: number;
}

export default function WizardProgress({ currentStep, totalSteps }: WizardProgressProps) {
    const router = useRouter();
    const progress = (currentStep / totalSteps) * 100;

    // Shared value for the width percentage
    const widthVal = useSharedValue(0);

    // Animate to new progress whenever it changes
    useEffect(() => {
        widthVal.value = withTiming(progress, {
            duration: 600,
            easing: Easing.out(Easing.exp),
        });
    }, [progress]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            width: `${widthVal.value}%`,
        };
    });

    return (
        <View style={styles.container}>
            {/* Progress Bar */}
            <View style={styles.progressTrack}>
                <Animated.View style={[styles.progressFill, animatedStyle]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        marginBottom: 20,
    },

    progressTrack: {
        flex: 1,
        height: 8,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: COLORS.TEXT, // or whatever primitive color fits, assuming TEXT is dark
        borderRadius: 4,
    },
});
