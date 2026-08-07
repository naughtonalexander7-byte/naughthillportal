import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAllInvoices } from "@/lib/xero/invoices";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invoices = await getAllInvoices();
  return NextResponse.json({ invoices });
}
