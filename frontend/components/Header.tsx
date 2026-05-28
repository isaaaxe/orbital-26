import { View, Text, StyleSheet } from "react-native";

type HeaderProps = {
  text: string;
  description: string;
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0B2D73",
    marginBottom: 2,
  },

  titleView: {
    margin: 20,
  },

  description: {
    fontSize: 14,
    fontWeight: "400",
    color: "grey",
    marginBottom: 2,
  },
});

export default function Header(props: HeaderProps) {
  return (
    <View style={styles.titleView}>
      <Text style={styles.title}>{props.text}</Text>
      <Text style={styles.description}>{props.description}</Text>
    </View>
  );
}
