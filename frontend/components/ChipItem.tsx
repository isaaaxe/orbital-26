import {
  View,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
} from "react-native";

type ChipProps<TCode extends string = string> = {
  item: {
    name: string;
    code: TCode;
  };
  selected: boolean;
  onSelect: (code: TCode) => void;
};

const styles = StyleSheet.create({
  chip: {
    backgroundColor: "#EAF3FF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    marginRight: 12,
    justifyContent: "center",
  },

  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0B4EA2",
  },
  chipSelected: {
    backgroundColor: "#0B4EA2",
  },
  chipTextSelected: {
    color: "white",
  },
});

export default function ChipItem<TCode extends string = string>({
  item,
  selected,
  onSelect,
}: ChipProps<TCode>) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={() => onSelect(item.code)}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );
}
