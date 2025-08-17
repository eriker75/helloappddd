import { GLOBAL_COLORS } from "@/src/definitions/constants/GLOBAL_COLORS";
import { useColorScheme } from "./useColorScheme";

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof GLOBAL_COLORS.light & keyof typeof GLOBAL_COLORS.dark
) {
  const theme = useColorScheme() ?? "light";
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return GLOBAL_COLORS[theme][colorName];
  }
}
