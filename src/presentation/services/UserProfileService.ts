import { ExtendedUserProfile, UserProfile } from "@/src/domain/entities/UserProfile";
import {
  useCreateSwipe,
  useFindUserProfileByUserId,
  useListNearbySwipeableProfiles,
} from "@/src/infraestructure/repositories/UserProfileRepositoryImpl";
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

export function useLoadSwipeableProfiles(masDistance: number) {
  const nearbySwipeableProfilesInStore = useNearbySwipeableProfilesStore((s) => s.nearbySwipeableProfiles);
  const loadInitialNearbySwipeableProfiles = useNearbySwipeableProfilesStore((s) => s.loadInitialProfiles);
  const swipeProfile = useNearbySwipeableProfilesStore((s) => s.swipeProfile);
  const { data: swipeableProfilesRequested, ...rest } = useListNearbySwipeableProfiles(
    masDistance,
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
