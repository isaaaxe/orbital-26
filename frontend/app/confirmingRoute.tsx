import Header from "@/components/Header";
import StylisedButton from "@/components/StylisedButton";
import { RenderPath, ROUTE_COLOURS, useRouteContext } from "@/context/RouteContext";
import { router } from "expo-router";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import MapView, {
  Marker,
  Overlay,
  Polyline,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import IndoorView from "@/components/IndoorView";

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
  bottomPanel: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingTop: 12,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 14,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  summaryItem: {
    flex: 1,
  },

  summaryLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: 4,
  },

  summaryValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },

  summaryDivider: {
    width: 1,
    height: 36,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 16,
  },
});

export default function ConfirmingRoute() {
  const [isOutdoor, setIsOutdoor] = useState(true);

  const { origin, destination, selectedRoute, routeSegments } = useRouteContext();

  if (!selectedRoute) {
    return (
      <View>
        <SafeAreaView>
          <Header
            text="Route not ready"
            description="Please select a route first"
          />
        </SafeAreaView>
      </View>
    );
  }

  const toNavigate = () => {
    router.push("/navigate");
  };

  function formatDuration(totalSeconds: number) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    return hours > 0
      ? `${hours}h ${minutes}m ${seconds}s`
      : minutes > 0
        ? `${minutes}m ${seconds}s`
        : `${seconds}s`;
  }

  function formatDistance(distanceMeters: number) {
    return distanceMeters >= 1000
      ? `${(distanceMeters / 1000).toFixed(1)} km`
      : `${Math.round(distanceMeters)} m`;
  }
  return (
    <View style={styles.screen}>
      <SafeAreaView style={{ flex: 1 }}>
        <Header
          text={selectedRoute.mode}
          description={`${origin?.nearest_node.name} -> ${destination?.name}`}
        />
        {/* map + summary of route chosen */}
        {/* bottom has button to choose to start navigating */}
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
        <View style={styles.container}>
          {isOutdoor ? (
            <MapView
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              region={{
                latitude: 1.300291282646443,
                longitude: 103.77733947340228,
                latitudeDelta: 0.016,
                longitudeDelta: 0.016,
              }}
            >
              {/* <Polyline
                coordinates={selectedRoute.path_coordinates.map((path) => ({
                  latitude: path[1],
                  longitude: path[0],
                }))}
                strokeColor="#0B2D73"
                strokeWidth={5}
                lineDashPattern={[4, 4]}
              /> */}
              {routeSegments.map((renderPath, index)=> (
                <Polyline
                  key={index}
                  coordinates={renderPath.coords}
                  strokeColor={ROUTE_COLOURS[renderPath.mode] ?? "#000000"}
                  strokeWidth={4}
                  lineDashPattern={[24, 12]}
                  lineCap="butt"
                />
              ))}
              {/* {groupOfSteps[1] && (
                <Polyline 
                  coordinates={groupOfSteps[1].coords}
                  strokeColor="red"
                  strokeWidth={10}
                />
              )} */}
            </MapView>
          ) : (
            <IndoorView />
          )}
          <View style={styles.bottomPanel}>
            <Text style={styles.summaryTitle}>Route Summary</Text>

            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Distance</Text>
                <Text style={styles.summaryValue}>
                  {selectedRoute.total_distance
                    ? formatDistance(selectedRoute.total_distance)
                    : "-"}
                </Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Estimated Time</Text>
                <Text style={styles.summaryValue}>
                  {selectedRoute.total_estimated_seconds
                    ? formatDuration(selectedRoute.total_estimated_seconds)
                    : "-"}
                </Text>
              </View>
            </View>
          </View>
          <StylisedButton buttonText="Confirm Route" onPress={toNavigate} />
        </View>
      </SafeAreaView>
    </View>
  );
}
