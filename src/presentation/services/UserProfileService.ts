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

export function useLoadSwipeableProfiles(maxDistance: number) {
  const nearbySwipeableProfilesInStore = useNearbySwipeableProfilesStore((s) => s.nearbySwipeableProfiles);
  const loadInitialNearbySwipeableProfiles = useNearbySwipeableProfilesStore((s) => s.loadInitialProfiles);
  const swipeProfile = useNearbySwipeableProfilesStore((s) => s.swipeProfile);
  const { data: swipeableProfilesRequested, ...rest } = useListNearbySwipeableProfiles(
    maxDistance,
    nearbySwipeableProfilesInStore.length === 0 ? 5 : 1
  );
  if (!rest.isLoading && !rest.isFetching && swipeableProfilesRequested) {
    if (nearbySwipeableProfilesInStore.length === 0) {
      loadInitialNearbySwipeableProfiles(swipeableProfilesRequested);
    }
    if (nearbySwipeableProfilesInStore.length > 0 && nearbySwipeableProfilesInStore.length < 5) {
      swipeProfile(swipeableProfilesRequested[0] ?? null);
    }
  }
}

export function useSwipeProfile() {
  const swipeProfile = useNearbySwipeableProfilesStore((s) => s.swipeProfile);
  const restoreSwipeableProfile = useNearbySwipeableProfilesStore((s) => s.restoreSwipeableProfile);
  const { mutate: swipeUserProfileMutation } = useCreateSwipe();

  return ({
    targetUserId,
    liked,
    newProfile,
  }: {
    targetUserId: string;
    liked: boolean;
    newProfile?: ExtendedUserProfile;
  }) => {
    swipeUserProfileMutation(
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
}

export function useLoadNearbyMatchProfiles(maxDistance: number) {
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

  const updateLocation = ({ latitude, longitude }: { latitude: number; longitude: number }) => {
    mutation.mutate(
      { latitude, longitude },
      {
        onSuccess: () => {
          setProfile({ latitude, longitude });
        },
      }
    );
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

export function useOnboardMyUser() {
  const setProfile = useAuthUserProfileStore((s) => s.setProfile);
  const resetOnboarding = useOnboardingStore((s) => s.reset);
  const mutation = useOnboardUser();

  const onboard = (profile: Partial<UserProfile>) => {
    mutation.mutate(profile, {
      onSuccess: (data: any) => {
        setProfile(data);
        resetOnboarding();
      },
    });
  };

  return {
    ...mutation,
    onboard,
  };
}
