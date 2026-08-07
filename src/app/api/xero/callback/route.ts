import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getXeroClient, saveNewConnection } from "@/lib/xero/client";

export async function GET(request: NextRequest) {
  const adminUrl = new URL("/admin/xero", request.url);

  try {
    await requireAdmin();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const xero = getXeroClient();
    await xero.initialize();

    const tokenSet = await xero.apiCallback(request.url);
    await xero.updateTenants(false);

    const tenant = xero.tenants[0];
    if (!tenant) {
      adminUrl.searchParams.set(
        "error",
        "No Xero organisation was authorized. Try again and select an org."
      );
      return NextResponse.redirect(adminUrl);
    }

    await saveNewConnection(tokenSet, tenant.tenantId, tenant.tenantName ?? "");

    adminUrl.searchParams.set("connected", tenant.tenantName ?? tenant.tenantId);
    return NextResponse.redirect(adminUrl);
  } catch (err) {
    console.error("Xero OAuth callback failed", err);
    adminUrl.searchParams.set("error", "Connecting to Xero failed. Try again.");
    return NextResponse.redirect(adminUrl);
  }
}
