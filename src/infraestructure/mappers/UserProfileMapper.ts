import { ExtendedUserProfile, UserProfile } from "@/src/domain/entities/UserProfile";
import {
  ExtendedUserProfileResponse,
  OnboardUserProfileRequest,
  UserProfileResponse,
} from "@/src/domain/models/user-profile.models";

export function mapUserProfileResponseToUserProfileEntity(userProfileResponse: UserProfileResponse): UserProfile {
  const userProfileEntity = {
    userId: "String",
    profileId: "String",
    avatar: "String",
    name: "String",
    alias: "String",
    biography: "String",
    email: "String",
    secondaryImages: ["str"],
    genderInterests: ["String"],
    address: "String",
    latitude: "String",
    longitude: "String",
    minAgePreference: 18,
    maxAgePreference: 98,
    maxDistancePreference: 200,
    birthDate: "String",
    age: 20,
    gender: 1,
    isOnline: true,
    isActive: true,
    isOnboarded: true,
    lastOnline: "string",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  return userProfileEntity;
}

export function mapExtendedUserProfileResponseToExtendedUserProfileEntity(
  extendedUserProfile: ExtendedUserProfileResponse
): ExtendedUserProfile {
  return {
    distanceInKm: 0,
    userId: "",
    profileId: "",
    avatar: "",
    name: "",
    alias: "",
    biography: "",
    email: "",
    secondaryImages: [],
    genderInterests: [],
    address: "",
    latitude: "",
    longitude: "",
    minAgePreference: 0,
    maxAgePreference: 0,
    maxDistancePreference: 0,
    birthDate: "",
    age: 0,
    gender: 0,
    isOnline: false,
    isActive: false,
    isOnboarded: false,
    lastOnline: "",
  };
}

export function mapPartialUserProfileToOnboardUserProfileRequest(
  partialUserProfile: Partial<UserProfile>
): OnboardUserProfileRequest {
  return {
    avatar: "",
  };
}
