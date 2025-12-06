import React from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from "react-native";
import { COLORS, FONT, SIZES } from "../constants/theme";

export default function PromptRow({ value, onChange, placeholder, onAdd, canAdd }: any) {
    return (
        <View style={styles.row}>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>{placeholder}</Text>
                <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="Type your answer..."
                    placeholderTextColor={COLORS.MUTED}
                    style={styles.input}
                    multiline
                />
            </View>
            {canAdd && (
                <TouchableOpacity onPress={onAdd} style={styles.addBtn}>
                    <Text style={styles.addText}>Add</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    row: { marginBottom: 16, backgroundColor: COLORS.WHITE, borderRadius: SIZES.radius, padding: 16, borderWidth: 1, borderColor: COLORS.BORDER, flexDirection: 'row', alignItems: 'center' },
    inputContainer: { flex: 1 },
    label: { fontSize: 14, fontFamily: FONT.UI_MEDIUM, marginBottom: 4 },
    input: { fontFamily: FONT.UI_REGULAR, fontSize: 16, color: COLORS.TEXT, minHeight: 40 },
    addBtn: { backgroundColor: COLORS.LINK, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginLeft: 8 },
    addText: { color: COLORS.WHITE, fontFamily: FONT.UI_MEDIUM, fontSize: 12 }
});
