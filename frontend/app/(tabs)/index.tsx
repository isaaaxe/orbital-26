import { Linking, StyleSheet, Text, TouchableHighlight, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import CardItem from "@/components/CardItem";
import ChipList from "@/components/ChipList";
import { useRouteContext } from "@/context/RouteContext";
import { useAuthContext } from "@/context/AuthContext";
import * as Location from "expo-location"
import { useEffect } from "react";
import { Alert } from "react-native";



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
      }
    }
  )

export default function Index() {

  // const {user} = useAuthContext()
  const { userSearch,setUserSearch, origin, setOrigin } = useRouteContext();
  const icons = {
    location: require("../../assets/icons/location.png"),
    star: require("../../assets/icons/star.png"),

  }

  const toSearchPage = () => {
    router.push("/searchRoute")
  }

  function handleSearch(input: string) {
    setUserSearch(input)
    router.push("/searchRoute")
    console.log(input);
  }

  function handleSetCurrLocation() {
    // to be able to manually set origin next time, too complicated to do now
    // router.push("/selectOrigin")
    getCurrentLocation()
  }

  function onSearch(input: string) {
    console.log(input);
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

    setOrigin({
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
      name: "Current Location"
    })
  }
  useEffect(() => {
    getCurrentLocation()
  },[])


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
          icon={icons.location}
          cardTitle={origin == null ? "Please select a location to navigate from" : origin.name}
          cardSubtitle=""
          onPress={handleSetCurrLocation}
        />
        <Text style={styles.h3}>Recently Visited</Text>
        {/* will prob have to set the chiplist props here? */}
        <ChipList />
        
      </View>
      {/* Favourites */}
      <View style={styles.bodyView}>
        <Text style={styles.h3}>Favourites</Text>
        {/* sample data, convert to scrollview later */}
        <CardItem 
          icon={icons.star}
          cardTitle="COM1-02-12"
          cardSubtitle="Description"
          onPress={origin ? () => handleSearch("COM1-02-12"): ()=>Alert.alert("Please enable your current location")}
        />
        <CardItem 
          icon={icons.star}
          cardTitle="Central Libary"
          cardSubtitle="Description"
          onPress={origin ? () => handleSearch("Central Library"): ()=>Alert.alert("Please enable your current location")}
          />
      </View>
    </SafeAreaView>
    </View>
  );
}
