import { Text,View, StyleSheet, Image, ImageSourcePropType, TouchableOpacity } from "react-native";

type CardItemProp ={
    icon: ImageSourcePropType,
    cardTitle: string,
    cardSubtitle: string,
    onPress: () => void
}

export default function CardItem({icon, cardTitle, cardSubtitle, onPress}: CardItemProp) {

    const styles = StyleSheet.create({
        cardContainer: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#F7F7F8",
            borderRadius: 14,
            paddingVertical: 14,
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
    })

    return <TouchableOpacity style={styles.cardContainer} onPress={onPress}>
        <View>
            <Image source={icon} style={{width: 24, height: 24}}/>
        </View>
        <View style={{marginLeft: 20}}>
            <Text style={styles.cardTitle}>{cardTitle}</Text>
            {cardSubtitle.length > 0 ? <Text style={styles.cardSubtitle}>{cardSubtitle}</Text> : <></>}
        </View>
    </TouchableOpacity>
}