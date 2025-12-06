import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { COLORS, FONT, SIZES } from '../src/constants/theme';

const DATA = [
    { id: 1, name: 'Jess', age: 24, score: 95, dest: 'Bali', img: 'https://via.placeholder.com/400x600' },
    { id: 2, name: 'Alex', age: 27, score: 88, dest: 'Tokyo', img: 'https://via.placeholder.com/400x600' },
    { id: 3, name: 'Sam', age: 22, score: 75, dest: 'Paris', img: 'https://via.placeholder.com/400x600' },
];

export default function Discover() {
    return (
        <View style={styles.container}>
            <Swiper
                cards={DATA}
                renderCard={(card) => {
                    return (
                        <View style={styles.card}>
                            <Image source={{ uri: card.img }} style={styles.cardImage} />
                            <View style={styles.cardOverlay}>
                                <View style={styles.scoreBadge}>
                                    <Text style={styles.scoreText}>{card.score}% Match</Text>
                                </View>
                                <Text style={styles.cardTitle}>{card.name}, {card.age}</Text>
                                <Text style={styles.cardSubtitle}>Going over to {card.dest}</Text>
                            </View>
                        </View>
                    )
                }}
                onSwiped={(cardIndex) => { console.log(cardIndex) }}
                onSwipedAll={() => { console.log('onSwipedAll') }}
                cardIndex={0}
                backgroundColor={COLORS.BG}
                stackSize={3}>
            </Swiper>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.BG
    },
    card: {
        height: '80%', // Swiper cards usually need explicit height or flex
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#E8E8E8",
        backgroundColor: COLORS.WHITE,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        justifyContent: 'center'
    },
    cardImage: { width: '100%', height: '100%', borderRadius: 20 },
    cardOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: 'rgba(0,0,0,0.3)', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
    cardTitle: { fontFamily: FONT.UI_BOLD, fontSize: 32, color: COLORS.WHITE },
    cardSubtitle: { fontFamily: FONT.UI_MEDIUM, fontSize: 18, color: COLORS.WHITE },
    scoreBadge: { position: 'absolute', top: -50, right: 20, backgroundColor: COLORS.PRIMARY_BTN, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16 },
    scoreText: { fontFamily: FONT.UI_BOLD, color: COLORS.TEXT }
});
