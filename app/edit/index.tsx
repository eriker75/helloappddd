import CustomInputDate from "@/components/forms/CustomInputDate";
import CustomInputRangeSlider from "@/components/forms/CustomInputRangeSlider";
import CustomInputText from "@/components/forms/CustomInputText";
import CustomInputTextarea from "@/components/forms/CustomInputTextarea";
import CustomRadioButton from "@/components/forms/CustomRadioButton";
import { HStack, Text, VStack } from "@/components/ui";
import { GENDER_TYPES } from "@/src/definitions/constants/GENDER_TYPES";
import { INTEREST_TYPES } from "@/src/definitions/constants/INTEREST_TYPES";
import { useUpdateMyUserProfileInformation } from "@/src/presentation/services/UserProfileService";
import { useCurrentUserProfileStore } from "@/src/presentation/stores/current-user-profile.store";
import { EditProfileForm, editProfileSchema } from "@/src/presentation/validators/edit-profile.schema";
import { logWithColor } from "@/src/utils/logWithColor";
import { getSignedUrlForKey } from "@/src/utils/supabaseS3Storage";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, Alert, Image, ScrollView, TouchableOpacity, View } from "react-native";

/**
 * Extracts the S3 key from a Supabase Storage public URL.
 * Example:
 *   https://clotbfxzjhogaqddnetg.storage.supabase.co/storage/v1/s3/helloapp/profiles/df28690d-e65c-429e-96d5-7efbf8887064/1755286698016-684y0b-secondary-0.jpg?...
 *   => profiles/df28690d-e65c-429e-96d5-7efbf8887064/1755286698016-684y0b-secondary-0.jpg
 */
function extractS3KeyFromUrl(url: string): string | null {
  const match = url.match(/s3\/[^/]+\/(.+?)(\?|$)/);
  return match ? decodeURIComponent(match[1]) : null;
}

