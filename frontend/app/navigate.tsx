import Header from "@/components/Header";
import NavigationInstructionsSheet from "@/components/NavigationInstructionsSheet";
import { useRouteContext } from "@/context/RouteContext";
import { useGetLocationDetails } from "@/hook/useLocations";
import { useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import MapView, { Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { ROUTE_COLOURS_TYPE } from "@/context/RouteContext";
import { ROUTE_COLOURS } from "@/context/RouteContext";
import IndoorCheck from "@/components/IndoorCheck";

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
  instructionSheetSpacer: {
    height: 150,
    opacity: 0,
  },
});

export default function Navigate() {
  //Think can have quite a few things here.
  // 1. Main thing should be a map with the highlighted path to take for navigating
  // 2. Add a tab users can scroll up to see full steps for navigating
  // 3. Actually more importantly navigation functionality needs to kick in here
  //    from api calls to sql retrievals
  const [isOutdoor, setIsOutdoor] = useState(true);

  const { selectedRoute, routeSegments, mapParams } = useRouteContext();
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
              showsUserLocation
              followsUserLocation
            >
              {routeSegments.map((renderPath, index) => (
                <Polyline
                  key={index}
                  coordinates={renderPath.coords}
                  strokeColor={ROUTE_COLOURS[renderPath.mode] ?? "#808080"}
                  strokeWidth={4}
                  lineDashPattern={[24, 12]}
                  lineCap="butt"
                />
              ))}
            </MapView>
          ) : (
            <>
              <IndoorCheck />
              <View style={styles.instructionSheetSpacer} />
            </>
          )}
        </View>
        {selectedRoute && (
          <NavigationInstructionsSheet steps={selectedRoute.steps} />
        )}
      </SafeAreaView>
    </View>
  );
}
