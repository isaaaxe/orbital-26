import IndoorView from "@/components/IndoorView";
import { useRouteContext } from "@/context/RouteContext";
import { useNavigation } from "expo-router";
import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text } from "react-native";

export default function FloorPlanView() {
  const { setPOI } = useRouteContext();
  const navigate = useNavigation();
  useEffect(() => {
    const unsubscribe = navigate.addListener("beforeRemove", () => {
      setPOI(null);
    });

    return unsubscribe;
  }, [navigation]);
  return (
    <View>
      <SafeAreaView>
        <View>
          <Text></Text>
        </View>
        <IndoorView />
      </SafeAreaView>
    </View>
  );
}
