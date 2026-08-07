import { NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { getInvoicesForContact } from "@/lib/xero/invoices";

export async function GET() {
  const profile = await getProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!profile.xero_contact_id) {
    return NextResponse.json({ invoices: [], notLinked: true });
  }

  const invoices = await getInvoicesForContact(profile.xero_contact_id);
  return NextResponse.json({ invoices, notLinked: false });
}
