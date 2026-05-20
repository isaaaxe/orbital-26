import { StyleSheet, Text, TouchableHighlight, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import CardItem from "@/components/CardItem";
import ChipList from "@/components/ChipList";

export default function Index() {

  const icons = {
    location: require("../../assets/icons/location.png"),
    star: require("../../assets/icons/star.png"),

  }

  const toSearchPage = () => {
    router.push("/searchRoute")
  }

  function onSearch(input: string) {
    console.log(input);
  }

  const styles = StyleSheet.create(
    {
      screen: {
            flex: 1,
            backgroundColor: "#FFFFFF",
      },
      bodyView: {
        margin: 20,
      },
      h3: {
        fontSize: 16,
        fontWeight: "600"
      }
    }
  )

  return (
    <View style={styles.screen}>
      <SafeAreaView style={{flex: 1}}>  
      <Header text={"Routes@NUS"} description={"Campus routing with ETA, buses and indoor levels"} />
      {/* Search bar */}
      <SearchBar searchContent="" onSearch={onSearch} />
  

      {/* Automatic starting point but it should be selectable as well */}
      {/* Quick Destinations, common areas people navigate to, we can keep this fixed for now */}
      <View style={styles.bodyView}>
        <Text style={styles.h3}>Starting Point</Text>
        <CardItem 
          icon={icons.location}
          cardTitle="UTown Bus Stop"
          cardSubtitle="Current location"
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
        />
        <CardItem 
          icon={icons.star}
          cardTitle="Central Libary"
          cardSubtitle="Description"/>
      </View>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Testing home pageDDD</Text>
        <TouchableHighlight onPress={toSearchPage}><Text>To search</Text></TouchableHighlight>
      </View>
    </SafeAreaView>
    </View>
  );
}
