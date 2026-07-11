import Header from "@/components/Header";
import StylisedButton from "@/components/StylisedButton";
import {
  RenderPath,
  ROUTE_COLOURS,
  useRouteContext,
} from "@/context/RouteContext";
import { router, useNavigation } from "expo-router";
import { Text, TouchableOpacity, View, StyleSheet, Alert } from "react-native";
import MapView, {
  Marker,
  Overlay,
  Polyline,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import BackButton from "@/components/BackButton";
import { useAuthContext } from "@/context/AuthContext";
import { addRecentlyVisitedMutation } from "@/hook/useUser";
import IndoorCheck from "@/components/IndoorCheck";
import { addRecentlyVisited } from "@/api_debug/recently_visited.logged";
import { useQueryClient } from "@tanstack/react-query";

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
  const { token } = useAuthContext();
  // const addRecentMutation = addRecentlyVisitedMutation(token);
  const navigation = useNavigation();

  const {
    origin,
    destination,
    selectedRoute,
    routeSegments,
    setFloorPlanSource,
    mapParams,
  } = useRouteContext();
  const queryClient = useQueryClient();

  const toNavigate = () => {
    console.log("CONFIRM ROUTE PRESSED");
    if (!destination) {
      Alert.alert("Error has occurred. Please choose a destination.");
      return;
    }
    if (token) {
      addRecentlyVisited(token, { location_id: destination.id })
        .then(() => {
          queryClient.invalidateQueries({
            queryKey: ["recentlyVisited", token],
          });
        })
        .catch((error) => {
          console.log("Failed to add recently visited");
        });
    }
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

  const routeReady = !!selectedRoute;

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", () => {
      setFloorPlanSource(null);
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.screen}>
      <SafeAreaView style={{ flex: 1 }}>
        {!routeReady ? (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Header
              text="Route not ready"
              description="Please select a route first"
            />
            <View>
              <BackButton additionalBackCleanUp={() => {}} />
            </View>
          </View>
        ) : (
          <>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Header
                text={selectedRoute.mode}
                description={`${origin?.nearest_node.name} -> ${destination?.name}`}
              />
              <View style={{ marginRight: 20, alignItems: "center" }}>
                <BackButton additionalBackCleanUp={() => {}} />
              </View>
            </View>
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
                    latitude: mapParams.coordinates.latitude,
                    longitude: mapParams.coordinates.longitude,
                    latitudeDelta: mapParams.delta,
                    longitudeDelta: mapParams.delta,
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
                  {routeSegments.map((renderPath, index) => (
                    <Polyline
                      key={index}
                      coordinates={renderPath.coords}
                      strokeColor={ROUTE_COLOURS[renderPath.mode] ?? "#000000"}
                      strokeWidth={4}
                      lineDashPattern={[24, 12]}
                      lineCap="butt"
                    />
                  ))}
                </MapView>
              ) : (
                <IndoorCheck />
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
          </>
        )}
      </SafeAreaView>
    </View>
  );
}
