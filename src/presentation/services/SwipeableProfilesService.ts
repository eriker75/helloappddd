import { MAX_SWIPEABLE_PROFILES_BATCH } from "@/src/definitions/constants/SWIPE_LIMITS";
import { UserProfileEntity } from "@/src/domain/entities/UserProfile.entity";
import { toNearbySwipeableProfile } from "@/src/infraestructure/mappers/UserProfileMapper";
import { useCreateSwipe } from "@/src/infraestructure/repositories/InteractionRepositoryImpl";
import { useListNearbySwipeableProfiles } from "@/src/infraestructure/repositories/UserProfileRepositoryImpl";
import {
  NearbySwipeableProfile,
  nearbySwipeableProfilesStore,
} from "@/src/presentation/stores/nearby-swipeable-profiles.store";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

/**
 * Hook para obtener el estado reactivo del store de perfiles swipeables.
 */
export function useSwipeableProfilesState() {
  return nearbySwipeableProfilesStore();
}

/**
 * Hook para saber si el usuario puede hacer swipe (según lógica de límites).
 */
export function useCanSwipe() {
  return nearbySwipeableProfilesStore((s) => s.canSwipe());
}

/**
 * Hook para cargar el batch inicial de perfiles swipeables y sincronizarlos con el store.
 */
export function useFetchSwipeableProfiles(userId: string, maxDistance: number) {
  const { data, isLoading, error, refetch } = useListNearbySwipeableProfiles(
    userId,
    maxDistance,
    MAX_SWIPEABLE_PROFILES_BATCH
  );
  const loadInitialProfiles = nearbySwipeableProfilesStore(
    (s) => s.loadInitialProfiles
  );

  // Debug: log request params and response
  console.log("[useFetchSwipeableProfiles] userId:", userId, "maxDistance:", maxDistance, "data:", data, "error:", error);

  useCallback(() => {
    if (data) {
      const mapped = (data as UserProfileEntity[]).map(
        toNearbySwipeableProfile
      );
      console.log("[useFetchSwipeableProfiles] mapped profiles:", mapped);

      // Only update the store if the profiles have changed
      const current = nearbySwipeableProfilesStore.getState().nearbySwipeableProfiles;
      const same =
        current.length === mapped.length &&
        current.every((p, i) => p.profileId === mapped[i].profileId);

      if (!same) {
        console.log("[useFetchSwipeableProfiles] Updating store with new profiles");
        loadInitialProfiles(mapped);
      } else {
        console.log("[useFetchSwipeableProfiles] Skipping store update (no change)");
      }
    }
  }, [data, loadInitialProfiles])();

  return { data, isLoading, error, refetch };
}

/**
 * Hook para hacer swipe sobre el perfil actual (like/pass) y sincronizar el store.
 */
export function useSwipeProfile(userId: string) {
  const registerSwipe = nearbySwipeableProfilesStore((s) => s.registerSwipe);
  const swipeProfile = nearbySwipeableProfilesStore((s) => s.swipeProfile);
  const canSwipe = nearbySwipeableProfilesStore((s) => s.canSwipe());
  const mutation = useCreateSwipe();
  const queryClient = useQueryClient();

  // Memoized función para hacer swipe (like/pass)
  const swipe = useCallback(
    async (
      targetUserId: string,
      isLiked: boolean,
      newProfile: NearbySwipeableProfile | null
    ) => {
      if (!canSwipe) {
        return { success: false, reachedDailyLimit: true };
      }
      await mutation.mutateAsync({
        user_id: userId,
        target_user_id: targetUserId,
        is_liked: isLiked,
      });
      registerSwipe();
      swipeProfile(newProfile);
      // Opcional: invalidar queries relacionadas para mantener sincronía
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      return { success: true, reachedDailyLimit: false };
    },
    [canSwipe, mutation, registerSwipe, swipeProfile, userId, queryClient]
  );

  // React Query mutation loading state: use isPending or status
  const isLoading =
    mutation.status === "pending" || (mutation as any).isPending;

  return { swipe, isLoading, error: mutation.error };
}

/**
 * Hook para sincronizar el store local con el backend (útil tras reconexión o refresh).
 */
export function useSyncSwipeableProfilesStore(
  userId: string,
  maxDistance: number
) {
  const { refetch } = useListNearbySwipeableProfiles(
    userId,
    maxDistance,
    MAX_SWIPEABLE_PROFILES_BATCH
  );
  const loadInitialProfiles = nearbySwipeableProfilesStore(
    (s) => s.loadInitialProfiles
  );

  // Memoized función para sincronizar el store con el backend
  const sync = useCallback(async () => {
    const { data } = await refetch();
    if (data) {
      const mapped = (data as UserProfileEntity[]).map(
        toNearbySwipeableProfile
      );
      loadInitialProfiles(mapped);
    }
  }, [refetch, loadInitialProfiles]);

  return { sync };
}
