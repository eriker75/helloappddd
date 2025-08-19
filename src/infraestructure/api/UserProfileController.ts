import {
  CreateSwipeRequest,
  ExtendedUserProfileResponse,
  OnboardUserProfileRequest,
  UpdateUserProfileRequest,
  UserProfileResponse,
} from "@/src/domain/models/user-profile.models";
import { getAuthenticatedUser } from "@/src/utils/getAuthenticatedUser";

import { supabase } from "@/src/utils/supabase";

export class UserProfileController {
  async findUserProfileByUserId(userId: string): Promise<UserProfileResponse> {
    throw new Error("Method not implemented.");
  }

  async updateMyUserProfile(userProfileData: UpdateUserProfileRequest): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  async deleteMyUserProfile(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  async listNearbyProfiles(maxDistance: number): Promise<ExtendedUserProfileResponse[]> {
    throw new Error("Method not implemented.");
  }

  async listNearbySwipeableProfiles(maxDistance: number, limit: number = 5): Promise<ExtendedUserProfileResponse[]> {
    throw new Error("Method not implemented.");
  }

  async listNearbyMatches(maxDistance: number): Promise<ExtendedUserProfileResponse[]> {
    throw new Error("Method not implemented.");
  }

  async updateMyLocation(latitude: number, longitude: number): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  async onboardUser(onboardingData: OnboardUserProfileRequest): Promise<boolean> {
    const { id: userId } = await getAuthenticatedUser();

    const {
      alias,
      gender,
      avatar,
      biography,
      birthDate,
      isOnboarded = true,
      isVerified = true,
      isActive = true,
      latitude,
      longitude,
      address,
      secondary_images,
      minAge = 18,
      maxAge = 98,
      maxDistance = 200,
      genders = [1, 2, 3],
    } = onboardingData;

    if (!alias || gender === undefined) {
      throw new Error("--alias and --gender are required");
    }

    // Check if profile already exists
    const { data: existingProfiles, error: checkError } = await supabase
      .from("profiles")
      .select("id, is_onboarded")
      .eq("user_id", userId);

    if (checkError) {
      throw new Error("Error checking for existing profile: " + checkError.message);
    }

    if (existingProfiles && existingProfiles.length > 0) {
      const profileRow = existingProfiles[0];
      // Update profile if not onboarded
      if (profileRow.is_onboarded === null || profileRow.is_onboarded === false) {
        const { error: updateProfileError } = await supabase
          .from("profiles")
          .update({
            alias,
            gender,
            avatar: avatar ?? null,
            biography: biography ?? null,
            birth_date: birthDate ?? null,
            is_onboarded: true,
            is_verified: isVerified,
            is_active: isActive,
            latitude: latitude ?? null,
            longitude: longitude ?? null,
            address: address ?? null,
            secondary_images: secondary_images ?? null,
          })
          .eq("id", profileRow.id);

        if (updateProfileError) {
          throw new Error("Error updating profile: " + updateProfileError.message);
        }
      } else {
        throw new Error("Profile already exists for this user and is already onboarded. Onboarding is idempotent.");
      }
    } else {
      // Insert new profile
      const { error: insertProfileError } = await supabase.from("profiles").insert([
        {
          user_id: userId,
          alias,
          gender,
          avatar: avatar ?? null,
          biography: biography ?? null,
          birth_date: birthDate ?? null,
          is_onboarded: isOnboarded,
          is_verified: isVerified,
          is_active: isActive,
          latitude: latitude ?? null,
          longitude: longitude ?? null,
          address: address ?? null,
          last_online: new Date().toISOString(),
          is_online: false,
          location: null,
          secondary_images: secondary_images ?? null,
        },
      ]);

      if (insertProfileError) {
        throw new Error("Error creating profile: " + insertProfileError.message);
      }
    }

    // Upsert preferences
    const { data: existingPrefs, error: checkPrefsError } = await supabase
      .from("preferences")
      .select("id")
      .eq("user_id", userId);

    if (checkPrefsError) {
      throw new Error("Error checking preferences: " + checkPrefsError.message);
    }

    const preferencesFields = {
      user_id: userId,
      min_age: minAge,
      max_age: maxAge,
      max_distance: maxDistance,
      genders,
    };

    if (existingPrefs && existingPrefs.length > 0) {
      // Update
      const { error: updatePrefsError } = await supabase
        .from("preferences")
        .update(preferencesFields)
        .eq("user_id", userId);
      if (updatePrefsError) {
        throw new Error("Error updating preferences: " + updatePrefsError.message);
      }
    } else {
      // Insert
      const { error: insertPrefsError } = await supabase.from("preferences").insert([preferencesFields]);
      if (insertPrefsError) {
        throw new Error("Error creating preferences: " + insertPrefsError.message);
      }
    }

    return true;
  }

  async setOnline(): Promise<void> {
    const user = await getAuthenticatedUser();
    const { error } = await supabase
      .from("profiles")
      .update({
        is_online: true,
        last_online: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (error) {
      throw new Error("Error setting user online: " + error.message);
    }
  }

  async setOffline(): Promise<void> {
    const user = await getAuthenticatedUser();
    const { error } = await supabase
      .from("profiles")
      .update({
        is_online: false,
        last_online: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (error) {
      throw new Error("Error setting user offline: " + error.message);
    }
  }

  async listMyMatches(): Promise<ExtendedUserProfileResponse[]> {
    throw new Error("Method not implemented.");
  }

  async createSwipe(swipeRequest: CreateSwipeRequest): Promise<boolean> {
    const { user_id, target_user_id, is_liked } = swipeRequest;

    if (!user_id) {
      throw new Error("❌ user_id is required for 'post'");
    }
    if (!target_user_id || typeof is_liked === "undefined") {
      throw new Error("❌ target_user_id and is_liked are required for 'post'");
    }

    // Insert swipe (interaction)
    const { data, error } = await supabase
      .from("interactions")
      .insert([
        {
          swiper_user_id: user_id,
          target_user_id,
          is_liked: is_liked === true,
        },
      ])
      .select();

    if (error || !data || data.length === 0) {
      throw new Error(
        "❌ Error creating swipe: " + (error?.message || "Unknown error")
      );
    }

    return { swipe: data[0] as Swipe };
  }
}
