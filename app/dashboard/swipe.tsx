import { Avatar, AvatarImage, Text } from "@/components/ui";
import { useLoadSwipeableProfiles, useSwipeProfile } from "@/src/presentation/services/UserProfileService";
import { useAuthUserProfileStore } from "@/src/presentation/stores/auth-user-profile.store";
import { useCurrentUserProfileStore } from "@/src/presentation/stores/current-user-profile.store";
import { useNearbySwipeableProfilesStore } from "@/src/presentation/stores/nearby-swipeable-profiles.store";
import { truncateString } from "@/src/utils/stringHelpers";
import { getSignedUrlForKey } from "@/src/utils/supabaseS3Storage";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Key, useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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

// Layout constants
const TOP_BAR_HEIGHT = 90;
const DOTS_TOP = TOP_BAR_HEIGHT + 2; // minimal gap
const IMAGE_AREA_TOP = DOTS_TOP + 24;
const IMAGE_AREA_BOTTOM = 180;

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
      color: interpolateColor(animatedColor.value, [0, 1], [baseColor, activeColor]),
    };
  });

  return <AnimatedMaterialIcons name={name as any} size={size} animatedProps={animatedProps} color={baseColor} />;
};

const extractS3KeyFromUrl = (url: string): string | null => {
  // Example: https://.../helloapp/profiles/uuid/avatar.jpg?...  => profiles/uuid/avatar.jpg
  const match = url.match(/helloapp\/([^?]+)/);
  return match ? match[1] : null;
};

