import CardItem from "@/components/CardItem";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import StylisedButton from "@/components/StylisedButton";
import { RoutePlace, useRouteContext } from "@/context/RouteContext";
import { router, useNavigation } from "expo-router";
import { useEffect } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useDeleteSavedLocationMutation,
  useLocationSearchQuery,
  useSavedLocationsQuery,
  useSaveLocationMutation,
} from "@/hook/useLocations";

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
});

const MOCK_TOKEN = "mock-token";

export default function SearchRoute() {
  const { userSearch, setUserSearch, destination, setDestination, origin } =
    useRouteContext();
  const {
    data: searchData,
    isLoading: isSearching,
    error: searchError,
  } = useLocationSearchQuery(userSearch);
  const { data: savedData, isLoading: isLoadingSaved } =
    useSavedLocationsQuery(MOCK_TOKEN);

  const locations = searchData?.locations ?? [];
  const savedLocations = savedData?.savedLocations ?? [];

  const savedLocationIds = new Set(savedLocations.map((loc) => loc.id));
  const searchLocationIds = new Set(locations.map((loc) => loc.id));

  const navigation = useNavigation();

  function handleSearch() {
    //check if origin and destination are the same
    if (origin == null || destination == null) {
      return;
    }
    if (origin.id == destination.id) {
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

  function handleSelect(input: RoutePlace) {
    setDestination(input);
  }

  const icons = {
    no_image: require("../assets/icons/no_image.png"),
  };

  //handling saving and deleting location
  const saveLocationMutation = useSaveLocationMutation(MOCK_TOKEN);
  const deleteSavedLocationMutation =
    useDeleteSavedLocationMutation(MOCK_TOKEN);

  function handleToggleSaveLocation(locationId: string, isSaved: boolean) {
    if (isSaved) {
      deleteSavedLocationMutation.mutate(locationId);
    } else {
      saveLocationMutation.mutate(locationId);
    }
  }

  // useEffect(() => {
  //     const unsubscribe = navigation.addListener("beforeRemove", () => {
  //         setDestination(null)
  //     });

  //     return unsubscribe;
  // }, [navigation]);

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
                saveable
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
      </SafeAreaView>
    </View>
  );
}
