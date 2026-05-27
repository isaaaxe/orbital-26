import { Text,View, StyleSheet, Image, ImageSourcePropType, TouchableOpacity } from "react-native";

type CardItemProp ={
    mainIcon: ImageSourcePropType,
    cardTitle: string,
    cardSubtitle: string,
    onPress: () => void,
    selected?: boolean,
    saveable?: boolean,
    isSaved?: boolean
    onSavePress?: () => void
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
      mainPressArea: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
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

    bookmarkButton : {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 8,
    },

    bookmarkIcon: {
        width: 24,
        height: 24,
    },
})

export default function CardItem({mainIcon, cardTitle, cardSubtitle, onPress, selected, saveable, isSaved, onSavePress}: CardItemProp) {

    let bookmarkUnsaved
    let bookmarkSaved


    if (saveable) {
        bookmarkUnsaved = require("../assets/icons/bookmark_unsaved.png")
        bookmarkSaved = require("../assets/icons/bookmark_saved.png")
    }

    return <View style={[styles.cardContainer, selected && styles.cardContainerSelected]}>
        <TouchableOpacity style={styles.mainPressArea} onPress={onPress}>
            <Image source={mainIcon} style={{width: 24, height: 24}}/>
            <View style={[styles.textContainer, cardSubtitle.length == 0 && styles.textContainerCentered]}>
                <Text style={styles.cardTitle}>{cardTitle}</Text>
                {cardSubtitle.length > 0 ? <Text style={styles.cardSubtitle}>{cardSubtitle}</Text> : <></>}
            </View>
        </TouchableOpacity>
              {saveable && (
                <TouchableOpacity style={styles.bookmarkButton} onPress={onSavePress}>
                <Image
                    source={isSaved ? bookmarkSaved : bookmarkUnsaved}
                    style={styles.bookmarkIcon}
                />
                </TouchableOpacity>
            )}
        </View>
}