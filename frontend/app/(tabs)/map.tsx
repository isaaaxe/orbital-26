import Header from "@/components/Header";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
})


export default function MapPage(){


    return <View style={styles.screen}>
    <SafeAreaView>
        <View>
            <Text>Map page</Text>
        </View>
    </SafeAreaView>
    </View>

}