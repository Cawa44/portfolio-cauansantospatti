import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  // Navegação padrão
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  // ctBlun — tabs principais
  "calendar": "calendar-today",
  "person.fill": "person",
  "list.bullet": "list",
  // ctBlun — ações
  "plus": "add",
  "video.fill": "videocam",
  "clipboard.fill": "assignment",
  "star.fill": "star",
  "checkmark.circle.fill": "check-circle",
  "xmark.circle.fill": "cancel",
  "clock.fill": "access-time",
  "trash.fill": "delete",
  "pencil": "edit",
  "arrow.left": "arrow-back",
  "square.and.arrow.up": "share",
  "doc.on.clipboard": "content-copy",
  "bell.fill": "notifications",
  "gear": "settings",
  "power": "logout",
} as IconMapping;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
