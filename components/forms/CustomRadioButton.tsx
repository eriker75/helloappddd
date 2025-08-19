import { TouchableOpacity, View } from "react-native";
import { Text } from "../ui";

interface Props {
  label: string;
  value: string;
  selectedValue: string;
  onSelect: (value: string) => void;
}

export default function CustomRadioButton({
  label,
  value,
  selectedValue,
  onSelect,
}: Props) {
  const isSelected = selectedValue === value;

  return (
    <TouchableOpacity
      className="flex-row items-center"
      onPress={() => onSelect(value)}
    >
      <View
        className={`w-6 h-6 rounded-full border-2 ${
          isSelected ? "border-cyan-400" : "border-gray-400"
        } flex items-center justify-center mr-3`}
      >
        {isSelected && <View className="w-3 h-3 rounded-full bg-cyan-400" />}
      </View>
      <Text className="text-[#35313D] text-base">{label}</Text>
    </TouchableOpacity>
  );
}
