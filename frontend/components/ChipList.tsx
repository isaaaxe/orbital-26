import { View, FlatList, StyleSheet, ScrollView } from "react-native";
import ChipItem from "./ChipItem";

export type ChipListProps<TCode extends string = string> = {
  data: {
    name: string;
    code: TCode;
  }[];
  selected: TCode;
  onSelect: (code: TCode) => void;
};

const styles = StyleSheet.create({
  chipList: {
    marginTop: 5,
    maxHeight: 52,
  },
});

export default function ChipList<TCode extends string = string>({
  data,
  selected,
  onSelect,
}: ChipListProps<TCode>) {
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
