import { AbstractUserProfileDatasource } from "@/src/domain/datasoruces/AbstractUserProfileDatasoruce";
import {
  ExtendedUserProfile,
  UserProfile,
} from "@/src/domain/entities/UserProfile";
import { UserProfileController } from "../api/UserProfileController";

export class UserProfileDatasourceImpl
  implements AbstractUserProfileDatasource
{
  private controller: UserProfileController;

  constructor() {
    this.controller = new UserProfileController();
  }

  findUserProfileByUserId(userId: string): Promise<UserProfile | null> {
    throw new Error("Method not implemented.");
  }

  updateMyUserProfile(userProfile: Partial<UserProfile>): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  deleteMyUserProfile(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  listNearbyProfiles(maxDistance: number): Promise<UserProfile[]> {
    throw new Error("Method not implemented.");
  }

  listNearbySwipeableProfiles(
    maxDistance: number,
    limit: number
  ): Promise<{ profiles: ExtendedUserProfile[] }> {
    throw new Error("Method not implemented.");
  }

  listNearbyMatches(
    maxDistance: number
  ): Promise<{ profiles: ExtendedUserProfile[] }> {
    throw new Error("Method not implemented.");
  }

  updateMyLocation(
    latitude: number,
    longitude: number
  ): Promise<{ profiles: ExtendedUserProfile[] }> {
    throw new Error("Method not implemented.");
  }

  onboardUser(userProfile: Partial<UserProfile>): Promise<UserProfile> {
    throw new Error("Method not implemented.");
  }

  setOnline(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  setOffline(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  listMyMatches(): Promise<ExtendedUserProfile[]> {
    throw new Error("Method not implemented.");
  }

  createSwipe(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
}
