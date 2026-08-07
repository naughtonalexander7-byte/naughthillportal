import { requireAdmin } from "@/lib/auth";
import { getAllInvoices } from "@/lib/xero/invoices";
import { getStoredConnection } from "@/lib/xero/client";
import InvoiceTable from "@/components/InvoiceTable";

export default async function AdminInvoicesPage() {
  await requireAdmin();

  const connection = await getStoredConnection();
  const invoices = connection?.access_token ? await getAllInvoices() : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy">All Invoices</h1>
      <p className="mt-1 text-grey">
        Every finalized invoice across all NaughtHill clients, pulled live from Xero.
      </p>

      <div className="mt-6">
        {!connection?.access_token ? (
          <div className="rounded-xl border border-navy/10 bg-white p-10 text-center">
            <p className="text-grey">
              Xero isn&apos;t connected yet.{" "}
              <a href="/admin/xero" className="font-semibold text-green hover:text-green-dark">
                Connect it here.
              </a>
            </p>
          </div>
        ) : (
          <InvoiceTable invoices={invoices} showContact />
        )}
      </div>
    </div>
  );
}
