import { Avatar, AvatarBadge, AvatarImage } from "@/components/ui";
import { Text } from "@/components/ui/text";
import { useGoogleAuth } from "@/src/presentation/hooks/useGoogleAuth";
import { useGetCurrentUserProfileByUserId } from "@/src/presentation/services/UserProfileService";
import { useAuthUserProfileStore } from "@/src/presentation/stores/auth-user-profile.store";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, ImageBackground, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get("window");
const PROFILE_IMAGE = require("@/assets/images/profile-bg.jpg");
const AVATAR_PLACEHOLDER = require("@/assets/images/avatar-placeholder.png");

/**
 * Returns an excerpt of the given text, up to maxLength chars, ending at a word boundary.
 * Adds "…" if text is trimmed.
 */
function getExcerpt(text: string, maxLength: number = 140): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  const trimmed = text.slice(0, maxLength);
  const lastSpace = trimmed.lastIndexOf(" ");
  return (lastSpace > 0 ? trimmed.slice(0, lastSpace) : trimmed).trim() + "…";
}

export default function ProfileScreen() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [signedImages, setSignedImages] = useState<(string | number)[]>([]);
  const [signedAvatar, setSignedAvatar] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const {logout, isLoading: isLoadingAuth, error: authError} = useGoogleAuth();
  const router = useRouter();
  const avatar = useAuthUserProfileStore((s) => s.avatar);
  const secondaryImages = useAuthUserProfileStore((s) => s.secondaryImages);
  const userProfile = useAuthUserProfileStore();

  console.log(authError);

  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log(
        "\x1b[36m[ProfileScreen] Raw userProfile from store:\n" +
          JSON.stringify(userProfile, null, 2) +
          "\x1b[0m"
      );
    }
  }, [userProfile]);

  // (removed duplicate router and userProfile declarations)

  // Fetch and update profile for authenticated user on mount
  const { isLoading, error } = useGetCurrentUserProfileByUserId(userProfile.userId);

  // Utility to extract S3 key from a Supabase Storage URL
  function extractS3KeyFromUrl(url: string): string | null {
    // Example: .../helloapp/profiles/uuid/secondary_1.jpg?...  -> profiles/uuid/secondary_1.jpg
    const match = url.match(/\/helloapp\/(.+?)(\?|$)/);
    if (match && match[1]) {
      return match[1];
    }
    return null;
  }

  useEffect(() => {
    async function signImagesAndAvatar() {
      if (!secondaryImages || secondaryImages.length === 0) {
        setSignedImages([PROFILE_IMAGE]);
      } else {
        setSigning(true);
        try {
          const { getSignedUrlForKey } = await import("@/src/utils/supabaseS3Storage");
          const promises = secondaryImages.map(async (img: string) => {
            if (typeof img !== "string") return img;
            const key = extractS3KeyFromUrl(img);
            if (!key) return img;
            try {
              const signed = await getSignedUrlForKey(key, 3600);
              return signed;
            } catch (err) {
              console.warn("Failed to sign image", img, err);
              return img;
            }
          });
          const results = await Promise.all(promises);
          setSignedImages(results);

          // Sign avatar if present
          if (avatar && typeof avatar === "string") {
            const avatarKey = extractS3KeyFromUrl(avatar);
            if (avatarKey) {
              try {
                const signedAvatarUrl = await getSignedUrlForKey(avatarKey, 3600);
                setSignedAvatar(signedAvatarUrl);
              } catch (err) {
                console.warn("Failed to sign avatar", avatar, err);
                setSignedAvatar(avatar);
              }
            } else {
              setSignedAvatar(avatar);
            }
          } else {
            setSignedAvatar(null);
          }
        } catch (err) {
          console.warn("Error importing getSignedUrlForKey or signing images", err);
          setSignedImages(secondaryImages);
          setSignedAvatar(avatar ?? null);
        }
        setSigning(false);
      }
    }
    signImagesAndAvatar();
    // Only re-run if the images or avatar change

  }, [secondaryImages, avatar]);

  const images = React.useMemo(
    () =>
      signedImages && signedImages.length > 0
        ? signedImages
        : [PROFILE_IMAGE],
    [signedImages]
  );

  // Log final images array used for rendering (green)

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      console.log(
        "\x1b[32m[ProfileScreen] Final images array for rendering:\n" +
          JSON.stringify(images, null, 2) +
          "\x1b[0m"
      );
    }
  }, [images]);

  const handlePrevImage = () => {
    const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : images.length - 1;
    setCurrentImageIndex(newIndex);
    scrollViewRef.current?.scrollTo({ x: newIndex * width, animated: true });
  };

  const handleNextImage = () => {
    const newIndex = currentImageIndex < images.length - 1 ? currentImageIndex + 1 : 0;
    setCurrentImageIndex(newIndex);
    scrollViewRef.current?.scrollTo({ x: newIndex * width, animated: true });
  };

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffset / width);
    setCurrentImageIndex(currentIndex);
  };

  if (isLoading || signing) {
    return (
      <View style={styles.centered}>
        <Text>Cargando perfil...</Text>
      </View>
    );
  }

  if (error || !userProfile || !userProfile.profileId) {
    return (
      <View style={styles.centered}>
        <Text>Error al cargar el perfil.</Text>
      </View>
    );
  }

  // For debugging
  console.log("PROFILE", { userProfile });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Top curved image carousel */}
        <View style={styles.topImageContainer}>
          {/* Page indicators */}
          {images.length > 1 && (
            <View style={styles.pageIndicators}>
              {images.map((_: any, index: React.Key | null | undefined) => (
                <View
                  key={index}
                  style={[styles.pageIndicator, index === currentImageIndex && styles.activePageIndicator]}
                />
              ))}
            </View>
          )}

          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.imageCarousel}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {images.map((img: string | number, idx: number) => (
              <ImageBackground
                key={idx}
                source={typeof img === "string" ? { uri: img } : img}
                style={styles.topImage}
                imageStyle={styles.topImageRadius}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <TouchableOpacity style={[styles.navButton, styles.leftNavButton]} onPress={handlePrevImage}>
                <Ionicons name="chevron-back" size={24} color="white" />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.navButton, styles.rightNavButton]} onPress={handleNextImage}>
                <Ionicons name="chevron-forward" size={24} color="white" />
              </TouchableOpacity>
            </>
          )}

          {/* Avatar overlapping */}
          <View style={styles.avatarWrapper}>
            <Avatar size="xl">
              <AvatarImage source={signedAvatar ? { uri: signedAvatar } : AVATAR_PLACEHOLDER} />
              <AvatarBadge>
                <TouchableOpacity style={styles.bigEditBadge} onPress={() => router.push("/edit" as any)} activeOpacity={0.85}>
                  <MaterialIcons name="edit" size={18} color="#25262c" />
                </TouchableOpacity>
              </AvatarBadge>
            </Avatar>
          </View>
        </View>

        {/* Profile info */}
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.nameText}>
              {userProfile.alias || userProfile.name || "Usuario"}
              {userProfile.age ? `, ${userProfile.age}` : ""}
            </Text>
            <TouchableOpacity onPress={() => router.push("/edit" as any)}>
              <Text style={styles.editText}>Editar</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.genderText}>
            {(() => {
              const gender = userProfile.gender === 1 ? "Hombre" : "Mujer";
              const interestPrefix = userProfile.gender === 1 ? "interesado en" : "interesada en";
              const interestsRaw = Array.isArray(userProfile.gederInterests) ? userProfile.gederInterests : [];
              // Normalize to numbers
              const interests = interestsRaw.map((v) => Number(v)).filter((v) => v === 1 || v === 2);
              let interestText = "";
              if (interests.length === 1) {
                interestText = interests[0] === 1 ? "Hombres" : "Mujeres";
              } else if (interests.includes(1) && interests.includes(2)) {
                interestText = "Hombres y Mujeres";
              }
              return `${gender}${interestText ? `, ${interestPrefix} ${interestText}` : ""}`;
            })()}
          </Text>
          <Text style={styles.descriptionText}>
            {userProfile.biography
              ? getExcerpt(userProfile.biography, 200)
              : "Este usuario aún no ha escrito una descripción."}
          </Text>
        </View>
      </ScrollView>
      {/* Bottom button */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={[
            styles.logoutButton,
            isLoadingAuth && { opacity: 0.6 }
          ]}
          onPress={logout}
          disabled={isLoadingAuth}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const AVATAR_SIZE = 110;
const AVATAR_OVERLAP = 55;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  topImageContainer: {
    width: "100%",
    height: 350,
    backgroundColor: "#eee",
    borderBottomLeftRadius: 180,
    borderBottomRightRadius: 180,
    alignItems: "center",
    justifyContent: "flex-end",
    position: "relative",
  },
  pageIndicators: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    gap: 8,
  },
  pageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  activePageIndicator: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    width: 24,
  },
  imageCarousel: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 1,
    overflow: "hidden",
    borderBottomLeftRadius: 180,
    borderBottomRightRadius: 180,
  },
  topImage: {
    width: width,
    height: 350,
  },
  topImageRadius: {
    borderBottomLeftRadius: 180,
    borderBottomRightRadius: 180,
  },
  navButton: {
    position: "absolute",
    top: "50%",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
    marginTop: -20,
  },
  leftNavButton: {
    left: 20,
  },
  rightNavButton: {
    right: 20,
  },
  avatarWrapper: {
    position: "absolute",
    bottom: -AVATAR_OVERLAP,
    left: (width - AVATAR_SIZE) / 2,
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  },
  editBadge: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
  },
  bigEditBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f8fafc",
    borderColor: "#ededed",
    borderWidth: 0.8,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: -4,
    right: -2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  editIcon: {
    fontSize: 16,
    color: "#00BFFF",
  },
  infoContainer: {
    marginTop: AVATAR_OVERLAP + 20,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  nameText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
    fontFamily: "Poppins-Bold",
  },
  editText: {
    fontSize: 14,
    color: "#00BFFF",
    fontWeight: "600",
    marginLeft: 8,
    fontFamily: "Poppins-Medium",
  },
  genderText: {
    fontSize: 14,
    color: "#888",
    marginBottom: 16,
    fontFamily: "Poppins-Regular",
  },
  descriptionText: {
    fontSize: 16,
    color: "#444",
    textAlign: "center",
    marginTop: 8,
    fontFamily: "Poppins-Regular",
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  bottomButtonContainer: {
    position: "absolute",
    bottom: 24,
    left: 0,
    width: "100%",
    alignItems: "center",
    zIndex: 10,
  },
  bottomButton: {
    backgroundColor: "#7EE6FD",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    maxWidth: 320,
    justifyContent: "center",
  },
  bottomButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
    fontFamily: "Poppins-Medium",
  },
  logoutButton: {
    backgroundColor: "#80E1FF", // lighter variant of #00BFFF
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18, // taller
    paddingHorizontal: 18,
    maxWidth: 220, // narrower
    width: "70%",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    marginTop: 8,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Roboto",
    letterSpacing: 0.5,
  },
});
