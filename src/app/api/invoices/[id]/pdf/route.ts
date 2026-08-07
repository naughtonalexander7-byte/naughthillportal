import { NextResponse, type NextRequest } from "next/server";
import { getProfile } from "@/lib/auth";
import { getInvoiceById, getInvoicePdf } from "@/lib/xero/invoices";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const profile = await getProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Ownership check: a client may only download an invoice that belongs to
  // their own linked Xero contact. Admins may download any invoice.
  const invoice = await getInvoiceById(id);
  if (!invoice) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isOwner =
    profile.role === "admin" ||
    (profile.xero_contact_id &&
      profile.xero_contact_id === invoice.contactId);

  if (!isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const pdf = await getInvoicePdf(id);
  if (!pdf) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="invoice-${invoice.invoiceNumber ?? id}.pdf"`,
    },
  });
}
