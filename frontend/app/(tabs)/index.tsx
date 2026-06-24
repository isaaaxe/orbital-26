import {
  FlatList,
  Linking,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Modal,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import CardItem from "@/components/CardItem";
import { useRouteContext } from "@/context/RouteContext";
import { useAuthContext } from "@/context/AuthContext";
import * as ExpoLocation from "expo-location";
import { useEffect, useCallback, useState } from "react";
import { Alert } from "react-native";

// import { sampleLocations, recentlyVisitedLocations, sampleSavedLocations } from "../data/sampleLocations";
// import type { RoutePlace } from "@/context/RouteContext";
import {
  useDeleteSavedLocationMutation,
  useSavedLocations,
  useSaveLocationMutation,
} from "@/hook/useLocations";
import {
  useRecentlyVisitedQuery,
  deleteRecentlyVisitedMutation,
  clearRecentlyVisitedMutation,
} from "@/hook/useUser";
import { useClosestNodeMutation } from "@/hook/useRoute";
import { LocationDetail } from "@/api_debug/locations.logged";
import { useGetLocationDetails } from "@/hook/useLocations";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { icons } from "../data/loadIcons";

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  bodyView: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  h3: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  loadingBox: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
  },
  mutedText: {
    fontSize: 14,
    color: "#666",
    paddingVertical: 8,
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

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
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
});
// const MOCK_TOKEN = "mock-token";

