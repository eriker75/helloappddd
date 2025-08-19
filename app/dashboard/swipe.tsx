import { Avatar, AvatarImage, Text } from "@/components/ui";
import {
  useCanSwipe,
  useFetchSwipeableProfiles,
  useSwipeableProfilesState,
  useSwipeProfile,
} from "@/src/presentation/services/SwipeableProfilesService";
import { useAuthUserProfileStore } from "@/src/presentation/stores/auth-user-profile.store";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Key, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import Reanimated, {
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

const GENDER_TEXT: Record<number, string> = {
  0: "Mujer",
  1: "Hombre",
  2: "Otro",
};

const AnimatedMaterialIcons = Reanimated.createAnimatedComponent(MaterialIcons);

const ReanimatedIcon = ({
  name,
  size,
  animatedColor,
  baseColor,
  activeColor,
}: {
  name: string;
  size: number;
  animatedColor: any;
  baseColor: string;
  activeColor: string;
}) => {
  const animatedProps = useAnimatedProps(() => {
    return {
      color: interpolateColor(
        animatedColor.value,
        [0, 1],
        [baseColor, activeColor]
      ),
    };
  });

  return (
    <AnimatedMaterialIcons
      name={name as any}
      size={size}
      animatedProps={animatedProps}
      color={baseColor}
    />
  );
};

const SwipeScreen = () => {
  // Obtener usuario autenticado y preferencias
  const { userId, maxDistancePreference } = useAuthUserProfileStore();
  // Estado y hooks del servicio real
  console.log(
    "[SwipeScreen] userId:",
    userId,
    "maxDistancePreference:",
    maxDistancePreference
  );
  useFetchSwipeableProfiles(userId, maxDistancePreference);
  const { nearbySwipeableProfiles, hasMore } = useSwipeableProfilesState();
  const { swipe, isLoading: isSwiping } = useSwipeProfile(userId);
  const canSwipe = useCanSwipe();

  console.log(JSON.stringify(nearbySwipeableProfiles, null, 2));

  // Reanimated values for Like/Pass button animation
  const likeAnim = useSharedValue(0);
  const passAnim = useSharedValue(0);

  const [profileIndex, setProfileIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();

  // Perfil actual (por índice local)
  console.log(
    "[SwipeScreen] nearbySwipeableProfiles:",
    nearbySwipeableProfiles
  );
  const currentProfile =
    nearbySwipeableProfiles &&
    nearbySwipeableProfiles.length > 0 &&
    profileIndex < nearbySwipeableProfiles.length
      ? nearbySwipeableProfiles[profileIndex]
      : undefined;
  console.log(
    "[SwipeScreen] profileIndex:",
    profileIndex,
    "currentProfile:",
    currentProfile,
    "profilesLen:",
    nearbySwipeableProfiles.length
  );

  // Carousel: avatar (primero, centrado) + hasta 4 secondaryImages (máx 5 imágenes)
  const images = currentProfile
    ? [
        currentProfile.avatar,
        ...(Array.isArray(currentProfile.secondaryImages)
          ? currentProfile.secondaryImages.slice(0, 4)
          : []),
      ].filter(Boolean)
    : [];

  // Handle scroll events to update photo index
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setPhotoIndex(currentIndex);
  };

  // Animaciones para like/pass
  const triggerLike = () => {
    console.log(
      "[triggerLike] Button pressed. canSwipe:",
      canSwipe,
      "isSwiping:",
      isSwiping,
      "currentProfile:",
      currentProfile
    );
    if (!canSwipe || isSwiping) {
      console.log("[triggerLike] Blocked: canSwipe or isSwiping is false");
      return;
    }
    console.log("[triggerLike] Animation starting");
    likeAnim.value = withTiming(1, { duration: 150 }, (finished) => {
      if (finished) {
        likeAnim.value = withTiming(0, { duration: 150 }, (finished2) => {
          if (finished2) {
            console.log(
              "[triggerLike] Animation finished, calling handleSwipe(true)"
            );
            runOnJS(() => handleSwipe(true))();
          }
        });
      }
    });
  };

  const triggerPass = () => {
    console.log(
      "[triggerPass] Button pressed. canSwipe:",
      canSwipe,
      "isSwiping:",
      isSwiping,
      "currentProfile:",
      currentProfile
    );
    if (!canSwipe || isSwiping) {
      console.log("[triggerPass] Blocked: canSwipe or isSwiping is false");
      return;
    }
    console.log("[triggerPass] Animation starting");
    passAnim.value = withTiming(1, { duration: 150 }, (finished) => {
      if (finished) {
        passAnim.value = withTiming(0, { duration: 150 }, (finished2) => {
          if (finished2) {
            console.log(
              "[triggerPass] Animation finished, calling handleSwipe(false)"
            );
            runOnJS(() => handleSwipe(false))();
          }
        });
      }
    });
  };

  // Swipe real: like/pass y avanza la cola
  const handleSwipe = async (isLiked: boolean) => {
    try {
      if (!currentProfile) {
        console.log("[handleSwipe] No currentProfile, aborting.");
        return;
      }
      console.log(
        "[handleSwipe] Swiping profile:",
        currentProfile,
        "isLiked:",
        isLiked
      );
      let swipeResult;
      try {
        console.log("[handleSwipe] Calling swipe mutation...");
        swipeResult = await swipe(currentProfile.userId, isLiked, null); // null: el backend debe cargar el siguiente
        console.log("[handleSwipe] swipeResult:", swipeResult);
      } catch (err) {
        // Mostrar error pero avanzar la cola localmente
        console.error("[handleSwipe] Error en swipe mutation:", err);
      }
      // Avanzar el índice localmente
      console.log(
        "[handleSwipe] Before setProfileIndex, current:",
        profileIndex,
        "profilesLen:",
        nearbySwipeableProfiles.length
      );
      setTimeout(() => {
        setProfileIndex((prev) => {
          const nextIndex = prev + 1;
          console.log(
            "[handleSwipe] Advancing to next profileIndex:",
            nextIndex,
            "profilesLen:",
            nearbySwipeableProfiles.length
          );
          return nextIndex;
        });
      }, 0);
      setPhotoIndex(0);
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: 0, animated: false });
      }
      // Si se llegó al final del batch, mostrar mensaje o recargar
      if (profileIndex + 1 >= nearbySwipeableProfiles.length) {
        console.warn(
          "[handleSwipe] No hay más perfiles en el batch. Considera recargar o pedir más."
        );
        // Aquí podrías disparar un refetch o mostrar un mensaje al usuario
      }
      // Feedback si se alcanzó el límite
      if (swipeResult && swipeResult.reachedDailyLimit) {
        // Puedes mostrar un toast, modal o alerta aquí
        console.warn("[handleSwipe] Has alcanzado el límite diario de swipes.");
      }
      console.log("[handleSwipe] End of function");
    } catch (err) {
      console.error("[handleSwipe] Unhandled error:", err);
    }
  };

  // Truncate bio for excerpt
  const bioExcerpt =
    (currentProfile?.biography || "").length > 60
      ? currentProfile?.biography?.slice(0, 60) + "..."
      : currentProfile?.biography;

  // Tailwind classes for overlay
  const gradientOverlayStyle = {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="absolute inset-0 z-[1]">
        {/* Image ScrollView - Main scrollable content */}
        {currentProfile && images.length > 0 ? (
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            className="absolute inset-0 z-[1]"
            contentContainerStyle={{}}
          >
            {images.map((imgSrc: any, index: number) => {
              const imgSource =
                typeof imgSrc === "string" && imgSrc
                  ? { uri: imgSrc }
                  : require("@/assets/images/avatar-placeholder.png");
              console.log("[Image Render] imgSrc:", imgSrc, "used:", imgSource);
              return (
                <View
                  key={index}
                  className="relative"
                  style={{ width, height }}
                >
                  <Image
                    source={imgSource}
                    style={{ width, height }}
                    className=""
                    resizeMode="cover"
                  />
                  {/* Overlay per image */}
                  <View style={gradientOverlayStyle} pointerEvents="none" />
                </View>
              );
            })}
          </ScrollView>
        ) : (
          <View className="relative" style={{ width, height }}>
            <Image
              source={require("@/assets/images/avatar-placeholder.png")}
              style={{ width, height }}
              className=""
              resizeMode="cover"
            />
            <View style={gradientOverlayStyle} pointerEvents="none" />
          </View>
        )}

        {/* Top bar */}
        <View
          className="absolute left-0 w-full flex-row items-center justify-between px-[18px] pt-[30px] z-[10]"
          style={{ top: 0, height: 90 }}
          pointerEvents="box-none"
        >
          <View style={{ width: 38, height: 38 }} />
          <Text className="text-white text-[28px] font-semibold text-center flex-1 mx-[10px]">
            Hola
          </Text>
          <Pressable
            onPress={() => router.push("/dashboard/profile")}
            className="w-[38px] h-[38px] rounded-full overflow-hidden border-2 border-white items-center justify-center"
          >
            <Avatar size="sm" className="w-full h-full">
              <AvatarImage
                source={
                  userId && useAuthUserProfileStore.getState().avatar
                    ? { uri: useAuthUserProfileStore.getState().avatar }
                    : require("@/assets/images/avatar-placeholder.png")
                }
              />
            </Avatar>
          </Pressable>
        </View>

        {/* Dots indicator */}
        {images.length > 1 && (
          <View
            className="absolute left-0 right-0 flex-row justify-center items-center z-[5] px-5"
            style={{ top: 120 }}
            pointerEvents="none"
          >
            {images.map((_: any, i: Key | null | undefined) => (
              <View
                key={i}
                className={`w-2 h-2 rounded-full mx-1 ${
                  i === photoIndex
                    ? "bg-white opacity-100"
                    : "bg-white opacity-40"
                }`}
              />
            ))}
          </View>
        )}

        {/* User info overlay */}
        <View
          className="absolute w-full items-center px-6 z-[5]"
          style={{ bottom: 110 }}
          pointerEvents="none"
        >
          <Text
            className="text-white text-[24px] font-bold text-center mb-1"
            style={{
              textShadowColor: "rgba(0,0,0,0.7)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 3,
            }}
          >
            {currentProfile?.alias}
          </Text>
          <Text
            className="text-white text-[16px] font-normal text-center mb-2 opacity-90"
            style={{
              textShadowColor: "rgba(0,0,0,0.7)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 3,
            }}
          >
            {typeof currentProfile?.gender === "number"
              ? GENDER_TEXT[currentProfile.gender]
              : ""}
          </Text>
          {bioExcerpt && (
            <Text
              className="text-white text-[16px] font-normal text-center leading-[22px]"
              style={{
                textShadowColor: "rgba(0,0,0,0.7)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
              }}
            >
              &quot;{bioExcerpt}&quot;
            </Text>
          )}
        </View>
      </View>

      {/* Bottom action buttons */}
      <View
        className="absolute left-0 w-full flex-row justify-between items-end px-8 z-[10]"
        style={{ bottom: 30 }}
        pointerEvents="box-none"
      >
        {/* Pass (X) */}
        <Reanimated.View
          className="items-center justify-center mx-2"
          style={[
            {
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: "rgba(255,255,255,0.18)",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            },
            useAnimatedStyle(() => ({
              transform: [
                {
                  scale: interpolate(passAnim.value, [0, 1], [1, 1.1]),
                },
              ],
            })),
          ]}
        >
          <Pressable
            onPress={currentProfile && !isSwiping ? triggerPass : undefined}
            className="w-16 h-16 items-center justify-center"
            accessibilityLabel="Pasar"
            disabled={!currentProfile || isSwiping}
          >
            <ReanimatedIcon
              name="close"
              size={36}
              animatedColor={passAnim}
              baseColor="#fff"
              activeColor="#5BC6EA"
            />
          </Pressable>
        </Reanimated.View>

        {/* View profile */}
        {currentProfile && (
          <Pressable
            onPress={() =>
              router.push(`/dashboard/profile/${currentProfile.profileId}`)
            }
            className="items-center justify-center bg-transparent px-2 py-0.5 min-w-[80px]"
          >
            <MaterialIcons name="keyboard-arrow-up" size={28} color="#fff" />
            <Text
              className="text-white text-[16px] font-semibold text-center mt-[-2px]"
              style={{
                textShadowColor: "rgba(0,0,0,0.7)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
              }}
            >
              Ver perfil
            </Text>
          </Pressable>
        )}

        {/* Like (Heart) */}
        <Reanimated.View
          className="items-center justify-center mx-2"
          style={[
            {
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: "rgba(255,255,255,0.18)",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            },
            useAnimatedStyle(() => ({
              transform: [
                {
                  scale: interpolate(likeAnim.value, [0, 1], [1, 1.1]),
                },
              ],
            })),
          ]}
        >
          <Pressable
            onPress={currentProfile && !isSwiping ? triggerLike : undefined}
            className="w-16 h-16 items-center justify-center"
            accessibilityLabel="Me gusta"
            disabled={!currentProfile || isSwiping}
          >
            <ReanimatedIcon
              name="favorite"
              size={32}
              animatedColor={likeAnim}
              baseColor="#fff"
              activeColor="#5BC6EA"
            />
          </Pressable>
        </Reanimated.View>
      </View>
    </SafeAreaView>
  );
};

export default SwipeScreen;
