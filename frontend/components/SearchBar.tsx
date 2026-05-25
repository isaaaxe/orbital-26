import { useState } from "react";
import { StyleSheet, TextInput, View, Image, TouchableHighlight, TouchableOpacity } from "react-native";


type SearchBarProps = {
    searchContent: string;
    onChangeText: (text: string) => void
    onSearch: (text: string) => void
}
const styles = StyleSheet.create({
    searchInput: {
        flex:12,
        fontSize: 14,
        color: "#111827",
    },
    searchView: {
        marginHorizontal: 20,
        height: 48,
        borderWidth: 2,
        borderColor: "#D5D7DB",
        borderRadius: 14,
        paddingHorizontal: 16,
        fontSize: 14,
        color: "#111827",
        marginBottom: 22,
        justifyContent: "space-between",
        flexDirection: "row"
    },
    icon: {
        flex: 1,
        justifyContent: "center"
    }
})
export default function SearchBar(props: SearchBarProps) {

    // can try implementing fuzzy search here next time
    const icons = {
        search: require("../assets/icons/search.png")
    }

    return <View style={styles.searchView}>
        <TextInput 
            style={styles.searchInput}   
            placeholder="Search"
            placeholderTextColor="#6B7280" 
            returnKeyType="search"
            onChangeText={props.onChangeText} value={props.searchContent}
            onSubmitEditing={() => props.onSearch(props.searchContent)}
        />
        <View style={styles.icon}>
            <TouchableOpacity onPress={() => props.onSearch(props.searchContent)}>
            <Image source={icons.search} style= {{width:24, height:24}}/>
            </TouchableOpacity>
        </View>
    </View>
}