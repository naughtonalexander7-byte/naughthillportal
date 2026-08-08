"use client";

import { useAuthHashRedirect } from "@/lib/useAuthHashRedirect";

export default function AuthCallbackPage() {
  const { timedOut } = useAuthHashRedirect();

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-navy px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 text-center shadow-2xl">
        {timedOut ? (
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
