import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin, type Profile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getInvoicesForContact, listContacts } from "@/lib/xero/invoices";
import { getStoredConnection } from "@/lib/xero/client";
import InvoiceTable from "@/components/InvoiceTable";
import ClientEditForm from "./ClientEditForm";

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (!profile) notFound();

  const client = profile as Profile;
  const connection = await getStoredConnection();
  const contacts = connection?.access_token ? await listContacts() : [];
  const invoices =
    client.xero_contact_id && connection?.access_token
      ? await getInvoicesForContact(client.xero_contact_id)
      : [];

  return (
    <div>
      <Link href="/admin" className="text-sm font-semibold text-green hover:text-green-dark">
        ← All Clients
      </Link>

      <h1 className="mt-3 text-2xl font-bold text-navy">
        {client.company_name || client.full_name || "Client"}
      </h1>
      <p className="mt-1 text-grey">{client.full_name}</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
        <ClientEditForm
          clientId={client.id}
          currentXeroContactId={client.xero_contact_id}
          currentRole={client.role}
          contacts={contacts}
        />

        <div>
          <h2 className="mb-3 font-heading text-sm font-semibold uppercase tracking-wide text-grey">
            Invoices
          </h2>
          <InvoiceTable invoices={invoices} />
        </div>
      </div>
    </div>
  );
}
