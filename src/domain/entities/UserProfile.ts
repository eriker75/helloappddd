export interface UserProfile {
  userId: string;
  profileId: string;
  avatar: string;
  name: string;
  alias: string;
  biography: string;
  email: string;
  secondaryImages: string[];
  genderInterests: string[];
  address: string;
  latitude: number;
  longitude: number;
  minAgePreference: number;
  maxAgePreference: number;
  maxDistancePreference: number;
  birthDate: string;
  age: number;
  gender: number;
  isOnline: boolean;
  isActive: boolean;
  isOnboarded: boolean;
  lastOnline: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ExtendedUserProfile extends UserProfile {
  distanceInKm: number;
}
