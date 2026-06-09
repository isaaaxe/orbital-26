import { View, Text, StyleSheet, Alert, Modal, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, {
  Marker,
  Polyline,
  Polygon,
  PROVIDER_GOOGLE,
  Callout,
  Region,
} from "react-native-maps";
import { useRouteContext } from "@/context/RouteContext";
import { POI_DATA, POI_DATA_TYPE } from "../data/POI";
import { useState } from "react";
import { router } from "expo-router";

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
mapLabel: {
  backgroundColor: "rgba(255, 255, 255, 0.95)",
  paddingHorizontal: 4,
  paddingVertical: 4,
  borderRadius: 6,
  borderWidth: 1,
  borderColor: "#4169e1",

  minWidth: 12,
  alignItems: "center",
  justifyContent: "center",
},

mapLabelText: {
  color: "#4169e1",
  fontSize: 12,
  fontWeight: "700",
  textAlign: "center",
  includeFontPadding: false, // Android helpful
},
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  modalCard: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },

  modalText: {
    marginTop: 8,
    fontSize: 14,
    color: "#555",
  },

  modalButton: {
    marginTop: 20,
    backgroundColor: "#4169e1",
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
  },

  modalButtonText: {
    color: "white",
    fontWeight: "700",
  },
});

export default function MapPage() {
  const { origin, poi, setPOI } = useRouteContext();
  const [visible, setVisible] = useState(false)
  const [region, setRegion] = useState<Region | null>(null)
  const showPOI =
  region !== null && region.latitudeDelta < 0.015;
  // const {
  //   data: originDetails,
  //   isLoading,
  //   error,
  // } = useGetLocationDetails(origin?.nearest_node.);
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
    { latitude: 85, longitude: 175 },
    { latitude: -85, longitude: 175 },
    { latitude: -85, longitude: -85 },
  ];

  function getCurrentLocation() {
    Alert.alert(`Current Location\n${origin?.nearest_node.name}`);
  }

  function handleIndoor() {
    router.push("/")
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
            provider={PROVIDER_GOOGLE}
            region={{
              latitude: 1.300291282646443,
              longitude: 103.77733947340228,
              latitudeDelta: 0.016,
              longitudeDelta: 0.016,
            }}
            onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
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
                  latitude: origin.nearest_node.latitude!,
                  longitude: origin.nearest_node.longitude!,
                }}
                onPress={getCurrentLocation}
              />
            ) : (
              <></>
            )}
            {/* Point of interests: buildings */}
            {showPOI && POI_DATA.map((currPoi, index) => (
              <Polygon
                key={`poly_${index}`} 
                coordinates={currPoi.boundary}
                fillColor={currPoi.color}
                strokeColor={currPoi.color}
              />
            ))}
            {showPOI && POI_DATA.map((currPoi, index) => (
              <Marker coordinate={currPoi.center}
                      onPress={() => {
                        setVisible(true)
                        setPOI(currPoi)
                      }}>
                <View style={styles.mapLabel}>
                  <Text style={styles.mapLabelText}>{currPoi.display_name}</Text>
                </View>
              </Marker>
            ))}
            
          </MapView>
          <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={() => setVisible(false)}
          >
            <View style={styles.modalBackdrop}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>{poi?.name}</Text>
                <View>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => {
                      setVisible(false)
                      setPOI(null)
                    }}
                  >
                    <Text style={styles.modalButtonText}>Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={handleIndoor}
                  >
                    <Text style={styles.modalButtonText}>View floorplan</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </SafeAreaView>
    </View>
  );
}
