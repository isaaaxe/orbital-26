import {
  View,
  Text,
  StyleSheet,
  Alert,
  Modal,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, {
  Marker,
  Polyline,
  Polygon,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";
import { useRouteContext } from "@/context/RouteContext";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import BackButton from "@/components/BackButton";
import { useAuthContext } from "@/context/AuthContext";
import ChipList, { ChipListProps } from "@/components/ChipList";
import { icons } from "../data/loadIcons";
import {
  useGetLocationDetailsByType,
  useSaveLocationMutation,
} from "@/hook/useLocations";
import { useFetchAllBusStop } from "@/hook/useBus";
import { FlatList } from "react-native-gesture-handler";
import CrowdHeatmap from "@/components/CrowdHeatmap";
import { LocationDetail } from "@/api_debug/locations.logged";
import { BusStopResponse } from "@/api_debug/bus.logged";

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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  modalBox: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
  },
  modalMessage: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
    lineHeight: 20,
  },

  modalInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    marginBottom: 18,
  },

  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },

  modalCancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },

  modalCancelText: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "600",
  },

  modalSaveButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },

  modalSaveText: {
    fontSize: 15,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  swipeWrapper: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 10,
  },

  clipWrapper: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#DD5550", // red behind the card
  },

  deleteAction: {
    width: 90, // final snapped open width
    justifyContent: "center",
    alignItems: "center",
  },

  deleteText: {
    color: "white",
    fontWeight: "700",
  },
  outerSwipeWrapper: {
    marginBottom: 10,
  },

  cardFix: {
    marginBottom: -10, // cancels CardItem's internal marginBottom
  },
  loadingModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    justifyContent: "center",
    alignItems: "center",
  },

  loadingModalBox: {
    width: 220,
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },

  loadingModalText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },

  bottomOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,

    maxHeight: "42%",
    backgroundColor: "rgba(255, 255, 255, 1)",

    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,

    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,

    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: -4 },
    // shadowOpacity: 0.16,
    // shadowRadius: 12,
    // elevation: 8,
  },

  overlayList: {
    paddingBottom: 4,
  },

  itemGap: {
    height: 10,
  },

  overlayCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  cardTitleButton: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },

  saveButton: {
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#EAF3FF",
  },

  saveButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0B4EA2",
  },

  detailsContainer: {
    marginTop: 12,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },

  statusText: {
    fontSize: 13,
    fontWeight: "800",
  },

  openText: {
    color: "#16A34A",
  },

  closedText: {
    color: "#DC2626",
  },

  openingText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
    color: "#4B5563",
  },

  chevronText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#6B7280",
  },

  scheduleContainer: {
    marginBottom: 10,
  },

  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
  },

  scheduleDay: {
    width: 46,
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },

  scheduleHours: {
    flex: 1,
    fontSize: 13,
    color: "#4B5563",
  },

  busRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },

  busBadge: {
    backgroundColor: "#0B4EA2",
    color: "white",
    fontSize: 13,
    fontWeight: "800",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: "hidden",
  },

  busTiming: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
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

type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

// type OpeningHours = Partial<Record<DayKey, [string, string]>>;
// type CrowdDensity = Partial<Record<DayKey, Record<string, number>>>;

const dayOrder: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const dayLabels: Record<string, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

function getTodayKey() {
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return days[new Date().getDay()];
}

export function formatHour(time: string): string {
  const [hour, minutes] = time.split(":");
  if (Number(hour) > 12) return `${Number(hour) - 12}:${minutes} pm`;
  return `${Number(hour)}:${minutes} am`;
}

function formatOpeningHours(openingHours: [string, string]): string {
  return `${formatHour(openingHours[0])} - ${formatHour(openingHours[1])}`;
}

export function getDensityColor(value?: number) {
  if (value == null) return "#E5E7EB";
  if (value < 35) return "#22C55E";
  if (value < 70) return "#FACC15";
  return "#EF4444";
}

function timeToMinutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function isCurrentlyOpen(openingHours: [string, string]) {
  const [openTime, closeTime] = openingHours;

  const openMinutes = timeToMinutes(openTime);
  const closeMinutes = timeToMinutes(closeTime);

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
}

// function getDensityText(value?: number) {
//   if (value == null) return "Unknown";
//   if (value < 35) return "Quiet";
//   if (value < 70) return "Moderate";
//   return "Crowded";
// }

// function getCrowdHours(crowdDensity?: CrowdDensity | null) {
//   return Array.from(
//     new Set(
//       Object.values(crowdDensity ?? {}).flatMap((dayData) =>
//         Object.keys(dayData ?? {}),
//       ),
//     ),
//   ).sort((a, b) => Number(a) - Number(b));
// }

