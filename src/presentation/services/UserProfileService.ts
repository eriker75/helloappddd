import { ExtendedUserProfile, UserProfile } from "@/src/domain/entities/UserProfile";
import {
  useCreateSwipe,
  useFindUserProfileByUserId,
  useListNearbyMatches,
  useListNearbySwipeableProfiles,
  useOnboardUser,
  useSetOffline,
  useSetOnline,
  useUpdateMyLocation,
  useUpdateMyUserProfile,
} from "@/src/infraestructure/repositories/UserProfileRepositoryImpl";
import { useAuthUserProfileStore } from "@/src/presentation/stores/auth-user-profile.store";
import { useOnboardingStore } from "@/src/presentation/stores/onboarding.store";
import { getCurrentLocation } from "@/src/utils/location";
import { useEffect } from "react";
import { useCurrentUserProfileStore } from "../stores/current-user-profile.store";
import { useNearbySwipeableProfilesStore } from "../stores/nearby-swipeable-profiles.store";

export function usePreloadCurrentUserProfile(userProfilePreloadData: UserProfile) {
  const setProfile = useCurrentUserProfileStore((s) => s.setProfile);
  setProfile(userProfilePreloadData);
}

export function useGetCurrentUserProfileByUserId(userId: string) {
  const { data: requestedCurrentUserProfile, ...rest } = useFindUserProfileByUserId(userId);
  const setProfile = useCurrentUserProfileStore((s) => s.setProfile);
  const currentUserProfile = useCurrentUserProfileStore((s) => s);

  useEffect(() => {
    if (requestedCurrentUserProfile) {
      setProfile(requestedCurrentUserProfile);
    }
  }, [requestedCurrentUserProfile, setProfile]);

  return {
    ...currentUserProfile,
    ...requestedCurrentUserProfile,
    ...rest,
  };
}

const LOW_QUEUE_THRESHOLD = 2;

export function useLoadSwipeableProfiles(maxDistance: number) {
  const nearbySwipeableProfilesInStore = useNearbySwipeableProfilesStore((s) => s.nearbySwipeableProfiles);
  const loadInitialNearbySwipeableProfiles = useNearbySwipeableProfilesStore((s) => s.loadInitialProfiles);
  const appendNearbySwipeableProfiles = useNearbySwipeableProfilesStore((s) => s.appendProfiles);

  // Fetch 5 if empty, otherwise 5 if low, otherwise 1 (to keep react-query happy)
  const shouldPrefetch =
    nearbySwipeableProfilesInStore.length > 0 && nearbySwipeableProfilesInStore.length <= LOW_QUEUE_THRESHOLD;
  const fetchLimit = nearbySwipeableProfilesInStore.length === 0 || shouldPrefetch ? 5 : 1;

  const {
    data: swipeableProfilesRequested,
    isLoading,
    isFetching,
  } = useListNearbySwipeableProfiles(maxDistance, fetchLimit);

  useEffect(() => {
    if (!isLoading && !isFetching && swipeableProfilesRequested) {
      if (nearbySwipeableProfilesInStore.length === 0) {
        loadInitialNearbySwipeableProfiles(swipeableProfilesRequested);
      } else if (shouldPrefetch) {
        appendNearbySwipeableProfiles(swipeableProfilesRequested);
      }
    }
  }, [
    isLoading,
    isFetching,
    swipeableProfilesRequested,
    nearbySwipeableProfilesInStore.length,
    loadInitialNearbySwipeableProfiles,
    appendNearbySwipeableProfiles,
    shouldPrefetch,
  ]);

  // Return loading/fetching state for UI
  return { isLoading, isFetching };
}

