import Header from "@/components/Header";
import { router } from "expo-router";
import { Text, TouchableHighlight, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ConfirmingRoute() {

    const toNavigate = () => {
        router.push("/navigate")
    }

    //Temp values, need to pass in context
    const routeName = "Fastest Route"
    const currLocation = "UTown"
    const destination = "LT14"

    return <SafeAreaView style={{flex : 1}}>
                <Header text={routeName} description={`${currLocation}  ${destination}`} />
                {/* map + summary of route chosen */}
                {/* bottom has button to choose to start navigating */}
                <View
                    style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <Text>Confirming route page, preview of the navigation</Text>
                    <TouchableHighlight onPress={toNavigate}>
                        <Text>
                            To navigate
                        </Text>
                    </TouchableHighlight>
                </View>
            </SafeAreaView>
}