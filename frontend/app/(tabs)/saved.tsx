import CardItem from "@/components/CardItem";
import Header from "@/components/Header";
import { useRouteContext } from "@/context/RouteContext";
import { Route, router } from "expo-router";
import { View, Text, StyleSheet, FlatList, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// import { sampleSavedLocations } from "../data/sampleLocations";
import type { RoutePlace } from "@/context/RouteContext";
import { useDeleteSavedLocationMutation, useSavedLocationsQuery } from "@/hook/useLocations";

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
})

const MOCK_TOKEN = "mock-token"

export default function SavedPage() {
    const {setUserSearch,setDestination} = useRouteContext()
    const {data: savedData, isLoading: isLoadingSaved} = useSavedLocationsQuery(MOCK_TOKEN)

    function handleSelect(input : RoutePlace) {
        setUserSearch(input.name)
        setDestination(input)
        router.push("/chooseRoute")
    }

    const deleteSavedLocationMutation = useDeleteSavedLocationMutation(MOCK_TOKEN)
    const savedLocations = savedData?.savedLocations ?? []


    return <View style={styles.screen}>
    <SafeAreaView>
        <Header text={"Saved Destinations"} description="Destinations that you frequently visit"/>

        {savedData?.savedLocations.length === 0 ? 
        <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>Start saving some routes to be displayed here!</Text>
        </View> :
            <FlatList
                style={styles.savedListView}
                data={savedLocations}
                extraData={savedLocations.map((location) => location.id).join(",")}
                keyExtractor={(item)=>item.id}
                renderItem={({item})=><CardItem mainIcon={icons.no_image} 
                                                cardTitle={item.name} 
                                                cardSubtitle={item.description ? item.description : ""} 
                                                onPress={() => handleSelect(item)}
                                                saveable
                                                isSaved
                                                onSavePress={() => deleteSavedLocationMutation.mutate(item.id)}
                                                />}
            />}
    </SafeAreaView>
    </View>
}