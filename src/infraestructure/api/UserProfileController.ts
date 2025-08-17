import {
  CreateSwipeRequest,
  ExtendedUserProfileResponse,
  OnboardUserProfileRequest,
  UpdateUserProfileRequest,
  UserProfileResponse,
} from "@/src/domain/models/user-profile.models";

export class UserProfileController {
  findUserProfileByUserId(userId: string): Promise<UserProfileResponse> {
    throw new Error("Method not implemented.");
  }

  updateMyUserProfile(
    userProfileData: UpdateUserProfileRequest
  ): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  deleteMyUserProfile(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  listNearbyProfiles(
    maxDistance: number
  ): Promise<ExtendedUserProfileResponse[]> {
    throw new Error("Method not implemented.");
  }

  listNearbySwipeableProfiles(
    maxDistance: number,
    limit: number
  ): Promise<ExtendedUserProfileResponse[]> {
    throw new Error("Method not implemented.");
  }

  listNearbyMatches(
    maxDistance: number
  ): Promise<ExtendedUserProfileResponse[]> {
    throw new Error("Method not implemented.");
  }

  updateMyLocation(
    latitude: number,
    longitude: number
  ): Promise<UserProfileResponse> {
    throw new Error("Method not implemented.");
  }

  onboardUser(onboardingData: OnboardUserProfileRequest): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  setOnline(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  setOffline(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  listMyMatches(): Promise<ExtendedUserProfileResponse[]> {
    throw new Error("Method not implemented.");
  }

  createSwipe(swipeRequest: CreateSwipeRequest): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
}
