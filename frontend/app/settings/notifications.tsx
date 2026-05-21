import { Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationSettings() {

    const styles = StyleSheet.create({
        screen: {
            flex: 1,
            backgroundColor: "#FFFFFF",
        },
    })
    return <View style={styles.screen}>
            <SafeAreaView>
                <View>
                    <Text>Notif Settings Page</Text>
                </View>
            </SafeAreaView>
        </View>
}