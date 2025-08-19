import { OnboardingScreenLayout } from "@/components/layouts/OnboardingScreenLayout";
import { LocationPermissionStatuses } from "@/src/definitions/enums/LocationPermissionStatuses.enum";
import { useOnboardUserService } from "@/src/presentation/services/OnboardingService";
import { useAuthUserProfileStore } from "@/src/presentation/stores/auth-user-profile.store";
import { useOnboardingStore } from "@/src/presentation/stores/onboarding.store";
import { requestLocationPermission } from "@/src/utils/location";
import { getSignedUrlForKey, uploadFile } from "@/src/utils/supabaseS3Storage";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect } from "react";
import { Alert, Dimensions, Image, Text, View } from "react-native";

const LocationImg = require("@/assets/images/location-img.png");

const AllowLocationScreen = () => {
  const screenHeight = Dimensions.get("window").height;
  const onboardingStore = useOnboardingStore();
  const setLatitude = useOnboardingStore((s) => s.setLatitude);
  const setLongitude = useOnboardingStore((s) => s.setLongitude);
  const userId = useAuthUserProfileStore((s: any) => s.userId || s.id || "");
  const userEmail = useAuthUserProfileStore((s: any) => s.email || "");
  const { mutate, isPending, isSuccess, isError, error } =
    useOnboardUserService();

  useEffect(() => {
    if (isSuccess) {
      router.push("/dashboard/swipe");
    }
    if (isError) {
      // Log the error for debugging
      console.error("Onboarding mutation error:", error);
      Alert.alert(
        "Error",
        "Ocurrió un problema al guardar tu perfil. Por favor intenta nuevamente."
      );
    }
  }, [isSuccess, isError, error]);

  const selectMyCurrentLocationAndContinue = async () => {
    try {
      // 1. Solicitar permisos de ubicación
      const permissionStatus = await requestLocationPermission();
      if (permissionStatus !== LocationPermissionStatuses.GRANTED) {
        Alert.alert(
          "Permisos requeridos",
          "Debes habilitar los permisos de ubicación para continuar"
        );
        return;
      }

      // 2. Obtener ubicación actual
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      // Guardar lat/lng en el store para asegurar que estén presentes
      setLatitude(latitude.toString());
      setLongitude(longitude.toString());

      // 3. Subir imágenes a S3 y obtener URLs firmadas
      let mainPictureUrl = onboardingStore.mainPicture;
      const randomString = () => Math.random().toString(36).slice(2, 8);
      if (mainPictureUrl && !mainPictureUrl.startsWith("https://")) {
        // Asumimos que es un URI local, subir a S3
        const mainPicBuffer = await fetch(mainPictureUrl).then((res) =>
          res.arrayBuffer()
        );
        const mainPicKey = `profiles/${userId}/${Date.now()}-${randomString()}-main.jpg`;
        await uploadFile(mainPicBuffer, mainPicKey, "image/jpeg");
        mainPictureUrl = await getSignedUrlForKey(mainPicKey, 24 * 3600);
      }

      const secondaryImagesUrls: string[] = [];
      for (const [i, img] of onboardingStore.secondaryImages.entries()) {
        if (img && !img.startsWith("https://")) {
          const imgBuffer = await fetch(img).then((res) => res.arrayBuffer());
          const imgKey = `profiles/${userId}/${Date.now()}-${randomString()}-secondary-${i}.jpg`;
          await uploadFile(imgBuffer, imgKey, "image/jpeg");
          const url = await getSignedUrlForKey(imgKey, 24 * 3600);
          secondaryImagesUrls.push(url);
        } else if (img) {
          secondaryImagesUrls.push(img);
        }
      }

      // 4. Actualizar el store con las URLs de S3
      onboardingStore.setMainPicture(mainPictureUrl);
      onboardingStore.setSecondaryImages(secondaryImagesUrls);

      console.log(JSON.stringify(onboardingStore, null, 2));

      // 5. Llamar al servicio de onboarding para guardar los datos
      // Validar campos requeridos antes de enviar
      const missingFields: string[] = [];
      // Esperar a que el store se actualice y luego armar el payload
      setTimeout(() => {
        const latestStore = useOnboardingStore.getState();
        const missingFields: string[] = [];
        if (!latestStore.alias) missingFields.push("alias");
        if (!latestStore.gender || latestStore.gender < 1) missingFields.push("género");
        if (!latestStore.minAgePreference) missingFields.push("edad mínima");
        if (!latestStore.maxAgePreference) missingFields.push("edad máxima");
        if (!latestStore.latitude || !latestStore.longitude) missingFields.push("ubicación");

        if (missingFields.length > 0) {
          Alert.alert(
            "Error",
            `Faltan datos requeridos para completar el perfil: ${missingFields.join(", ")}.`
          );
          return;
        }

        // Construir payload solo con los campos requeridos y válidos
        const payload: any = {
          user_id: userId,
          alias: latestStore.alias,
          gender: latestStore.gender,
          biography: latestStore.biography,
          birth_date: latestStore.birthDate
            ? (() => {
                // Convierte DD/MM/YYYY a YYYY-MM-DD
                const [d, m, y] = latestStore.birthDate.split("/");
                if (d && m && y) return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
                return latestStore.birthDate;
              })()
            : undefined,
          minAgePreference: latestStore.minAgePreference,
          maxAgePreference: latestStore.maxAgePreference,
          latitude: latestStore.latitude,
          longitude: latestStore.longitude,
          avatar: mainPictureUrl,
          secondary_images: secondaryImagesUrls,
          address: "Ubicación actual",
          is_onboarded: true,
        };

        console.log("Payload final de onboarding:", payload);
        mutate(payload);
      }, 100);
    } catch (error) {
      console.error("Error en ubicación/onboarding:", error);
      Alert.alert(
        "Error",
        "Ocurrió un problema al obtener tu ubicación o guardar tu información. Por favor intenta nuevamente."
      );
    }
  };

  return (
    <OnboardingScreenLayout
      showProgress
      progressValue={100}
      showBackButton
      isStepValidated={true}
      footerButtonText={isPending ? "Guardando..." : "Activar ubicación"}
      onFooterButtonPress={selectMyCurrentLocationAndContinue}
    >
      <View className="flex-1 pb-10 gap-10 items-center">
        <Text className="font-poppins font-bold text-3xl text-center">
          Necesitamos tu ubicación
        </Text>
        <Text className="font-poppins font-normal text-xl text-center">
          Queremos mostrarte gente real, cerca de ti.{"\n"}Para eso es
          importante tu ubicación, tu privacidad está segura
        </Text>
        <Image
          source={LocationImg}
          style={{
            width: "100%",
            height: screenHeight * 0.5,
            maxHeight: 400,
          }}
          resizeMode="contain"
        />
      </View>
    </OnboardingScreenLayout>
  );
};

export default AllowLocationScreen;
