import CalendarIcon from "@/assets/images/calendar-icon.svg";
import dayjs from "dayjs";
import { useState } from "react";
import { Platform, TouchableOpacity } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Box, Text, VStack } from "../ui";

interface Props {
  label: string;
  value: string;
  setValue: (text: string) => void;
  placeholder: string;
}

export default function CustomInputDate({
  label,
  value,
  setValue,
  placeholder,
}: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const [isUnderage, setIsUnderage] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const hasValue = value.trim().length > 0;

  const handleConfirm = (date: Date) => {
    const formattedDate = dayjs(date).format("DD/MM/YYYY");
    const age = dayjs().diff(date, "year");

    if (age < 18) {
      setIsUnderage(true);
      setValue("");
    } else {
      setIsUnderage(false);
      setValue(formattedDate);
    }

    setShowPicker(false);
    setIsFocused(false);
  };

  return (
    <VStack className="mt-5">
      <Text className="text-[#1E1E1E] mb-2 font-medium text-base">{label}</Text>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          setShowPicker(true);
          setIsFocused(true);
        }}
      >
        <Box
          className={`${
            hasValue || isFocused ? "bg-[#EAF9FE]" : "bg-gray-100"
          } rounded-full px-4 py-3 relative flex-row items-center justify-between ${
            isFocused
              ? "border-2 border-cyan-500"
              : hasValue
              ? "border border-gray-200"
              : "border border-transparent"
          }`}
        >
          <Text
            className={`text-base ${hasValue ? "text-black" : "text-gray-400"}`}
          >
            {hasValue ? value : placeholder}
          </Text>

          <CalendarIcon width={20} height={20} />
        </Box>
      </TouchableOpacity>

      {isUnderage && (
        <Text className="text-red-500 text-sm mt-1">
          Debes tener al menos 18 años.
        </Text>
      )}

      <DateTimePickerModal
        isVisible={showPicker}
        mode="date"
        maximumDate={dayjs().subtract(18, "year").toDate()}
        onConfirm={handleConfirm}
        onCancel={() => {
          setShowPicker(false);
          setIsFocused(false);
        }}
        display={Platform.OS === "ios" ? "inline" : "default"}
      />
    </VStack>
  );
}
