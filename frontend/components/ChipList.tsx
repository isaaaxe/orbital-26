import { View, FlatList, StyleSheet, ScrollView } from "react-native";
import ChipItem from "./ChipItem";

export default function ChipList() {
  //sample data
  const DATA = [
    { text: "COM1" },
    { text: "BIZ2" },
    { text: "CLB" },
    { text: "KR Terminal" },
    { text: "KR Terminal" },
    { text: "KR Terminal" },
    { text: "KR Terminal" },
  ];

  const styles = StyleSheet.create({
    chipList: {
      marginTop: 5,
      maxHeight: 52,
    },
  });

  return (
    <FlatList
      style={styles.chipList}
      horizontal
      data={DATA}
      renderItem={({ item }) => <ChipItem text={item.text} />}
      showsHorizontalScrollIndicator={false}
    />
  );
}
