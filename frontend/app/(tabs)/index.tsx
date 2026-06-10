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
  useRecentlyVisitedQuery,
  useSavedLocations,
  useSavedLocationsQuery,
  useSaveLocationMutation,
} from "@/hook/useLocations";
import { useClosestNodeMutation } from "@/hook/useRoute";
import { Location } from "@/api/locations";

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
});
// const MOCK_TOKEN = "mock-token";

export default function Index() {
  const { user } = useAuthContext();
  const {
    userSearch,
    setUserSearch,
    origin,
    setOrigin,
    setDestination,
    setSelectedRoute,
  } = useRouteContext();
  //to be implemented
  // const {
  //   data: recentlyVisited,
  //   isLoading: isLoadingRecentlyVisited,
  //   error: errorRecentlyVisited,
  // } = useRecentlyVisitedQuery(user?.user_id);
  const {
    data: savedData,
    isLoading: isLoadingSaved,
    refetch: refetchSavedLocations,
  } = useSavedLocationsQuery(user?.user_id);
  const closestNodeMutation = useClosestNodeMutation();

  //to be implemented
  // const recentlyVisitedLocations = recentlyVisited?.recentLocations ?? [];
  const savedLocations = savedData ?? [];

  const savedLocationIds = new Set(
    savedLocations.map((loc) => loc.location_id),
  );

  const icons = {
    location: require("../../assets/icons/location.png"),
    star: require("../../assets/icons/star.png"),
    no_img: require("../../assets/icons/no_image.png"),
  };

  function handleSearch(input: string) {
    setUserSearch(input);
    router.push("/searchRoute");
  }

  function handleSetCurrLocation() {
    // to be able to manually set origin next time, too complicated to do now
    // router.push("/selectOrigin")
    getCurrentLocation();
  }

  function handleSetDestination(location: Location) {
    if (origin == null) {
      Alert.alert("Please enable your current location");
      return;
    }
    if (location.id == origin.nearest_node.node_id) {
      Alert.alert(
        "Please choose a destination that is different from your starting point",
      );
      return;
    }
    setDestination(location);
    router.push("/chooseRoute");
  }

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
      return;
    }

    const currentLocation = await ExpoLocation.getCurrentPositionAsync({
      accuracy: ExpoLocation.Accuracy.High,
    });
    // send a request to find the nearest location to current coords
    // const sampleOrigin = sampleLocations[4]
    const closestNode = await closestNodeMutation.mutateAsync({
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
      floor: 1,
    });
    console.log(closestNode);
    setOrigin({
      ...closestNode,
    });
  }
  useEffect(() => {
    getCurrentLocation();
  }, []);
  useFocusEffect(
    useCallback(() => {
      setSelectedRoute(null);
      setDestination(null);
    }, []),
  );

  //handling saving and deleting location
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [savePurpose, setSavePurpose] = useState("");
  const saveLocationMutation = useSaveLocationMutation(user?.user_id);
  const deleteSavedLocationMutation = useDeleteSavedLocationMutation(
    user?.user_id,
  );

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

  return (
    <View style={styles.screen}>
      <SafeAreaView style={{ flex: 1 }}>
        <Header
          text={"Routes@NUS"}
          description={"Campus routing with ETA, buses and indoor levels"}
        />
        {/* somewhere here add a small text welcome back xxx unless its guest, then ask for them to sign in */}

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
        {!user && (
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
        {user && (
          <View
            style={{ flex: 1, justifyContent: "center", marginHorizontal: 20 }}
          >
            <Text>Recently visited list to be implemented...</Text>
          </View>
        )}
        {/* {user && (
          <>
            <View style={styles.bodyView}>
              <Text style={styles.h3}>Recently Visited</Text>
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
              ) : recentlyVisitedLocations.length === 0 ? (
                <Text style={styles.mutedText}>
                  No recently visited locations yet.
                </Text>
              ) : (
                <FlatList
                  data={recentlyVisitedLocations}
                  extraData={savedLocationIds}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => {
                    const isSaved = savedLocationIds.has(item.id);
                    return (
                      <CardItem
                        mainIcon={icons.no_img}
                        cardTitle={item.name}
                        cardSubtitle={item.description ? item.description : ""}
                        onPress={() => handleSetDestination(item)}
                        saveable
                        isSaved={isSaved}
                        onSavePress={() =>
                          handleToggleSaveLocation(item.id, isSaved)
                        }
                      />
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
          </>
        )} */}
      </SafeAreaView>
    </View>
  );
}
