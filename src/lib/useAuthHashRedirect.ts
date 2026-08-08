"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Supabase invite / magic-link / recovery emails use the implicit flow —
 * tokens arrive as #access_token=... in the URL fragment, which a server
 * component can never see (fragments never leave the browser). This
 * detects that fragment on whichever page it happens to land on (Supabase
 * Dashboard-initiated invites redirect to the bare Site URL root, while our
 * own /auth/callback page also uses this), lets the Supabase browser client
 * auto-consume it, and forwards to /auth/set-password once a session exists.
 */
export function useAuthHashRedirect(timeoutMs = 6000) {
  const router = useRouter();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.location.hash.includes("access_token")) return;

    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.replace("/auth/set-password");
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/auth/set-password");
    });

    const timeout = setTimeout(() => setTimedOut(true), timeoutMs);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router, timeoutMs]);

  return { timedOut };
}
