import Header from "@/components/Header";
import RouteOptionCard from "@/components/RouteOptionCard";
import StylisedButton from "@/components/StylisedButton";
import { useRouteContext } from "@/context/RouteContext";
import { router, useNavigation } from "expo-router";
import { Text, View, TouchableHighlight, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { useEffect } from "react";
import { useRouteOptions } from "@/hook/useRoute";


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

    const { destination, selectedRoute, setSelectedRoute, origin} = useRouteContext()
    const navigation = useNavigation()
    const toConfirmRoute = () => {
        router.push("/confirmingRoute")
    }
    
    function handleSelect(item: RouteOption) {
        setSelectedRoute(item)
    }

    const {data: optionsData, isLoading: isOptionsLoading, error } = useRouteOptions(origin?.id, destination?.id)

    useEffect(() => {
        const unsubscribe = navigation.addListener("beforeRemove", () => {
            setSelectedRoute(null)
        });

        return unsubscribe;
    }, [navigation]);


    return <View style={styles.screen}>
        <SafeAreaView style={{flex: 1}}>
                <Header text={`Route to ${destination?.name}`} description={`From ${origin?.name}`}/>

                {/* choosing the route type */}
                {/* list of a set 4 items, may be less depending on availability */}
                {/* TODO: Create a ListItem component for this */}
                <FlatList 
                    data={optionsData?.options}
                    renderItem={({item})=> <RouteOptionCard 
                                                optionType={item.optionType} 
                                                eta={item.estimatedMinutes} 
                                                routeTitle={item.title} 
                                                routeDescription={item.description}
                                                onPress={() => handleSelect({
                                                    optionType: item.optionType,
                                                    eta: item.estimatedMinutes,
                                                    routeTitle: item.title,
                                                    routeDescription: item.description
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