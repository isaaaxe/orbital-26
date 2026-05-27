import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, Polyline, Polygon } from 'react-native-maps'
import { useRouteContext } from "@/context/RouteContext";
import SearchBar from "@/components/SearchBar";

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    container: {
        flex: 14,
    },
    map: {
        flex: 1,
    },
    errorBox: {
        position: "absolute",
        bottom: 40,
        left: 20,
        right: 20,
        padding: 12,
        backgroundColor: "white",
        borderRadius: 8,
    },
})


export default function MapOrigin(){
    const { origin, setOrigin, userSearch, setUserSearch } = useRouteContext()
    console.log(origin)


    function handleSetOrigin(input: string) {

    }

    return <View style={styles.screen}>
    <SafeAreaView style={{flex: 1}}>
        <SearchBar searchContent={userSearch} onChangeText={setUserSearch} onSearch={() => handleSetOrigin(userSearch)}/>
        <View style={styles.container}>
        <MapView
            style={styles.map} 
            region={{
                latitude: 1.300291282646443,
                longitude: 103.77733947340228,
                latitudeDelta: 0.016,
                longitudeDelta: 0.016
            }}
        >
            {origin?<Marker 
                coordinate={{latitude: origin?.latitude, longitude: origin?.longitude}}
            />: <></>}
        </MapView>
        </View>
    </SafeAreaView>
    </View>

}

