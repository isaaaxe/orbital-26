import CardItem from "@/components/CardItem";
import Header from "@/components/Header";
import { useRouteContext } from "@/context/RouteContext";
import { Route, router } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// import { sampleSavedLocations } from "../data/sampleLocations";
// import type { RoutePlace } from "@/context/RouteContext";
import {
  useDeleteSavedLocationMutation,
  useGetLocationDetails,
  useSavedLocationsQuery,
} from "@/hook/useLocations";
import { LocationDetail } from "@/api_debug/locations.logged";
import { useAuthContext } from "@/context/AuthContext";
import { useEffect, useState } from "react";

// curr default image should be selected by tag later on?
const icons = {
  no_image: require("../../assets/icons/no_image.png"),
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  savedListView: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  emptyStateContainer: {
    marginHorizontal: 20,
    marginTop: 28,
    padding: 24,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: "#444444",
    textAlign: "center",
    lineHeight: 20,
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

// const MOCK_TOKEN = "mock-token"
export default function SavedPage() {
  const { token } = useAuthContext();
  const { origin, setUserSearch, setDestination } = useRouteContext();
  const { data: savedData, isLoading: isLoadingSaved } =
    useSavedLocationsQuery(token);
  const [detailLocationId, setDetailLocationId] = useState<string | null>(null);
  const {
    data: locDetail,
    isFetching: locDetailLoading,
    error: locDetailError,
  } = useGetLocationDetails(detailLocationId);

  function handleSelect(location_id: string, name: string) {
    setUserSearch(name);
    setDetailLocationId(location_id);
  }

  useEffect(() => {
    if (!locDetail) return;
    if (!origin) {
      Alert.alert("No origin detected", "Please choose a starting point");
    }

    setDestination(locDetail);
    setDetailLocationId(null);
    router.push("/chooseRoute");
  }, [locDetail]);

  const deleteSavedLocationMutation = useDeleteSavedLocationMutation(token);
  const savedLocations = savedData ?? [];

  const isMutationLoading = deleteSavedLocationMutation.isPending;

  const loadingMessage = deleteSavedLocationMutation.isPending
    ? "Removing saved location..."
    : locDetailLoading
      ? "Fetching location details..."
      : "Loading...";

  return (
    <View style={styles.screen}>
      <SafeAreaView>
        <Header
          text={"Saved Destinations"}
          description="Destinations that you frequently visit"
        />
        {!token && (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>
              Sign up/log in to save your frequently visited destinations!
            </Text>
          </View>
        )}
        {token &&
          (isLoadingSaved ? (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>
                Loading saved locations...
              </Text>
            </View>
          ) : savedData?.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>
                Start saving some routes to be displayed here!
              </Text>
            </View>
          ) : (
            <FlatList
              style={styles.savedListView}
              data={savedLocations}
              extraData={savedLocations
                .map((location) => location.location_id)
                .join(",")}
              keyExtractor={(item) => item.location_id}
              renderItem={({ item }) => (
                <CardItem
                  mainIcon={icons.no_image}
                  cardTitle={item.name}
                  cardSubtitle={item.purpose ? item.purpose : ""}
                  onPress={() => handleSelect(item.location_id, item.name)}
                  saveable
                  isSaved
                  onSavePress={() =>
                    deleteSavedLocationMutation.mutate(item.location_id)
                  }
                />
              )}
            />
          ))}
      </SafeAreaView>
      <Modal visible={isMutationLoading} transparent animationType="fade">
        <View style={styles.loadingModalOverlay}>
          <View style={styles.loadingModalBox}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingModalText}>{loadingMessage}</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}
