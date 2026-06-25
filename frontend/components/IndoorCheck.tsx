import { useRouteContext } from "@/context/RouteContext";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import IndoorView from "./IndoorView";

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0B2D73",
    textAlign: "center",
  },
});

export default function IndoorCheck() {
  const { floorPlans, floorPlanSource, floorPlansLoading} = useRouteContext();
  if (floorPlansLoading) {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator size={"large"}/>
        <Text style={styles.emptyText}>{floorPlanSource == "route" ? "Fetching indoor route...": "Fetching floor plan..."}</Text>
      </View>
    )
  }

  if (!floorPlans || Object.keys(floorPlans).length == 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{floorPlanSource == "route" ? "No indoor routing involved!": "No floor plan available"}</Text>
      </View>
    );

  }

  return <IndoorView floorPlans={floorPlans} />;
}
