import CardItem from "@/components/CardItem";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import StylisedButton from "@/components/StylisedButton";
import { useRouteContext } from "@/context/RouteContext";
import { router, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useDeleteSavedLocationMutation,
  useLocationSearchQuery,
  useSavedLocationsQuery,
  useSaveLocationMutation,
} from "@/hook/useLocations";
import { Location } from "@/api/locations";
import { useAuthContext } from "@/context/AuthContext";

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
});

// const MOCK_TOKEN = "mock-token";

export default function SearchRoute() {
  const { user } = useAuthContext();
  const { userSearch, setUserSearch, destination, setDestination, origin } =
    useRouteContext();
  const {
    data: searchData,
    isLoading: isSearching,
    error: searchError,
  } = useLocationSearchQuery(userSearch);
  console.log(searchData);
  const { data: savedData, isLoading: isLoadingSaved } = useSavedLocationsQuery(
    user?.user_id,
  );

  const locations = searchData ?? [];
  const savedLocations = savedData ?? [];

  const savedLocationIds = new Set(
    savedLocations.map((loc) => loc.location_id),
  );
  const searchLocationIds = new Set(locations.map((loc) => loc.id));

  const navigation = useNavigation();

  function handleSearch() {
    //check if origin and destination are the same
    if (origin == null || destination == null) {
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
      router.push("/chooseRoute");
    } else {
      //i dont think this is currently possible but just in case
      Alert.alert("Please choose one of the currently listed destinations");
    }
  }

  function handleSelect(input: Location) {
    setDestination(input);
  }

  const icons = {
    no_image: require("../assets/icons/no_image.png"),
  };

  //handling saving and deleting location
  const saveLocationMutation = useSaveLocationMutation(user?.user_id);
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

  return (
    <View style={styles.screen}>
      <SafeAreaView style={{ flex: 1 }}>
        <Header
          text={"Search destination"}
          description={"Find classrooms, bus stops, and buildings"}
        />
        {/* another search bar they can alter incase they typed wrongly or smth */}
        {/* actually this onSearch for search should be fuzzy searching things on the catalogue, not supposed to search */}
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
          extraData={savedLocationIds}
          renderItem={({ item }) => {
            const isSaved = savedLocationIds.has(item.id);
            return (
              <CardItem
                mainIcon={icons.no_image}
                cardTitle={item.name}
                cardSubtitle={item.description ? item.description : ""}
                onPress={() => handleSelect(item)}
                selected={item.name === destination?.name}
                saveable={user !== null}
                isSaved={isSaved}
                onSavePress={() => handleToggleSaveLocation(item.id, isSaved)}
              />
            );
          }}
          style={{ marginHorizontal: 20 }}
        />
        <StylisedButton
          buttonText="Choose destination"
          onPress={handleSearch}
        />
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
      </SafeAreaView>
    </View>
  );
}
