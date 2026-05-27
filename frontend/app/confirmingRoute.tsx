import Header from "@/components/Header";
import StylisedButton from "@/components/StylisedButton";
import { useRouteContext } from "@/context/RouteContext";
import { router } from "expo-router";
import { Text, TouchableHighlight, View, StyleSheet } from "react-native";
import MapView, { Overlay, Polyline } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { sampleLocations } from "./data/sampleLocations";
import { useRouteQuery } from "@/hook/useRoute";


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

    const { origin, destination} = useRouteContext()

    const toNavigate = () => {
        router.push("/navigate")
    }

    //Temp values, need to pass in context
    const routeName = "Fastest Route"

    const {data: route, isLoading, error} = useRouteQuery(
        origin?.id, destination?.id
    )

    return <View style={styles.screen}>
            <SafeAreaView style={{flex : 1}}>
                <Header text={routeName} description={`${origin?.name} -> ${destination?.name}`} />
                {/* map + summary of route chosen */}
                {/* bottom has button to choose to start navigating */}
                {isLoading && <View>
                        <Text>Loading...</Text>
                    </View>}
                {!isLoading && <View
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
                    >
                        <Overlay 
                            image={require("../assets/computing/COM_1/COM1-B.png")}
                            bounds={[
                                    [1.294612718304867, 103.77358270844721], // south-west corner
                                    [1.295201365992332, 103.77435659568096], // north-east corner
                                ]}
                        />
                        <Polyline 
                            coordinates={route!.nodes.map((node)=>({
                                latitude: node.latitude,
                                longitude: node.longitude
                            }))}
                            strokeColor="#0B2D73"
                        />
                    </MapView>
                    <StylisedButton 
                        buttonText="Confirm Route"
                        onPress={toNavigate}
                    />
                </View>}
            </SafeAreaView>
            </View>
}