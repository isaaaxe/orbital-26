import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Navigate() {

    //Think can have quite a few things here.
    // 1. Main thing should be a map with the highlighted path to take for navigating
    // 2. Add a tab users can scroll up to see full steps for navigating
    // 3. Actually more importantly navigation functionality needs to kick in here
    //    from api calls to sql retrievals
    

    return <SafeAreaView style={{flex:1}}>
                <View
                    style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <Text>Navigation page, page where the map is suppose to be</Text>
                    <Text>Can include modal here to bring up the entire journey</Text>
                </View>
            </SafeAreaView>
}