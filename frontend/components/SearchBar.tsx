import { useState } from "react";
import { StyleSheet, TextInput, View, Image, TouchableHighlight } from "react-native";


type SearchBarProps = {
    searchContent: string;
    onSearch: (text: string) => void
}
export default function SearchBar(props: SearchBarProps) {

    const [query, setQuery] = useState(props.searchContent)
    const icons = {
        search: require("../assets/icons/search.png")
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

    return <View style={styles.searchView}>
        <TextInput 
            style={styles.searchInput}   
            placeholder="Search destination"
            placeholderTextColor="#6B7280" 
            returnKeyType="search"
            onChangeText={setQuery} value={query}
            onSubmitEditing={() => props.onSearch(query)}
        />
        <View style={styles.icon}>
            <TouchableHighlight onPress={() => props.onSearch(query)}>
            <Image source={icons.search} style= {{width:24, height:24}}/>
            </TouchableHighlight>
        </View>
    </View>
}