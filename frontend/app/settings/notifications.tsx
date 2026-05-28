import { Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
});

export default function NotificationSettings() {
  return (
    <View style={styles.screen}>
      <SafeAreaView>
        <View>
          <Text>Notif Settings Page</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
