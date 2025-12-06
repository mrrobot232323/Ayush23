import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format, differenceInYears } from "date-fns";
import { COLORS, FONT } from "../constants/theme";

export default function DOBPicker({ onConfirm }: { onConfirm: (dob: string, age: number) => void }) {
    const [showPicker, setShowPicker] = useState(false);
    const [dob, setDob] = useState<Date | null>(null);
    const [confirmModal, setConfirmModal] = useState(false);
    const [age, setAge] = useState<number | null>(null);

    const handleChange = (_: any, selected?: Date) => {
        setShowPicker(false);
        if (selected) {
            const years = differenceInYears(new Date(), selected);
            setDob(selected);
            setAge(years);
            // show confirmation modal
            setConfirmModal(true);
        }
    };

    const confirm = () => {
        if (!dob || age == null) return;
        onConfirm(format(dob, "yyyy-MM-dd"), age);
        setConfirmModal(false);
    };

    return (
        <View>
            <TouchableOpacity
                style={[styles.pill]}
                onPress={() => setShowPicker(true)}
            >
                <Text style={styles.pillText}>{dob ? format(dob, "do MMM yyyy") : "Select date of birth"}</Text>
            </TouchableOpacity>

            {showPicker && (
                <DateTimePicker
                    value={dob ?? new Date(1995, 0, 1)}
                    mode="date"
                    display="spinner"
                    maximumDate={new Date()}
                    onChange={handleChange}
                />
            )}

            <Modal transparent visible={confirmModal} animationType="fade">
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Confirm your age</Text>
                        <Text style={styles.modalText}>You are {age} years old</Text>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 16 }}>
                            <TouchableOpacity onPress={() => setConfirmModal(false)}>
                                <Text style={styles.modalCancel}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={confirm} style={styles.modalOk}>
                                <Text style={styles.modalOkText}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    pill: {
        backgroundColor: COLORS.WHITE,
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: COLORS.BORDER,
    },
    pillText: { color: COLORS.TEXT },
    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.35)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalCard: {
        backgroundColor: COLORS.WHITE,
        padding: 20,
        width: "84%",
        borderRadius: 12,
    },
    modalTitle: { fontFamily: FONT.UI_BOLD, fontSize: 18, color: COLORS.TEXT },
    modalText: { marginTop: 8, color: COLORS.MUTED },
    modalOk: {
        backgroundColor: COLORS.PRIMARY_BTN,
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 8,
    },
    modalOkText: { fontFamily: FONT.UI_MEDIUM, color: COLORS.TEXT },
    modalCancel: { color: COLORS.MUTED },
});
