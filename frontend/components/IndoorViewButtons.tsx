import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

type IndoorViewButtonsProps = {
  layers: string[];
  selectedLayer?: string;
  onPress: (input: string) => void;
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "column",
    gap: 8,
    padding: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.92)",

    // shadow for iOS
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    // shadow for Android
    elevation: 5,
  },

  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  selectedButton: {
    backgroundColor: "#0B4EA2",
  },

  buttonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },

  selectedButtonText: {
    color: "#FFFFFF",
  },
});

export default function IndoorViewButtons({
  layers,
  selectedLayer,
  onPress,
}: IndoorViewButtonsProps) {
  return (
    <View style={styles.buttonContainer}>
      {layers.map((layer) => {
        const isSelected = layer === selectedLayer;

        return (
          <TouchableOpacity
            key={layer}
            activeOpacity={0.75}
            style={[styles.button, isSelected && styles.selectedButton]}
            onPress={() => onPress(layer)}
          >
            <Text
              style={[
                styles.buttonText,
                isSelected && styles.selectedButtonText,
              ]}
            >
              {layer}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
