import { Text, TouchableHighlight, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Header from "@/components/Header";

export default function Index() {


  const toSearchPage = () => {
    router.push("/searchRoute")
  }

  return (<SafeAreaView style={{flex: 1}}>
      <Header text={"Routes@NUS"} description={"Campus routing with ETA, buses and indoor levels"} />
      {/* Search bar */}

      {/* Automatic starting point but it should be selectable as well */}

      {/* Quick Destinations, common areas people navigate to, we can keep this fixed for now */}
      
      {/* Favourites */}
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Testing home page</Text>
        <TouchableHighlight onPress={toSearchPage}><Text>To search</Text></TouchableHighlight>
      </View>
    </SafeAreaView>
  );
}
