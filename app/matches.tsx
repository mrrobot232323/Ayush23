import { View, Text } from "react-native";
import { COLORS, FONT } from "../src/constants/theme";

export default function Matches() {
    return (
        <View style={{ flex: 1, backgroundColor: COLORS.BG, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontFamily: FONT.UI_BOLD, fontSize: 24 }}>Matches</Text>
        </View>
    );
}
