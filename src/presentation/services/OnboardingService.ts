// OnboardingService.ts
import { useOnboardUser } from "@/src/infraestructure/repositories/OnboardingRepositoryImpl";
import { useAuthUserProfileStore } from "@/src/presentation/stores/auth-user-profile.store";
import { useOnboardingStore } from "@/src/presentation/stores/onboarding.store";
import { useCallback } from "react";

/**
 * Store action hook for setting the authenticated user profile.
 */
export function useSetAuthUserProfile() {
  const setProfile = useAuthUserProfileStore((s) => s.setProfile);
  return useCallback(setProfile, [setProfile]);
}

/**
 * Store action hooks for onboarding state
 */
export function useSetName() {
  const setName = useOnboardingStore((s) => s.setName);
  return useCallback(setName, [setName]);
}

export function useSetAlias() {
  const setAlias = useOnboardingStore((s) => s.setAlias);
  return useCallback(setAlias, [setAlias]);
}

export function useSetBirthDate() {
  const setBirthDate = useOnboardingStore((s) => s.setBirthDate);
  return useCallback(setBirthDate, [setBirthDate]);
}

export function useSetAge() {
  const setAge = useOnboardingStore((s) => s.setAge);
  return useCallback(setAge, [setAge]);
}

export function useSetGender() {
  const setGender = useOnboardingStore((s) => s.setGender);
  return useCallback(setGender, [setGender]);
}

export function useSetGenderInterests() {
  const setGenderInterests = useOnboardingStore((s) => s.setGenderInterests);
  return useCallback(setGenderInterests, [setGenderInterests]);
}

export function useAddGenderInterest() {
  const addGenderInterest = useOnboardingStore((s) => s.addGenderInterest);
  return useCallback(addGenderInterest, [addGenderInterest]);
}

export function useRemoveGenderInterest() {
  const removeGenderInterest = useOnboardingStore(
    (s) => s.removeGenderInterest
  );
  return useCallback(removeGenderInterest, [removeGenderInterest]);
}

export function useSetMinAgePreference() {
  const setMinAgePreference = useOnboardingStore((s) => s.setMinAgePreference);
  return useCallback(setMinAgePreference, [setMinAgePreference]);
}

export function useSetMaxAgePreference() {
  const setMaxAgePreference = useOnboardingStore((s) => s.setMaxAgePreference);
  return useCallback(setMaxAgePreference, [setMaxAgePreference]);
}

export function useSetMaxDistance() {
  const setMaxDistance = useOnboardingStore((s) => s.setMaxDistance);
  return useCallback(setMaxDistance, [setMaxDistance]);
}

export function useSetBiography() {
  const setBiography = useOnboardingStore((s) => s.setBiography);
  return useCallback(setBiography, [setBiography]);
}

export function useSetAddress() {
  const setAddress = useOnboardingStore((s) => s.setAddress);
  return useCallback(setAddress, [setAddress]);
}

export function useSetLatitude() {
  const setLatitude = useOnboardingStore((s) => s.setLatitude);
  return useCallback(setLatitude, [setLatitude]);
}

export function useSetLongitude() {
  const setLongitude = useOnboardingStore((s) => s.setLongitude);
  return useCallback(setLongitude, [setLongitude]);
}

export function useSetMainPicture() {
  const setMainPicture = useOnboardingStore((s) => s.setMainPicture);
  return useCallback(setMainPicture, [setMainPicture]);
}

export function useSetSecondaryImages() {
  const setSecondaryImages = useOnboardingStore((s) => s.setSecondaryImages);
  return useCallback(setSecondaryImages, [setSecondaryImages]);
}

export function useAddSecondaryImage() {
  const addSecondaryImage = useOnboardingStore((s) => s.addSecondaryImage);
  return useCallback(addSecondaryImage, [addSecondaryImage]);
}

export function useRemoveSecondaryImage() {
  const removeSecondaryImage = useOnboardingStore(
    (s) => s.removeSecondaryImage
  );
  return useCallback(removeSecondaryImage, [removeSecondaryImage]);
}

export function useResetOnboarding() {
  const reset = useOnboardingStore((s) => s.reset);
  return useCallback(reset, [reset]);
}

export function useSetOnboarding() {
  const setOnboarding = useOnboardingStore((s) => s.setOnboarding);
  return useCallback(setOnboarding, [setOnboarding]);
}

export function useSetOnboardingProperty() {
  const setOnboardingProperty = useOnboardingStore(
    (s) => s.setOnboardingProperty
  );
  return useCallback(setOnboardingProperty, [setOnboardingProperty]);
}

/**
 * useOnboardUserService: mutation hook for onboarding a user.
 * On success, fills the auth user profile store with onboarding data and resets onboarding state.
 */
export function useOnboardUserService() {
  const reset = useResetOnboarding();
  const onboardingState = useOnboardingStore();
  const setAuthUserProfile = useSetAuthUserProfile();
  const mutation = useOnboardUser();
  const { mutate, ...rest } = mutation;

  const onboardUser = useCallback(
    (req: Parameters<typeof mutate>[0]) => {
      mutate(req, {
        onSuccess: () => {
          const {
            name,
            alias,
            birthDate,
            age,
            gender,
            genderInterests,
            minAgePreference,
            maxAgePreference,
            maxDistancePreference,
            biography,
            address,
            latitude,
            longitude,
            mainPicture,
            secondaryImages,
          } = onboardingState;
          setAuthUserProfile({
            name,
            alias,
            birthDate,
            age,
            gender,
            gederInterests: genderInterests,
            minAgePreference,
            maxAgePreference,
            maxDistancePreference,
            biography,
            address,
            latitude,
            longitude,
            avatar: mainPicture,
            secondaryImages,
            isOnboarded: true,
            isAuthenticated: true,
            isActive: true,
          });

          reset();
        },
      });
    },
    [mutate, reset, onboardingState, setAuthUserProfile]
  );

  return { ...rest, mutate: onboardUser, error: mutation.error };
}