const EditProfileScreen = () => {
  // Store
  const profile = useCurrentUserProfileStore();

  // Helper: parse ISO date to DD/MM/YYYY
  function formatBirthDate(dateStr?: string) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
  // Helper: parse DD/MM/YYYY to ISO
  function parseBirthDate(input: string) {
    if (!input) return undefined;
    const [day, month, year] = input.split("/");
    if (!day || !month || !year) return undefined;
    return new Date(`${year}-${month}-${day}T00:00:00`);
  }

  // Main image: prefer avatar, else first secondary image, else ""
  const initialMainPicture =
    (typeof profile.avatar === "string" && profile.avatar) ||
    (Array.isArray(profile.secondaryImages) && profile.secondaryImages.length > 0 ? profile.secondaryImages[0] : "");

  const [mainPicture, setMainPicture] = useState(initialMainPicture);
  const [mainPictureSignedUrl, setMainPictureSignedUrl] = useState<string>("");
  const [secondaryImages, setSecondaryImages] = useState<string[]>(
    Array.isArray(profile.secondaryImages) ? profile.secondaryImages : []
  );
  const [secondaryImagesSignedUrls, setSecondaryImagesSignedUrls] = useState<string[]>([]);
  const [minAge, setMinAge] = useState(typeof profile.minAgePreference === "number" ? profile.minAgePreference : 18);
  const [maxAge, setMaxAge] = useState(typeof profile.maxAgePreference === "number" ? profile.maxAgePreference : 98);

  // Form
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<EditProfileForm>({
    resolver: zodResolver(editProfileSchema),
    mode: "onChange",
    defaultValues: {
      alias: typeof profile.alias === "string" ? profile.alias : "",
      birthDate: formatBirthDate(profile.birthDate),
      biography: typeof profile.biography === "string" ? profile.biography : "",
      gender:
        profile.gender === 1 ? GENDER_TYPES.MALE : profile.gender === 2 ? GENDER_TYPES.FEMALE : GENDER_TYPES.OTHER,
      // Prefer genderInterests, fallback to gederInterests, fallback to preferences.genders
      genderInterests:
        Array.isArray(profile.genderInterests) && profile.genderInterests.length > 0
          ? profile.genderInterests.map(String)
          : Array.isArray(profile.gederInterests) && profile.gederInterests.length > 0
          ? profile.gederInterests.map(String)
          : typeof (profile as any).preferences === "object" &&
            Array.isArray((profile as any).preferences.genders) &&
            (profile as any).preferences.genders.length > 0
          ? (profile as any).preferences.genders.map(String)
          : ["1", "2"], // Default to both if nothing
      minAgePreference: typeof profile.minAgePreference === "number" ? profile.minAgePreference : 18,
      maxAgePreference: typeof profile.maxAgePreference === "number" ? profile.maxAgePreference : 98,
      // Main picture: prefer avatar, else first secondary image
      mainPicture:
        typeof profile.avatar === "string" && profile.avatar
          ? profile.avatar
          : Array.isArray(profile.secondaryImages) && profile.secondaryImages.length > 0
          ? profile.secondaryImages[0]
          : "",
      secondaryImages: Array.isArray(profile.secondaryImages) ? profile.secondaryImages : [],
    },
  });

  // Keep form in sync with store
  useEffect(() => {
    setValue("alias", typeof profile.alias === "string" ? profile.alias : "");
    setValue("birthDate", formatBirthDate(profile.birthDate));
    setValue("biography", typeof profile.biography === "string" ? profile.biography : "");
    setValue(
      "gender",
      profile.gender === 1 ? GENDER_TYPES.MALE : profile.gender === 2 ? GENDER_TYPES.FEMALE : GENDER_TYPES.OTHER
    );
    setValue(
      "genderInterests",
      Array.isArray(profile.genderInterests) && profile.genderInterests.length > 0
        ? profile.genderInterests.map(String)
        : Array.isArray(profile.gederInterests) && profile.gederInterests.length > 0
        ? profile.gederInterests.map(String)
        : typeof (profile as any).preferences === "object" &&
          Array.isArray((profile as any).preferences.genders) &&
          (profile as any).preferences.genders.length > 0
        ? (profile as any).preferences.genders.map(String)
        : ["1", "2"]
    );
    setValue("minAgePreference", typeof profile.minAgePreference === "number" ? profile.minAgePreference : 18);
    setValue("maxAgePreference", typeof profile.maxAgePreference === "number" ? profile.maxAgePreference : 98);
    setValue("mainPicture", initialMainPicture);
    setValue("secondaryImages", Array.isArray(profile.secondaryImages) ? profile.secondaryImages : []);
    setMainPicture(initialMainPicture);
    setSecondaryImages(Array.isArray(profile.secondaryImages) ? profile.secondaryImages : []);
    setMinAge(typeof profile.minAgePreference === "number" ? profile.minAgePreference : 18);
    setMaxAge(typeof profile.maxAgePreference === "number" ? profile.maxAgePreference : 98);
  }, [initialMainPicture, profile, setValue]);

  // --- Fetch signed URLs for images ---
  useEffect(() => {
    async function fetchSignedUrls() {
      // Main picture
      let mainUrl = "";
      if (mainPicture && typeof mainPicture === "string" && mainPicture.startsWith("http")) {
        const key = extractS3KeyFromUrl(mainPicture);
        if (key) {
          try {
            mainUrl = await getSignedUrlForKey(key);
          } catch (e) {
            logWithColor(e, "red");
            mainUrl = mainPicture; // fallback to original
          }
        } else {
          mainUrl = mainPicture;
        }
      } else {
        mainUrl = mainPicture;
      }
      setMainPictureSignedUrl(mainUrl);

      // Secondary images
      const signedUrls: string[] = await Promise.all(
        (secondaryImages || []).map(async (img) => {
          if (img && typeof img === "string" && img.startsWith("http")) {
            const key = extractS3KeyFromUrl(img);
            if (key) {
              try {
                return await getSignedUrlForKey(key);
              } catch (e) {
                logWithColor(e, "red");
                return img;
              }
            }
            return img;
          }
          return img;
        })
      );
      setSecondaryImagesSignedUrls(signedUrls);
    }
    fetchSignedUrls();
  }, [mainPicture, secondaryImages]);

  // --- Image Picker Logic ---
  const pickImage = async (isMain: boolean, index?: number) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso requerido", "Se requiere acceso a la galería.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      if (isMain) {
        setMainPicture(uri);
        setValue("mainPicture", uri, { shouldDirty: true });
      } else if (typeof index === "number") {
        const updated = [...secondaryImages];
        updated[index] = uri;
        setSecondaryImages(updated);
        setValue("secondaryImages", updated, { shouldDirty: true });
      } else {
        if (secondaryImages.length < 4) {
          const updated = [...secondaryImages, uri];
          setSecondaryImages(updated);
          setValue("secondaryImages", updated, { shouldDirty: true });
        }
      }
    }
  };

  const removeSecondaryImage = (index: number) => {
    const updated = secondaryImages.filter((_, i) => i !== index);
    setSecondaryImages(updated);
    setValue("secondaryImages", updated, { shouldDirty: true });
  };

  // --- Update Service ---
  const updateProfileMutation = useUpdateMyUserProfileInformation();

  const onSubmit = (data: EditProfileForm) => {
    if (minAge > maxAge) {
      Alert.alert("Rango de edad inválido", "La edad mínima no puede ser mayor que la máxima.");
      return;
    }
    updateProfileMutation.updateMyProfile({
      userId: profile.userId,
      alias: data.alias,
      biography: data.biography,
      birthDate: parseBirthDate(data.birthDate) ? parseBirthDate(data.birthDate)!.toISOString() : undefined,
      gender: data.gender === GENDER_TYPES.MALE ? 1 : data.gender === GENDER_TYPES.FEMALE ? 2 : 3,
      genderInterests: data.genderInterests,
      avatar: mainPicture,
      secondaryImages,
      address: profile.address,
      lastOnline: profile.lastOnline ? new Date(profile.lastOnline).toISOString() : undefined,
      latitude: typeof profile.latitude === "number" ? profile.latitude : undefined,
      longitude: typeof profile.longitude === "number" ? profile.longitude : undefined,
      isOnboarded: profile.isOnboarded,
      isActive: profile.isActive,
      name: profile.alias || "",
      email: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      // preferences is omitted if not present in store
    });
  };

  useEffect(() => {
    if (updateProfileMutation.isSuccess) {
      Alert.alert("Perfil actualizado", "Tus datos han sido actualizados correctamente.");
    } else if (updateProfileMutation.isError) {
      Alert.alert("Error", "No se pudo actualizar el perfil. Intenta de nuevo.");
    }
    // Only run on mutation state change
  }, [updateProfileMutation.isSuccess, updateProfileMutation.isError]);

  console.log(JSON.stringify(profile, null, 2));

  // --- UI ---
  return (
    <View style={{ flex: 1, backgroundColor: "#fff", paddingTop: 32 }}>
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 20 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-3xl font-bold text-[#1B1B1F] mt-2 mb-4">Edita tu perfil</Text>
        <VStack space="lg">
          {/* Alias */}
          <Controller
            control={control}
            name="alias"
            render={({ field: { onChange, value } }) => (
              <CustomInputText label="Nombre a mostrar" value={value} setValue={onChange} placeholder="Tu Nombre" />
            )}
          />
          {/* Fecha de nacimiento */}
          <Controller
            control={control}
            name="birthDate"
            render={({ field: { onChange, value } }) => (
              <CustomInputDate label="Fecha de nacimiento" value={value} setValue={onChange} placeholder="DD/MM/AAAA" />
            )}
          />
          {/* Biografía */}
          <Controller
            control={control}
            name="biography"
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
                  {errors.biography?.message ? String(errors.biography.message) : " "}
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
                <Text className="text-[#35313D] mb-3 font-medium text-base">Tu Género</Text>
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
                  <CustomRadioButton
                    label="Otro"
                    value={GENDER_TYPES.OTHER}
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
            name="genderInterests"
            render={({ field: { onChange, value } }) => {
              // Normalize value to array of strings
              let interests = Array.isArray(value) ? value.map(String) : [];
              if (!Array.isArray(value) || value.length === 0) {
                interests = ["1", "2"]; // Default to both
              }
              const isFemale = interests.length === 1 && interests[0] === INTEREST_TYPES.FEMALE;
              const isMale = interests.length === 1 && interests[0] === INTEREST_TYPES.MALE;
              const isBoth =
                interests.length === 2 &&
                interests.includes(INTEREST_TYPES.MALE) &&
                interests.includes(INTEREST_TYPES.FEMALE);
              return (
                <VStack className="mt-3">
                  <Text className="text-[#35313D] mb-3 font-medium text-base">Quiero conocer</Text>
                  <HStack space="md">
                    <CustomRadioButton
                      label="Mujeres"
                      value={INTEREST_TYPES.FEMALE}
                      selectedValue={isFemale ? INTEREST_TYPES.FEMALE : ""}
                      onSelect={() => onChange([INTEREST_TYPES.FEMALE])}
                    />
                    <CustomRadioButton
                      label="Hombres"
                      value={INTEREST_TYPES.MALE}
                      selectedValue={isMale ? INTEREST_TYPES.MALE : ""}
                      onSelect={() => onChange([INTEREST_TYPES.MALE])}
                    />
                    <CustomRadioButton
                      label="Ambos"
                      value="both"
                      selectedValue={isBoth ? "both" : ""}
                      onSelect={() => onChange([INTEREST_TYPES.MALE, INTEREST_TYPES.FEMALE])}
                    />
                  </HStack>
                  <Text className="text-red-500 text-xs mt-1" style={{ minHeight: 18 }}>
                    {errors.genderInterests?.message ? String(errors.genderInterests.message) : " "}
                  </Text>
                </VStack>
              );
            }}
          />
          {/* Rango de edad */}
          <VStack className="mt-3">
            <HStack className="justify-between items-center mb-2">
              <Text className="font-bold text-lg text-[#1B1B1F]">Rango de edad</Text>
              <Text className="text-[#35313D] text-base font-medium">
                {maxAge >= 98 ? `${minAge} a 98 años` : `${minAge} a ${maxAge} años`}
              </Text>
            </HStack>
            <CustomInputRangeSlider
              value={[minAge, maxAge]}
              min={18}
              max={98}
              onChange={([min, max]) => {
                setMinAge(min);
                setMaxAge(max);
                setValue("minAgePreference", min, { shouldDirty: true });
                setValue("maxAgePreference", max, { shouldDirty: true });
              }}
            />
          </VStack>
          {/* Pictures Section - Onboarding Style */}
          <VStack className="mt-8 items-center w-full">
            <Text className="text-2xl font-bold text-black text-left mb-4">Edita tus fotos de perfil</Text>
            <Text className="text-gray-600 text-left text-base mb-6">Puedes actualizar tus fotos cuando quieras.</Text>
            {/* Main Picture */}
            <View className="items-center mb-8">
              <TouchableOpacity
                onPress={() => pickImage(true)}
                className="w-64 h-64 rounded-full bg-[#7CDAF9] items-center justify-center relative"
                style={{
                  elevation: 2,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                }}
              >
                {mainPictureSignedUrl ? (
                  <Image
                    source={{ uri: mainPictureSignedUrl }}
                    className="w-full h-full rounded-full"
                    style={{ width: 256, height: 256, borderRadius: 128 }}
                  />
                ) : (
                  <Ionicons name="camera" size={64} color="#fff" />
                )}
                <View className="absolute bottom-2 right-2 bg-[#1E1E1E] rounded-full w-12 h-12 items-center justify-center">
                  <Ionicons name="add" size={24} color="white" />
                </View>
              </TouchableOpacity>
            </View>
            {/* Secondary Images */}
            <View className="bg-[#EAF9FE] rounded-3xl p-6 w-full max-w-[340px]">
              <View className="flex-row justify-between">
                {[...Array(4)].map((_, index) => {
                  const secondaryPhotoUri = secondaryImages[index];
                  const signedUrl = secondaryImagesSignedUrls[index];
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        if (secondaryPhotoUri) {
                          Alert.alert("Foto secundaria", "Elige una opción", [
                            { text: "Cancelar", style: "cancel" },
                            {
                              text: "Cambiar",
                              onPress: () => pickImage(false, index),
                            },
                            {
                              text: "Eliminar",
                              onPress: () => removeSecondaryImage(index),
                              style: "destructive",
                            },
                          ]);
                        } else {
                          pickImage(false);
                        }
                      }}
                      className="w-16 h-16 rounded-full bg-sky-300 items-center justify-center"
                      style={{
                        elevation: 1,
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.1,
                        shadowRadius: 2,
                      }}
                    >
                      {signedUrl ? (
                        <Image
                          source={{ uri: signedUrl }}
                          className="w-full h-full rounded-full"
                          style={{ width: 64, height: 64, borderRadius: 32 }}
                        />
                      ) : (
                        <Ionicons name="add" size={24} color="white" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </VStack>
          {/* Submit Button - Onboarding Style */}
          <View style={{ marginTop: 40, alignItems: "center" }}>
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid || updateProfileMutation.isPending}
              style={{
                backgroundColor: !isValid || updateProfileMutation.isPending ? "#B0E0EF" : "#7CDAF9",
                borderRadius: 24,
                paddingVertical: 16,
                paddingHorizontal: 48,
                alignItems: "center",
                justifyContent: "center",
                width: 240,
                shadowColor: "#000",
                shadowOpacity: 0.08,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
                opacity: !isValid || updateProfileMutation.isPending ? 0.7 : 1,
              }}
            >
              {updateProfileMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>Actualizar</Text>
              )}
            </TouchableOpacity>
          </View>
        </VStack>
      </ScrollView>
    </View>
  );
};

export default EditProfileScreen;
