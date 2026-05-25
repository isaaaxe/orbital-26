import Header from "@/components/Header";
import RouteOptionCard from "@/components/RouteOptionCard";
import StylisedButton from "@/components/StylisedButton";
import { useRouteContext } from "@/context/RouteContext";
import { router } from "expo-router";
import { Text, View, TouchableHighlight, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";


const styles = StyleSheet.create({
    routeCard: {
        marginHorizontal: 20,
        marginBottom: 8
    },
    screen: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
})

type RouteOption = {
  optionType: string;
  eta: number;
  routeTitle: string;
  routeDescription: string;
};

export default function ChooseRoute() {

    const { searchDestination, selectedRoute, setSelectedRoute, origin} = useRouteContext()
    const toConfirmRoute = () => {
        router.push("/confirmingRoute")
    }
    
    function handleSelect(item: RouteOption) {
        setSelectedRoute(item)
    }

    //Temporary Values for testing
    const destination = searchDestination
    const currLocation = origin?.name

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


    useFocusEffect(

        useCallback(()=> {

            return () => {
                setSelectedRoute(null)
            }
        }, [])
    )



    return <View style={styles.screen}>
        <SafeAreaView style={{flex: 1}}>
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
                                                routeDescription={item.routeDescription}
                                                onPress={() => handleSelect({
                                                    optionType: item.optionType,
                                                    eta: item.eta,
                                                    routeTitle: item.routeTitle,
                                                    routeDescription: item.routeDescription
                                                })}
                                                selected={item.optionType == selectedRoute?.optionType}
                                                />
                                }
                    style={styles.routeCard}
                />

                <StylisedButton buttonText="Choose Route" onPress={toConfirmRoute}/>
            </SafeAreaView>
            </View>
}