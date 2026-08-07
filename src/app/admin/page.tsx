import Link from "next/link";
import { requireAdmin, type Profile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import InviteClientForm from "./InviteClientForm";

export default async function AdminClientsPage() {
  await requireAdmin();

  const admin = createAdminClient();
  const { data: profiles } = await admin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const clients = (profiles as Profile[] | null) ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy">Clients</h1>
      <p className="mt-1 text-grey">
        Invite clients and link each account to a Xero contact.
      </p>

      <div className="mt-6">
        <InviteClientForm />
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-navy/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-navy/10 bg-grey-light/60 text-xs font-semibold uppercase tracking-wide text-grey">
              <th className="px-5 py-3">Company</th>
              <th className="px-5 py-3">Contact</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Xero Contact</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-grey">
                  No accounts yet — invite your first client above.
                </td>
              </tr>
            )}
            {clients.map((c) => (
              <tr key={c.id} className="border-b border-navy/5 last:border-0">
                <td className="px-5 py-3.5 font-semibold text-navy">
                  {c.company_name ?? "—"}
                </td>
                <td className="px-5 py-3.5 text-navy">{c.full_name ?? "—"}</td>
                <td className="px-5 py-3.5">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      c.role === "admin"
                        ? "bg-navy/10 text-navy"
                        : "bg-green/10 text-green-dark"
                    }`}
                  >
                    {c.role}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-grey">
                  {c.xero_contact_id ? "Linked" : "Not linked"}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link
                    href={`/admin/clients/${c.id}`}
                    className="font-heading text-xs font-semibold text-green hover:text-green-dark"
                  >
                    Manage →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
