import { TouchableOpacity, View, Text, StyleSheet } from "react-native"

type RouteOptionProps = {
    optionType: string,
    eta: number,
    routeTitle: string,
    routeDescription: string
}

const styles = StyleSheet.create({
    routeCard: {
        backgroundColor: "#F7F7F8",
        borderRadius: 24,
        paddingHorizontal: 28,
        paddingVertical: 24,
        marginBottom: 20,
        minHeight: 130,
    },

    routeCardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
    },

    routeTag: {
        fontSize: 15,
        fontWeight: "700",
        color: "#0B3A7E",
    },

    routeTime: {
        fontSize: 22,
        fontWeight: "700",
        color: "#0B3A7E",
    },

    routeTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: "#171717",
        marginBottom: 10,
    },

    routeDescription: {
        fontSize: 15,
        color: "#6E6E6E",
        lineHeight: 21,
    },
})

export default function RouteOptionCard({optionType, eta, routeTitle, routeDescription}: RouteOptionProps) {

    const colorMap = new Map([
        ["Fastest", "#FF4A1C"],
        ["Walking only", "#0B3A7E"],
        ["Accessible", "#168A45"],
        ["Carpark", "#0B3A7E"],
    ])

    const colorRoute = colorMap.get(optionType)

    return <TouchableOpacity style={styles.routeCard}>
                <View style={styles.routeCardHeader}>
                    <Text style={[styles.routeTag, { color: colorRoute }]}>{optionType}</Text>
                    <Text style={[styles.routeTime, { color: colorRoute }]}>{`${eta} min${eta > 1 ? "s" : ""}`}</Text>
                </View>
                <Text style={styles.routeTitle}>{routeTitle}</Text>
                <Text style={styles.routeDescription}>{routeDescription}</Text>
            </TouchableOpacity>
}