export default function Index() {
  //settle react stuff first
  const { user, token } = useAuthContext();
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const {
    userSearch,
    setUserSearch,
    origin,
    setOrigin,
    setDestination,
    setSelectedRoute,
  } = useRouteContext();
  //to be implemented
  const {
    data: recentlyVisited,
    isLoading: isLoadingRecentlyVisited,
    error: errorRecentlyVisited,
  } = useRecentlyVisitedQuery(token);

  const closestNodeMutation = useClosestNodeMutation();
  const deleteRecentMutation = deleteRecentlyVisitedMutation(token);
  const clearRecentMutation = clearRecentlyVisitedMutation(token);

  const {
    savedLocations,
    isLoading: savedIsLoading,
    error: savedError,
    isLocationSaved,
  } = useSavedLocations(token);

  const [detailLocationId, setDetailLocationId] = useState<string | null>(null);
  const {
    data: locDetail,
    isFetching: locDetailLoading,
    error: locDetailError,
  } = useGetLocationDetails(detailLocationId);
  //

  function handleSearch(input: string) {
    setUserSearch(input);
    router.push("/searchRoute?mode=destination");
  }

  function handleSetCurrLocation() {
    // to be able to manually set origin next time, too complicated to do now
    // router.push("/selectOrigin")
    router.push("/searchRoute?mode=origin");
  }

  function handleSetDestination(location_id: string) {
    if (origin == null) {
      Alert.alert("Please enable your current location");
      return;
    }
    if (location_id == origin.nearest_node.node_id) {
      Alert.alert(
        "Please choose a destination that is different from your starting point",
      );
      return;
    }
    //think i need to get location detail sigh
    setDetailLocationId(location_id);
  }

  useEffect(() => {
    if (!locDetail) return;
    if (!origin) return;

    setDestination(locDetail);
    setDetailLocationId(null);
    router.push("/chooseRoute");
  }, [locDetail]);

  //asking for location data
  async function getCurrentLocation() {
    const permission = await ExpoLocation.requestForegroundPermissionsAsync();

    if (permission.status !== "granted") {
      console.log("Permission denied");

      if (!permission.canAskAgain) {
        console.log("User must enable location manually in settings");
        // lead them to settings
        Linking.openSettings();
      }
      return false;
    }

    const currentLocation = await ExpoLocation.getCurrentPositionAsync({
      accuracy: ExpoLocation.Accuracy.High,
    });
    const closestNode = await closestNodeMutation.mutateAsync({
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
      floor: 1,
    });
    console.log(closestNode);
    setOrigin({
      ...closestNode,
    });
    return true;
  }

  //recently visited stuff
  function renderDeleteAction(location_id: string) {
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() =>
          deleteRecentMutation.mutate({
            location_id: location_id,
          })
        }
      >
        <Text style={styles.deleteText}>X</Text>
      </TouchableOpacity>
    );
  }

  useEffect(() => {
    async function loadCurrentLocation() {
      try {
        setIsLocationLoading(true);
        await getCurrentLocation();
      } catch (error) {
        console.log("failed to get current location");
      } finally {
        setIsLocationLoading(false);
      }
    }
    loadCurrentLocation();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setSelectedRoute(null);
      setDestination(null);
    }, []),
  );

  //handling saving and deleting location
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  // const [clearRecentModalVisible, setClearRecentModalVisible] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [savePurpose, setSavePurpose] = useState("");
  const saveLocationMutation = useSaveLocationMutation(token);
  const deleteSavedLocationMutation = useDeleteSavedLocationMutation(token);

  function handleToggleSaveLocation(locationId: string, isSaved: boolean) {
    if (isSaved) {
      deleteSavedLocationMutation.mutate(locationId);
    } else {
      setSelectedLocationId(locationId);
      handleOpenSaveBubble();
      // saveLocationMutation.mutate(locationId);
    }
  }
  //handling modal for saving locations

  function handleOpenSaveBubble() {
    setSaveModalVisible(true);
  }

  function handleSave() {
    saveLocationMutation.mutate({
      locationId: selectedLocationId,
      purpose: savePurpose,
    });
    setSelectedLocationId("");
    setSavePurpose("");
  }

  //loading
  const isMutationLoading =
    saveLocationMutation.isPending ||
    deleteSavedLocationMutation.isPending ||
    deleteRecentMutation.isPending ||
    clearRecentMutation.isPending ||
    locDetailLoading;

  const loadingMessage = saveLocationMutation.isPending
    ? "Saving location..."
    : deleteSavedLocationMutation.isPending
      ? "Removing saved location..."
      : deleteRecentMutation.isPending
        ? "Deleting recently visited location..."
        : clearRecentMutation.isPending
          ? "Clearing recently visited locations..."
          : locDetailLoading
            ? "Fetching location details..."
            : isLocationLoading
              ? "Fetching current location..."
              : "Loading...";

  return (
    <View style={styles.screen}>
      <SafeAreaView style={{ flex: 1 }}>
        <Header
          text={"Routes@NUS"}
          description={"Campus routing with ETA, buses and indoor levels"}
        />
        {/* somewhere here add a small text welcome back xxx unless its guest, then ask for them to sign in */}
        {user && (
          <View style={{ marginLeft: 20, marginBottom: 8 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "400",
                color: "grey",
              }}
            >
              Welcome back, {user.username}!
            </Text>
          </View>
        )}
        {/* Search bar */}
        <SearchBar
          searchContent={userSearch}
          onSearch={handleSearch}
          onChangeText={setUserSearch}
        />

        {/* Automatic starting point but it should be selectable as well */}
        {/* Quick Destinations, common areas people navigate to, we can keep this fixed for now */}
        <View style={styles.bodyView}>
          <Text style={styles.h3}>Starting Point</Text>
          <CardItem
            mainIcon={icons.location}
            cardTitle={
              closestNodeMutation.isPending
                ? "Finding your current location..."
                : origin == null
                  ? "Please select a location to navigate from"
                  : origin.nearest_node.name
            }
            cardSubtitle=""
            onPress={handleSetCurrLocation}
          />
        </View>
        {/* Recently Visited */}
        {!token && (
          <View
            style={{
              marginHorizontal: 20,
            }}
          >
            <Text>
              Sign up/log in to save your frequently visited destinations!
            </Text>
          </View>
        )}
        {token && (
          <>
            <View style={styles.bodyView}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={styles.h3}>Recently Visited</Text>
                {recentlyVisited && recentlyVisited.length > 0 && (
                  <TouchableOpacity
                    onPress={() => clearRecentMutation.mutate()}
                  >
                    <Text style={{ color: "#DC2626", fontWeight: "700" }}>
                      Clear
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              {isLoadingRecentlyVisited ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator />
                  <Text style={styles.loadingText}>
                    Loading recently visited locations...
                  </Text>
                </View>
              ) : errorRecentlyVisited ? (
                <Text style={styles.mutedText}>
                  Failed to load recently visited locations.
                </Text>
              ) : !recentlyVisited || recentlyVisited.length === 0 ? (
                <Text style={styles.mutedText}>
                  No recently visited locations yet.
                </Text>
              ) : (
                <FlatList
                  data={recentlyVisited}
                  extraData={savedLocations}
                  keyExtractor={(item) => `recent-${item.recent_id}`}
                  renderItem={({ item }) => {
                    return (
                      <View style={styles.outerSwipeWrapper}>
                        <View style={styles.clipWrapper}>
                          <ReanimatedSwipeable
                            renderRightActions={() =>
                              renderDeleteAction(item.location_id)
                            }
                            rightThreshold={40}
                            overshootRight
                          >
                            <View style={styles.cardFix}>
                              <CardItem
                                mainIcon={
                                  icons[item.location_type] ?? icons.no_image
                                }
                                cardTitle={item.name}
                                cardSubtitle={
                                  item.description ? item.description : ""
                                }
                                onPress={() =>
                                  handleSetDestination(item.location_id)
                                }
                                saveable
                                isSaved={isLocationSaved(item.location_id)}
                                onSavePress={() =>
                                  handleToggleSaveLocation(
                                    item.location_id,
                                    isLocationSaved(item.location_id),
                                  )
                                }
                              />
                            </View>
                          </ReanimatedSwipeable>
                        </View>
                      </View>
                    );
                  }}
                />
              )}
            </View>
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
                        setSelectedLocationId("");
                        setSavePurpose("");
                      }}
                    >
                      <Text style={styles.modalCancelText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.modalSaveButton}
                      onPress={() => {
                        setSaveModalVisible(false);
                        handleSave();
                      }}
                    >
                      <Text style={styles.modalSaveText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
            <Modal visible={isMutationLoading} transparent animationType="fade">
              <View style={styles.loadingModalOverlay}>
                <View style={styles.loadingModalBox}>
                  <ActivityIndicator size="large" />
                  <Text style={styles.loadingModalText}>{loadingMessage}</Text>
                </View>
              </View>
            </Modal>
          </>
        )}
      </SafeAreaView>
    </View>
  );
}
