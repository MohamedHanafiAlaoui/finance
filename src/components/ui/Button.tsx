import { Pressable, Text, StyleSheet } from "react-native";

type ButtonProps = {
  title: string;
  onPress: () => void;
};

export default function Button({
  title,
  onPress,
}: ButtonProps) {
  return (
    <Pressable
      style={styles.button}
      onPress={onPress}
    >
      <Text style={styles.text}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 55,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },

  text: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});