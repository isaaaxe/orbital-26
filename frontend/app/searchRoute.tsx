import CardItem from "@/components/CardItem";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import StylisedButton from "@/components/StylisedButton";
import { useRouteContext } from "@/context/RouteContext";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, FlatList, StyleSheet, Text, TouchableHighlight, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { sampleLocations } from "./data/sampleLocations";


const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
})

export default function SearchRoute() {
    const {userSearch, setUserSearch, searchDestination , setSearchDestination} = useRouteContext();

    function handleSearch() {
        //check if the thing matchy, 
        if (userSearch == searchDestination) {
            //do smth the searchDestination
            router.push("/chooseRoute")
        } else {
            Alert.alert("Please choose one of the listed destinations")
        }
    }

    function handleSelect(input: string) {
        setUserSearch(input)
        setSearchDestination(input)
    }

    //on hold until i find out how to force a selection
    // function handleChangeText(input : string) {
    //     setSearchDestination(input)
    // }
    
    const icons = {
        no_image : require("../assets/icons/no_image.png")
    }
    
    // // sample potential reslts
    // const SEARCH_RESULTS = [
    //     {icon: icons.no_image, cardTitle: "COM1-02-20", cardSubtitle: "Placeholder Subtitle", id: 1},
    //     {icon: icons.no_image, cardTitle: "COM1-02-21", cardSubtitle: "Placeholder Subtitle", id: 2},
    //     {icon: icons.no_image, cardTitle: "COM1-02-22", cardSubtitle: "Placeholder Subtitle", id: 3},
    //     {icon: icons.no_image, cardTitle: "COM1-02-23", cardSubtitle: "Placeholder Subtitle", id: 4},
    //     {icon: icons.no_image, cardTitle: "COM1-02-24", cardSubtitle: "Placeholder Subtitle", id: 5},
    //     {icon: icons.no_image, cardTitle: "COM1-02-25", cardSubtitle: "Placeholder Subtitle", id: 6},
    //     {icon: icons.no_image, cardTitle: "COM1-02-26", cardSubtitle: "Placeholder Subtitle", id: 7},
    //     {icon: icons.no_image, cardTitle: "COM1-02-22", cardSubtitle: "Placeholder Subtitle", id: 8},
    //     {icon: icons.no_image, cardTitle: "COM1-02-28", cardSubtitle: "Placeholder Subtitle", id: 9},
    //     {icon: icons.no_image, cardTitle: "COM1-02-29", cardSubtitle: "Placeholder Subtitle", id: 10},
    // ]
    

    return <View style={styles.screen}>
        <SafeAreaView style={{flex: 1}}>
            <Header text={"Search destination"} description={"Find classrooms, bus stops, and buildings"}/>
            {/* another search bar they can alter incase they typed wrongly or smth */}
            {/* actually this onSearch for search should be fuzzy searching things on the catalogue, not supposed to search */}
            <SearchBar searchContent={userSearch} onSearch={handleSearch} onChangeText={setUserSearch}/>
            <FlatList 
                data={sampleLocations}
                renderItem={({item})=> <CardItem icon={icons.no_image}
                                                cardTitle={item.name}
                                                cardSubtitle={item.description? item.description: ""} 
                                                onPress={() => handleSelect(item.name)} //to be changed to location id in the future 
                                                selected={item.name === userSearch}/>}
                style={{marginHorizontal: 20}}
            />
            <StylisedButton buttonText="Choose destination" onPress={handleSearch} />
            {/* Dont know if i shld include building level */}
        </SafeAreaView>
    </View>
}