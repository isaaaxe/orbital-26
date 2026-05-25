import CardItem from "@/components/CardItem";
import Header from "@/components/Header";
import { useRouteContext } from "@/context/RouteContext";
import { router } from "expo-router";
import { View, Text, StyleSheet, FlatList, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { sampleSavedLocations } from "../data/sampleLocations";

// curr default image should be selected by tag later on?
const icons = {
    no_image : require("../../assets/icons/no_image.png")
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    savedListView: {
        marginHorizontal: 20,
        marginBottom: 20
    }
})

export default function SavedPage() {
    const {setUserSearch,setSearchDestination} = useRouteContext()

    function handleSelect(input : string) {
        setUserSearch(input)
        setSearchDestination(input)
        router.push("/chooseRoute")
    }

    // sample data
    // const DATA = [
    //     {icon: icons.no_image, cardTitle: "COM1-02-20", cardSubtitle: "Placeholder description", id: 1},
    //     {icon: icons.no_image, cardTitle: "COM1-02-21", cardSubtitle: "Placeholder description", id: 2},
    //     {icon: icons.no_image, cardTitle: "COM1-02-22", cardSubtitle: "Placeholder description", id: 3},
    //     {icon: icons.no_image, cardTitle: "COM1-02-23", cardSubtitle: "Placeholder description", id: 4},
    //     {icon: icons.no_image, cardTitle: "COM1-02-24", cardSubtitle: "Placeholder description", id: 5},
    //     {icon: icons.no_image, cardTitle: "COM1-02-25", cardSubtitle: "Placeholder description", id: 6},
    //     {icon: icons.no_image, cardTitle: "COM1-02-26", cardSubtitle: "Placeholder description", id: 7},
    //     {icon: icons.no_image, cardTitle: "COM1-02-27", cardSubtitle: "Placeholder description", id: 8},
    //     {icon: icons.no_image, cardTitle: "COM1-02-28", cardSubtitle: "Placeholder description", id: 9},
    //     {icon: icons.no_image, cardTitle: "COM1-02-29", cardSubtitle: "Placeholder description", id: 10},
    // ]

    // const DATA_EMPTY = [

    // ]
    // when selecting, need 
    return <View style={styles.screen}>
    <SafeAreaView>
        <Header text={"Saved Routes"} description="Routes that you frequently use"/>

        {sampleSavedLocations.length === 0 ? 
        <View>
            <Text>Start saving some routes to be displayed here!</Text>
        </View> :
            <FlatList
                style={styles.savedListView}
                data={sampleSavedLocations}
                renderItem={({item})=><CardItem icon={icons.no_image} cardTitle={item.name} cardSubtitle={item.description ? item.description : ""} onPress={() => handleSelect(item.name)}/>}
            />}
    </SafeAreaView>
    </View>
}