import { Box, Text, VStack } from "@/components/ui";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { TextInput, TouchableOpacity } from "react-native";

interface Props {
  label: string;
  value: string;
  setValue: (text: string) => void;
  placeholder: string;
  maxLength?: number;
}

export default function CustomInputTextarea({
  label,
  value,
  setValue,
  placeholder,
  maxLength,
}: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;

  const handleChange = (text: string) => {
    setValue(text);
  };

  return (
    <VStack className="mt-5">
      <Box className="flex flex-row gap-10 justify-between items-center">
        <Text className="text-[#1E1E1E] mb-2 font-medium text-base">
          {label}
        </Text>
        {maxLength && (
          <Text className="text-[#6B6B6B] text-sm mt-1 text-right">
            {value.length}/{maxLength}
          </Text>
        )}
      </Box>
      <Box
        className={`${
          isFocused || hasValue ? "bg-[#EAF9FE]" : "bg-gray-100"
        } rounded-xl p-1 relative ${
          isFocused
            ? "border-2 border-cyan-500"
            : hasValue
            ? "border border-gray-200"
            : "border border-transparent"
        }`}
      >
        <TextInput
          value={value}
          onChangeText={handleChange}
          placeholder={placeholder}
          multiline
          numberOfLines={4}
          maxLength={maxLength}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="text-base text-[#1B1B1F] p-3 min-h-[100px]"
          style={{ textAlignVertical: "top" }}
          placeholderTextColor="#6B6B6B"
        />

        {hasValue && (
          <TouchableOpacity
            className="absolute right-3 top-3 bg-cyan-400 rounded-full w-5 h-5 items-center justify-center"
            onPress={() => handleChange("")}
          >
            <MaterialIcons name="close" size={12} color="#fff" />
          </TouchableOpacity>
        )}
      </Box>
    </VStack>
  );
}
