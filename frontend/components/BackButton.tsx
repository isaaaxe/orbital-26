import { router } from "expo-router";
import { Text, Pressable, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  button: {
    alignSelf: "flex-start",
    backgroundColor: "#E5E7EB",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },

  text: {
    color: "#404040",
    fontSize: 12,
    fontWeight: "600",
  },
});

export type BackButtonProps = {
  additionalBackCleanUp: () => void;
};

export default function BackButton({
  additionalBackCleanUp: cleanUp,
}: BackButtonProps) {
  return (
    <Pressable
      style={styles.button}
      onPress={() => {
        cleanUp();
        router.back();
      }}
    >
      <Text style={styles.text}>Back</Text>
    </Pressable>
  );
}
