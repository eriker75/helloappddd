import { supabase } from "@/src/utils/supabase";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useAuthUserProfileStore } from "../stores/auth-user-profile.store";

if (!process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID) {
  throw new Error("Not GOOGLE_CLIENT_ID Found in env variables");
}

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
});

export const useGoogleAuth = () => {
  const setProfile = useAuthUserProfileStore((state) => state.setProfile);
  const resetProfile = useAuthUserProfileStore((state) => state.resetProfile);
  const setLoading = useAuthUserProfileStore((state) => state.setLoading);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const signIn = async () => {
    setIsLoading(true);
    setLoading(true);
    setError(null);

    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (!isSuccessResponse(response) || !response.data.idToken) {
        throw new Error("No se pudo obtener el token de Google");
      }

      const { data: authData, error: supabaseError } =
        await supabase.auth.signInWithIdToken({
          provider: "google",
          token: response.data.idToken,
        });

      if (supabaseError || !authData.user) {
        throw new Error(
          supabaseError?.message || "Error en la autenticación con Supabase"
        );
      }

      const {
        data: { user: userData },
      } = await supabase.auth.getUser();

      if (!userData) {
        throw new Error("Usuario no encontrado");
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userData.id)
        .single();

      if (profileError) {
        throw new Error("No se pudo obtener el perfil del usuario");
      }

      const userProfile = {
        userId: userData.id,
        profileId: profileData?.id || "",
        birthDate: profileData?.birth_date || "",
        age: profileData?.age || 18,
        gender: profileData?.gender || 0,
        gederInterests: profileData?.interested_in || [],
        minAgePreference: profileData?.min_age_preference || 18,
        maxAgePreference: profileData?.max_age_preference || 98,
        maxDistancePreference: profileData?.max_distance_preference || 200,
        name:
          userData.user_metadata?.full_name ||
          authData?.user.user_metadata?.full_name ||
          "",
        alias: profileData?.alias || "",
        biography: profileData?.bio || "",
        avatar:
          profileData?.avatar || authData?.user.user_metadata?.avatar_url || "",
        address: profileData?.address || "",
        latitude: profileData?.latitude || "",
        longitude: profileData?.longitude || "",
        secondaryImages: profileData?.secondary_images || [],
        isOnline: true,
        isActive: profileData?.status === 1,
        isOnboarded: !!profileData?.is_onboarded,
        lastOnline: profileData?.last_online || "",
        isAuthenticated: true,
        isLoading: false,
        accessToken: authData.session?.access_token || "",
        refreshToken: authData.session?.refresh_token || "",
      };

      setProfile(userProfile);
      setLoading(false);
      setIsLoading(false);
      return true;
    } catch (error) {
      setLoading(false);
      setIsLoading(false);

      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            setError("Inicio de sesión cancelado");
            return false;
          case statusCodes.IN_PROGRESS:
            setError("Proceso de inicio de sesión en progreso");
            return false;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            setError("Google Play Services no está disponible");
            return false;
          default:
            setError("Error en el inicio de sesión con Google");
            return false;
        }
      } else {
        const message =
          error instanceof Error ? error.message : "Error desconocido";
        setError(message);
      }
      resetProfile();
      return false;
    }
  };

  const logout = async () => {
    setError(null);
    setLoading(true);
    setIsLoading(true);
    try {
      // Sign out from Supabase
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        setError(signOutError.message);
        setLoading(false);
        setIsLoading(false);
        return;
      }
      // Sign out from Google
      await GoogleSignin.signOut();
      // Clean the store
      resetProfile();
      // Redirect to login
      router.replace("/login");
    } catch (err: any) {
      setError(err?.message || "Unknown error");
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  return {
    signIn,
    logout,
    isLoading,
    error,
  };
};
