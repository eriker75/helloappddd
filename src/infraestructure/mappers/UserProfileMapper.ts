import { ExtendedUserProfile, UserProfile } from "@/src/domain/entities/UserProfile";
import {
  ExtendedUserProfileResponse,
  OnboardUserProfileRequest,
  UserProfileResponse,
} from "@/src/domain/models/user-profile.models";

import { calculateAge } from "@/src/utils/calculateAge";

/**
 * Maps UserProfileResponse (API model) to UserProfile (domain entity).
 * Note: Fields like is_verified, location, and others not present in the entity are intentionally omitted.
 */
export function mapUserProfileResponseToUserProfileEntity(userProfileResponse: UserProfileResponse): UserProfile {
  return {
    userId: userProfileResponse.user_id,
    profileId: userProfileResponse.id,
    avatar: userProfileResponse.avatar,
    name: userProfileResponse.name ?? "",
    alias: userProfileResponse.alias,
    biography: userProfileResponse.biography ?? "",
    email: userProfileResponse.email ?? "",
    secondaryImages: userProfileResponse.secondary_images ?? [],
    genderInterests: Array.isArray(userProfileResponse.preferences?.genders)
      ? (userProfileResponse.preferences.genders as (string | number)[]).map(String)
      : typeof userProfileResponse.preferences?.genders === "string"
      ? [userProfileResponse.preferences.genders]
      : [],
    address: userProfileResponse.address ?? "",
    latitude:
      userProfileResponse.latitude !== null && userProfileResponse.latitude !== undefined
        ? Number(userProfileResponse.latitude)
        : 0,
    longitude:
      userProfileResponse.longitude !== null && userProfileResponse.longitude !== undefined
        ? Number(userProfileResponse.longitude)
        : 0,
    minAgePreference: userProfileResponse.preferences?.min_age ?? 18,
    maxAgePreference: userProfileResponse.preferences?.max_age ?? 98,
    maxDistancePreference: userProfileResponse.preferences?.max_distance ?? 200,
    birthDate: userProfileResponse.birth_date ?? "",
    age: calculateAge(userProfileResponse.birth_date),
    gender: userProfileResponse.gender,
    isOnline: userProfileResponse.is_online ?? false,
    isActive: userProfileResponse.is_active ?? false,
    isOnboarded: userProfileResponse.is_onboarded ?? false,
    lastOnline: userProfileResponse.last_online ?? "",
    createdAt: undefined,
    updatedAt: undefined,
  };
}

export function mapExtendedUserProfileResponseToExtendedUserProfileEntity(
  extendedUserProfile: ExtendedUserProfileResponse
): ExtendedUserProfile {
  return {
    ...mapUserProfileResponseToUserProfileEntity(extendedUserProfile),
    distanceInKm: Number(extendedUserProfile.distance_in_km) || 0,
  };
}

export function mapPartialUserProfileToOnboardUserProfileRequest(
  partialUserProfile: Partial<UserProfile>
): OnboardUserProfileRequest {
  // LOG para depuración
  console.log("🟡 [MAPPER] Input partialUserProfile:");
  console.log("- secondaryImages:", partialUserProfile.secondaryImages);
  console.log("- maxDistancePreference:", partialUserProfile.maxDistancePreference);

  const mapped: OnboardUserProfileRequest = {
    userId: partialUserProfile.userId ?? "",
    alias: partialUserProfile.alias ?? "",
    gender: partialUserProfile.gender ?? 0,
    avatar: partialUserProfile.avatar,
    biography: partialUserProfile.biography,
    birthDate: partialUserProfile.birthDate,
    isOnboarded: partialUserProfile.isOnboarded,
    isActive: partialUserProfile.isActive,
    latitude: partialUserProfile.latitude ? Number(partialUserProfile.latitude) : undefined,
    longitude: partialUserProfile.longitude ? Number(partialUserProfile.longitude) : undefined,
    address: partialUserProfile.address,
    // Siempre enviar un array (aunque sea vacío)
    secondary_images: Array.isArray(partialUserProfile.secondaryImages)
      ? partialUserProfile.secondaryImages
      : [],
    minAge: partialUserProfile.minAgePreference ?? 18,
    maxAge: partialUserProfile.maxAgePreference ?? 98,
    maxDistance: partialUserProfile.maxDistancePreference ?? 200,
    genders: partialUserProfile.genderInterests
      ? partialUserProfile.genderInterests.map((g) => (typeof g === "string" ? Number(g) : g))
      : [1, 2, 3],
  };

  console.log("🟡 [MAPPER] Output mapped:");
  console.log("- secondary_images:", mapped.secondary_images);
  console.log("- maxDistance:", mapped.maxDistance);
  console.log("- Full mapped:", JSON.stringify(mapped, null, 2));

  return mapped;
}
