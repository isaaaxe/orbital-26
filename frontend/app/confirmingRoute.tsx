import Header from "@/components/Header";
import StylisedButton from "@/components/StylisedButton";
import { useRouteContext } from "@/context/RouteContext";
import { router } from "expo-router";
import { Text, TouchableHighlight, View, StyleSheet } from "react-native";
import MapView from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";


const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    map: {
        flex:1
    },
    container: {
        flex: 1,
    }
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
                    style={styles.container}
                >
                    <MapView 
                        style={styles.map}
                        region={
                            {
                                latitude: 1.300291282646443,
                                longitude: 103.77733947340228,
                                latitudeDelta: 0.016,
                                longitudeDelta: 0.016
                            }
                        }
                    />
                    <StylisedButton 
                        buttonText="Confirm Route"
                        onPress={toNavigate}
                    />
                </View>
            </SafeAreaView>
            </View>
}