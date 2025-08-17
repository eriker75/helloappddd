import {
  CreateSwipeRequest,
  ExtendedUserProfileResponse,
  OnboardUserProfileRequest,
  UpdateUserProfileRequest,
  UserProfileResponse,
} from "@/src/domain/models/user-profile.models";

export class UserProfileController {
  async findUserProfileByUserId(userId: string): Promise<UserProfileResponse> {
    throw new Error("Method not implemented.");
  }

  async updateMyUserProfile(
    userProfileData: UpdateUserProfileRequest
  ): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  async deleteMyUserProfile(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  async listNearbyProfiles(
    maxDistance: number
  ): Promise<ExtendedUserProfileResponse[]> {
    throw new Error("Method not implemented.");
  }

  async listNearbySwipeableProfiles(
    maxDistance: number,
    limit: number = 5
  ): Promise<ExtendedUserProfileResponse[]> {
    throw new Error("Method not implemented.");
  }

  async listNearbyMatches(
    maxDistance: number
  ): Promise<ExtendedUserProfileResponse[]> {
    throw new Error("Method not implemented.");
  }

  async updateMyLocation(
    latitude: number,
    longitude: number
  ): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  async onboardUser(
    onboardingData: OnboardUserProfileRequest
  ): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  async setOnline(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async setOffline(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async listMyMatches(): Promise<ExtendedUserProfileResponse[]> {
    throw new Error("Method not implemented.");
  }

  async createSwipe(swipeRequest: CreateSwipeRequest): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
}
