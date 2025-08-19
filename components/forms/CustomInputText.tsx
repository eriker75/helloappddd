import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import { Box, Input, InputField, Text, VStack } from "../ui";

interface Props {
  label: string;
  value: string;
  setValue: (text: string) => void;
  placeholder: string;
  maxLength?: number;
}

export default function CustomInputText({
  label,
  value,
  setValue,
  placeholder,
  maxLength,
}: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;

  return (
    <VStack className="mt-5">
      <Text className="text-[#1E1E1E] mb-2 font-medium text-base">{label}</Text>
      <Box
        className={`${
          isFocused || hasValue ? "bg-[#EAF9FE]" : "bg-gray-100"
        } rounded-full p-1 relative ${
          isFocused
            ? "border-2 border-cyan-500"
            : hasValue
            ? "border border-gray-200"
            : "border border-transparent"
        }`}
      >
        <Input variant="outline" size="lg" className="border-0">
          <InputField
            value={value}
            onChangeText={setValue}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="py-3 px-4"
            placeholder={placeholder}
            maxLength={maxLength}
          />
        </Input>
        {hasValue && (
          <TouchableOpacity
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-cyan-400 rounded-full w-5 h-5 flex items-center justify-center"
            onPress={() => setValue("")}
          >
            <MaterialCommunityIcons name="close" size={12} color="#fff" />
          </TouchableOpacity>
        )}
      </Box>
      {maxLength && (
        <Text className="text-gray-400 text-sm mt-1 text-right">
          {value.length}/{maxLength}
        </Text>
      )}
    </VStack>
  );
}
