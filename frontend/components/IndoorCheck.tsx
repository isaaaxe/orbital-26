import { useRouteContext } from "@/context/RouteContext";
import { StyleSheet, Text, View } from "react-native";
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
  const { routePOIs } = useRouteContext();

  if (routePOIs.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No indoor routing involved!</Text>
      </View>
    );
  }

  return <IndoorView routePOIs={routePOIs} />;
}
