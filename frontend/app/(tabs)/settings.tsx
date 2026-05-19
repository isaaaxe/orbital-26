import Header from "@/components/Header";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsPage() {
    return <SafeAreaView>
            <Header text={"Settings"} description="" />
            <View>
                <Text>
                    Settings Page
                </Text>
            </View>
        </SafeAreaView>
}