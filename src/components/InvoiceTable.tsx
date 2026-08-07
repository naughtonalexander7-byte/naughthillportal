import { format, isPast, parseISO } from "date-fns";
import type { PortalInvoice } from "@/lib/xero/invoices";

function formatMoney(amount: number | null, currency: string | null) {
  if (amount === null) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  } catch {
    return amount.toFixed(2);
  }
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  try {
    return format(parseISO(iso), "d MMM yyyy");
  } catch {
    return iso;
  }
}

function StatusBadge({ status, dueDate }: { status: string | null; dueDate: string | null }) {
  const isOverdue =
    status === "AUTHORISED" && dueDate && isPast(parseISO(dueDate));

  const label = isOverdue ? "Overdue" : status === "PAID" ? "Paid" : "Awaiting Payment";
  const classes = isOverdue
    ? "bg-red-50 text-red-700"
    : status === "PAID"
    ? "bg-green/10 text-green-dark"
    : "bg-amber-50 text-amber-700";

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${classes}`}>
      {label}
    </span>
  );
}

export default function InvoiceTable({
  invoices,
  showContact = false,
}: {
  invoices: PortalInvoice[];
  showContact?: boolean;
}) {
  if (invoices.length === 0) {
    return (
      <div className="rounded-xl border border-navy/10 bg-white p-10 text-center">
        <p className="text-grey">No invoices to show yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-navy/10 bg-white">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-navy/10 bg-grey-light/60 text-xs font-semibold uppercase tracking-wide text-grey">
            <th className="px-5 py-3">Invoice</th>
            {showContact && <th className="px-5 py-3">Client</th>}
            <th className="px-5 py-3">Date</th>
            <th className="px-5 py-3">Due</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3 text-right">Total</th>
            <th className="px-5 py-3 text-right">Amount Due</th>
            <th className="px-5 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id} className="border-b border-navy/5 last:border-0">
              <td className="px-5 py-3.5 font-semibold text-navy">
                {inv.invoiceNumber ?? "—"}
                {inv.reference && (
                  <span className="block text-xs font-normal text-grey">
                    {inv.reference}
                  </span>
                )}
              </td>
              {showContact && (
                <td className="px-5 py-3.5 text-navy">{inv.contactName ?? "—"}</td>
              )}
              <td className="px-5 py-3.5 text-navy">{formatDate(inv.date)}</td>
              <td className="px-5 py-3.5 text-navy">{formatDate(inv.dueDate)}</td>
              <td className="px-5 py-3.5">
                <StatusBadge status={inv.status} dueDate={inv.dueDate} />
              </td>
              <td className="px-5 py-3.5 text-right text-navy">
                {formatMoney(inv.total, inv.currencyCode)}
              </td>
              <td className="px-5 py-3.5 text-right font-semibold text-navy">
                {formatMoney(inv.amountDue, inv.currencyCode)}
              </td>
              <td className="px-5 py-3.5 text-right">
                <a
                  href={`/api/invoices/${inv.id}/pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-heading text-xs font-semibold text-green hover:text-green-dark"
                >
                  View PDF
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
