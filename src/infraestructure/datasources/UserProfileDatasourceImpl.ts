import { AbstractUserProfileDatasource } from "@/src/domain/datasoruces/AbstractUserProfileDatasoruce";
import { ExtendedUserProfile, UserProfile } from "@/src/domain/entities/UserProfile";
import { UserProfileController } from "../api/UserProfileController";
import {
  mapExtendedUserProfileResponseToExtendedUserProfileEntity,
  mapPartialUserProfileToOnboardUserProfileRequest,
  mapUserProfileResponseToUserProfileEntity,
} from "../mappers/UserProfileMapper";

export class UserProfileDatasourceImpl implements AbstractUserProfileDatasource {
  private controller: UserProfileController;

  constructor() {
    this.controller = new UserProfileController();
  }

  async findUserProfileByUserId(userId: string): Promise<UserProfile | null> {
    const userProfile = await this.controller.findUserProfileByUserId(userId);
    return mapUserProfileResponseToUserProfileEntity(userProfile);
  }

  async updateMyUserProfile(userProfile: Partial<UserProfile>): Promise<boolean> {
    if (!userProfile.userId) {
      throw new Error("UserProfile userId is required to update profile.");
    }
    // Use the full mapper to include all fields, especially secondary_images
    const mapped = mapPartialUserProfileToOnboardUserProfileRequest(userProfile);
    const updateProfileRequestData = {
      ...mapped,
      id: userProfile.userId,
    } as any; // Cast to any to satisfy TS, or use UpdateUserProfileRequest if imported
    // Optionally, log for debug
    console.log("[DEBUG] updateMyUserProfile mapped data:", JSON.stringify(updateProfileRequestData, null, 2));
    return await this.controller.updateMyUserProfile(updateProfileRequestData);
  }

  async deleteMyUserProfile(): Promise<boolean> {
    return await this.controller.deleteMyUserProfile();
  }

  async listNearbyProfiles(maxDistance: number): Promise<ExtendedUserProfile[]> {
    const extendedUserProfileResponse = await this.controller.listNearbyProfiles(maxDistance);
    const extendedUserProfiles = extendedUserProfileResponse.map((extp) =>
      mapExtendedUserProfileResponseToExtendedUserProfileEntity(extp)
    );
    return extendedUserProfiles;
  }

  async listNearbySwipeableProfiles(maxDistance: number, limit: number): Promise<ExtendedUserProfile[]> {
    const extendedUserProfileResponse = await this.controller.listNearbySwipeableProfiles(maxDistance, limit);
    const extendedUserProfiles = extendedUserProfileResponse.map((extp) =>
      mapExtendedUserProfileResponseToExtendedUserProfileEntity(extp)
    );
    return extendedUserProfiles;
  }

  async listNearbyMatches(maxDistance: number): Promise<ExtendedUserProfile[]> {
    const extendedUserProfileResponse = await this.controller.listNearbyMatches(maxDistance);
    const extendedUserProfiles = extendedUserProfileResponse.map((extp) =>
      mapExtendedUserProfileResponseToExtendedUserProfileEntity(extp)
    );
    return extendedUserProfiles;
  }

  async updateMyLocation(latitude: number, longitude: number): Promise<boolean> {
    return await this.controller.updateMyLocation(latitude, longitude);
  }

  async onboardUser(userProfile: Partial<UserProfile>): Promise<boolean> {
    const onboardProfileData = mapPartialUserProfileToOnboardUserProfileRequest(userProfile);
    return await this.controller.onboardUser(onboardProfileData);
  }

  async setOnline(): Promise<void> {
    await this.controller.setOnline();
  }

  async setOffline(): Promise<void> {
    await this.controller.setOffline();
  }

  async listMyMatches(): Promise<ExtendedUserProfile[]> {
    const extendedUserProfileResponse = await this.controller.listMyMatches();
    const extendedUserProfiles = extendedUserProfileResponse.map((extp) =>
      mapExtendedUserProfileResponseToExtendedUserProfileEntity(extp)
    );
    return extendedUserProfiles;
  }

  async createSwipe(targetUserId: string, liked: boolean): Promise<boolean> {
    return await this.controller.createSwipe({
      targetUserId,
      liked,
    });
  }
}
