import { getProfile } from "@/lib/auth";
import { getInvoicesForContact } from "@/lib/xero/invoices";
import { getStoredConnection } from "@/lib/xero/client";
import InvoiceTable from "@/components/InvoiceTable";

export default async function DashboardPage() {
  const profile = await getProfile();
  const connection = await getStoredConnection();

  const invoices =
    profile?.xero_contact_id && connection?.access_token
      ? await getInvoicesForContact(profile.xero_contact_id)
      : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy">Invoices</h1>
      <p className="mt-1 text-grey">
        Your billing history with NaughtHill Group.
      </p>

      <div className="mt-6">
        {!connection?.access_token ? (
          <div className="rounded-xl border border-navy/10 bg-white p-10 text-center">
            <p className="text-grey">
              Billing isn&apos;t connected yet. Check back shortly, or
              contact your NaughtHill representative.
            </p>
          </div>
        ) : !profile?.xero_contact_id ? (
          <div className="rounded-xl border border-navy/10 bg-white p-10 text-center">
            <p className="text-grey">
              Your account isn&apos;t linked to a billing record yet.
              Contact your NaughtHill representative to get this set up.
            </p>
          </div>
        ) : (
          <InvoiceTable invoices={invoices} />
        )}
      </div>
    </div>
  );
}
