import Header from "@/components/Header";
import StylisedButton from "@/components/StylisedButton";
import { router } from "expo-router";
import { Text, View, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },

    safeArea: {
        flex: 1,
    },


    fieldContainer: {
        marginHorizontal: 20,
        marginBottom:10
    },

    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 6
    },

    inputBox: {
        minHeight: 52,
        borderWidth: 2,
        borderColor: "#D5D7DB",
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 12,
        justifyContent: "center",
    },

    descriptionBox: {
        minHeight: 140,
        borderWidth: 2,
        borderColor: "#D5D7DB",
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },

    inputText: {
        fontSize: 14,
        color: "#111827",
    },

    helperText: {
        fontSize: 13,
        color: "#6B7280",
        lineHeight: 18,
    },
    buttonContainer: {
        flex: 1,
        flexDirection: "column-reverse"
    }
});

export default function ReportSettings() {

    function handleReport() {
        console.log("To be implemented...")
        router.back()
    }

    return         <View style={styles.screen}>
            <SafeAreaView style={styles.safeArea}>
                    <Header text="Report an Issue" description="Let us know if you found an incorrect route, missing location, or any other problem with Routes@NUS."/>
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Title</Text>
                        <View style={styles.inputBox}>
                            <TextInput
                                style={styles.inputText}
                                placeholder="Briefly describe the issue"
                                placeholderTextColor="#6B7280"
                            />
                        </View>
                    </View>

                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Description</Text>
                        <View style={styles.descriptionBox}>
                            <TextInput
                                style={styles.inputText}
                                placeholder="Give more details about what happened"
                                placeholderTextColor="#6B7280"
                                multiline
                                textAlignVertical="top"
                            />
                        </View>
                        <Text style={styles.helperText}>
                            Include the location, route, or building if relevant.
                        </Text>
                    </View>
                <View style={styles.buttonContainer}>
                    <StylisedButton buttonText="Submit Report" onPress={handleReport}/>
                </View>
            </SafeAreaView>
        </View>
}