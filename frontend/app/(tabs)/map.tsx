import { View, Text, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, Polyline, Polygon, Callout } from "react-native-maps";
import { RoutePlace, useRouteContext } from "@/context/RouteContext";

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 14,
  },
  map: {
    flex: 1,
  },
  errorBox: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    padding: 12,
    backgroundColor: "white",
    borderRadius: 8,
  },
  calloutContainer: {
    alignItems: "center",
  },

  calloutBubble: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 160,
    maxWidth: 220,

    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },

    elevation: 5,
  },

  calloutTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },

  calloutSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
    textAlign: "center",
  },

  calloutArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "white",
  },
});

export default function MapPage() {
  const { origin } = useRouteContext();

  const boundaryCoordinates = [
    { latitude: 1.309274704980008, longitude: 103.77196245668526 },
    { latitude: 1.307506885450094, longitude: 103.77726729866667 },
    { latitude: 1.3019869511579418, longitude: 103.77622076521456 },
    { latitude: 1.2950634383403345, longitude: 103.78665786634224 },
    { latitude: 1.288220180328691, longitude: 103.78144365183114 },
    { latitude: 1.293711950030539, longitude: 103.76895528652895 },
    { latitude: 1.309274704980008, longitude: 103.77196245668526 },
  ];

  const outerBoundary = [
    { latitude: 85, longitude: -85 },
    { latitude: 85, longitude: 179 },
    { latitude: -85, longitude: 179 },
    { latitude: -85, longitude: -85 },
  ];

  function getCurrentLocation() {
    Alert.alert(`Current Location\n${origin?.name}`);
  }

  return (
    <View style={styles.screen}>
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ fontSize: 20, fontWeight: "600", color: "#0B2D73" }}>
            Area covered by Routes@NUS
          </Text>
        </View>
        <View style={styles.container}>
          <MapView
            style={styles.map}
            region={{
              latitude: 1.300291282646443,
              longitude: 103.77733947340228,
              latitudeDelta: 0.016,
              longitudeDelta: 0.016,
            }}
            customMapStyle={[
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }],
              },
            ]}
          >
            <Polyline
              coordinates={boundaryCoordinates}
              strokeWidth={5}
              strokeColor="#f86a04"
              lineCap="round"
              lineJoin="round"
            />
            <Polygon
              coordinates={outerBoundary}
              holes={[boundaryCoordinates]}
              fillColor="rgba(0, 0, 0, 0.45)"
              strokeColor="rgba(0, 0, 0, 0)"
            />
            {origin ? (
              <Marker
                coordinate={{
                  latitude: origin.latitude,
                  longitude: origin.longitude,
                }}
                onPress={getCurrentLocation}
              />
            ) : (
              <></>
            )}
          </MapView>
        </View>
      </SafeAreaView>
    </View>
  );
}
