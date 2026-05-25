import { Text,View, StyleSheet, Image, ImageSourcePropType, TouchableOpacity } from "react-native";

type CardItemProp ={
    icon: ImageSourcePropType,
    cardTitle: string,
    cardSubtitle: string,
    onPress: () => void,
    selected?: boolean
}

const styles = StyleSheet.create({
    cardContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F7F7F8",
        borderRadius: 14,
        paddingVertical: 18,
        paddingHorizontal: 14,
        marginBottom: 10,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 3,
    },

    cardSubtitle: {
        fontSize: 12,
        color: "#6B7280",
    },

    cardContainerSelected: {
        opacity: 0.35,
        backgroundColor: "#E5E7EB",
    },

    textContainer: {
        marginLeft: 20,
        height: 36, 
        justifyContent: "center",
    },

    textContainerCentered: {
        justifyContent: "center",
    },
})

export default function CardItem({icon, cardTitle, cardSubtitle, onPress, selected}: CardItemProp) {

    return <TouchableOpacity style={[styles.cardContainer, selected && styles.cardContainerSelected]} onPress={onPress}>
        <View>
            <Image source={icon} style={{width: 24, height: 24}}/>
        </View>
        <View style={[styles.textContainer, cardSubtitle.length == 0 && styles.textContainerCentered]}>
            <Text style={styles.cardTitle}>{cardTitle}</Text>
            {cardSubtitle.length > 0 ? <Text style={styles.cardSubtitle}>{cardSubtitle}</Text> : <></>}
        </View>
    </TouchableOpacity>
}