export function useSwipeProfile() {
  const swipeProfile = useNearbySwipeableProfilesStore((s) => s.swipeProfile);
  const restoreSwipeableProfile = useNearbySwipeableProfilesStore((s) => s.restoreSwipeableProfile);
  const mutation = useCreateSwipe();

  const swipe = ({
    targetUserId,
    liked,
    newProfile,
  }: {
    targetUserId: string;
    liked: boolean;
    newProfile?: ExtendedUserProfile;
  }) => {
    mutation.mutate(
      { targetUserId, liked },
      {
        onSuccess: () => {
          if (newProfile) {
            swipeProfile(newProfile);
          } else {
            swipeProfile(null);
          }
        },
        onError: () => {
          restoreSwipeableProfile();
        },
      }
    );
  };

  return { swipe, ...mutation };
}

export function useListNearbyMatchProfileService(maxDistance: number) {
  return useListNearbyMatches(maxDistance);
}

export function useUpdateMyUserProfileInformation() {
  const updateProfile = useAuthUserProfileStore((s) => s.updateProfile);
  const setProfile = useAuthUserProfileStore((s) => s.setProfile);
  const previousProfile = useAuthUserProfileStore((s) => s);
  const mutation = useUpdateMyUserProfile();

  const updateMyProfile = (profile: Partial<UserProfile>) => {
    mutation.mutate(profile, {
      onSuccess: () => {
        updateProfile(profile);
      },
      onError: () => {
        setProfile(previousProfile);
      },
    });
  };

  return {
    ...mutation,
    updateMyProfile,
  };
}

export function useUpdateMyUserCurrentLocation() {
  const setProfile = useAuthUserProfileStore((s) => s.setProfile);
  const mutation = useUpdateMyLocation();

  const updateLocation = async () => {
    try {
      const { latitude, longitude } = await getCurrentLocation();
      mutation.mutate(
        { latitude, longitude },
        {
          onSuccess: () => {
            console.log("MyCurrentLocation", JSON.stringify({ latitude, longitude }));
            setProfile({ latitude, longitude });
          },
        }
      );
    } catch (error) {
      // Optionally, handle error (e.g., show alert, log, etc.)
      // For now, just log
      console.error("Failed to update location:", error);
    }
  };

  return {
    ...mutation,
    updateLocation,
  };
}

export function useSetMyUserAsOnline() {
  const setProfile = useAuthUserProfileStore((s) => s.setProfile);
  const mutation = useSetOnline();

  const setOnline = () => {
    mutation.mutate(undefined, {
      onSuccess: () => {
        setProfile({ isOnline: true });
      },
      onError: () => {
        setProfile({ isOnline: false });
      },
    });
  };

  return {
    ...mutation,
    setOnline,
  };
}

export function useSetMyUserAsOffline() {
  const setProfile = useAuthUserProfileStore((s) => s.setProfile);
  const mutation = useSetOffline();

  const setOffline = () => {
    mutation.mutate(undefined, {
      onSuccess: () => {
        setProfile({ isOnline: false });
      },
      onError: () => {
        setProfile({ isOnline: true });
      },
    });
  };

  return {
    ...mutation,
    setOffline,
  };
}

export function useOnboardMyUserService() {
  const setProfile = useAuthUserProfileStore((s) => s.setProfile);
  const resetOnboarding = useOnboardingStore((s) => s.reset);
  const mutation = useOnboardUser();

  const onboard = (profile: Partial<UserProfile>) => {
    mutation.mutate(profile, {
      onSuccess: (data: any) => {
        // LOG: Backend response after onboarding
        console.log("[ONBOARDING] Backend response:", JSON.stringify(data, null, 2));
        // Map secondary_images (snake_case) to secondaryImages (camelCase) for the store
        const mappedData = {
          ...data,
          secondaryImages: data.secondary_images || [],
        };
        setProfile(mappedData);
        // LOG: Store value after setProfile
        setTimeout(() => {
          // If using Zustand, getState is available directly on the hook
          if (useAuthUserProfileStore.getState) {
            console.log(
              "[ONBOARDING] Store after setProfile:",
              JSON.stringify(useAuthUserProfileStore.getState(), null, 2)
            );
          }
        }, 200);
        resetOnboarding();
      },
    });
  };

  return {
    ...mutation,
    onboard,
  };
}
