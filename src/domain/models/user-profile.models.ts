export interface UserProfileResponse {
  id: string;
}

export interface UpdateUserProfileRequest {
  alias: string;
}

export interface ExtendedUserProfileResponse extends UserProfileResponse {
  distance_in_km: string;
}

export interface OnboardUserProfileRequest {
  avatar: string;
}

export interface CreateSwipeRequest {
  targetUserId: string;
  liked: boolean;
}
