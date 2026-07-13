import CardItem from "@/components/CardItem";
import Header from "@/components/Header";
import { router } from "expo-router";
import { Text, View, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";
import { useAuthContext } from "@/context/AuthContext";
import { useState } from "react";
import { useUpdateUserMutation } from "@/hook/useUser";

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
  const { token, user } = useAuthContext();
  const [pacing, setPacing] = useState(100);
  // scaled up 100x to prevent float errors
  const [shelter, setShelter] = useState(8);
  //scaled up 10x to prevent float errors
  const SETTINGS_DATA = [
    { icon: icons.user, cardTitle: "Account", onPress: toAccount },
    // { icon: icons.notif, cardTitle: "Notifications", onPress: toNotifications },
    // { icon: icons.report, cardTitle: "Report", onPress: toReport },
    //pacing to be added here
  ];
  const updateMutation = useUpdateUserMutation();

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
        {/* pacing slider */}
        {token && (
          <Slider
            minimumValue={50}
            maximumValue={150}
            step={25}
            value={pacing}
            onValueChange={setPacing}
            onSlidingComplete={() => {
              // function to update the user pacing
              updateMutation.mutateAsync({
                token: token,
                request: {
                  new_username: null,
                  new_password: null,
                  language: null,
                  pace_factor: pacing,
                  shelter_pref: null,
                },
              });
            }}
          />
        )}
        {/* shelter pref slider */}
        {token && (
          <Slider
            minimumValue={0}
            maximumValue={10}
            step={2}
            value={shelter}
            onValueChange={setShelter}
            onSlidingComplete={() => {
              // function to update the user pacing
              updateMutation.mutateAsync({
                token: token,
                request: {
                  new_username: null,
                  new_password: null,
                  language: null,
                  pace_factor: null,
                  shelter_pref: shelter,
                },
              });
            }}
          />
        )}
      </SafeAreaView>
    </View>
  );
}
