import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import { router } from "expo-router";
import { Text, TouchableHighlight, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SearchRoute() {

    const toChooseRoute = () => {
        router.push("/chooseRoute")
    }


    return <SafeAreaView style={{flex: 1}}>
            <Header text={"Search destination"} description={"Find classrooms, bus stops, and buildings"}/>
            {/* another search bar they can alter incase they typed wrongly or smth */}
            <SearchBar />
            {/* Results list: Scrollable element */}

            {/* Dont know if i shld include building level */}
        

            <View
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
            </View>
        </SafeAreaView>
}