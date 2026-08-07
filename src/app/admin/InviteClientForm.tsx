"use client";

import { useActionState } from "react";
import { inviteClient, type ActionState } from "./actions";

const initialState: ActionState = {};

export default function InviteClientForm() {
  const [state, formAction, pending] = useActionState(
    inviteClient,
    initialState
  );

  return (
    <form
      action={formAction}
      className="grid grid-cols-1 gap-3 rounded-xl border border-navy/10 bg-white p-5 sm:grid-cols-[1.2fr_1fr_1fr_auto]"
    >
      <input
        name="email"
        type="email"
        required
        placeholder="client@company.com"
        className="rounded-md border border-navy/15 px-3 py-2 text-sm text-navy outline-none focus:border-green focus:ring-2 focus:ring-green/20"
      />
      <input
        name="full_name"
        type="text"
        placeholder="Contact name"
        className="rounded-md border border-navy/15 px-3 py-2 text-sm text-navy outline-none focus:border-green focus:ring-2 focus:ring-green/20"
      />
      <input
        name="company_name"
        type="text"
        placeholder="Company name"
        className="rounded-md border border-navy/15 px-3 py-2 text-sm text-navy outline-none focus:border-green focus:ring-2 focus:ring-green/20"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-green px-4 py-2 font-heading text-sm font-semibold text-white transition hover:bg-green-dark disabled:opacity-60"
      >
        {pending ? "Inviting…" : "Invite Client"}
      </button>

      {state.error && (
        <p className="col-span-full text-sm text-red-700">{state.error}</p>
      )}
      {state.success && (
        <p className="col-span-full text-sm text-green-dark">{state.success}</p>
      )}
    </form>
  );
}
