import { Progress, ProgressFilledTrack } from "@/components/ui/progress";
import { Text } from "@/components/ui/text";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { ReactNode } from "react";
import { TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  children: ReactNode;
  showProgress?: boolean;
  progressValue?: number;
  showBackButton?: boolean;
  isStepValidated?: boolean;
  onBackPress?: () => void;
  footerButtonText?: string;
  onFooterButtonPress?: () => void;
};

type SubcomponentProps = { children: ReactNode };

const OnboardingScreenLayoutRoot = ({
  children,
  showProgress = false,
  progressValue = 0,
  isStepValidated = false,
  showBackButton = true,
  onBackPress,
  footerButtonText = "Continuar",
  onFooterButtonPress,
}: Props) => {
  const layoutChildren = React.Children.toArray(children);
  const footerExtra = layoutChildren.find(
    (child: any) => child.type?.displayName === "FooterExtra"
  );
  const content = layoutChildren.filter(
    (child: any) => child.type?.displayName !== "FooterExtra"
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />

      {showProgress && (
        <View className="pb-1 bg-[#F7F9FA]">
          <Progress
            value={progressValue}
            className="w-full h-2 bg-[#E6F8FD] rounded-full"
          >
            <ProgressFilledTrack className="h-2 bg-[#7CDAF9] rounded-full" />
          </Progress>
        </View>
      )}

      <View className="px-6 pt-4 pb-4 bg-[#F7F9FA] shadow-sm">
        {showBackButton && (
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-[#F7F9FA] items-center justify-center shadow"
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.08,
              shadowRadius: 3,
              shadowOffset: { width: 0, height: 1 },
            }}
            onPress={onBackPress || (() => router.back())}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#1E1E1E"
            />
          </TouchableOpacity>
        )}
      </View>

      <View className="flex-1 px-6">{content}</View>

      {footerExtra && <View className="px-6 mb-3">{footerExtra}</View>}

      {onFooterButtonPress && (
        <View className="px-6 pb-8">
          <TouchableOpacity
            onPress={onFooterButtonPress}
            activeOpacity={0.7}
            className={`rounded-full max-w-96 mx-auto w-full h-14 justify-center items-center ${
              isStepValidated ? "bg-[#7CDAF9]" : "bg-gray-300"
            }`}
            disabled={!isStepValidated}
          >
            <Text className="text-white font-semibold text-base">
              {footerButtonText}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const FooterExtra = ({ children }: SubcomponentProps) => children;
FooterExtra.displayName = "FooterExtra";

export const OnboardingScreenLayout = Object.assign(
  OnboardingScreenLayoutRoot,
  {
    FooterExtra,
  }
);
