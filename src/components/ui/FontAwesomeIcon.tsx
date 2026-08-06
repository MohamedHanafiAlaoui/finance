// Icon utilities component - works with FontAwesome fallback
import { Text, TextProps } from "react-native";

type IconName =
  | "money"
  | "envelope"
  | "lock"
  | "eye"
  | "eye-slash"
  | "question-circle"
  | "sign-in"
  | "exclamation-circle"
  | "info-circle";

const ICON_MAP: Record<IconName, string> = {
  money: "💰",
  envelope: "✉️",
  lock: "🔒",
  eye: "👁️",
  "eye-slash": "🙈",
  "question-circle": "❓",
  "sign-in": "➡️",
  "exclamation-circle": "⚠️",
  "info-circle": "ℹ️",
};

export function FontAwesomeIcon(
  props: TextProps & {
    name: IconName;
    size?: number;
    color?: string;
  }
) {
  const { name, size = 16, color = "#000", style, ...rest } = props;
  
  return (
    <Text
      {...rest}
      style={[
        {
          fontSize: size,
          color,
        },
        style,
      ]}
    >
      {ICON_MAP[name]}
    </Text>
  );
}
