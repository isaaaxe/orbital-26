import { View,StyleSheet, Text, TouchableHighlight, TouchableOpacity } from "react-native"

type ChipProps = {
    text: string;
}

const styles = StyleSheet.create(
    {
        chip:{
            backgroundColor: "#EAF3FF",
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 18,
            marginRight: 12,
            justifyContent: "center"
        },

        chipText:{
            fontSize: 12,
            fontWeight: "600",
            color: "#0B4EA2",
        },
    }
)


export default function ChipItem(props: ChipProps) {

    return <TouchableOpacity style={styles.chip}>
        <Text style={styles.chipText}>{props.text}</Text>
    </TouchableOpacity>
}