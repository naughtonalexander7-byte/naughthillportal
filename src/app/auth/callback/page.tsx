"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Lands here from Supabase invite / magic-link / recovery emails. Supabase
 * admin-generated links use the implicit flow — tokens arrive in the URL
 * hash (#access_token=...), which only the browser can read (a server
 * Route Handler never sees a fragment). The browser client auto-detects
 * and consumes it on load (detectSessionInUrl), so we just wait for the
 * resulting SIGNED_IN event and move on.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.replace("/auth/set-password");
      }
    });

    // In case a session already exists by the time this effect runs.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/auth/set-password");
    });

    const timeout = setTimeout(() => setErrored(true), 6000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-navy px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 text-center shadow-2xl">
        {errored ? (
          <>
            <p className="font-heading font-semibold text-navy">
              This link has expired or already been used.
            </p>
            <a
              href="/login"
              className="mt-3 inline-block text-sm font-semibold text-green hover:text-green-dark"
            >
              Back to login
            </a>
          </>
        ) : (
          <p className="text-grey">Signing you in…</p>
        )}
      </div>
    </div>
  );
}
