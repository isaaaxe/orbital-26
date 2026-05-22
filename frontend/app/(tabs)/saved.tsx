import CardItem from "@/components/CardItem";
import Header from "@/components/Header";
import { View, Text, StyleSheet, FlatList, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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


    function handleSelect() {
        console.log("To be implemented...")
    }




    // sample data
    const DATA = [
        {icon: icons.no_image, cardTitle: "Placeholder title", cardSubtitle: "Placeholder description"},
        {icon: icons.no_image, cardTitle: "Placeholder title", cardSubtitle: "Placeholder description"},
        {icon: icons.no_image, cardTitle: "Placeholder title", cardSubtitle: "Placeholder description"},
        {icon: icons.no_image, cardTitle: "Placeholder title", cardSubtitle: "Placeholder description"},
        {icon: icons.no_image, cardTitle: "Placeholder title", cardSubtitle: "Placeholder description"},
        {icon: icons.no_image, cardTitle: "Placeholder title", cardSubtitle: "Placeholder description"},
        {icon: icons.no_image, cardTitle: "Placeholder title", cardSubtitle: "Placeholder description"},
        {icon: icons.no_image, cardTitle: "Placeholder title", cardSubtitle: "Placeholder description"},
        {icon: icons.no_image, cardTitle: "Placeholder title", cardSubtitle: "Placeholder description"},
        {icon: icons.no_image, cardTitle: "Placeholder title", cardSubtitle: "Placeholder description"},
        {icon: icons.no_image, cardTitle: "Placeholder title", cardSubtitle: "Placeholder description"},
        {icon: icons.no_image, cardTitle: "Placeholder title", cardSubtitle: "Placeholder description"},
        {icon: icons.no_image, cardTitle: "Placeholder title", cardSubtitle: "Placeholder description"},
        {icon: icons.no_image, cardTitle: "Placeholder title", cardSubtitle: "Placeholder description"},
    ]

    const DATA_EMPTY = [

    ]
    // when selecting, need 
    return <View style={styles.screen}>
    <SafeAreaView>
        <Header text={"Saved Routes"} description="Routes that you frequently use"/>

        {DATA.length === 0 ? 
        <View>
            <Text>Start saving some routes to be displayed here!</Text>
        </View> :
            <FlatList
                style={styles.savedListView}
                data={DATA}
                renderItem={({item})=><CardItem icon={item.icon} cardTitle={item.cardTitle} cardSubtitle={item.cardSubtitle} onPress={handleSelect}/>}
            />}
    </SafeAreaView>
    </View>
}