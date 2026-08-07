import "server-only";
import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  role: "client" | "admin";
  full_name: string | null;
  company_name: string | null;
  xero_contact_id: string | null;
  created_at: string;
};

/** Returns the signed-in user's profile, or null if not authenticated. */
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (profile as Profile) ?? null;
}

/** Throws-by-redirect is handled at the page/route level; this just asserts. */
export async function requireAdmin(): Promise<Profile> {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") {
    throw new Error("UNAUTHORIZED");
  }
  return profile;
}

export async function requireUser(): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) {
    throw new Error("UNAUTHENTICATED");
  }
  return profile;
}
