import Header from "@/components/Header";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SavedPage() {
    return <SafeAreaView>
        <Header text={"Saved Routes"} description="Routes that you frequently use"/>
        <View>
            <Text>Saved page</Text>
        </View>
    </SafeAreaView>
}