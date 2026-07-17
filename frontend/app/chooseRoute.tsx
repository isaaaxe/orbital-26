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
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect } from "react";
import { useRouteQuery } from "@/hook/useRoute";
import { RouteResponse } from "@/api_debug/routes.logged";
import { useGetLocationDetails } from "@/hook/useLocations";
import BackButton from "@/components/BackButton";
import { useAuthContext } from "@/context/AuthContext";

const styles = StyleSheet.create({
  routeCard: {
    marginHorizontal: 20,
    marginBottom: 8,
  },
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  loadingText: {
    fontWeight: "500",
    color: "#6B7280",
  },
  routeHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  routeHeaderTextArea: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },

  routeHeaderBackButton: {
    marginRight: 20,
    alignItems: "center",
    flexShrink: 0,
  },
});

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

export default function ChooseRoute() {
  const { user, token } = useAuthContext();
  const {
    destination,
    selectedRoute,
    setSelectedRoute,
    origin,
    setFloorPlanSource,
  } = useRouteContext();
  const navigation = useNavigation();
  const toConfirmRoute = () => {
    if (!selectedRoute) {
      Alert.alert("Please choose a route.");
    } else {
      setFloorPlanSource("route");
      router.push("/confirmingRoute");
    }
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
    token,
    user,
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
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flex: 7 }}>
            <Header
              text={`Route to ${destination?.name ?? ""}`}
              description={`From ${origin?.nearest_node.name ?? ""}`}
            />
          </View>
          <View style={{ marginRight: 20, alignItems: "flex-end", flex: 1 }}>
            <BackButton additionalBackCleanUp={() => {}} />
          </View>
        </View>
        {/* choosing the route type */}
        {/* list of a set 4 items, may be less depending on availability */}
        {/* TODO: Create a ListItem component for this */}
        {isRoutesLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator />
            <View>
              <Text style={styles.loadingText}>
                Calculating routes... please hold on...
              </Text>
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
                routeDescription={`${item.route_instructions[0]}... `}
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
