import { UserProfile } from "@/src/domain/entities/UserProfile";
import { create, StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { zustandAsyncStorage } from "../../utils/zustandAsyncStorage";

export interface AuthUserProfileState extends UserProfile {
  userId: string;
  profileId: string;
  birthDate: string;
  age: number;
  gender: number;
  gederInterests: string[];
  minAgePreference: number;
  maxAgePreference: number;
  maxDistancePreference: number;
  name: string;
  alias: string;
  biography: string;
  avatar: string;
  address: string;
  latitude: number;
  longitude: number;
  secondaryImages: string[];
  isOnline: boolean;
  isActive: boolean;
  isOnboarded: boolean;
  lastOnline: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string;
  refreshToken: string;
}

export interface AuthUserProfileAction {
  setProfile: (profile: Partial<AuthUserProfileState>) => void;
  updateProfile: (profile: Partial<AuthUserProfileState>) => void;
  setLoading: (isLoading: boolean) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  resetProfile: () => void;
}

export type AuthUserProfileStore = AuthUserProfileState & AuthUserProfileAction;

const initialState: AuthUserProfileState = {
  userId: "",
  profileId: "",
  birthDate: "",
  age: 18,
  gender: 0,
  gederInterests: [],
  minAgePreference: 18,
  maxAgePreference: 98,
  maxDistancePreference: 200,
  name: "",
  alias: "",
  biography: "",
  avatar: "",
  address: "",
  latitude: 0,
  longitude: 0,
  secondaryImages: [],
  isOnline: false,
  isActive: false,
  isOnboarded: false,
  lastOnline: "",
  isAuthenticated: false,
  isLoading: false,
  accessToken: "",
  refreshToken: "",
  email: "",
  genderInterests: [],
};

const authUserProfileStoreCreator: StateCreator<
  AuthUserProfileStore,
  [["zustand/immer", never]],
  [["zustand/persist", unknown]]
> = (set) => ({
  ...initialState,
  setProfile: (profile) =>
    set((state) => {
      Object.assign(state, profile);
    }),
  updateProfile: (profile) =>
    set((state) => {
      Object.assign(state, profile);
    }),
  setLoading: (isLoading) =>
    set((state) => {
      state.isLoading = isLoading;
    }),
  setAuthenticated: (isAuthenticated) =>
    set((state) => {
      state.isAuthenticated = isAuthenticated;
    }),
  resetProfile: () =>
    set(() => ({
      ...initialState,
    })),
});

export const useAuthUserProfileStore = create<AuthUserProfileStore>()(
  persist(immer(authUserProfileStoreCreator), {
    name: "auth-user-profile-store",
    storage: zustandAsyncStorage,
    partialize: (state) => {
      const { isLoading, ...persisted } = state;
      return persisted;
    },
  })
);
