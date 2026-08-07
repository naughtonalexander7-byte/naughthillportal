import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getXeroClient } from "@/lib/xero/client";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const xero = getXeroClient();
  await xero.initialize();
  const consentUrl = await xero.buildConsentUrl();

  return NextResponse.redirect(consentUrl);
}
