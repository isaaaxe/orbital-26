import CardItem from "@/components/CardItem";
import Header from "@/components/Header";
import { router } from "expo-router";
import { Text, View, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const icons = {
  user: require("../../assets/icons/user.png"),
  notif: require("../../assets/icons/notification-bell.png"),
  report: require("../../assets/icons/danger.png"),
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  settingItem: {
    flexDirection: "row",
    justifyContent: "center",
    alignContent: "center",
  },
});

export default function SettingsPage() {
  const SETTINGS_DATA = [
    { icon: icons.user, cardTitle: "Account", onPress: toAccount },
    { icon: icons.notif, cardTitle: "Notifications", onPress: toNotifications },
    { icon: icons.report, cardTitle: "Report", onPress: toReport },
    //pacing to be added here
  ];

  function toAccount() {
    router.push("/settings/account");
  }
  function toNotifications() {
    router.push("/settings/notifications");
  }
  function toReport() {
    router.push("/settings/report");
  }

  return (
    <View style={styles.screen}>
      <SafeAreaView>
        <Header text={"Settings"} description="" />
        <FlatList
          data={SETTINGS_DATA}
          renderItem={({ item }) => (
            <CardItem
              mainIcon={item.icon}
              cardTitle={item.cardTitle}
              cardSubtitle=""
              onPress={item.onPress}
            />
          )}
          style={{ marginHorizontal: 20 }}
        />
      </SafeAreaView>
    </View>
  );
}
