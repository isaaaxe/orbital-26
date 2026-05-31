import Header from "@/components/Header";
import RouteOptionCard from "@/components/RouteOptionCard";
import StylisedButton from "@/components/StylisedButton";
import { useRouteContext } from "@/context/RouteContext";
import { router, useNavigation } from "expo-router";
import {
  Text,
  View,
  TouchableHighlight,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect } from "react";
import { useRouteQuery } from "@/hook/useRoute";
import { RouteResponse } from "@/api/routes";
import { useGetLocationDetails } from "@/hook/useLocations";

const styles = StyleSheet.create({
  routeCard: {
    marginHorizontal: 20,
    marginBottom: 8,
  },
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
});

type RouteOption = {
  optionType: string;
  eta: number;
  routeTitle: string;
  routeDescription: string;
};
function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return hours > 0
    ? `${hours}h ${minutes}m ${seconds}s`
    : minutes > 0
      ? `${minutes}m ${seconds}s`
      : `${seconds}s`;
}

function formatDistance(distanceMeters: number) {
  return distanceMeters >= 1000
    ? `${(distanceMeters / 1000).toFixed(1)} km`
    : `${Math.round(distanceMeters)} m`;
}

export default function ChooseRoute() {
  const { destination, selectedRoute, setSelectedRoute, origin } =
    useRouteContext();
  const navigation = useNavigation();
  const toConfirmRoute = () => {
    router.push("/confirmingRoute");
  };

  function handleSelect(item: RouteResponse) {
    setSelectedRoute(item);
  }

  const {
    data: destinationDetails,
    isLoading: isGetDetailsLoading,
    error: detailsError,
  } = useGetLocationDetails(destination?.id);

  const {
    data: routes,
    isLoading: isRoutesLoading,
    error,
  } = useRouteQuery(
    origin?.nearest_node.node_id,
    destinationDetails?.nearest_node_id!,
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", () => {
      setSelectedRoute(null);
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.screen}>
      <SafeAreaView style={{ flex: 1 }}>
        <Header
          text={`Route to ${destination?.name}`}
          description={`From ${origin?.nearest_node.name}`}
        />

        {/* choosing the route type */}
        {/* list of a set 4 items, may be less depending on availability */}
        {/* TODO: Create a ListItem component for this */}
        {isRoutesLoading && (
          <View>
            <ActivityIndicator />
            <View>
              <Text>Calculating routes... please hold on...</Text>
            </View>
          </View>
        )}
        {!isRoutesLoading && (
          <FlatList
            data={routes}
            renderItem={({ item, index }) => (
              <RouteOptionCard
                key={index}
                optionType={item.mode}
                eta_formatted={formatDuration(item.total_estimated_seconds)}
                routeTitle={item.mode}
                routeDescription={`${item.steps[0].step_instruction}... `}
                onPress={() => handleSelect(item)}
                selected={item.mode == selectedRoute?.mode}
              />
            )}
            style={styles.routeCard}
          />
        )}

        <StylisedButton buttonText="Choose Route" onPress={toConfirmRoute} />
      </SafeAreaView>
    </View>
  );
}
