import supabase, {supabaseUrl} from "@/db/supabase";

/**
 * Signs in a user with email and password.
 */
export async function login({email, password}) {
  const {data, error} = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Registers a new user with email, password, and optional avatar.
 * Falls back to default avatar if storage upload fails or bucket is missing.
 */
export async function signup({name, email, password, profile_pic}) {
  let profilePicUrl = "/logo.png";

  if (profile_pic) {
    try {
      const fileName = `dp-${name.split(" ").join("-")}-${Math.random()}`;
      const {error: storageError} = await supabase.storage
        .from("profile_pic")
        .upload(fileName, profile_pic);

      if (!storageError) {
        profilePicUrl = `${supabaseUrl}/storage/v1/object/public/profile_pic/${fileName}`;
      }
    } catch (storageErr) {
      console.warn("Storage upload for profile_pic skipped:", storageErr);
    }
  }

  const {data, error} = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        profile_pic: profilePicUrl,
      },
    },
  });

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Retrieves the current session's authenticated user.
 */
export async function getCurrentUser() {
  const {data: session, error} = await supabase.auth.getSession();
  if (!session?.session) return null;

  if (error) throw new Error(error.message);
  return session.session?.user;
}

/**
 * Signs out the current user.
 */
export async function logout() {
  const {error} = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}
