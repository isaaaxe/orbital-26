import Header from "@/components/Header";
import { router } from "expo-router";
import { Text, View, TouchableHighlight } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChooseRoute() {

    const toConfirmRoute = () => {
        router.push("/confirmingRoute")
    }

    //Temporary Values for testing
    const destination = "LT14"
    const currLocation = "UTown"

    return <SafeAreaView style={{flex: 1}}>
                <Header text={`Route to ${destination}`} description={`From ${currLocation}`}/>

                {/* choosing the route type */}
                {/* list of a set 4 items, may be less depending on availability */}

                {/* TODO: Create a ListItem component for this */}
                <View
                    style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <Text>
                        Choosing route page
                    </Text>
                    <TouchableHighlight onPress={toConfirmRoute}>
                        <Text>
                            To choose page
                        </Text>
                    </TouchableHighlight>
                </View>
            </SafeAreaView>
}