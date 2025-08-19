import { HStack, Text, VStack } from "../ui";
import CustomRadioButton from "./CustomRadioButton";

interface Option {
  label: string;
  value: string;
}

interface Props {
  label: string;
  selectedValue: string;
  onChange: (value: string) => void;
  options: Option[];
  direction?: "row" | "column";
}

export default function CustomRadioGroup({
  label,
  selectedValue,
  onChange,
  options,
  direction = "row",
}: Props) {
  const Container = direction === "row" ? HStack : VStack;

  return (
    <VStack className="mt-6">
      <Text className="text-[#35313D] mb-3 font-medium text-base">{label}</Text>
      <Container space={direction === "row" ? "xl" : "md"}>
        {options.map((opt) => (
          <CustomRadioButton
            key={opt.value}
            label={opt.label}
            value={opt.value}
            selectedValue={selectedValue}
            onSelect={onChange}
          />
        ))}
      </Container>
    </VStack>
  );
}
