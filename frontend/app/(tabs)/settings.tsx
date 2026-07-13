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
  settingsContent: {
    marginHorizontal: 20,
  },

  sliderSection: {
    marginHorizontal: 20,
    marginTop: 24,
  },

  sliderHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  sliderTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1D2939",
  },

  sliderValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0B2D73",
  },

  sliderContainer: {
    height: 56,
    justifyContent: "center",
    paddingHorizontal: 8,
    backgroundColor: "#F2F4F7",
    borderRadius: 14,
  },

  slider: {
    width: "100%",
    height: 48,
  },

  tickContainer: {
    position: "absolute",
    left: 20,
    right: 20,
    top: 20,
    height: 16,
  },

  tick: {
    position: "absolute",
    width: 2,
    height: 16,
    borderRadius: 1,
    backgroundColor: "#98A2B3",
    transform: [{ translateX: -1 }],
  },

  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingHorizontal: 4,
  },

  sliderLabel: {
    fontSize: 11,
    color: "#667085",
  },
});

const paceValues = [50, 75, 100, 125, 150];
const shelterValues = [0, 2, 4, 6, 8, 10];

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
          <View style={styles.sliderSection}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sliderTitle}>Walking pace</Text>
              <Text style={styles.sliderValue}>{pacing}%</Text>
            </View>
            <View style={styles.sliderContainer}>
              <View pointerEvents="none" style={styles.tickContainer}>
                {paceValues.map((value, index) => (
                  <View
                    key={value}
                    style={[
                      styles.tick,
                      {
                        left: `${(index / (paceValues.length - 1)) * 100}%`,
                      },
                    ]}
                  />
                ))}
              </View>
              <Slider
                minimumValue={50}
                maximumValue={150}
                step={25}
                value={pacing}
                onValueChange={setPacing}
                minimumTrackTintColor="#0B2D73"
                maximumTrackTintColor="#D0D5DD"
                thumbTintColor="#FFFFFF"
                onSlidingComplete={(value) => {
                  // function to update the user pacing
                  setPacing(value);
                  updateMutation.mutateAsync({
                    token: token,
                    request: {
                      new_username: null,
                      new_password: null,
                      language: null,
                      pace_factor: value / 100,
                      shelter_pref: null,
                    },
                  });
                }}
              />
            </View>
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>Slower</Text>
              <Text style={styles.sliderLabel}>Normal</Text>
              <Text style={styles.sliderLabel}>Faster</Text>
            </View>
          </View>
        )}
        {/* shelter pref slider */}
        {token && (
          <View style={styles.sliderSection}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sliderTitle}>Sheltered route preference</Text>
              <Text style={styles.sliderValue}>{shelter}/10</Text>
            </View>

            <View style={styles.sliderContainer}>
              <View pointerEvents="none" style={styles.tickContainer}>
                {shelterValues.map((value, index) => (
                  <View
                    key={value}
                    style={[
                      styles.tick,
                      {
                        left: `${(index / (shelterValues.length - 1)) * 100}%`,
                      },
                    ]}
                  />
                ))}
              </View>
              <Slider
                minimumValue={0}
                maximumValue={10}
                step={2}
                value={shelter}
                onValueChange={setShelter}
                minimumTrackTintColor="#0B2D73"
                maximumTrackTintColor="#D0D5DD"
                thumbTintColor="#FFFFFF"
                onSlidingComplete={(value) => {
                  setShelter(value);
                  // function to update the user pacing
                  updateMutation.mutateAsync({
                    token: token,
                    request: {
                      new_username: null,
                      new_password: null,
                      language: null,
                      pace_factor: null,
                      shelter_pref: value / 10,
                    },
                  });
                }}
              />
            </View>
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>No preference</Text>
              <Text style={styles.sliderLabel}>Strong preference</Text>
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}
