import "server-only";
import { getReadyXeroClient } from "@/lib/xero/client";

export type PortalInvoice = {
  id: string;
  invoiceNumber: string | null;
  reference: string | null;
  type: string | null;
  status: string | null;
  date: string | null;
  dueDate: string | null;
  currencyCode: string | null;
  subTotal: number | null;
  total: number | null;
  amountDue: number | null;
  amountPaid: number | null;
  contactId: string | null;
  contactName: string | null;
};

// Only show finalized invoices — drafts aren't something a client should see.
const VISIBLE_STATUSES = ["AUTHORISED", "PAID"];

function mapInvoice(inv: import("xero-node").Invoice): PortalInvoice {
  return {
    id: inv.invoiceID ?? "",
    invoiceNumber: inv.invoiceNumber ?? null,
    reference: inv.reference ?? null,
    type: inv.type ? String(inv.type) : null,
    status: inv.status ? String(inv.status) : null,
    date: inv.date ?? null,
    dueDate: inv.dueDate ?? null,
    currencyCode: inv.currencyCode ? String(inv.currencyCode) : null,
    subTotal: inv.subTotal ?? null,
    total: inv.total ?? null,
    amountDue: inv.amountDue ?? null,
    amountPaid: inv.amountPaid ?? null,
    contactId: inv.contact?.contactID ?? null,
    contactName: inv.contact?.name ?? null,
  };
}

/** Fetches invoices for a single Xero contact — used for a client's own dashboard. */
export async function getInvoicesForContact(
  contactId: string
): Promise<PortalInvoice[]> {
  const ready = await getReadyXeroClient();
  if (!ready) return [];
  const { xero, tenantId } = ready;

  const response = await xero.accountingApi.getInvoices(
    tenantId,
    undefined,
    undefined,
    "Date DESC",
    undefined,
    undefined,
    [contactId],
    VISIBLE_STATUSES
  );

  return (response.body.invoices ?? []).map(mapInvoice);
}

/** Fetches every visible invoice across all contacts — used in the admin panel. */
export async function getAllInvoices(): Promise<PortalInvoice[]> {
  const ready = await getReadyXeroClient();
  if (!ready) return [];
  const { xero, tenantId } = ready;

  const response = await xero.accountingApi.getInvoices(
    tenantId,
    undefined,
    undefined,
    "Date DESC",
    undefined,
    undefined,
    undefined,
    VISIBLE_STATUSES,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    200
  );

  return (response.body.invoices ?? []).map(mapInvoice);
}

/** Fetches one invoice by ID, for the PDF download route's ownership check. */
export async function getInvoiceById(
  invoiceId: string
): Promise<PortalInvoice | null> {
  const ready = await getReadyXeroClient();
  if (!ready) return null;
  const { xero, tenantId } = ready;

  const response = await xero.accountingApi.getInvoice(tenantId, invoiceId);
  const inv = response.body.invoices?.[0];
  return inv ? mapInvoice(inv) : null;
}

export async function getInvoicePdf(invoiceId: string): Promise<Buffer | null> {
  const ready = await getReadyXeroClient();
  if (!ready) return null;
  const { xero, tenantId } = ready;

  const response = await xero.accountingApi.getInvoiceAsPdf(tenantId, invoiceId);
  return response.body as unknown as Buffer;
}

export async function listContacts(): Promise<
  { contactId: string; name: string }[]
> {
  const ready = await getReadyXeroClient();
  if (!ready) return [];
  const { xero, tenantId } = ready;

  const response = await xero.accountingApi.getContacts(
    tenantId,
    undefined,
    undefined,
    "Name ASC"
  );

  return (response.body.contacts ?? [])
    .filter((c) => c.contactID && c.name)
    .map((c) => ({ contactId: c.contactID!, name: c.name! }));
}
