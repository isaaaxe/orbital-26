import IndoorView from "@/components/IndoorView";
import { useRouteContext } from "@/context/RouteContext";
import { useRouteQuery } from "@/hook/useRoute";
import { router } from "expo-router";
import { useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import MapView, { Polyline } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  map: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  mapViewToggle: {
    flexDirection: "row",
    marginHorizontal: 24,
    // marginTop: 8,
    // marginBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  mapViewToggleItem: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },

  mapViewToggleItemSelected: {
    borderBottomColor: "#f86a04",
  },

  mapViewToggleText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },

  mapViewToggleTextSelected: {
    color: "#f86a04",
  },
});

export default function Navigate() {
  //Think can have quite a few things here.
  // 1. Main thing should be a map with the highlighted path to take for navigating
  // 2. Add a tab users can scroll up to see full steps for navigating
  // 3. Actually more importantly navigation functionality needs to kick in here
  //    from api calls to sql retrievals
  const [isOutdoor, setIsOutdoor] = useState(true);

  const { origin, destination } = useRouteContext();

  const toNavigate = () => {
    router.push("/navigate");
  };

  //Temp values, need to pass in context
  const routeName = "Fastest Route";

  const {
    data: route,
    isLoading,
    error,
  } = useRouteQuery(origin?.id, destination?.id);
  return (
    <View style={styles.screen}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.mapViewToggle}>
          <TouchableOpacity
            style={[
              styles.mapViewToggleItem,
              isOutdoor && styles.mapViewToggleItemSelected,
            ]}
            onPress={() => setIsOutdoor(true)}
          >
            <Text
              style={[
                styles.mapViewToggleText,
                isOutdoor && styles.mapViewToggleTextSelected,
              ]}
            >
              Outdoor
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.mapViewToggleItem,
              !isOutdoor && styles.mapViewToggleItemSelected,
            ]}
            onPress={() => setIsOutdoor(false)}
          >
            <Text
              style={[
                styles.mapViewToggleText,
                !isOutdoor && styles.mapViewToggleTextSelected,
              ]}
            >
              Indoor
            </Text>
          </TouchableOpacity>
        </View>
        {isLoading && (
          <View>
            <Text>Loading... </Text>
          </View>
        )}
        {!isLoading && (
          <View style={styles.container}>
            {isOutdoor ? (
              <MapView
                style={styles.map}
                region={{
                  latitude: 1.300291282646443,
                  longitude: 103.77733947340228,
                  latitudeDelta: 0.016,
                  longitudeDelta: 0.016,
                }}
              >
                <Polyline
                  coordinates={route!.nodes.map((node) => ({
                    latitude: node.latitude,
                    longitude: node.longitude,
                  }))}
                  strokeColor="#0B2D73"
                />
              </MapView>
            ) : (
              <IndoorView />
            )}
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}
