import CameraIcon from "@/assets/images/camera-icon.svg";
import { OnboardingScreenLayout } from "@/components/layouts/OnboardingScreenLayout";
import { Text } from "@/components/ui/text";
import { useOnboardingStore } from "@/src/presentation/stores/onboarding.store";
import { validateOnboardingStep } from "@/src/utils/validateOnboardingStep";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Image, TouchableOpacity, View } from "react-native";

const AddYourPicturesScreen = () => {
  // Obtener propiedades del estado
  const mainPicture = useOnboardingStore((state) => state.mainPicture);
  const secondaryImages = useOnboardingStore((state) => state.secondaryImages);

  // Obtener acciones del store
  const setMainPicture = useOnboardingStore((state) => state.setMainPicture);
  const addSecondaryImage = useOnboardingStore(
    (state) => state.addSecondaryImage
  );
  const setSecondaryImages = useOnboardingStore(
    (state) => state.setSecondaryImages
  );
  const [isValidStep, setIsValidStep] = useState(false);

  const requestPermissions = async (type: "camera" | "gallery") => {
    try {
      if (type === "camera") {
        const { status: cameraStatus } =
          await ImagePicker.requestCameraPermissionsAsync();
        if (cameraStatus !== "granted") {
          Alert.alert(
            "Permisos requeridos",
            "Necesitamos permisos para acceder a la cámara"
          );
          return false;
        }
        return true;
      } else {
        const { status: libraryStatus } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (libraryStatus !== "granted") {
          Alert.alert(
            "Permisos requeridos",
            "Necesitamos permisos para acceder a la galería"
          );
          return false;
        }
        return true;
      }
    } catch (error) {
      console.error("Error al solicitar permisos:", error);
      Alert.alert("Error", "Ocurrió un error al solicitar los permisos");
      return false;
    }
  };

  const showImagePickerOptions = (
    isMainPhoto: boolean,
    photoIndex?: number
  ) => {
    Alert.alert("Seleccionar imagen", "Elige una opción", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cámara",
        onPress: () => pickImage("camera", isMainPhoto, photoIndex),
      },
      {
        text: "Galería",
        onPress: () => pickImage("gallery", isMainPhoto, photoIndex),
      },
    ]);
  };

  const pickImage = async (
    source: "camera" | "gallery",
    isMainPhoto: boolean,
    photoIndex?: number
  ) => {
    const hasPermission = await requestPermissions(source);
    if (!hasPermission) return;

    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    };

    let result;
    if (source === "camera") {
      result = await ImagePicker.launchCameraAsync(options);
    } else {
      result = await ImagePicker.launchImageLibraryAsync(options);
    }

    if (!result.canceled && result.assets[0]) {
      const newPhotoUri = result.assets[0].uri;

      if (isMainPhoto) {
        setMainPicture(newPhotoUri);
      } else {
        if (photoIndex !== undefined) {
          // Reemplazar foto existente
          const updatedPhotos = [...secondaryImages];
          updatedPhotos[photoIndex] = newPhotoUri;
          setSecondaryImages(updatedPhotos);
        } else {
          // Agregar nueva foto
          if (secondaryImages.length < 4) {
            addSecondaryImage(newPhotoUri);
          }
        }
      }
    }
  };

  const handleRemoveSecondaryPhoto = (index: number) => {
    const updatedPhotos = secondaryImages.filter((_, i) => i !== index);
    setSecondaryImages(updatedPhotos);
  };

  useEffect(() => {
    const checkValidation = async () => {
      const isValid = await validateOnboardingStep(3, {
        mainPicture,
        secondaryImages,
      });
      setIsValidStep(isValid);
    };
    checkValidation();
  }, [mainPicture, secondaryImages]);

  const handleContinue = async () => {
    const isValid = await validateOnboardingStep(3, {
      mainPicture,
      secondaryImages,
    });
    if (isValid) {
      router.push("/onboarding/location");
    } else {
      Alert.alert(
        "Fotos requeridas",
        "Debes seleccionar al menos una foto principal para continuar"
      );
    }
  };

  return (
    <OnboardingScreenLayout
      showProgress
      progressValue={75}
      showBackButton
      isStepValidated={isValidStep}
      footerButtonText="Listo, conocer amigos"
      onFooterButtonPress={handleContinue}
    >
      <View className="flex-1 h-full items-center pb-10">
        <View className="flex flex-1 justify-between h-full gap-10">
          {/* Título */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-black text-left mb-2">
              ¡Que se vea ese flow! ✨
            </Text>
            <Text className="text-gray-600 text-left text-xl">
              Elige una o varias fotos que te represente.
            </Text>
            <Text className="text-gray-600 text-left text-xl">
              Tranquilo, nada formal 😉
            </Text>
          </View>

          {/* Foto principal */}
          <View className="items-center mb-8">
            <TouchableOpacity
              onPress={() => showImagePickerOptions(true)}
              className="w-64 h-64 rounded-full bg-[#7CDAF9] items-center justify-center relative"
              style={{
                elevation: 2,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              }}
            >
              {mainPicture ? (
                <Image
                  source={{ uri: mainPicture }}
                  className="w-full h-full rounded-full"
                />
              ) : (
                <CameraIcon />
              )}
              <View className="absolute bottom-2 right-2 bg-[#1E1E1E] rounded-full w-12 h-12 items-center justify-center">
                <Ionicons name="add" size={20} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Fotos secundarias */}
          <View className="bg-[#EAF9FE] rounded-3xl p-6">
            <View className="flex-row justify-between">
              {[...Array(4)].map((_, index) => {
                const secondaryPhotoUri = secondaryImages[index];
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      if (secondaryPhotoUri) {
                        Alert.alert("Foto secundaria", "Elige una opción", [
                          { text: "Cancelar", style: "cancel" },
                          {
                            text: "Cambiar",
                            onPress: () => showImagePickerOptions(false, index),
                          },
                          {
                            text: "Eliminar",
                            onPress: () => handleRemoveSecondaryPhoto(index),
                            style: "destructive",
                          },
                        ]);
                      } else {
                        showImagePickerOptions(false);
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
                    {secondaryPhotoUri ? (
                      <Image
                        source={{ uri: secondaryPhotoUri }}
                        className="w-full h-full rounded-full"
                      />
                    ) : (
                      <Ionicons
                        name="add"
                        size={24}
                        color="white"
                        className="font-bold"
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </View>
    </OnboardingScreenLayout>
  );
};

export default AddYourPicturesScreen;
