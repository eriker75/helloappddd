import { Text } from "@/components/ui";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SettingScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="bg-white">
        <Text>Settings</Text>
      </View>
    </SafeAreaView>
  );
};

export default SettingScreen;
