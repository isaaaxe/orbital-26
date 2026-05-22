import { StyleSheet, Text, TouchableHighlight, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import CardItem from "@/components/CardItem";
import ChipList from "@/components/ChipList";
import { useRouteContext } from "@/context/RouteContext";



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

  const { setSearchDestination } = useRouteContext();
  const icons = {
    location: require("../../assets/icons/location.png"),
    star: require("../../assets/icons/star.png"),

  }

  const toSearchPage = () => {
    router.push("/searchRoute")
  }

  function handleSearch(input: string) {
    setSearchDestination(input)
    router.push("/searchRoute")
    console.log(input);
  }

  function handleSetCurrLocation() {
    console.log("to be implemented...")
  }

  function onSearch(input: string) {
    console.log(input);
  }

  return (
    <View style={styles.screen}>
      <SafeAreaView style={{flex: 1}}>  
      <Header text={"Routes@NUS"} description={"Campus routing with ETA, buses and indoor levels"} />
      {/* somewhere here add a small text welcome back xxx unless its guest, then ask for them to sign in */}
      
      {/* Search bar */}
      <SearchBar searchContent={""} onSearch={handleSearch} />
  

      {/* Automatic starting point but it should be selectable as well */}
      {/* Quick Destinations, common areas people navigate to, we can keep this fixed for now */}
      <View style={styles.bodyView}>
        <Text style={styles.h3}>Starting Point</Text>
        <CardItem 
          icon={icons.location}
          cardTitle="UTown Bus Stop"
          cardSubtitle="Current location"
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
          onPress={() => handleSearch("COM1-02-12")}
        />
        <CardItem 
          icon={icons.star}
          cardTitle="Central Libary"
          cardSubtitle="Description"
          onPress={() => handleSearch("Central Library")}
          />
      </View>
    </SafeAreaView>
    </View>
  );
}
