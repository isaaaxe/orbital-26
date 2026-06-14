import CardItem from "@/components/CardItem";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import StylisedButton from "@/components/StylisedButton";
import { useRouteContext } from "@/context/RouteContext";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useDeleteSavedLocationMutation,
  useLocationSearchQuery,
  useSavedLocations,
  useSaveLocationMutation,
} from "@/hook/useLocations";
import { useAuthContext } from "@/context/AuthContext";
import { useDebounce } from "@/hook/useDebounce";
import BackButton from "@/components/BackButton";
import { useLocalSearchParams } from "expo-router";
import type { Location } from "@/api_debug/locations.logged";
import * as ExpoLocation from "expo-location";
import { useClosestNodeMutation } from "@/hook/useRoute";
import { useGetLocationDetails } from "@/hook/useLocations";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  message: {
    marginHorizontal: 20,
    marginTop: 12,
    color: "#666",
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  loadingItem: {
    alignItems: "center",
  },
  mapSection: {
    flex: 2,
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#eee",
  },
  listSection: {
    flex: 3,
    marginTop: 12,
  },
});

export default function SearchRoute() {
  const { user, token } = useAuthContext();
  const {
    userSearch,
    setUserSearch,
    destination,
    setDestination,
    origin,
    setOrigin,
  } = useRouteContext();
  const query = useDebounce(userSearch, 1000);
  const {
    data: searchData,
    isLoading: isSearching,
    error: searchError,
  } = useLocationSearchQuery(query);

  const {
    savedLocations,
    isLoading: savedIsLoading,
    error: savedError,
    isLocationSaved,
  } = useSavedLocations(token);
  const closestNodeMutation = useClosestNodeMutation();
  const getLocationQuery = useGetLocationDetails();
  const locations = searchData ?? [];

  const searchLocationIds = new Set(locations.map((loc) => loc.id));
  const { mode } = useLocalSearchParams<{ mode: "origin" | "destination" }>();
  const isOriginMode = mode === "origin";
  const [selectItem, setSelectItem] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function handleSearch() {
    if (isOriginMode) {
      //origin mode
      if (selectItem == null) {
        Alert.alert(
          "Please enable your location or select a location to start from.",
        );
      } else if (searchLocationIds.has(selectItem.id)) {
        //need to fetch item
        setOrigin(null);
        router.back();
      } else {
        //i dont think this is currently possible but just in case
        Alert.alert("Please choose one of the currently listed destinations");
      }
    } else {
      //destination mode
      if (origin == null) {
        Alert.alert(
          "Please enable your location or select a location to start from.",
          "",
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ],
          {
            cancelable: true,
            onDismiss: () => router.back(),
          },
        );

        return;
      }
      if (destination == null) {
        Alert.alert("Please select a destination");
        return;
      }
      if (origin.nearest_node.node_id == destination.id) {
        Alert.alert(
          "Please choose a destination that is different from your starting point",
        );
        return;
      }
      //check if the thing matchy,
      if (searchLocationIds.has(destination.id)) {
        setDestination(selectItem);
        router.push("/chooseRoute");
      } else {
        //i dont think this is currently possible but just in case
        Alert.alert("Please choose one of the currently listed destinations");
      }
    }
  }

  function handleSelect(input: Location) {
    setSelectItem(input);
  }
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
    setIsLoading(true);
    const currentLocation = await ExpoLocation.getCurrentPositionAsync({
      accuracy: ExpoLocation.Accuracy.High,
    });
    const closestNode = await closestNodeMutation.mutateAsync({
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
      floor: 1,
    });
    setOrigin({
      ...closestNode,
    });
    setIsLoading(false);
  }

  const icons = {
    no_image: require("../assets/icons/no_image.png"),
    location: require("../assets/icons/location.png"),
  };

  //handling saving and deleting location
  const saveLocationMutation = useSaveLocationMutation(token);
  const deleteSavedLocationMutation = useDeleteSavedLocationMutation(
    user?.user_id,
  );

  //handle saving locations
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [savePurpose, setSavePurpose] = useState("");
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

  const isMutationLoading =
    saveLocationMutation.isPending || deleteSavedLocationMutation.isPending;

  const loadingMessage = saveLocationMutation.isPending
    ? "Saving location..."
    : deleteSavedLocationMutation.isPending
      ? "Removing saved location..."
      : "Loading...";

  return (
    <View style={styles.screen}>
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Header
            text={"Search destination"}
            description={"Find classrooms, bus stops, and buildings"}
          />
          <View style={{ alignItems: "center", marginRight: 20 }}>
            <BackButton additionalBackCleanUp={() => setUserSearch("")} />
          </View>
        </View>
        {/* another search bar they can alter incase they typed wrongly or smth */}
        {/* actually this onSearch for search should be fuzzy searching things on the catalogue, not supposed to search */}
        <View style={styles.mapSection}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={StyleSheet.absoluteFillObject}
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
            {/* selected marker here */}
          </MapView>
        </View>
        <View style={styles.listSection}>
          <SearchBar
            searchContent={userSearch}
            onSearch={handleSearch}
            onChangeText={(text) => {
              setUserSearch(text);
              setDestination(null);
            }}
          />
          {isSearching && (
            <Text style={styles.message}>Searching locations...</Text>
          )}

          {searchError && (
            <Text style={styles.message}>Failed to search locations</Text>
          )}

          {!isSearching &&
            userSearch.trim().length >= 2 &&
            locations.length === 0 && (
              <Text style={styles.message}>No locations found</Text>
            )}
          <FlatList
            keyExtractor={(item) => item.id}
            data={locations}
            extraData={savedLocations}
            renderItem={({ item }) => {
              return (
                <CardItem
                  mainIcon={icons.no_image}
                  cardTitle={item.name}
                  cardSubtitle={item.description ? item.description : ""}
                  onPress={() => handleSelect(item)}
                  selected={item.name === selectItem?.name}
                  saveable={token !== null}
                  isSaved={isLocationSaved(item.id)}
                  onSavePress={() =>
                    handleToggleSaveLocation(item.id, isLocationSaved(item.id))
                  }
                />
              );
            }}
            style={{ marginHorizontal: 20 }}
          />
          {/* function to choose origin available if there is no search*/}
          {isOriginMode && !locations && (
            <CardItem
              mainIcon={icons.location}
              cardTitle="Current location"
              cardSubtitle="Selects registered place closest to your location"
              onPress={getCurrentLocation}
            />
          )}
          <StylisedButton
            buttonText={
              isOriginMode ? "Choose starting point" : "Choose destination"
            }
            onPress={handleSearch}
          />
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
      </SafeAreaView>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingItem}>
            <ActivityIndicator size="large" />
          </View>
        </View>
      )}
    </View>
  );
}
