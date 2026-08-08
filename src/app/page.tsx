"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Client component, not a server redirect — Supabase's dashboard-initiated
 * invites land here with an #access_token= fragment, and a server redirect
 * would fire before the browser ever gets to read it (fragments never reach
 * the server at all). AuthHashHandler (mounted in the root layout) owns
 * consuming that fragment; this page just handles the plain "which
 * dashboard do I belong on" case once no hash is present.
 */
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (window.location.hash.includes("access_token")) return;

    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      router.replace(profile?.role === "admin" ? "/admin" : "/dashboard");
    });
  }, [router]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-grey-light">
      <p className="text-grey">Loading…</p>
    </div>
  );
}
