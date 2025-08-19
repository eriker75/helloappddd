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
