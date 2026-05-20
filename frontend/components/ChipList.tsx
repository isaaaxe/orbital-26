import { View, FlatList, StyleSheet, ScrollView } from "react-native";
import ChipItem from "./ChipItem";



export default function ChipList() {


    //sample data
    const DATA = [
        {text: "COM1"},
        {text: "BIZ2"},
        {text: "CLB"},
        {text: "KR Terminal"},
        {text: "KR Terminal"},
        {text: "KR Terminal"},
        {text: "KR Terminal"},
    ]
        
    const styles = StyleSheet.create({
            chipList: {
                flex: 1,
                marginTop: 5,
            },
            listView: {
                flex: 1
            }
        }   
    )


    return <ScrollView style={styles.listView}>
        <FlatList 
            style={styles.chipList}
            horizontal
            data={DATA}
            renderItem={({item})=> <ChipItem text={item.text} />}
        />
    </ScrollView>
}