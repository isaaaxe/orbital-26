import { View,StyleSheet, Text, TouchableHighlight } from "react-native"

type ChipProps = {
    text: string;
}

const styles = StyleSheet.create(
    {
        chip:{
            backgroundColor: "#EAF3FF",
            paddingHorizontal: 14,
            paddingVertical: 9,
            borderRadius: 18,
            marginRight: 12
        },

        chipText:{
            fontSize: 12,
            fontWeight: "600",
            color: "#0B4EA2",
        },
    }
)


export default function ChipItem(props: ChipProps) {

    return <TouchableHighlight style={styles.chip}>
        <Text style={styles.chipText}>{props.text}</Text>
    </TouchableHighlight>
}