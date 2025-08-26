"use client";

import { Avatar, AvatarBadge, AvatarImage } from "@/components/ui";
import { Text } from "@/components/ui/text";
import { useCreateChatService } from "@/src/presentation/services/ChatService";
import { useGetCurrentUserProfileByUserId } from "@/src/presentation/services/UserProfileService";
import { useAuthUserProfileStore } from "@/src/presentation/stores/auth-user-profile.store";
import { useCurrentUserProfileStore } from "@/src/presentation/stores/current-user-profile.store";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, ImageBackground, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get("window");
const PROFILE_IMAGE = require("@/assets/images/profile-bg.jpg");
const AVATAR_PLACEHOLDER = require("@/assets/images/avatar-placeholder.png");

/**
 * Returns an excerpt of the given text, up to maxLength chars, ending at a word boundary.
 * Adds "…" if text is trimmed.
 */
function getExcerpt(text: string, maxLength = 140): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  const trimmed = text.slice(0, maxLength);
  const lastSpace = trimmed.lastIndexOf(" ");
  return (lastSpace > 0 ? trimmed.slice(0, lastSpace) : trimmed).trim() + "…";
}

export default function UserProfileByIdScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const userId = useAuthUserProfileStore((s) => s.userId);
  const { createChat, isLoading: isCreatingChat } = useCreateChatService();
  const [signedImages, setSignedImages] = useState<(string | number)[]>([]);
  const [signedAvatar, setSignedAvatar] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Get current profile from store for fast initial render
  const currentUserProfile = useCurrentUserProfileStore();

  // Fetch and update profile for visited user on mount
  const { isLoading, error } = useGetCurrentUserProfileByUserId(id as string);

  // State: existing chat with this user if it exists, else null
  const [existingChat, setExistingChat] = useState<null | { chatId: string }>(null);
  const [checkingChat, setCheckingChat] = useState(false);

  // On mount/id/userId/profile change, check for existing private chat
  useEffect(() => {
    async function checkForExistingChat() {
      setCheckingChat(true);
      setExistingChat(null);
      try {
        // Only check if looking at another user, not self
        if (userId && currentUserProfile && userId !== currentUserProfile.userId) {
          const { findPrivateChatWithUserService } = await import("@/src/presentation/services/ChatService");
          const chat = await findPrivateChatWithUserService(currentUserProfile.userId);
          if (chat?.chatId) {
            setExistingChat({ chatId: chat.chatId });
          }
        }
      } catch (e) {
        console.log(e);
        setExistingChat(null);
      }
      setCheckingChat(false);
    }
    checkForExistingChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, currentUserProfile?.userId]);

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
      if (!currentUserProfile?.secondaryImages || currentUserProfile.secondaryImages.length === 0) {
        setSignedImages([PROFILE_IMAGE]);
      } else {
        setSigning(true);
        try {
          const { getSignedUrlForKey } = await import("@/src/utils/supabaseS3Storage");
          const promises = currentUserProfile.secondaryImages.map(async (img: string) => {
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
          if (currentUserProfile.avatar && typeof currentUserProfile.avatar === "string") {
            const avatarKey = extractS3KeyFromUrl(currentUserProfile.avatar);
            if (avatarKey) {
              try {
                const signedAvatarUrl = await getSignedUrlForKey(avatarKey, 3600);
                setSignedAvatar(signedAvatarUrl);
              } catch (err) {
                console.warn("Failed to sign avatar", currentUserProfile.avatar, err);
                setSignedAvatar(currentUserProfile.avatar);
              }
            } else {
              setSignedAvatar(currentUserProfile.avatar);
            }
          } else {
            setSignedAvatar(null);
          }
        } catch (err) {
          console.warn("Error importing getSignedUrlForKey or signing images", err);
          setSignedImages(currentUserProfile.secondaryImages);
          setSignedAvatar(currentUserProfile.avatar ?? null);
        }
        setSigning(false);
      }
    }
    signImagesAndAvatar();
    // Only re-run if the images or avatar change
  }, [currentUserProfile.avatar, currentUserProfile.secondaryImages]);

  const images = signedImages && signedImages.length > 0 ? signedImages : [PROFILE_IMAGE];

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

  if (error || !currentUserProfile || !currentUserProfile.profileId) {
    console.log(error, currentUserProfile, currentUserProfile.profileId);
    return (
      <View style={styles.centered}>
        <Text>Error al cargar el perfil.</Text>
      </View>
    );
  }

  // For debugging
  console.log("CURRENT PROFILE", { currentUserProfile });

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
              {currentUserProfile.isOnline && <AvatarBadge />}
            </Avatar>
          </View>
        </View>

        {/* Profile info */}
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.nameText}>
              {currentUserProfile.alias || "Usuario"}
              {currentUserProfile.age ? `, ${currentUserProfile.age}` : ""}
            </Text>
            {/* <Text style={styles.editLink}>Editar</Text> */}
          </View>
          <Text style={styles.genderText}>
            {currentUserProfile.gender === 1 ? "Hombre" : "Mujer"}
            {currentUserProfile.gederInterests && currentUserProfile.gederInterests.length > 0
              ? `, busca ${currentUserProfile.gederInterests.join(", ")}`
              : ""}
          </Text>
          <Text style={styles.descriptionText}>
            {currentUserProfile.biography
              ? getExcerpt(currentUserProfile.biography, 200)
              : "Este usuario aún no ha escrito una descripción."}
          </Text>
        </View>

        {/* Action button at bottom */}
        <View style={styles.actionButtonWrapper}>
          <TouchableOpacity
            style={styles.actionButton}
            disabled={isCreatingChat || checkingChat}
            onPress={async () => {
              if (existingChat?.chatId) {
                // Go to chat directly
                const { router } = await import("expo-router");
                router.push(`/dashboard/chats/${existingChat.chatId}`);
              } else {
                console.log("creating chat...");
                createChat(
                  {
                    type: "private",
                    unreadedCount: 0,
                    creatorId: userId,
                    isActive: true,
                    participants: [currentUserProfile.userId],
                  },
                  (error) => {
                    console.error("Chat creation error:", error);
                  }
                );
              }
            }}
          >
            <Text style={styles.actionButtonText}>
              {checkingChat
                ? "Cargando..."
                : existingChat?.chatId
                ? "Ir al chat"
                : `¡Hola, ${currentUserProfile.alias || "Usuario"}! 👋`}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const AVATAR_SIZE = 110;
const AVATAR_OVERLAP = 45;

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
  editLink: {
    fontSize: 14,
    color: "#4fc3f7",
    fontWeight: "600",
    marginLeft: 8,
    textDecorationLine: "underline",
    fontFamily: "Poppins-SemiBold",
    alignSelf: "flex-end",
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
  actionButtonWrapper: {
    marginTop: 40,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: 24,
  },
  actionButton: {
    backgroundColor: "#5BC6EA",
    borderRadius: 28,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    width: "100%",
    maxWidth: 320,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
  },
});
