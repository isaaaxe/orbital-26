import { Text, StyleSheet, TouchableOpacity } from "react-native";

type ButtonProps = {
  buttonText: string;
  onPress: () => void;
};

const styles = StyleSheet.create({
  findRouteButton: {
    backgroundColor: "#FF4B22",
    height: 58,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 48,
    marginHorizontal: 24,
  },

  findRouteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default function StylisedButton({ buttonText, onPress }: ButtonProps) {
  return (
    <TouchableOpacity style={styles.findRouteButton} onPress={onPress}>
      <Text style={styles.findRouteButtonText}>{buttonText}</Text>
    </TouchableOpacity>
  );
}
