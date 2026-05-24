import Header from "@/components/Header";
import { useRouteContext } from "@/context/RouteContext";
import { router } from "expo-router";
import { Text, TouchableHighlight, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
})

export default function ConfirmingRoute() {

    const {searchDestination} = useRouteContext()

    const toNavigate = () => {
        router.push("/navigate")
    }

    //Temp values, need to pass in context
    const routeName = "Fastest Route"
    const currLocation = "UTown"
    const destination = searchDestination

    return <View style={styles.screen}>
            <SafeAreaView style={{flex : 1}}>
                <Header text={routeName} description={`${currLocation} -> ${destination}`} />
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
            </View>
}