const SwipeLimitReachedView = ({ onGoHome }: { onGoHome?: () => void }) => (
  <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: "#5BC6EA" }}>
    <Image
      source={require("@/assets/images/avatar-placeholder.png")}
      style={{
        width: width * 0.5,
        height: width * 0.5,
        borderRadius: (width * 0.5) / 2,
        marginTop: 40,
        marginBottom: 16,
      }}
      resizeMode="cover"
    />
    <Text
      className="text-white text-[24px] font-bold text-center mt-6 mb-2"
      style={{
        textShadowColor: "rgba(0,0,0,0.7)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
      }}
    >
      ¡Has conocido a muchas personas hoy!
    </Text>
    <Text
      className="text-white text-[18px] font-normal text-center opacity-90 mb-4"
      style={{
        textShadowColor: "rgba(0,0,0,0.7)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      }}
    >
      Has llegado al límite de swipes por hoy. ¡Tómate un descanso, recarga energías y vuelve mañana para seguir descubriendo nuevas conexiones!
    </Text>
    <Text
      className="text-white text-[16px] font-normal text-center opacity-80 mb-8"
      style={{
        textShadowColor: "rgba(0,0,0,0.7)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      }}
    >
      Recuerda: lo mejor de conocer gente es que cada día trae nuevas sorpresas. ¡Nos vemos mañana!
    </Text>
    {onGoHome && (
      <Pressable
        onPress={onGoHome}
        className="px-6 py-3 rounded-full bg-white"
        style={{ marginTop: 10 }}
      >
        <Text className="text-[#5BC6EA] text-[18px] font-bold">Volver al inicio</Text>
      </Pressable>
    )}
  </SafeAreaView>
);

const SwipeScreen = () => {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const { isLoading, isFetching } = useLoadSwipeableProfiles(2000);
  const { avatar: authAvatar } = useAuthUserProfileStore();
  const { swipe, isPending: isPendingSwipe, isError: isErrorSwiping } = useSwipeProfile();
  const nearbySwipeableProfiles = useNearbySwipeableProfilesStore((s) => s.nearbySwipeableProfiles);
  const canSwipe = useNearbySwipeableProfilesStore((s) => s.canSwipe());
  const setProfile = useCurrentUserProfileStore((s) => s.setProfile);
  const [photoIndex, setPhotoIndex] = useState(0);
  const currentProfile = nearbySwipeableProfiles[0];

  // State for resolved image URLs
  const [resolvedImages, setResolvedImages] = useState<string[]>([]);
  const [failedImages, setFailedImages] = useState<number[]>([]);

  // Helper to get all image URLs (avatar + secondaryImages)
  const getImageUrls = useCallback(() => {
    const profile = currentProfile;
    if (!profile) {
      console.log('No current profile for getImageUrls');
      return [];
    }
    const urls = [
      profile.avatar,
      ...(Array.isArray(profile.secondaryImages) ? profile.secondaryImages.slice(0, 4) : []),
    ].filter(Boolean);
    console.log(`[${profile.alias}] Raw image URLs:`, urls);
    return urls;
  }, [currentProfile]);

  // Function to check if a signed URL is expired
  const isSignedUrlExpired = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      const expiresParam = urlObj.searchParams.get("X-Amz-Expires");
      const dateParam = urlObj.searchParams.get("X-Amz-Date");

      if (!expiresParam || !dateParam) return true;

      const expires = parseInt(expiresParam);
      const signedDate = new Date(
        dateParam.slice(0, 4) +
          "-" +
          dateParam.slice(4, 6) +
          "-" +
          dateParam.slice(6, 8) +
          "T" +
          dateParam.slice(9, 11) +
          ":" +
          dateParam.slice(11, 13) +
          ":" +
          dateParam.slice(13, 15) +
          "Z"
      );

      const expirationTime = signedDate.getTime() + expires * 1000;
      return Date.now() > expirationTime;
    } catch (e) {
      console.log("Error checking URL expiration:", e);
      return true; // Assume expired if we can't parse
    }
  };

  // Effect to resolve signed URLs for all images of the current profile
  // Add cache buster to image URLs
  const addCacheBuster = (url: string, userId: string): string => {
    if (!url) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}cache=${userId}-${Date.now()}`;
  };

  useEffect(() => {
    let isMounted = true;
    setResolvedImages([]); // Reset images immediately when profile changes
    setPhotoIndex(0); // Reset photo index when profile changes
    setFailedImages([]); // Reset failed images

    const fetchSignedUrls = async () => {
      const imgUrls = getImageUrls();
      console.log("Fetching signed URLs for:", imgUrls);

      const signedUrls: string[] = [];
      for (const url of imgUrls) {
        if (!url) continue;

        let shouldRegenerateUrl = true;

        // Check if already signed and not expired
        if (typeof url === "string" && url.includes("X-Amz-Signature")) {
          if (!isSignedUrlExpired(url)) {
            signedUrls.push(url);
            shouldRegenerateUrl = false;
            console.log("Using existing valid signed URL");
          } else {
            console.log("Signed URL expired, regenerating...");
          }
        }

        if (shouldRegenerateUrl) {
          const key = extractS3KeyFromUrl(url);
          if (key) {
            try {
              console.log("Generating new signed URL for key:", key);
              const signedUrl = await getSignedUrlForKey(key, 3600);
              signedUrls.push(signedUrl);
            } catch (e) {
              console.log("Error getting signed URL for key:", key, e);
              // fallback to placeholder if error
              signedUrls.push("");
            }
          } else {
            console.log("Could not extract S3 key from URL:", url);
            signedUrls.push("");
          }
        }
      }

      console.log("Final resolved images:", signedUrls);
      if (isMounted) setResolvedImages(signedUrls);
    };

    if (currentProfile) {
      fetchSignedUrls();
    }

    return () => {
      isMounted = false;
    };
  }, [getImageUrls, currentProfile]);

  console.log("Current profile:", currentProfile?.alias);
  console.log("Resolved images count:", resolvedImages.length);
  console.log("Photo index:", photoIndex);

  const likeAnim = useSharedValue(0);
  const passAnim = useSharedValue(0);

  // Always call hooks at top level
  const passButtonAnimStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(passAnim.value, [0, 1], [1, 1.1]),
      },
    ],
  }));
  const likeButtonAnimStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(likeAnim.value, [0, 1], [1, 1.1]),
      },
    ],
  }));

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setPhotoIndex(currentIndex);
  };

  // Use runOnJS to avoid Reanimated error
  const triggerLike = () => {
    likeAnim.value = withTiming(1, { duration: 150 }, (finished) => {
      if (finished) {
        likeAnim.value = withTiming(0, { duration: 150 }, (finished2) => {
          if (finished2) {
            runOnJS(handleSwipe)(true);
          }
        });
      }
    });
  };

  const triggerPass = () => {
    passAnim.value = withTiming(1, { duration: 150 }, (finished) => {
      if (finished) {
        passAnim.value = withTiming(0, { duration: 150 }, (finished2) => {
          if (finished2) {
            runOnJS(handleSwipe)(false);
          }
        });
      }
    });
  };

  const handleSwipe = (isLiked: boolean) => {
    console.log("doing like with...", isLiked);
    swipe({
      targetUserId: currentProfile.userId,
      liked: isLiked,
    });
    setPhotoIndex(0);
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: 0, animated: false });
    }
  };

  const gradientOverlayStyle = {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: "#5BC6EA" }}>
      {/* Top bar */}
      <View
        className="absolute left-0 w-full flex-row items-center justify-between px-[18px] pt-[30px] z-[10]"
        style={{ top: 0, height: TOP_BAR_HEIGHT }}
        pointerEvents="box-none"
      >
        <View style={{ width: 38, height: 38 }} />
        <Text className="text-white text-[28px] font-semibold text-center flex-1 mx-[10px]">Hola</Text>
        <Pressable
          onPress={() => router.push("/dashboard/profile")}
          className="w-[38px] h-[38px] rounded-full overflow-hidden border-2 border-white items-center justify-center"
        >
          <Avatar size="sm" className="w-full h-full">
            <AvatarImage
              source={authAvatar ? { uri: authAvatar } : require("@/assets/images/avatar-placeholder.png")}
            />
          </Avatar>
        </Pressable>
      </View>

      {/* Dots indicator - just below "Hola" */}
      {resolvedImages.length > 1 && (
        <View
          className="absolute left-0 right-0 flex-row justify-center items-center z-[5] px-5"
          style={{ top: DOTS_TOP }}
          pointerEvents="none"
        >
          {resolvedImages.map((_: any, i: Key | null | undefined) => (
            <View
              key={i}
              className={`w-2 h-2 rounded-full mx-1 ${
                i === photoIndex ? "bg-white opacity-100" : "bg-white opacity-40"
              }`}
            />
          ))}
        </View>
      )}

      {/* Image ScrollView - avatar and secondary images */}
      <View
        className="absolute left-0 right-0 z-[1] w-full"
        style={{
          bottom: 0,
          width: width,
          height: height,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {nearbySwipeableProfiles.length === 0 ? (
          isLoading || isFetching ? (
            <View
              className="relative items-center justify-center"
              style={{ width, height }}
            >
              <Image
                source={require("@/assets/images/avatar-placeholder.png")}
                style={{
                  width: width * 0.5,
                  height: width * 0.5,
                  borderRadius: (width * 0.5) / 2,
                  marginTop: 40,
                  marginBottom: 16,
                }}
                resizeMode="cover"
              />
              <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.20)" }} pointerEvents="none" />
              <Text
                className="text-white text-[20px] font-bold text-center mt-6 mb-2"
                style={{
                  textShadowColor: "rgba(0,0,0,0.7)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 3,
                }}
              >
                Buscando nuevas personas cerca...
              </Text>
              <View style={{ marginTop: 24 }}>
                {/* Spinner */}
                <ActivityIndicator size="large" color="#fff" />
              </View>
            </View>
          ) : (
            <View
              className="relative items-center justify-center"
              style={{ width, height }}
            >
              <Image
                source={require("@/assets/images/avatar-placeholder.png")}
                style={{
                  width: width * 0.5,
                  height: width * 0.5,
                  borderRadius: (width * 0.5) / 2,
                  marginTop: 40,
                  marginBottom: 16,
                }}
                resizeMode="cover"
              />
              <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.20)" }} pointerEvents="none" />
              <Text
                className="text-white text-[22px] font-bold text-center mt-6 mb-2"
                style={{
                  textShadowColor: "rgba(0,0,0,0.7)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 3,
                }}
              >
                No hay más perfiles cerca
              </Text>
              <Text
                className="text-white text-[16px] font-normal text-center opacity-80"
                style={{
                  textShadowColor: "rgba(0,0,0,0.7)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }}
              >
                Intenta actualizar más tarde o ajusta tus filtros de búsqueda.
              </Text>
            </View>
          )
        ) : currentProfile && resolvedImages.length > 0 ? (
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={{ width, height }}
            contentContainerStyle={{
              alignItems: "center",
              justifyContent: "center",
              minHeight: height,
            }}
          >
            {resolvedImages.map((imgSrc: string, index: number) => {
              console.log(`Rendering image ${index}:`, imgSrc);

              if (index === 0) {
                // Avatar: large, nearly full width, with padding, circular, full-screen bg and overlay
                return (
                  <View
                    key={index}
                    className="relative items-center justify-center"
                    style={{
                      width: width,
                      height: height,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <View
                      style={{
                        position: "absolute",
                        width: width,
                        height: height,
                        left: 0,
                        top: 0,
                        backgroundColor: "#5BC6EA",
                        zIndex: 1,
                      }}
                    />
                    <View
                      style={{
                        width: width * 0.95,
                        height: width * 0.95,
                        borderRadius: (width * 0.95) / 2,
                        alignSelf: "center",
                        backgroundColor: "#5BC6EA",
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: height * 0.12,
                        zIndex: 2,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.15,
                        shadowRadius: 12,
                      }}
                    >
                      <Image
                        key={`img-${currentProfile?.userId}-${index}-${imgSrc?.substring(0, 20)}`} source={
                          imgSrc && imgSrc.length > 0
                            ? { uri: imgSrc }
                            : require("@/assets/images/avatar-placeholder.png")
                        }
                        style={{
                          width: width * 0.7,
                          height: width * 0.7,
                          borderRadius: (width * 0.7) / 2,
                        }}
                        resizeMode="cover"
                        onError={(error) => console.log("Image load error:", error.nativeEvent.error)}
                        onLoad={() => console.log("Image loaded successfully:", imgSrc)}
                      />
                    </View>
                    <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.25)", zIndex: 3 }} pointerEvents="none" />
                  </View>
                );
              } else {
                // Secondary images - fill full background
                return (
                  <View
                    key={index}
                    className="relative items-center justify-center"
                    style={{
                      width: width,
                      height: height,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Image
                      key={`img-${currentProfile?.userId}-${index}-${imgSrc?.substring(0, 20)}`} source={
                        imgSrc && imgSrc.length > 0
                          ? { uri: imgSrc }
                          : require("@/assets/images/avatar-placeholder.png")
                      }
                      style={{
                        width: width,
                        height: height,
                        marginTop: 0,
                        marginBottom: 0,
                      }}
                      resizeMode="cover"
                      onError={(error) => console.log("Image load error:", error.nativeEvent.error)}
                      onLoad={() => console.log("Image loaded successfully:", imgSrc)}
                    />
                    <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.25)" }} pointerEvents="none" />
                  </View>
                );
              }
            })}
          </ScrollView>
        ) : currentProfile ? (
          // Loading state - show placeholder while resolving images
          <View
            className="relative items-center justify-center"
            style={{ width, height }}
          >
            <Image
              source={require("@/assets/images/avatar-placeholder.png")}
              style={{
                width: width * 0.5,
                height: width * 0.5,
                borderRadius: (width * 0.5) / 2,
                marginTop: 40,
                marginBottom: 16,
              }}
              resizeMode="cover"
            />
            <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.20)" }} pointerEvents="none" />
            <Text
              className="text-white text-[18px] font-normal text-center mt-6 opacity-80"
              style={{
                textShadowColor: "rgba(0,0,0,0.7)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
              }}
            >
              Cargando imágenes...
            </Text>
          </View>
        ) : null}
      </View>

      {/* User info overlay */}
      {currentProfile ? (
        <View className="absolute w-full items-center px-6 z-[5]" style={{ bottom: 110 }} pointerEvents="none">
          <Text
            className="text-white text-[24px] font-bold text-center mb-1"
            style={{
              textShadowColor: "rgba(0,0,0,0.7)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 3,
            }}
          >
            {currentProfile.alias}
          </Text>
          <Text
            className="text-white text-[16px] font-normal text-center mb-2 opacity-90"
            style={{
              textShadowColor: "rgba(0,0,0,0.7)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 3,
            }}
          >
            {typeof currentProfile.gender === "number" ? GENDER_TEXT[currentProfile.gender] : ""}
          </Text>
          {currentProfile.biography && (
            <Text
              className="text-white text-[16px] font-normal text-center leading-[22px]"
              style={{
                textShadowColor: "rgba(0,0,0,0.7)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
              }}
            >
              {truncateString(currentProfile.biography, 60)}
            </Text>
          )}
        </View>
      ) : null}

      {/* Bottom action buttons */}
      {nearbySwipeableProfiles.length === 0 ? null : (
        <View
          className="absolute left-0 w-full flex-row justify-between items-end px-8 z-[10]"
          style={{ bottom: 30, backgroundColor: "transparent" }}
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
              passButtonAnimStyle,
            ]}
          >
            <Pressable
              onPress={currentProfile ? triggerPass : undefined}
              className="w-16 h-16 items-center justify-center"
              accessibilityLabel="Pasar"
              disabled={!currentProfile}
            >
              <ReanimatedIcon name="close" size={36} animatedColor={passAnim} baseColor="#fff" activeColor="#5BC6EA" />
            </Pressable>
          </Reanimated.View>

          {/* View profile */}
          {currentProfile && (
            <Pressable
              className="items-center justify-center bg-transparent px-2 py-0.5 min-w-[80px]"
              onPress={() => {
                setProfile(currentProfile);
                router.push(`/dashboard/profile/${currentProfile.userId}`)
              }}
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
              likeButtonAnimStyle,
            ]}
          >
            <Pressable
              onPress={currentProfile ? triggerLike : undefined}
              className="w-16 h-16 items-center justify-center"
              accessibilityLabel="Me gusta"
              disabled={!currentProfile}
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
      )}
    </SafeAreaView>
  );
};

export default SwipeScreen;
