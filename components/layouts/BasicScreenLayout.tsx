import { PropsWithChildren } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BasicScreenLayout = ({ children }: PropsWithChildren) => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="bg-white">{children}</View>
    </SafeAreaView>
  );
};

export default BasicScreenLayout;
