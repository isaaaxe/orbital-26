import { FlatList, Linking, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import CardItem from "@/components/CardItem";
import { useRouteContext } from "@/context/RouteContext";
import { useAuthContext } from "@/context/AuthContext";
import * as Location from "expo-location"
import { useEffect, useCallback } from "react";
import { Alert } from "react-native";


// import { sampleLocations, recentlyVisitedLocations, sampleSavedLocations } from "../data/sampleLocations";
import type { RoutePlace } from "@/context/RouteContext";
import { useDeleteSavedLocationMutation, useRecentlyVisitedQuery, useSavedLocationsQuery, useSaveLocationMutation } from "@/hook/useLocations";
import { useClosestNodeMutation } from "@/hook/useRoute";

  const styles = StyleSheet.create(
    {
      screen: {
            flex: 1,
            backgroundColor: "#FFFFFF",
      },
      bodyView: {
        marginHorizontal: 20,
        marginBottom:12
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
    }
  )
const MOCK_TOKEN = "mock-token"

export default function Index() {

  // const {user} = useAuthContext()
  const { userSearch,setUserSearch, origin, setOrigin, setDestination } = useRouteContext();
  const {data: recentlyVisited, isLoading: isLoadingRecentlyVisited, error: errorRecentlyVisited} = useRecentlyVisitedQuery(MOCK_TOKEN)
  const {data: savedData, isLoading: isLoadingSaved, refetch: refetchSavedLocations} = useSavedLocationsQuery(MOCK_TOKEN)
  const closestNodeMutation = useClosestNodeMutation();

  const recentlyVisitedLocations = recentlyVisited?.recentLocations?? [];
  const savedLocations = savedData?.savedLocations ?? [];

  const savedLocationIds = new Set(savedLocations.map((loc)=> loc.id))

  const icons = {
    location: require("../../assets/icons/location.png"),
    star: require("../../assets/icons/star.png"),
    no_img: require("../../assets/icons/no_image.png")
  }

  function handleSearch(input : string) {
    setUserSearch(input)
    router.push("/searchRoute")
  }

  function handleSetCurrLocation() {
    // to be able to manually set origin next time, too complicated to do now
    // router.push("/selectOrigin")
    getCurrentLocation()
  }

  function handleSetDestination(location: RoutePlace) {
    if (origin == null) {
      Alert.alert("Please enable your current location")
      return;
    }
    if (location.id == origin.id) {
      Alert.alert("Please choose a destination that is different from your starting point")
      return;
    }
    setDestination(location)
    router.push("/chooseRoute")
  }

  //asking for location data
  async function getCurrentLocation() {
    const permission = await Location.requestForegroundPermissionsAsync();

    if (permission.status !== "granted") {
      console.log("Permission denied");

    if (!permission.canAskAgain) {
      console.log("User must enable location manually in settings");
      // lead them to settings
      Linking.openSettings()
    }
      return;
    }

    const currentLocation = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    // send a request to find the nearest location to current coords
    // const sampleOrigin = sampleLocations[4]
    const closestNode = await closestNodeMutation.mutateAsync({
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude
    })
    setOrigin({name: closestNode.name, latitude: closestNode.latitude, longitude: closestNode.longitude, id: closestNode.id})
  }
  useEffect(() => {
    getCurrentLocation()
  },[])


  //handling saving and deleting location
  const saveLocationMutation = useSaveLocationMutation(MOCK_TOKEN)
  const deleteSavedLocationMutation = useDeleteSavedLocationMutation(MOCK_TOKEN)

  function handleToggleSaveLocation(locationId: string, isSaved: boolean) {
    if (isSaved) {
      deleteSavedLocationMutation.mutate(locationId)
    } else {
      saveLocationMutation.mutate(locationId)
    }
  }

  // useFocusEffect(
  //   useCallback(()=> {
  //     refetchSavedLocations()
  //   }, [refetchSavedLocations])
  // )

  return (
    <View style={styles.screen}>
      <SafeAreaView style={{flex: 1}}>  
      <Header text={"Routes@NUS"} description={"Campus routing with ETA, buses and indoor levels"} />
      {/* somewhere here add a small text welcome back xxx unless its guest, then ask for them to sign in */}

      {/* Search bar */}
      <SearchBar searchContent={userSearch} onSearch={handleSearch} onChangeText={setUserSearch} />
  

      {/* Automatic starting point but it should be selectable as well */}
      {/* Quick Destinations, common areas people navigate to, we can keep this fixed for now */}
      <View style={styles.bodyView}>
        <Text style={styles.h3}>Starting Point</Text>
        <CardItem 
          mainIcon={icons.location}
          cardTitle={closestNodeMutation.isPending ? "Finding your current location..."
                    : origin == null ? "Please select a location to navigate from" : origin.name}
          cardSubtitle=""
          onPress={handleSetCurrLocation}
        />
        
      </View>
      {/* Recently Visited */}
      <View style={styles.bodyView}>
        <Text style={styles.h3}>Recently Visited</Text>
        {/* sample data, convert to scrollview later */}
        {isLoadingRecentlyVisited ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator />
            <Text style={styles.loadingText}>Loading recently visited locations...</Text>
          </View>
        ) : errorRecentlyVisited ? (
          <Text style={styles.mutedText}>
            Failed to load recently visited locations.
          </Text>
        ) : recentlyVisitedLocations.length === 0 ? (
          <Text style={styles.mutedText}>
            No recently visited locations yet.
          </Text>
        ) : (<FlatList 
          data={recentlyVisitedLocations}
          extraData={savedLocationIds}
          keyExtractor={(item)=>item.id}
          renderItem={({item})=> {
          const isSaved = savedLocationIds.has(item.id)
          return (<CardItem mainIcon={icons.no_img} 
                  cardTitle={item.name} 
                  cardSubtitle={item.description ? item.description : ""}
                  onPress={() => handleSetDestination(item)}
                  saveable
                  isSaved={isSaved}
                  onSavePress={() => handleToggleSaveLocation(item.id, isSaved)}
            />)}}
        
        />)}
      </View>
    </SafeAreaView>
    </View>
  );
}
