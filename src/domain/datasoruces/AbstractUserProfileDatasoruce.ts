import { ExtendedUserProfile, UserProfile } from "../entities/UserProfile";

/**
 * AbstractUserProfileDatasource ahora es una clase abstracta.
 */
export abstract class AbstractUserProfileDatasource {
  // CRUD
  abstract findUserProfileByUserId(userId: string): Promise<UserProfile | null>;
  abstract updateMyUserProfile(
    userProfile: Partial<UserProfile>
  ): Promise<boolean>;
  abstract deleteMyUserProfile(): Promise<boolean>;
  // Geo queries
  abstract listNearbyProfiles(maxDistance: number): Promise<UserProfile[]>;
  abstract listNearbySwipeableProfiles(
    maxDistance: number,
    limit: number
  ): Promise<{ profiles: ExtendedUserProfile[] }>;
  abstract listNearbyMatches(
    maxDistance: number
  ): Promise<{ profiles: ExtendedUserProfile[] }>;
  abstract updateMyLocation(
    latitude: number,
    longitude: number
  ): Promise<{ profiles: ExtendedUserProfile[] }>;
  // Onboarding
  abstract onboardUser(userProfile: Partial<UserProfile>): Promise<UserProfile>;
  // Online status
  abstract setOnline(): Promise<void>;
  abstract setOffline(): Promise<void>;
  // Interactions
  abstract listMyMatches(): Promise<ExtendedUserProfile[]>;
  abstract createSwipe(): Promise<boolean>;
}