export default function MapPage() {
  const { token } = useAuthContext();
  const saveLocationMutation = useSaveLocationMutation(token);
  const {
    origin,
    selectedLocation,
    setSelectedLocation,
    setFloorPlanSource,
    setDestination,
  } = useRouteContext();
  const [visible, setVisible] = useState(false);
  const [region, setRegion] = useState<Region | null>(null);
  const { mapMode, setMapMode } = useRouteContext();
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [savePurpose, setSavePurpose] = useState("");
  const showPOI = region !== null && region.latitudeDelta < 0.015;
  const {
    data: buildingDetails,
    isFetching: buildingDetailsLoading,
    error: buildingDetailsError,
  } = useGetLocationDetailsByType("COM");
  //temp put com here
  const {
    data: canteens,
    isFetching: canteensLoading,
    error: canteensError,
  } = useGetLocationDetailsByType("canteen");
  const {
    data: busStops,
    isFetching: busStopsLoading,
    error: busStopsError,
  } = useFetchAllBusStop();
  const chipData: ChipListProps<Mode> = {
    data: [
      { name: "Buildings", code: "building" },
      { name: "Canteens", code: "canteen" },
      { name: "Bus stops", code: "bus_stop" },
    ],
    selected: mapMode,
    onSelect: handleSelectChip,
  };
  // expanded view of item
  const [isExpanded, setIsExpanded] = useState(false);
  const [canteenSelected, setCanteenSelected] = useState<LocationDetail | null>(
    null,
  );
  const [busStopSelected, setBusStopSelected] =
    useState<BusStopResponse | null>(null);
  // const [canteenScheduleExpanded, setCanteenScheduleExpanded] = useState(false);

  function handleSelectChip(mode: Mode) {
    setIsExpanded(false);
    setCanteenSelected(null);
    setBusStopSelected(null);
    setSelectedLocation(null);
    setMapMode(mode);
  }

  function getCurrentLocation() {
    Alert.alert(`Current Location`, `${origin?.nearest_node.name}`);
  }

  function handleIndoor() {
    setVisible(false);
    setFloorPlanSource("building");
    router.push("/floorPlanView");
  }

  function handleSaveLocation() {
    saveLocationMutation.mutate({
      locationId: selectedLocation?.id!,
      purpose: savePurpose,
    });
    setSelectedLocation(null);
    setSavePurpose("");
    //want to cause a small pop up to appear to show that saving was successful
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
              onSelect={handleSelectChip}
            />
          </View>
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            region={{
              latitude: canteenSelected
                ? canteenSelected.latitude!
                : busStopSelected
                  ? busStopSelected.latitude
                  : 1.300291282646443,
              longitude: canteenSelected
                ? canteenSelected.longitude!
                : busStopSelected
                  ? busStopSelected.longitude
                  : 103.77733947340228,
              latitudeDelta: canteenSelected || busStopSelected ? 0.008 : 0.016,
              longitudeDelta:
                canteenSelected || busStopSelected ? 0.008 : 0.016,
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
                  {buildingDetails.map((buildingDetail, index) => (
                    <View key={`poi_${index}`}>
                      <Polygon
                        key={`poly_${index}`}
                        coordinates={buildingDetail.boundaries!.coordinates[0].map(
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
                </>
              )}
            {/* canteen */}
            {mapMode === "canteen" && !canteensLoading && canteens && (
              <>
                {canteens.map((canteen, index) => (
                  <View key={`can_${index}`}>
                    <Polygon
                      key={`canteen_${index}`}
                      coordinates={canteen.boundaries!.coordinates[0].map(
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
                      onPress={() => {
                        setVisible(true);
                        setSelectedLocation(canteen);
                        //to be updated to show the canteen instead
                      }}
                    />
                    <Marker
                      key={`canteen_marker_${index}`}
                      coordinate={{
                        latitude: canteen.latitude!,
                        longitude: canteen.longitude!,
                      }}
                      anchor={{ x: 0.5, y: 0.5 }}
                      onPress={() => {
                        setVisible(true);
                        setSelectedLocation(canteen);
                      }}
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
            {/* bus stop */}
            {mapMode === "bus_stop" && !busStopsLoading && busStops && (
              <>
                {busStops.map((stop, index) => (
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
                  </Marker>
                ))}
              </>
            )}
          </MapView>
          {/* this modal should only be for buildings for now */}

          {(mapMode === "canteen" || mapMode === "bus_stop") && (
            <View style={styles.bottomOverlay}>
              {mapMode === "canteen" && (
                <FlatList
                  key="canteen-list"
                  data={canteens}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.overlayList}
                  ItemSeparatorComponent={() => <View style={styles.itemGap} />}
                  renderItem={({ item }) => {
                    const isSelected = canteenSelected?.id === item.id;

                    const dayKey = getTodayKey();
                    const dayFormatted = dayLabels[dayKey];

                    const todayHours = item.opening_hours?.[dayKey];

                    const openingHour = todayHours
                      ? formatHour(todayHours[0])
                      : "N/A";

                    const isOpen = todayHours
                      ? isCurrentlyOpen(todayHours)
                      : false;

                    return (
                      <View style={styles.overlayCard}>
                        <View style={styles.cardHeader}>
                          <TouchableOpacity
                            style={styles.cardTitleButton}
                            onPress={() => {
                              setCanteenSelected(isSelected ? null : item);
                              setIsExpanded(false);
                            }}
                          >
                            <Text style={styles.cardTitle}>{item.name}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.saveButton}
                            onPress={() => {
                              setVisible(true);
                              setSelectedLocation(item);
                            }}
                          >
                            <Text style={styles.saveButtonText}>Navigate</Text>
                          </TouchableOpacity>
                          {token && (
                            <TouchableOpacity
                              style={styles.saveButton}
                              onPress={() => {
                                setVisible(true);
                                setSelectedLocation(item);
                              }}
                            >
                              <Text style={styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>
                          )}
                        </View>

                        {isSelected && (
                          <View style={styles.detailsContainer}>
                            {!isExpanded ? (
                              <TouchableOpacity
                                style={styles.statusRow}
                                onPress={() => setIsExpanded(true)}
                              >
                                <Text
                                  style={[
                                    styles.statusText,
                                    isOpen
                                      ? styles.openText
                                      : styles.closedText,
                                  ]}
                                >
                                  {isOpen ? "Open" : "Closed"}
                                </Text>

                                <Text style={styles.openingText}>
                                  {`Opens at ${openingHour} ${dayFormatted}`}
                                </Text>

                                <Text style={styles.chevronText}>⌄</Text>
                              </TouchableOpacity>
                            ) : (
                              <Pressable
                                style={styles.scheduleContainer}
                                onPress={() => setIsExpanded(false)}
                              >
                                {dayOrder
                                  .filter((day) => day in item.opening_hours!)
                                  .map((day, index) => (
                                    <View key={day} style={styles.scheduleRow}>
                                      <Text style={styles.scheduleDay}>
                                        {dayLabels[day]}
                                      </Text>

                                      <Text style={styles.scheduleHours}>
                                        {formatOpeningHours(
                                          item.opening_hours![day],
                                        )}
                                      </Text>

                                      {index === 0 && (
                                        <Text style={styles.chevronText}>
                                          ⌃
                                        </Text>
                                      )}
                                    </View>
                                  ))}
                              </Pressable>
                            )}

                            <CrowdHeatmap
                              densityByHour={item.crowd_density?.[dayKey]}
                            />
                          </View>
                        )}
                      </View>
                    );
                  }}
                />
              )}

              {mapMode === "bus_stop" && (
                <FlatList
                  key="bus_stop_list"
                  data={busStops}
                  keyExtractor={(item) => item.bus_stop_id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.overlayList}
                  ItemSeparatorComponent={() => <View style={styles.itemGap} />}
                  renderItem={({ item }) => {
                    const isSelected =
                      busStopSelected?.bus_stop_id === item.bus_stop_id;

                    return (
                      <View style={styles.overlayCard}>
                        <TouchableOpacity
                          style={styles.cardHeader}
                          onPress={() =>
                            setBusStopSelected(isSelected ? null : item)
                          }
                        >
                          <Text style={styles.cardTitle}>{item.name}</Text>
                          <Text style={styles.chevronText}>
                            {isSelected ? "⌃" : "⌄"}
                          </Text>
                        </TouchableOpacity>
                        {isSelected && (
                          <View style={styles.detailsContainer}>
                            {item.available_buses.map((bus) => (
                              <View key={bus} style={styles.busRow}>
                                <Text style={styles.busBadge}>{bus}</Text>
                                <Text style={styles.busTiming}>
                                  {item.bus_schedules[bus]} min
                                </Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    );
                  }}
                />
              )}
            </View>
          )}
          {/* building modal */}
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
                  {(mapMode == "building" || mapMode == "canteen") && (
                    <TouchableOpacity
                      style={styles.modalButton}
                      onPress={() => {
                        setDestination(selectedLocation);
                        setVisible(false);
                        router.push("/chooseRoute");
                      }}
                    >
                      <Text style={styles.modalButtonText}>Navigate</Text>
                    </TouchableOpacity>
                  )}

                  {/* setting up like these for future saveable types that i can use this modal with */}
                  {mapMode != "bus_stop" && token && (
                    <TouchableOpacity
                      style={styles.modalButton}
                      onPress={() => {
                        setVisible(false);
                        setSaveModalVisible(true);
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

          {/* saving modal, for now used for buildings and canteen */}
          <Modal
            visible={saveModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setSaveModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalBox}>
                <Text style={styles.modalTitle}>Save location</Text>

                <Text style={styles.modalMessage}>Purpose of location</Text>

                <TextInput
                  style={styles.modalInput}
                  value={savePurpose}
                  onChangeText={setSavePurpose}
                  placeholder="Reason"
                  autoFocus
                />

                <View style={styles.modalButtonRow}>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => {
                      setSaveModalVisible(false);
                      setSelectedLocation(null);
                      setSavePurpose("");
                    }}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalSaveButton}
                    onPress={() => {
                      setSaveModalVisible(false);
                      handleSaveLocation();
                    }}
                  >
                    <Text style={styles.modalSaveText}>Save</Text>
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
