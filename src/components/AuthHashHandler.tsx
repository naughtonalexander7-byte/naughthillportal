"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthHashRedirect } from "@/lib/useAuthHashRedirect";

/**
 * Mounted globally in the root layout. Supabase Dashboard-initiated invites
 * redirect to the bare Site URL (no path), so this needs to catch the
 * #access_token= fragment regardless of which page it lands on — see
 * useAuthHashRedirect for why a server route can't do this. If the token
 * turns out to be invalid/expired, send the user somewhere actionable
 * instead of leaving whatever page they landed on stuck loading forever.
 */
export default function AuthHashHandler() {
  const router = useRouter();
  const { timedOut } = useAuthHashRedirect();

  useEffect(() => {
    if (timedOut) {
      router.replace("/login?error=invite_expired");
    }
  }, [timedOut, router]);

  return null;
}
