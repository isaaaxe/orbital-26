import {
  View,
  Text,
  StyleSheet,
  Alert,
  Modal,
  TouchableOpacity,
  Image,
} from "react-native";
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
import {
  POI_DATA,
  POI_DATA_TYPE,
  POI_GROUPS,
  POI_CANTEEN,
  POI_BUS_STOPS,
} from "../data/POI";
import { useState } from "react";
import { router } from "expo-router";
import BackButton from "@/components/BackButton";
import { useAuthContext } from "@/context/AuthContext";
import ChipList, { ChipListProps } from "@/components/ChipList";
import { icons } from "../data/loadIcons";
import { useAllBuildingDetails } from "@/hook/useCampusMap";
import {
  useGetLocationDetailsByType,
  useSaveLocationMutation,
} from "@/hook/useLocations";
import { useFetchAllBusStop } from "@/hook/useBus";

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
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
    fontSize: 10,
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
    backgroundColor: "#0B2D73",
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
  },

  modalButtonText: {
    color: "white",
    fontWeight: "700",
  },
  modalButtonClose: {
    marginTop: 20,
    backgroundColor: "#E5E7EB",
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
  },

  modalButtonTextClose: {
    color: "#0B2D73",
    fontWeight: "700",
  },
  chipOverlay: {
    position: "absolute",
    top: 12,
    left: 16,
    right: 16,
    zIndex: 10,
  },
});
const scamColourWheel = [
  "rgba(130, 202, 255, 0.75)",
  "rgba(65, 105, 225, 0.75)",
  "rgba(155, 210, 255, 0.75)",
  "rgba(30, 144, 255, 0.75)",
  "rgba(118, 180, 250, 0.75)",
  "rgba(72, 118, 255, 0.75)",
  "rgba(86, 165, 235, 0.75)",
  "rgba(100, 149, 237, 0.75)",
];
export type Mode = "building" | "canteen" | "bus_stop";

export const boundaryCoordinates = [
  { latitude: 1.309274704980008, longitude: 103.77196245668526 },
  { latitude: 1.307506885450094, longitude: 103.77726729866667 },
  { latitude: 1.3019869511579418, longitude: 103.77622076521456 },
  { latitude: 1.2950634383403345, longitude: 103.78665786634224 },
  { latitude: 1.288220180328691, longitude: 103.78144365183114 },
  { latitude: 1.293711950030539, longitude: 103.76895528652895 },
  { latitude: 1.309274704980008, longitude: 103.77196245668526 },
];

export const outerBoundary = [
  { latitude: 85, longitude: -85 },
  { latitude: 85, longitude: 175 },
  { latitude: -85, longitude: 175 },
  { latitude: -85, longitude: -85 },
];

function firstAndLast(str: string) {
  if (str.length <= 3) return str;
  return str[0] + str[str.length - 1];
}

