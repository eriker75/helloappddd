import { UserProfileEntity } from "@/src/domain/entities/UserProfile.entity";
import {
  useBlockUser,
  useCreateUserProfile,
  useDeleteUserProfile,
  useFindUserProfileByAlias,
  useFindUserProfileByEmail,
  useFindUserProfileById,
  useFindUserProfileByUserId,
  useGetPreferences,
  useListNearbyMatches,
  useListNearbyProfiles,
  useListNearbySwipeableProfiles,
  useOnboardUser,
  useReportUser,
  useSetOffline,
  useSetOnline,
  useSetPreferences,
  useUpdateMyLocation,
  useUpdateUserLocation,
  useUpdateUserProfile,
} from "@/src/infraestructure/repositories/UserProfileRepositoryImpl";
import { useAuthUserProfileStore } from "@/src/presentation/stores/auth-user-profile.store";
import { currentUserProfileStore } from "@/src/presentation/stores/current-user-profile.store";
import { useCallback } from "react";

/**
 * UserProfileService: Provides all user profile actions and syncs state with stores.
 */

// --- Store Actions ---

export function useSetCurrentUserProfile() {
  const setProfile = currentUserProfileStore((s: any) => s.setProfile);
  return useCallback(setProfile, [setProfile]);
}

export function useUpdateCurrentUserProfile() {
  const updateProfile = currentUserProfileStore((s: any) => s.updateProfile);
  return useCallback(updateProfile, [updateProfile]);
}

export function useSetAuthUserProfile() {
  const setProfile = useAuthUserProfileStore((s: any) => s.setProfile);
  return useCallback(setProfile, [setProfile]);
}

export function useUpdateAuthUserProfile() {
  const updateProfile = useAuthUserProfileStore((s) => s.updateProfile);
  return useCallback(updateProfile, [updateProfile]);
}

export function useSetCurrentUserLoading() {
  const setLoading = currentUserProfileStore((s: any) => s.setLoading);
  return useCallback(setLoading, [setLoading]);
}

export function useSetAuthUserLoading() {
  const setLoading = useAuthUserProfileStore((s) => s.setLoading);
  return useCallback(setLoading, [setLoading]);
}

// --- Service Hooks ---

/** Create a new user profile and sync to store */
export function useCreateUserProfileService() {
  const setProfile = useSetCurrentUserProfile();
  const mutation = useCreateUserProfile();
  const { mutate, ...rest } = mutation;
  const createUserProfile = useCallback(
    (entity: UserProfileEntity) => {
      mutate(entity, {
        onSuccess: (profile) => {
          setProfile(profile);
        },
      });
    },
    [mutate, setProfile]
  );
  return { ...rest, mutate: createUserProfile };
}

/** Update user profile and sync to store */
export function useUpdateUserProfileService() {
  const updateProfile = useUpdateCurrentUserProfile();
  const mutation = useUpdateUserProfile();
  const { mutate, ...rest } = mutation;
  const updateUserProfile = useCallback(
    (entity: UserProfileEntity) => {
      mutate(entity, {
        onSuccess: () => {
          updateProfile(entity);
        },
      });
    },
    [mutate, updateProfile]
  );
  return { ...rest, mutate: updateUserProfile };
}

/** Delete user profile and reset store */
export function useDeleteUserProfileService() {
  const setProfile = useSetCurrentUserProfile();
  const mutation = useDeleteUserProfile();
  const { mutate, ...rest } = mutation;
  const deleteUserProfile = useCallback(
    (id: string) => {
      mutate(id, {
        onSuccess: () => {
          setProfile({});
        },
      });
    },
    [mutate, setProfile]
  );
  return { ...rest, mutate: deleteUserProfile };
}

/** Get user profile by id and sync to store */
import { useEffect } from "react";
export function useGetUserProfileByIdService(id: string) {
  const setProfile = useSetCurrentUserProfile();
  const query = useFindUserProfileById(id);
  console.log("[useGetUserProfileByIdService] Fetching profile by id:", id, "query:", query);
  useEffect(() => {
    console.log("[useGetUserProfileByIdService] useEffect query.data:", query.data, "error:", query.error);
    if (query.data) {
      // Ensure profileId is set for store compatibility
      const profileWithProfileId = {
        ...(query.data as any),
        profileId: (query.data as any).profileId || query.data.id || "",
      };
      setProfile(profileWithProfileId);
      console.log("[useGetUserProfileByIdService] setProfile called with:", profileWithProfileId);
    }
  }, [query.data, setProfile]);
  return query;
}

/** Get user profile by userId and sync to store */
export function useGetUserProfileByUserIdService(userId: string) {
  const setProfile = useSetCurrentUserProfile();
  const query = useFindUserProfileByUserId(userId);
  if (query.data) setProfile(query.data);
  return query;
}

/** Get user profile by email */
export function useGetUserProfileByEmailService(email: string) {
  return useFindUserProfileByEmail(email);
}

/** Get user profile by alias */
export function useGetUserProfileByAliasService(alias: string) {
  return useFindUserProfileByAlias(alias);
}

/** List nearby profiles */
export function useListNearbyProfilesService(
  userId: string,
  maxDistance: number
) {
  return useListNearbyProfiles(userId, maxDistance);
}

/** List nearby swipeable profiles */
export function useListNearbySwipeableProfilesService(
  userId: string,
  maxDistance: number,
  count: number
) {
  return useListNearbySwipeableProfiles(userId, maxDistance, count);
}

/** List nearby matches */
export function useListNearbyMatchesService(
  userId: string,
  maxDistance: number
) {
  return useListNearbyMatches(userId, maxDistance);
}

/** Update user location */
export function useUpdateUserLocationService() {
  return useUpdateUserLocation();
}

/** Update my location (geo) */
export function useUpdateMyLocationService() {
  return useUpdateMyLocation();
}

/** Onboard user */
export function useOnboardUserService() {
  const setAuthProfile = useSetAuthUserProfile();
  const mutation = useOnboardUser();
  const { mutate, ...rest } = mutation;
  const onboardUser = useCallback(
    (req: Parameters<typeof mutate>[0]) => {
      mutate(req, {
        onSuccess: (profile) => {
          // Map UserProfileEntity to Partial<AuthUserProfileState>
          setAuthProfile({
            ...profile,
            birthDate: profile.birthDate
              ? typeof profile.birthDate === "string"
                ? profile.birthDate
                : profile.birthDate.toISOString()
              : undefined,
          });
        },
      });
    },
    [mutate, setAuthProfile]
  );
  return { ...rest, mutate: onboardUser };
}

/** Block user */
export function useBlockUserService() {
  return useBlockUser();
}

/** Report user */
export function useReportUserService() {
  return useReportUser();
}

/** Set user online */
export function useSetOnlineService() {
  return useSetOnline();
}

/** Set user offline */
export function useSetOfflineService() {
  return useSetOffline();
}

/** Get preferences */
export function useGetPreferencesService(userId: string) {
  return useGetPreferences(userId);
}

/** Set preferences */
export function useSetPreferencesService() {
  return useSetPreferences();
}
