import { ExtendedUserProfile, UserProfile } from "@/src/domain/entities/UserProfile";
import { UseMutationResult, UseQueryResult, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserProfileDatasourceImpl } from "../datasources/UserProfileDatasourceImpl";

// Singleton datasource instance for hooks
const datasource = new UserProfileDatasourceImpl();

// Queries

/** Find user profile by userId */
export function useFindUserProfileByUserId(userId: string): UseQueryResult<UserProfile | null> {
  return useQuery({
    queryKey: ["userProfile", "findUserProfileByUserId", userId],
    queryFn: () => datasource.findUserProfileByUserId(userId),
    enabled: !!userId,
  });
}

/** List nearby profiles */
export function useListNearbyProfiles(maxDistance: number): UseQueryResult<ExtendedUserProfile[]> {
  return useQuery({
    queryKey: ["userProfile", "listNearbyProfiles", maxDistance],
    queryFn: () => datasource.listNearbyProfiles(maxDistance),
    enabled: typeof maxDistance === "number" && maxDistance > 0,
  });
}

/** List nearby swipeable profiles */
export function useListNearbySwipeableProfiles(
  maxDistance: number,
  limit: number
): UseQueryResult<ExtendedUserProfile[]> {
  return useQuery({
    queryKey: ["userProfile", "listNearbySwipeableProfiles", maxDistance, limit],
    queryFn: () => datasource.listNearbySwipeableProfiles(maxDistance, limit),
    enabled: typeof maxDistance === "number" && maxDistance > 0 && typeof limit === "number" && limit > 0,
  });
}

/** List nearby matches */
export function useListNearbyMatches(maxDistance: number): UseQueryResult<ExtendedUserProfile[]> {
  return useQuery({
    queryKey: ["userProfile", "listNearbyMatches", maxDistance],
    queryFn: () => datasource.listNearbyMatches(maxDistance),
    enabled: typeof maxDistance === "number" && maxDistance > 0,
  });
}

/** List my matches */
export function useListMyMatches(): UseQueryResult<ExtendedUserProfile[]> {
  return useQuery({
    queryKey: ["userProfile", "listMyMatches"],
    queryFn: () => datasource.listMyMatches(),
  });
}

// Mutations

/** Update my user profile */
export function useUpdateMyUserProfile(): UseMutationResult<boolean, unknown, Partial<UserProfile>> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userProfile: Partial<UserProfile>) => datasource.updateMyUserProfile(userProfile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

/** Delete my user profile */
export function useDeleteMyUserProfile(): UseMutationResult<boolean, unknown, void> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => datasource.deleteMyUserProfile(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

/** Update my location */
export function useUpdateMyLocation(): UseMutationResult<boolean, unknown, { latitude: number; longitude: number }> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ latitude, longitude }) => datasource.updateMyLocation(latitude, longitude),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

/** Onboard user */
export function useOnboardUser(): UseMutationResult<boolean, unknown, Partial<UserProfile>> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userProfile: Partial<UserProfile>) => datasource.onboardUser(userProfile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

/** Set online */
export function useSetOnline(): UseMutationResult<void, unknown, void> {
  return useMutation({
    mutationFn: () => datasource.setOnline(),
  });
}

/** Set offline */
export function useSetOffline(): UseMutationResult<void, unknown, void> {
  return useMutation({
    mutationFn: () => datasource.setOffline(),
  });
}

/** Create swipe */
export function useCreateSwipe(): UseMutationResult<boolean, unknown, { targetUserId: string; liked: boolean }> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ targetUserId, liked }) => datasource.createSwipe(targetUserId, liked),
    onSuccess: () => {
      // Invalidate specifically the swipeable profiles query and matches
      queryClient.invalidateQueries({ queryKey: ["userProfile", "listNearbySwipeableProfiles"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile", "listNearbyMatches"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile", "listMyMatches"] });
    },
  });
}
