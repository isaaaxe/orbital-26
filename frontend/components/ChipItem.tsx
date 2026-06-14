import { Mode } from "@/app/(tabs)/map";
import {
  View,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
} from "react-native";

type ChipProps = {
  item: {
    name: string;
    code: Mode;
  };
  selected: boolean;
  onSelect: React.Dispatch<React.SetStateAction<Mode>>;
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

  chipSelected: {
    backgroundColor: "#0B4EA2",
  },

  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0B4EA2",
  },

  chipTextSelected: {
    color: "white",
  },
});

export default function ChipItem({ item, selected, onSelect }: ChipProps) {
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
