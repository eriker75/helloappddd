import { OnboardingScreenLayout } from "@/components/layouts/OnboardingScreenLayout";
import { Pressable } from "@/components/ui/pressable";
import { useAuthUserProfileStore } from "@/src/presentation/stores/auth-user-profile.store";
import { useOnboardingStore } from "@/src/presentation/stores/onboarding.store";
import { validateOnboardingStep } from "@/src/utils/validateOnboardingStep";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  View,
} from "react-native";

const StartOnboardingScreen = () => {
  // Use the correct store hooks
  const name = useOnboardingStore((state) => state.name);
  const setName = useOnboardingStore((state) => state.setName);
  const userProfile = useAuthUserProfileStore((state) => state);

  const [isFocused, setIsFocused] = useState(false);
  const [isValidStep, setIsValidStep] = useState(false);

  // Redirect if user is already onboarded
  useEffect(() => {
    if (userProfile?.isOnboarded) {
      router.replace("/dashboard/radar");
    }
  }, [userProfile?.isOnboarded]);

  // Autofill name from user profile if available
  useEffect(() => {
    if (userProfile?.name) {
      setName(userProfile.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile?.name]);

  // Validate step 1 using the helper
  useEffect(() => {
    const checkValidation = async () => {
      const isValid = await validateOnboardingStep(1, { name });
      setIsValidStep(isValid);
    };
    checkValidation();
  }, [name]);

  const getPlaceholderText = () =>
    !isFocused && name.length === 0 ? "[nombre]" : "";

  const handleContinue = async () => {
    const isValid = await validateOnboardingStep(1, { name });
    if (isValid) {
      router.push("/onboarding/basicinfo");
    } else {
      Alert.alert(
        "Nombre Requerido",
        "Por favor dinos como te llamas para poder continuar"
      );
    }
  };

  return (
    <OnboardingScreenLayout
      showProgress
      progressValue={25}
      showBackButton
      footerButtonText="Continuar"
      isStepValidated={isValidStep}
      onFooterButtonPress={handleContinue}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-center"
      >
        <View className="mb-8">
          <View className="flex-row flex-wrap items-baseline mb-4">
            <Text className="text-2xl font-bold text-gray-900">¡Hola, </Text>

            <TextInput
              value={name}
              onChangeText={setName}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={getPlaceholderText()}
              placeholderTextColor="#9CA3AF"
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: "#111827",
                padding: 0,
                margin: 0,
              }}
              returnKeyType="done"
              autoCapitalize="words"
              autoCorrect={false}
              autoFocus
            />

            <Text className="text-2xl font-bold text-gray-900"> !</Text>
          </View>

          <Text className="text-gray-600 text-base leading-6">
            Ya casi terminamos...{"\n"}solo unos detalles más para comenzar
          </Text>
        </View>
      </KeyboardAvoidingView>

      <OnboardingScreenLayout.FooterExtra>
        <Text className="text-center text-sm text-gray-500">
          Al continuar aceptas los{" "}
          <Pressable
            onPress={() => router.push("/onboarding/terms-and-conditions")}
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
          >
            <Text className="text-[#7CDAF9] font-bold underline">
              Términos y Condiciones
            </Text>
          </Pressable>
        </Text>
      </OnboardingScreenLayout.FooterExtra>
    </OnboardingScreenLayout>
  );
};

export default StartOnboardingScreen;
