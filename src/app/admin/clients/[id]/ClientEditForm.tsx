"use client";

import { useActionState } from "react";
import { updateClient, type ActionState } from "../../actions";

const initialState: ActionState = {};

export default function ClientEditForm({
  clientId,
  currentXeroContactId,
  currentRole,
  contacts,
}: {
  clientId: string;
  currentXeroContactId: string | null;
  currentRole: string;
  contacts: { contactId: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(
    updateClient,
    initialState
  );

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-xl border border-navy/10 bg-white p-6"
    >
      <input type="hidden" name="id" value={clientId} />

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="xero_contact_id"
          className="text-sm font-semibold text-navy"
        >
          Linked Xero Contact
        </label>
        <select
          id="xero_contact_id"
          name="xero_contact_id"
          defaultValue={currentXeroContactId ?? ""}
          className="rounded-md border border-navy/15 bg-white px-3.5 py-2.5 text-navy outline-none focus:border-green focus:ring-2 focus:ring-green/20"
        >
          <option value="">— Not linked —</option>
          {contacts.map((c) => (
            <option key={c.contactId} value={c.contactId}>
              {c.name}
            </option>
          ))}
        </select>
        {contacts.length === 0 && (
          <p className="text-xs text-grey">
            No Xero contacts loaded — connect Xero first on the Xero
            Connection page.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="role" className="text-sm font-semibold text-navy">
          Role
        </label>
        <select
          id="role"
          name="role"
          defaultValue={currentRole}
          className="rounded-md border border-navy/15 bg-white px-3.5 py-2.5 text-navy outline-none focus:border-green focus:ring-2 focus:ring-green/20"
        >
          <option value="client">Client</option>
          <option value="admin">Admin (staff)</option>
        </select>
      </div>

      {state.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-md bg-green/10 px-3 py-2 text-sm text-green-dark">
          {state.success}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-green px-4 py-2.5 font-heading text-sm font-semibold text-white transition hover:bg-green-dark disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}
