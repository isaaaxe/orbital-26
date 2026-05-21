import { Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ReportSettings() {

    const styles = StyleSheet.create({
        screen: {
            flex: 1,
            backgroundColor: "#FFFFFF",
        },
    })
    return <View style={styles.screen}>
            <SafeAreaView>
                <View>
                    <Text>Report Page</Text>
                </View>
            </SafeAreaView>
        </View>
}