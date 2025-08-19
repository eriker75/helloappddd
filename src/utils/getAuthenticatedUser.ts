import { supabase } from "@/src/utils/supabase";

/**
 * Helper to get the currently authenticated user.
 * Throws an error if the user is not authenticated or if there is an error fetching the user.
 * @returns The authenticated user object
 */
export async function getAuthenticatedUser() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error("Error fetching user: " + userError.message);
  }
  if (!user) {
    throw new Error("User not authenticated");
  }
  return user;
}

/**
 * Helper to get the currently authenticated user, enriched with profile and preferences.
 * Throws an error if the user is not authenticated or if there is an error fetching the user.
 * @returns The authenticated user object with profile and preferences
 */
export async function getEnrichedAuthenticatedUser() {
  const user = await getAuthenticatedUser();

  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (profileError) {
    throw new Error("Error fetching user profile: " + profileError.message);
  }

  // Fetch preferences
  const { data: preferences, error: preferencesError } = await supabase
    .from("preferences")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (preferencesError && preferencesError.code !== "PGRST116") {
    // PGRST116 = no rows found, so preferences are optional
    throw new Error("Error fetching user preferences: " + preferencesError.message);
  }

  return {
    ...user,
    profile,
    preferences: preferences ?? null,
  };
}
