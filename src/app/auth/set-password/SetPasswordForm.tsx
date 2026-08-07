"use client";

import { useActionState } from "react";
import { setPassword, type SetPasswordState } from "./actions";

const initialState: SetPasswordState = {};

export default function SetPasswordForm() {
  const [state, formAction, pending] = useActionState(
    setPassword,
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-semibold text-navy">
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="rounded-md border border-navy/15 bg-white px-3.5 py-2.5 text-navy outline-none focus:border-green focus:ring-2 focus:ring-green/20"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirm" className="text-sm font-semibold text-navy">
          Confirm password
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="rounded-md border border-navy/15 bg-white px-3.5 py-2.5 text-navy outline-none focus:border-green focus:ring-2 focus:ring-green/20"
        />
      </div>

      {state.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-md bg-green px-4 py-2.5 font-heading font-semibold text-white transition hover:bg-green-dark disabled:opacity-60"
      >
        {pending ? "Saving…" : "Set Password & Continue"}
      </button>
    </form>
  );
}
