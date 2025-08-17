export interface UserProfileResponse {
  id: string;
  user_id: string;
  email: string;
  name: string | null;
  alias: string;
  biography: string | null;
  birth_date: string | null;
  gender: number;
  avatar: string;
  address: string | null;
  last_online: string | null;
  is_onboarded: boolean | null;
  is_verified: boolean | null;
  latitude: number | null;
  longitude: number | null;
  is_online: boolean | null;
  is_active: boolean | null;
  location: string | null;
  secondary_images: string[] | null;
  preferences: {
    min_age: number;
    max_age: number;
    max_distance: number;
    genders: number[] | string;
  };
}

export interface UpdateUserProfileRequest {
  id: string;
  alias?: string;
  gender?: number;
  avatar?: string;
  biography?: string;
  birthDate?: string;
  isOnboarded?: boolean;
  isVerified?: boolean;
  isActive?: boolean;
  latitude?: number;
  longitude?: number;
  address?: string;
  secondary_images?: string[];
  minAge?: number;
  maxAge?: number;
  maxDistance?: number;
  genders?: number[] | string;
}

export interface ExtendedUserProfileResponse extends UserProfileResponse {
  distance_in_km: string;
}

export interface OnboardUserProfileRequest {
  userId: string; // UUID del usuario autenticado
  alias: string;
  gender: number;
  avatar?: string;
  biography?: string;
  birthDate?: string;
  isOnboarded?: boolean;
  isVerified?: boolean;
  isActive?: boolean;
  latitude?: number;
  longitude?: number;
  address?: string;
  secondary_images?: string[];
  minAge?: number;
  maxAge?: number;
  maxDistance?: number;
  genders?: number[];
}

export interface CreateSwipeRequest {
  targetUserId: string;
  liked: boolean;
}
