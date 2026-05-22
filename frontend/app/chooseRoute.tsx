import Header from "@/components/Header";
import RouteOptionCard from "@/components/RouteOptionCard";
import StylisedButton from "@/components/StylisedButton";
import { router } from "expo-router";
import { Text, View, TouchableHighlight, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


const styles = StyleSheet.create({
    routeCard: {
        marginHorizontal: 20,
        marginBottom: 8
    }
})

export default function ChooseRoute() {

    const toConfirmRoute = () => {
        router.push("/confirmingRoute")
    }

    //Temporary Values for testing
    const destination = "LT14"
    const currLocation = "UTown"

    // sample data
    const ROUTE_OPTIONS = [
    {
        id: "1",
        optionType: "Fastest",
        eta: 17,
        routeTitle: "Walk + Internal Shuttle Bus",
        routeDescription: "Start at UTOWN bus stop → Take D1 → Alight at Central Library",
    },
    {
        id: "2",
        optionType: "Walking only",
        eta: 25,
        routeTitle: "Walking route",
        routeDescription: "Walk along pedestrian pathway from UTown to Central Library, along FOE to AS6",
    },
    {
        id: "3",
        optionType: "Accessible",
        eta: 30,
        routeTitle: "Lift-friendly route",
        routeDescription: "Avoid stairs and use accessible entrance plus lift",
    },
    {
        id: "4",
        optionType: "Carpark",
        eta: 9,
        routeTitle: "Nearest carpark + walk",
        routeDescription: "Drive to the closest carpark, then walk to AS6",
    },
    ];

    return <SafeAreaView style={{flex: 1}}>
                <Header text={`Route to ${destination}`} description={`From ${currLocation}`}/>

                {/* choosing the route type */}
                {/* list of a set 4 items, may be less depending on availability */}
                {/* TODO: Create a ListItem component for this */}
                <FlatList 
                    data={ROUTE_OPTIONS}
                    renderItem={({item})=> <RouteOptionCard 
                                                optionType={item.optionType} 
                                                eta={item.eta} 
                                                routeTitle={item.routeTitle} 
                                                routeDescription={item.routeDescription}/>
                                }
                    style={styles.routeCard}
                />

                <StylisedButton buttonText="Confirm Route" onPress={toConfirmRoute}/>
            </SafeAreaView>
}