export default function MapPage() {
  const { token } = useAuthContext();
  const saveMutation = useSaveLocationMutation(token);
  const { origin, selectedLocation, setSelectedLocation } = useRouteContext();
  const [visible, setVisible] = useState(false);
  const [region, setRegion] = useState<Region | null>(null);
  const [mapMode, setMapMode] = useState<Mode>("building");
  const showPOI = region !== null && region.latitudeDelta < 0.015;
  const {
    data: buildingDetails,
    isLoading: buildingDetailsLoading,
    error: buildingDetailsError,
  } = useGetLocationDetailsByType("COM");
  //temp put com here
  const {
    data: canteens,
    isLoading: canteensLoading,
    error: canteensError,
  } = useGetLocationDetailsByType("canteen");
  const {
    data: busStops,
    isLoading: busStopsLoading,
    error: busStopsError,
  } = useFetchAllBusStop();

  const chipData: ChipListProps<Mode> = {
    data: [
      { name: "Buildings", code: "building" },
      { name: "Canteens", code: "canteen" },
      { name: "Bus stops", code: "bus_stop" },
    ],
    selected: mapMode,
    onSelect: setMapMode,
  };

  function getCurrentLocation() {
    Alert.alert(`Current Location`, `${origin?.nearest_node.name}`);
  }

  function handleIndoor() {
    setVisible(false);
    router.push("/floorPlanView");
  }

  function handleSaveLocation() {
    //
  }

  return (
    <View style={styles.screen}>
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            alignItems: "center",
            justifyContent: "space-between",
            marginHorizontal: 20,
            marginVertical: 8,
            flexDirection: "row",
          }}
        >
          <View>
            <Text style={{ fontSize: 20, fontWeight: "600", color: "#0B2D73" }}>
              Area covered by Routes@NUS
            </Text>
          </View>
          <View>
            <BackButton additionalBackCleanUp={() => {}} />
          </View>
        </View>
        <View style={styles.container}>
          <View style={styles.chipOverlay}>
            <ChipList
              data={chipData.data}
              selected={mapMode}
              onSelect={setMapMode}
            />
          </View>
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
              >
                <Image
                  source={icons.location}
                  style={{ width: 28, height: 28 }}
                  resizeMode="contain"
                />
              </Marker>
            ) : (
              <></>
            )}
            {/* Point of interests: buildings */}
            {mapMode === "building" &&
              !buildingDetailsLoading &&
              buildingDetails && (
                <>
                  {showPOI &&
                    buildingDetails.map((buildingDetail, index) => (
                      <View key={`poi_${index}`}>
                        <Polygon
                          key={`poly_${index}`}
                          coordinates={buildingDetail.boundaries!.coordinates.map(
                            (coords) => {
                              return {
                                latitude: coords[1],
                                longitude: coords[0],
                              };
                            },
                          )}
                          fillColor={
                            scamColourWheel[index % scamColourWheel.length]
                          }
                          strokeColor={
                            scamColourWheel[index % scamColourWheel.length]
                          }
                          tappable={true}
                          onPress={() => {
                            setVisible(true);
                            setSelectedLocation(buildingDetail);
                          }}
                        />
                        <Marker
                          key={`marker_${index}`}
                          coordinate={{
                            latitude: buildingDetail.latitude!,
                            longitude: buildingDetail.longitude!,
                          }}
                          anchor={{ x: 0.5, y: 0.5 }}
                          onPress={() => {
                            setVisible(true);
                            setSelectedLocation(buildingDetail);
                          }}
                        >
                          <View style={styles.mapLabel}>
                            <Text style={styles.mapLabelText}>
                              {firstAndLast(buildingDetail.display_name)}
                            </Text>
                          </View>
                        </Marker>
                      </View>
                    ))}
                  {/* {!showPOI &&
                  POI_GROUPS.map((group, index) => (
                    <Polygon
                      key={`group_${index}`}
                      coordinates={group.boundary}
                      fillColor={group.color}
                      strokeColor={group.color}
                    />
                  ))}

                {!showPOI &&
                  POI_GROUPS.map((group, index) => (
                    <Marker
                      key={`group_marker_${index}`}
                      coordinate={group.center}
                      anchor={{ x: 0.5, y: 0.5 }}
                    >
                      <View style={styles.mapLabel}>
                        <Text style={styles.mapLabelText}>{group.name}</Text>
                      </View>
                    </Marker>
                  ))} */}
                </>
              )}
            {mapMode === "canteen" && !canteensLoading && canteens && (
              <>
                {canteens.map((canteen, index) => (
                  <View key={`can_${index}`}>
                    <Polygon
                      key={`canteen_${index}`}
                      coordinates={canteen.boundaries!.coordinates.map(
                        (coord) => {
                          return { latitude: coord[1], longitude: coord[0] };
                        },
                      )}
                      fillColor={
                        scamColourWheel[index % scamColourWheel.length]
                      }
                      strokeColor={
                        scamColourWheel[index % scamColourWheel.length]
                      }
                    />
                    <Marker
                      key={`canteen_marker_${index}`}
                      coordinate={{
                        latitude: canteen.latitude!,
                        longitude: canteen.longitude!,
                      }}
                      anchor={{ x: 0.5, y: 0.5 }}
                    >
                      <Image
                        source={icons.location}
                        style={{ height: 28, width: 28 }}
                      />
                    </Marker>
                  </View>
                ))}
              </>
            )}
            {/* {mapMode === "bus_stop" && (
              <>
                {POI_BUS_STOPS.map((stop, index) => (
                  <Marker
                    key={`bus_stop_${index}`}
                    coordinate={stop.center}
                    anchor={{ x: 0.5, y: 0.5 }}
                  >
                    <Image
                      source={icons.bus_stop}
                      style={{ width: 22, height: 22 }}
                      resizeMode="contain"
                    />
                  </Marker>
                ))}
              </>
            )} */}
            {mapMode === "bus_stop" && !busStopsLoading && busStops && (
              <>
                {busStops.map((stop, index) => {
                  <Marker
                    key={`bus_stop_${index}`}
                    coordinate={{
                      latitude: stop.latitude,
                      longitude: stop.longitude,
                    }}
                    anchor={{ x: 0.5, y: 0.5 }}
                  >
                    <Image
                      source={icons.bus_stop}
                      style={{ width: 22, height: 22 }}
                      resizeMode="contain"
                    />
                  </Marker>;
                })}
              </>
            )}
          </MapView>
          <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={() => setVisible(false)}
          >
            <View style={styles.modalBackdrop}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>
                  {selectedLocation ? selectedLocation.display_name : ""}
                </Text>
                <View>
                  {mapMode == "building" && (
                    <TouchableOpacity
                      style={styles.modalButton}
                      onPress={handleIndoor}
                    >
                      <Text style={styles.modalButtonText}>View floorplan</Text>
                    </TouchableOpacity>
                  )}
                  {mapMode != "bus_stop" && token && (
                    <TouchableOpacity
                      style={styles.modalButton}
                      onPress={async () => {
                        //handle saving
                        saveMutation.mutateAsync();
                      }}
                    >
                      <Text style={styles.modalButtonText}>Save Location</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.modalButtonClose}
                    onPress={() => {
                      setVisible(false);
                      setSelectedLocation(null);
                    }}
                  >
                    <Text style={styles.modalButtonTextClose}>Close</Text>
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
