import IndoorView from "@/components/IndoorView";
import { useRouteContext } from "@/context/RouteContext";
import { useNavigation } from "expo-router";
import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet } from "react-native";
import BackButton from "@/components/BackButton";
import IndoorCheck from "@/components/IndoorCheck";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#0B2D73",
    marginRight: 16,
  },

  indoorContainer: {
    flex: 1,
  },
});

export default function FloorPlanView() {
  const { routePOIs, setRoutePOIs } = useRouteContext();
  const navigate = useNavigation();
  useEffect(() => {
    const unsubscribe = navigate.addListener("beforeRemove", () => {
      setRoutePOIs([]);
    });

    return unsubscribe;
  }, [navigate]);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{routePOIs[0]?.name ?? "Indoor View"}</Text>
        <BackButton additionalBackCleanUp={() => {}} />
      </View>
      <View style={styles.indoorContainer}>
        <IndoorCheck />
      </View>
    </SafeAreaView>
  );
}
