import Header from "@/components/Header";
import StylisedButton from "@/components/StylisedButton";
import { useRouteContext } from "@/context/RouteContext";
import { router } from "expo-router";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import MapView, { Overlay, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { sampleLocations } from "./data/sampleLocations";
import { useRouteQuery } from "@/hook/useRoute";
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
});

export default function ConfirmingRoute() {
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
        <Header
          text={routeName}
          description={`${origin?.name} -> ${destination?.name}`}
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
                provider={PROVIDER_GOOGLE} 
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
            <StylisedButton buttonText="Confirm Route" onPress={toNavigate} />
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}
