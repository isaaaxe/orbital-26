import { View, FlatList, StyleSheet, ScrollView } from "react-native";
import ChipItem from "./ChipItem";
import { Mode } from "@/app/(tabs)/map";

export type ChipListProps = {
  data: {
    name: string;
    code: Mode;
  }[];
  selected: string;
  onSelect: React.Dispatch<React.SetStateAction<Mode>>;
};

export default function ChipList({ data, selected, onSelect }: ChipListProps) {
  //sample data
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
      data={data}
      renderItem={({ item }) => (
        <ChipItem
          item={item}
          selected={item.code == selected}
          onSelect={onSelect}
        />
      )}
      showsHorizontalScrollIndicator={false}
    />
  );
}
