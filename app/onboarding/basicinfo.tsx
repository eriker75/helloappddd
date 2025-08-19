import CustomInputDate from "@/components/forms/CustomInputDate";
import CustomInputRangeSlider from "@/components/forms/CustomInputRangeSlider";
import CustomInputText from "@/components/forms/CustomInputText";
import CustomInputTextarea from "@/components/forms/CustomInputTextarea";
import CustomRadioButton from "@/components/forms/CustomRadioButton";
import { OnboardingScreenLayout } from "@/components/layouts/OnboardingScreenLayout";
import { HStack, Text, VStack } from "@/components/ui";
import { GENDER_TYPES } from "@/src/definitions/constants/GENDER_TYPES";
import { INTEREST_TYPES } from "@/src/definitions/constants/INTEREST_TYPES";
import { useOnboardingStore } from "@/src/presentation/stores/onboarding.store";
import { Step2Data, step2Schema } from "@/src/presentation/validators/onboardin.shemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, ScrollView } from "react-native";

const BasicInfoScreen = () => {
  const alias = useOnboardingStore((state) => state.alias);
  const birthDate = useOnboardingStore((state) => state.birthDate);
  const biography = useOnboardingStore((state) => state.biography);
  const gender = useOnboardingStore((state) => state.gender);
  const genderInterests = useOnboardingStore((state) => state.genderInterests);
  const minAgePreference = useOnboardingStore((state) => state.minAgePreference);
  const maxAgePreference = useOnboardingStore((state) => state.maxAgePreference);
  const setMinAgePreference = useOnboardingStore((state) => state.setMinAgePreference);
  const setMaxAgePreference = useOnboardingStore((state) => state.setMaxAgePreference);
  const setAlias = useOnboardingStore((state) => state.setAlias);
  const setBirthDate = useOnboardingStore((state) => state.setBirthDate);
  const setBiography = useOnboardingStore((state) => state.setBiography);
  const setGender = useOnboardingStore((state) => state.setGender);
  const setGenderInterests = useOnboardingStore((state) => state.setGenderInterests);

  // Map gender number to string enum for form default
  let genderStr = "";
  if (gender === 1) genderStr = GENDER_TYPES.MALE;
  else if (gender === 2) genderStr = GENDER_TYPES.FEMALE;
  else if (gender === 3) genderStr = GENDER_TYPES.OTHER;

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid }
  } = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    mode: "onChange",
    defaultValues: {
      alias: alias || "",
      birth_date: birthDate || "",
      bio: biography || "",
      gender: genderStr as Step2Data["gender"],
      interestedIn: (genderInterests || []) as Step2Data["interestedIn"],
    }
  });

  // Keep store in sync with form
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "alias") setAlias(value.alias || "");
      if (name === "birth_date") setBirthDate(value.birth_date || "");
      if (name === "bio") setBiography(value.bio || "");
      if (name === "gender") {
        if (value.gender === GENDER_TYPES.MALE) setGender(1);
        else if (value.gender === GENDER_TYPES.FEMALE) setGender(2);
        else if (value.gender === GENDER_TYPES.OTHER) setGender(3);
      }
      if (name === "interestedIn") setGenderInterests(
        (value.interestedIn || []) as string[]
      );
    });
    return () => subscription.unsubscribe();
  }, [watch, setAlias, setBirthDate, setBiography, setGender, setGenderInterests]);

  // Removed unused helpers: getSelectedInterestType, handleGenderSelect

  const [isValidStep, setIsValidStep] = useState(false);

  // Custom validation for age range
  useEffect(() => {
    const isAgeRangeValid =
      minAgePreference >= 18 &&
      minAgePreference <= maxAgePreference &&
      maxAgePreference <= 98;
    setIsValidStep(isValid && isAgeRangeValid);
  }, [isValid, minAgePreference, maxAgePreference]);

  // (Removed unused handleGenderSelect and getSelectedInterestType)

  // (Removed old validation useEffect, now handled by react-hook-form and age range effect)

  const handleContinue = (formData: any) => {
    const isAgeRangeValid =
      minAgePreference >= 18 &&
      minAgePreference <= maxAgePreference &&
      maxAgePreference <= 98;

    if (!isAgeRangeValid) {
      Alert.alert(
        "Rango de edad inválido",
        "La edad mínima debe ser mayor o igual a 18, menor o igual que la máxima, y la máxima no debe superar 98 años."
      );
      setIsValidStep(false);
      return;
    }

    router.push("/onboarding/pictures");
  };

  return (
    <OnboardingScreenLayout
      showProgress
      progressValue={50}
      showBackButton
      isStepValidated={isValidStep}
      footerButtonText="Continuar"
      onFooterButtonPress={handleSubmit(handleContinue)}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-3xl font-bold text-[#1B1B1F] mt-2">
          ¡Arma tu perfil en un toque!
        </Text>

        <VStack space="lg" className="mt-6">
          {/* Alias */}
          <Controller
            control={control}
            name="alias"
            render={({ field: { onChange, value } }) => (
              <CustomInputText
                label="Nombre a mostrar"
                value={value}
                setValue={onChange}
                placeholder="Tu Nombre"
              />
            )}
          />

          {/* Fecha de nacimiento */}
          <Controller
            control={control}
            name="birth_date"
            render={({ field: { onChange, value } }) => (
              <CustomInputDate
                label="Fecha de nacimiento"
                value={value}
                setValue={onChange}
                placeholder="DD/MM/AAAA"
              />
            )}
          />

          {/* Biografía */}
          <Controller
            control={control}
            name="bio"
            render={({ field: { onChange, value } }) => (
              <>
                <CustomInputTextarea
                  label="Acerca de ti"
                  value={value}
                  setValue={onChange}
                  placeholder="Descríbete para hacer nuevos amigos"
                  maxLength={250}
                />
                <Text className="text-red-500 text-xs mt-1" style={{ minHeight: 18 }}>
                  {errors.bio?.message ? String(errors.bio.message) : " "}
                </Text>
              </>
            )}
          />

          {/* Género */}
          <Controller
            control={control}
            name="gender"
            render={({ field: { onChange, value } }) => (
              <VStack className="mt-3">
                <Text className="text-[#35313D] mb-3 font-medium text-base">
                  Tu Género
                </Text>
                <HStack space="xl" className="items-center">
                  <CustomRadioButton
                    label="Hombre"
                    value={GENDER_TYPES.MALE}
                    selectedValue={value}
                    onSelect={onChange}
                  />
                  <CustomRadioButton
                    label="Mujer"
                    value={GENDER_TYPES.FEMALE}
                    selectedValue={value}
                    onSelect={onChange}
                  />
                </HStack>
                <Text className="text-red-500 text-xs mt-1" style={{ minHeight: 18 }}>
                  {errors.gender?.message ? String(errors.gender.message) : " "}
                </Text>
              </VStack>
            )}
          />

          {/* Intereses */}
          <Controller
            control={control}
            name="interestedIn"
            render={({ field: { onChange, value } }) => {
              // Helper for radio group
              const getSelectedInterestType = () => {
                if (
                  value?.includes(INTEREST_TYPES.MALE) &&
                  value?.includes(INTEREST_TYPES.FEMALE)
                ) {
                  return "both";
                }
                if (value?.includes(INTEREST_TYPES.MALE)) {
                  return "male";
                }
                if (value?.includes(INTEREST_TYPES.FEMALE)) {
                  return "female";
                }
                return null;
              };
              return (
                <VStack className="mt-3">
                  <Text className="text-[#35313D] mb-3 font-medium text-base">
                    Quiero conocer
                  </Text>
                  <HStack space="md">
                    <CustomRadioButton
                      label="Mujeres"
                      value={INTEREST_TYPES.FEMALE}
                      selectedValue={
                        getSelectedInterestType() === "female"
                          ? INTEREST_TYPES.FEMALE
                          : ""
                      }
                      onSelect={() => onChange([INTEREST_TYPES.FEMALE])}
                    />
                    <CustomRadioButton
                      label="Hombres"
                      value={INTEREST_TYPES.MALE}
                      selectedValue={
                        getSelectedInterestType() === "male"
                          ? INTEREST_TYPES.MALE
                          : ""
                      }
                      onSelect={() => onChange([INTEREST_TYPES.MALE])}
                    />
                    <CustomRadioButton
                      label="Ambos"
                      value="both"
                      selectedValue={
                        getSelectedInterestType() === "both" ? "both" : ""
                      }
                      onSelect={() =>
                        onChange([INTEREST_TYPES.MALE, INTEREST_TYPES.FEMALE])
                      }
                    />
                  </HStack>
                  <Text className="text-red-500 text-xs mt-1" style={{ minHeight: 18 }}>
                    {errors.interestedIn?.message ? String(errors.interestedIn.message) : " "}
                  </Text>
                </VStack>
              );
            }}
          />

          {/* Rango de edad */}
          <VStack className="mt-3">
            <HStack className="justify-between items-center mb-2">
              <Text className="font-bold text-lg text-[#1B1B1F]">
                Rango de edad
              </Text>
              <Text className="text-[#35313D] text-base font-medium">
                {maxAgePreference >= 98
                  ? `${minAgePreference} a ∞ años`
                  : `${minAgePreference} a ${maxAgePreference} años`}
              </Text>
            </HStack>
            <CustomInputRangeSlider
              value={[minAgePreference, maxAgePreference]}
              min={18}
              max={98}
              onChange={([min, max]) => {
                setMinAgePreference(min);
                setMaxAgePreference(max);
              }}
            />
          </VStack>
        </VStack>
      </ScrollView>
    </OnboardingScreenLayout>
  );
};

export default BasicInfoScreen;
