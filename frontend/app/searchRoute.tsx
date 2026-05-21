import CardItem from "@/components/CardItem";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import StylisedButton from "@/components/StylisedButton";
import { useRouteContext } from "@/context/RouteContext";
import { router } from "expo-router";
import { FlatList, Text, TouchableHighlight, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SearchRoute() {
    const { setSearchDestination, searchDestination } = useRouteContext();

    function handleSearch(input: string) {
        setSearchDestination(input)
    }

    const icons = {
        no_image : require("../assets/icons/no_image.png")
    }
    const toChooseRoute = () => {
        router.push("/chooseRoute")
    }
    
    // sample potential reslts
    const SEARCH_RESULTS = [
        {icon: icons.no_image, cardTitle: "Placeholder Title", cardSubtitle: "Placeholder Subtitle", onPress: toChooseRoute},
        {icon: icons.no_image, cardTitle: "Placeholder Title", cardSubtitle: "Placeholder Subtitle", onPress: toChooseRoute},
        {icon: icons.no_image, cardTitle: "Placeholder Title", cardSubtitle: "Placeholder Subtitle", onPress: toChooseRoute},
        {icon: icons.no_image, cardTitle: "Placeholder Title", cardSubtitle: "Placeholder Subtitle", onPress: toChooseRoute},
        {icon: icons.no_image, cardTitle: "Placeholder Title", cardSubtitle: "Placeholder Subtitle", onPress: toChooseRoute},
        {icon: icons.no_image, cardTitle: "Placeholder Title", cardSubtitle: "Placeholder Subtitle", onPress: toChooseRoute},
        {icon: icons.no_image, cardTitle: "Placeholder Title", cardSubtitle: "Placeholder Subtitle", onPress: toChooseRoute},
        {icon: icons.no_image, cardTitle: "Placeholder Title", cardSubtitle: "Placeholder Subtitle", onPress: toChooseRoute},
        {icon: icons.no_image, cardTitle: "Placeholder Title", cardSubtitle: "Placeholder Subtitle", onPress: toChooseRoute},
        {icon: icons.no_image, cardTitle: "Placeholder Title", cardSubtitle: "Placeholder Subtitle", onPress: toChooseRoute},
        {icon: icons.no_image, cardTitle: "Placeholder Title", cardSubtitle: "Placeholder Subtitle", onPress: toChooseRoute},
        {icon: icons.no_image, cardTitle: "Placeholder Title", cardSubtitle: "Placeholder Subtitle", onPress: toChooseRoute},
    ]

    return <SafeAreaView style={{flex: 1}}>
            <Header text={"Search destination"} description={"Find classrooms, bus stops, and buildings"}/>
            {/* another search bar they can alter incase they typed wrongly or smth */}
            <SearchBar searchContent={searchDestination} onSearch={handleSearch}/>
            {/* Results list: Scrollable element */}
            <FlatList 
                data={SEARCH_RESULTS}
                renderItem={({item})=> <CardItem icon={item.icon} cardTitle={item.cardTitle} cardSubtitle={item.cardSubtitle} onPress={item.onPress}/>}
                style={{marginHorizontal: 20}}
            />
            <StylisedButton buttonText="Choose route" onPress={toChooseRoute} />
            {/* Dont know if i shld include building level */}
        

            {/* <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Text>Search Route page</Text>
                <TouchableHighlight onPress={toChooseRoute}>
                    <Text>
                        To choose page
                    </Text>
                </TouchableHighlight>
            </View> */}
        </SafeAreaView>
}