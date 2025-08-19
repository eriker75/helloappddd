import {
  CreateSwipeRequest,
  ExtendedUserProfileResponse,
  OnboardUserProfileRequest,
  UpdateUserProfileRequest,
  UserProfileResponse,
} from "@/src/domain/models/user-profile.models";
import { getAuthenticatedUser, getEnrichedAuthenticatedUser } from "@/src/utils/getAuthenticatedUser";
import { supabase } from "@/src/utils/supabase";

export class UserProfileController {
  async findUserProfileByUserId(userId: string): Promise<UserProfileResponse> {
    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      throw new Error("User profile not found: " + (profileError?.message || "Not found"));
    }

    // Fetch preferences
    const { data: preferences, error: preferencesError } = await supabase
      .from("preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (preferencesError && preferencesError.code !== "PGRST116") {
      throw new Error("Error fetching user preferences: " + preferencesError.message);
    }

    // Fetch user info from auth.users
    const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", userId).single();

    if (userError && userError.code !== "PGRST116") {
      throw new Error("Error fetching user info: " + userError.message);
    }

    // Compose UserProfileResponse
    const response: UserProfileResponse = {
      ...profile,
      preferences: preferences ?? null,
      user: user ?? null,
    };

    return response;
  }

  async updateMyUserProfile(userProfileData: UpdateUserProfileRequest): Promise<boolean> {
    const user = await getAuthenticatedUser();

    // Destructure and map fields, excluding latitude and longitude
    const {
      alias,
      gender,
      avatar,
      biography,
      birthDate,
      isOnboarded,
      isVerified,
      isActive,
      address,
      secondary_images,
      minAge,
      maxAge,
      maxDistance,
      genders,
    } = userProfileData;

    // Build update object for profiles table (exclude latitude/longitude)
    const profileUpdate: any = {};
    if (alias !== undefined) profileUpdate.alias = alias;
    if (gender !== undefined) profileUpdate.gender = gender;
    if (avatar !== undefined) profileUpdate.avatar = avatar;
    if (biography !== undefined) profileUpdate.biography = biography;
    if (birthDate !== undefined) profileUpdate.birth_date = birthDate;
    if (isOnboarded !== undefined) profileUpdate.is_onboarded = isOnboarded;
    if (isVerified !== undefined) profileUpdate.is_verified = isVerified;
    if (isActive !== undefined) profileUpdate.is_active = isActive;
    if (address !== undefined) profileUpdate.address = address;
    if (secondary_images !== undefined) profileUpdate.secondary_images = secondary_images;
    profileUpdate.updated_at = new Date().toISOString();

    // Update profile
    if (Object.keys(profileUpdate).length > 1) {
      // more than just updated_at
      const { error: profileError } = await supabase.from("profiles").update(profileUpdate).eq("user_id", user.id);

      if (profileError) {
        throw new Error("Error updating user profile: " + profileError.message);
      }
    }

    // Update preferences if any relevant field is present
    const preferencesUpdate: any = {};
    if (minAge !== undefined) preferencesUpdate.min_age = minAge;
    if (maxAge !== undefined) preferencesUpdate.max_age = maxAge;
    if (maxDistance !== undefined) preferencesUpdate.max_distance = maxDistance;
    if (genders !== undefined) preferencesUpdate.genders = genders;

    if (Object.keys(preferencesUpdate).length > 0) {
      // Check if preferences exist
      const { data: existingPrefs, error: checkPrefsError } = await supabase
        .from("preferences")
        .select("id")
        .eq("user_id", user.id);

      if (checkPrefsError) {
        throw new Error("Error checking preferences: " + checkPrefsError.message);
      }

      if (existingPrefs && existingPrefs.length > 0) {
        // Update
        const { error: updatePrefsError } = await supabase
          .from("preferences")
          .update(preferencesUpdate)
          .eq("user_id", user.id);
        if (updatePrefsError) {
          throw new Error("Error updating preferences: " + updatePrefsError.message);
        }
      } else {
        // Insert
        const { error: insertPrefsError } = await supabase
          .from("preferences")
          .insert([{ ...preferencesUpdate, user_id: user.id }]);
        if (insertPrefsError) {
          throw new Error("Error creating preferences: " + insertPrefsError.message);
        }
      }
    }

    return true;
  }

  async deleteMyUserProfile(): Promise<boolean> {
    const user = await getAuthenticatedUser();
    const { error } = await supabase
      .from("profiles")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    if (error) {
      throw new Error("Error deactivating user profile: " + error.message);
    }

    return true;
  }

  async listNearbyProfiles(maxDistance: number): Promise<ExtendedUserProfileResponse[]> {
    await getEnrichedAuthenticatedUser();

    // 1. Call the RPC to get basic info and user_ids
    const { data: rpcData, error } = await supabase.rpc("nearby_profiles", {
      max_distance: maxDistance,
    });

    if (error) {
      throw new Error("Error fetching nearby profiles: " + error.message);
    }

    const userIds = (rpcData ?? []).map((raw: any) => raw.user_id);

    if (!userIds.length) return [];

    // 2. Fetch full profiles and preferences for those user_ids
    const { data: profiles, error: profilesError } = await supabase.from("profiles").select("*").in("user_id", userIds);

    if (profilesError) {
      throw new Error("Error fetching profiles: " + profilesError.message);
    }

    const { data: preferences, error: prefsError } = await supabase
      .from("preferences")
      .select("*")
      .in("user_id", userIds);

    if (prefsError) {
      throw new Error("Error fetching preferences: " + prefsError.message);
    }

    // 3. Merge all data to construct ExtendedUserProfileResponse[]
    const profilesMap = new Map(profiles.map((p: any) => [p.user_id, p]));
    const prefsMap = new Map(preferences.map((p: any) => [p.user_id, p]));

    const results: ExtendedUserProfileResponse[] = (rpcData ?? []).map((raw: any) => {
      const profile = profilesMap.get(raw.user_id) || {};
      const prefs = prefsMap.get(raw.user_id) || null;
      return {
        id: profile.id ?? "",
        user_id: raw.user_id,
        email: profile.email ?? "",
        name: profile.name ?? null,
        alias: profile.alias ?? raw.username ?? "",
        biography: profile.biography ?? raw.biography ?? null,
        birth_date: profile.birth_date ?? null,
        gender: profile.gender ?? raw.gender,
        avatar: profile.avatar ?? raw.avatar_url ?? "",
        address: profile.address ?? null,
        last_online: profile.last_online ?? null,
        is_onboarded: profile.is_onboarded ?? null,
        is_verified: profile.is_verified ?? null,
        latitude: profile.latitude ?? raw.latitude ?? null,
        longitude: profile.longitude ?? raw.longitude ?? null,
        is_online: profile.is_online ?? null,
        is_active: profile.is_active ?? null,
        location: profile.location ?? null,
        secondary_images: profile.secondary_images ?? null,
        preferences: prefs,
        distance_in_km: raw.distance_km?.toString() ?? "0",
      };
    });

    return results;
  }

  async listNearbySwipeableProfiles(maxDistance: number, limit: number = 5): Promise<ExtendedUserProfileResponse[]> {
    // Ensure user is authenticated and enriched (for location, etc.)
    await getEnrichedAuthenticatedUser();

    // 1. Call the RPC to get basic info and user_ids
    const { data: rpcData, error } = await supabase.rpc("swipeable_profiles", {
      max_distance: maxDistance,
      limit_count: limit,
    });

    if (error) {
      throw new Error("Error fetching swipeable profiles: " + error.message);
    }

    const userIds = (rpcData ?? []).map((raw: any) => raw.user_id);

    if (!userIds.length) return [];

    // 2. Fetch full profiles and preferences for those user_ids
    const { data: profiles, error: profilesError } = await supabase.from("profiles").select("*").in("user_id", userIds);

    if (profilesError) {
      throw new Error("Error fetching profiles: " + profilesError.message);
    }

    const { data: preferences, error: prefsError } = await supabase
      .from("preferences")
      .select("*")
      .in("user_id", userIds);

    if (prefsError) {
      throw new Error("Error fetching preferences: " + prefsError.message);
    }

    // 3. Merge all data to construct ExtendedUserProfileResponse[]
    const profilesMap = new Map(profiles.map((p: any) => [p.user_id, p]));
    const prefsMap = new Map(preferences.map((p: any) => [p.user_id, p]));

    const results: ExtendedUserProfileResponse[] = (rpcData ?? []).map((raw: any) => {
      const profile = profilesMap.get(raw.user_id) || {};
      const prefs = prefsMap.get(raw.user_id) || null;
      return {
        id: profile.id ?? "",
        user_id: raw.user_id,
        email: profile.email ?? "",
        name: profile.name ?? null,
        alias: profile.alias ?? raw.username ?? "",
        biography: profile.biography ?? raw.biography ?? null,
        birth_date: profile.birth_date ?? null,
        gender: profile.gender ?? raw.gender,
        avatar: profile.avatar ?? raw.avatar_url ?? "",
        address: profile.address ?? null,
        last_online: profile.last_online ?? null,
        is_onboarded: profile.is_onboarded ?? null,
        is_verified: profile.is_verified ?? null,
        latitude: profile.latitude ?? raw.latitude ?? null,
        longitude: profile.longitude ?? raw.longitude ?? null,
        is_online: profile.is_online ?? null,
        is_active: profile.is_active ?? null,
        location: profile.location ?? null,
        secondary_images: profile.secondary_images ?? null,
        preferences: prefs,
        distance_in_km: raw.distance_km?.toString() ?? "0",
      };
    });

    return results;
  }

  async listNearbyMatches(maxDistance: number): Promise<ExtendedUserProfileResponse[]> {
    // Ensure user is authenticated and enriched (for location, etc.)
    await getEnrichedAuthenticatedUser();

    // 1. Call the RPC to get basic info and user_ids
    const { data: rpcData, error } = await supabase.rpc("nearby_matches", {
      max_distance: maxDistance,
    });

    if (error) {
      throw new Error("Error fetching nearby matches: " + error.message);
    }

    const userIds = (rpcData ?? []).map((raw: any) => raw.user_id);

    if (!userIds.length) return [];

    // 2. Fetch full profiles and preferences for those user_ids
    const { data: profiles, error: profilesError } = await supabase.from("profiles").select("*").in("user_id", userIds);

    if (profilesError) {
      throw new Error("Error fetching profiles: " + profilesError.message);
    }

    const { data: preferences, error: prefsError } = await supabase
      .from("preferences")
      .select("*")
      .in("user_id", userIds);

    if (prefsError) {
      throw new Error("Error fetching preferences: " + prefsError.message);
    }

    // 3. Merge all data to construct ExtendedUserProfileResponse[]
    const profilesMap = new Map(profiles.map((p: any) => [p.user_id, p]));
    const prefsMap = new Map(preferences.map((p: any) => [p.user_id, p]));

    const results: ExtendedUserProfileResponse[] = (rpcData ?? []).map((raw: any) => {
      const profile = profilesMap.get(raw.user_id) || {};
      const prefs = prefsMap.get(raw.user_id) || null;
      return {
        id: profile.id ?? "",
        user_id: raw.user_id,
        email: profile.email ?? "",
        name: profile.name ?? null,
        alias: profile.alias ?? raw.username ?? "",
        biography: profile.biography ?? raw.biography ?? null,
        birth_date: profile.birth_date ?? null,
        gender: profile.gender ?? raw.gender,
        avatar: profile.avatar ?? raw.avatar_url ?? "",
        address: profile.address ?? null,
        last_online: profile.last_online ?? null,
        is_onboarded: profile.is_onboarded ?? null,
        is_verified: profile.is_verified ?? null,
        latitude: profile.latitude ?? raw.latitude ?? null,
        longitude: profile.longitude ?? raw.longitude ?? null,
        is_online: profile.is_online ?? null,
        is_active: profile.is_active ?? null,
        location: profile.location ?? null,
        secondary_images: profile.secondary_images ?? null,
        preferences: prefs,
        distance_in_km: raw.distance_km?.toString() ?? "0",
      };
    });

    return results;
  }

  async updateMyLocation(latitude: number, longitude: number): Promise<boolean> {
    await getAuthenticatedUser();

    const { data, error } = await supabase.rpc("update_my_location", {
      new_latitude: latitude,
      new_longitude: longitude,
    });

    if (error) {
      throw new Error("Error updating location: " + error.message);
    }

    return data === true || data === 1;
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
    const user = await getAuthenticatedUser();

    // Find all matches where the user is either swiper or target
    const { data: matches, error } = await supabase
      .from("interactions")
      .select("swiper_user_id, target_user_id")
      .eq("is_match", true)
      .or(`swiper_user_id.eq.${user.id},target_user_id.eq.${user.id}`);

    if (error) {
      throw new Error("Error fetching matches: " + error.message);
    }

    // Get the other user in each match
    const matchedUserIds = new Set<string>();
    (matches ?? []).forEach((m: any) => {
      if (m.swiper_user_id === user.id) {
        matchedUserIds.add(m.target_user_id);
      } else if (m.target_user_id === user.id) {
        matchedUserIds.add(m.swiper_user_id);
      }
    });

    if (matchedUserIds.size === 0) {
      return [];
    }

    // Fetch profiles for matched users
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .in("user_id", Array.from(matchedUserIds));

    if (profilesError) {
      throw new Error("Error fetching matched profiles: " + profilesError.message);
    }

    // Optionally, join with preferences or other info as needed for ExtendedUserProfileResponse
    // For now, return the profiles as ExtendedUserProfileResponse[]
    return profiles as ExtendedUserProfileResponse[];
  }

  async createSwipe(swipeRequest: CreateSwipeRequest): Promise<boolean> {
    const user = await getAuthenticatedUser();
    const { targetUserId, liked } = swipeRequest;

    if (!targetUserId || typeof liked !== "boolean") {
      throw new Error("targetUserId and liked are required");
    }

    const { error } = await supabase.from("interactions").insert([
      {
        swiper_user_id: user.id,
        target_user_id: targetUserId,
        is_liked: liked,
        is_match: false,
      },
    ]);

    if (error) {
      throw new Error("Error creating swipe: " + error.message);
    }

    return true;
  }
}
