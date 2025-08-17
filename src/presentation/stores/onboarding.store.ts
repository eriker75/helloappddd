import { UserProfile } from "@/src/domain/entities/UserProfile";
import { create, StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { zustandAsyncStorage } from "../../utils/zustandAsyncStorage";

export interface OnboardingState extends Partial<UserProfile> {
  name: string;
  alias: string;
  birthDate: string;
  age: number;
  gender: number;
  genderInterests: string[];
  minAgePreference: number;
  maxAgePreference: number;
  maxDistancePreference: number;
  biography: string;
  address: string;
  latitude: string;
  longitude: string;
  avatar: string;
  secondaryImages: string[];
}

export interface OnboardingActions {
  setName: (name: string) => void;
  setAlias: (alias: string) => void;
  setBirthDate: (birthDate: string) => void;
  setAge: (age: number) => void;
  setGender: (gender: number) => void;
  setGenderInterests: (genderInterests: string[]) => void;
  addGenderInterest: (interest: string) => void;
  removeGenderInterest: (interest: string) => void;
  setMinAgePreference: (minAge: number) => void;
  setMaxAgePreference: (maxAge: number) => void;
  setMaxDistance: (distance: number) => void;
  setBiography: (biography: string) => void;
  setAddress: (address: string) => void;
  setLatitude: (latitude: string) => void;
  setLongitude: (longitude: string) => void;
  setAvatar: (avatar: string) => void;
  setSecondaryImages: (secondaryImages: string[]) => void;
  addSecondaryImage: (image: string) => void;
  removeSecondaryImage: (image: string) => void;
  reset: () => void;
  setOnboarding: (payload: Partial<OnboardingState>) => void;
  setOnboardingProperty: <K extends keyof OnboardingState>(
    key: K,
    value: OnboardingState[K]
  ) => void;
}

export type OnboardingStore = OnboardingState & OnboardingActions;

const initialState: OnboardingState = {
  name: "",
  alias: "",
  birthDate: "",
  age: 18,
  gender: 0,
  genderInterests: [],
  minAgePreference: 18,
  maxAgePreference: 98,
  maxDistancePreference: 200,
  biography: "",
  address: "",
  latitude: "",
  longitude: "",
  avatar: "",
  secondaryImages: [],
};

const onboardingStoreCreator: StateCreator<
  OnboardingStore,
  [["zustand/immer", never]],
  [["zustand/persist", unknown]]
> = (set) => ({
  ...initialState,
  setName: (name) =>
    set((state) => {
      state.name = name;
    }),
  setAlias: (alias) =>
    set((state) => {
      state.alias = alias;
    }),
  setBirthDate: (birthDate) =>
    set((state) => {
      state.birthDate = birthDate;
    }),
  setAge: (age) =>
    set((state) => {
      state.age = age;
    }),
  setGender: (gender) =>
    set((state) => {
      state.gender = gender;
    }),
  setGenderInterests: (genderInterests) =>
    set((state) => {
      state.genderInterests = genderInterests;
    }),
  addGenderInterest: (interest) =>
    set((state) => {
      if (!state.genderInterests.includes(interest)) {
        state.genderInterests.push(interest);
      }
    }),
  removeGenderInterest: (interest) =>
    set((state) => {
      state.genderInterests = state.genderInterests.filter(
        (i: string) => i !== interest
      );
    }),
  setMinAgePreference: (minAge) =>
    set((state) => {
      state.minAgePreference = minAge;
    }),
  setMaxAgePreference: (maxAge) =>
    set((state) => {
      state.maxAgePreference = maxAge;
    }),
  setMaxDistance: (distance) =>
    set((state) => {
      state.maxDistancePreference = distance;
    }),
  setBiography: (biography) =>
    set((state) => {
      state.biography = biography;
    }),
  setAddress: (address) =>
    set((state) => {
      state.address = address;
    }),
  setLatitude: (latitude) =>
    set((state) => {
      state.latitude = latitude;
    }),
  setLongitude: (longitude) =>
    set((state) => {
      state.longitude = longitude;
    }),
  setAvatar: (avatar) =>
    set((state) => {
      state.avatar = avatar;
    }),
  setSecondaryImages: (secondaryImages) =>
    set((state) => {
      state.secondaryImages = secondaryImages;
    }),
  addSecondaryImage: (image) =>
    set((state) => {
      if (!state.secondaryImages.includes(image)) {
        state.secondaryImages.push(image);
      }
    }),
  removeSecondaryImage: (image) =>
    set((state) => {
      state.secondaryImages = state.secondaryImages.filter(
        (img: string) => img !== image
      );
    }),
  reset: () => set(() => ({ ...initialState })),
  setOnboarding: (payload) =>
    set((state) => {
      Object.assign(state, payload);
    }),
  setOnboardingProperty: (key, value) =>
    set((state) => {
      (state as any)[key] = value;
    }),
});

export const useOnboardingStore = create<OnboardingStore>()(
  persist(immer(onboardingStoreCreator), {
    name: "onboarding-store",
    storage: zustandAsyncStorage,
    partialize: (state) => ({ ...state }),
  })
);
