import "server-only";
import { XeroClient, type TokenSet } from "xero-node";
import { createAdminClient } from "@/lib/supabase/admin";

// Read-only scopes — this portal only displays Xero data, never writes it.
export const XERO_SCOPES = [
  "offline_access",
  "openid",
  "profile",
  "email",
  "accounting.transactions.read",
  "accounting.contacts.read",
  "accounting.settings.read",
].join(" ");

export function getXeroClient() {
  return new XeroClient({
    clientId: process.env.XERO_CLIENT_ID!,
    clientSecret: process.env.XERO_CLIENT_SECRET!,
    redirectUris: [process.env.XERO_REDIRECT_URI!],
    scopes: XERO_SCOPES.split(" "),
  });
}

type XeroConnectionRow = {
  tenant_id: string | null;
  tenant_name: string | null;
  access_token: string | null;
  refresh_token: string | null;
  expires_at: string | null;
};

export async function getStoredConnection(): Promise<XeroConnectionRow | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("xero_connection")
    .select("tenant_id, tenant_name, access_token, refresh_token, expires_at")
    .eq("id", 1)
    .maybeSingle();

  return data ?? null;
}

async function persistTokenSet(tokenSet: TokenSet, tenantId?: string, tenantName?: string) {
  const admin = createAdminClient();
  const expiresAt = tokenSet.expires_at
    ? new Date(tokenSet.expires_at * 1000).toISOString()
    : null;

  await admin.from("xero_connection").upsert({
    id: 1,
    tenant_id: tenantId,
    tenant_name: tenantName,
    access_token: tokenSet.access_token,
    refresh_token: tokenSet.refresh_token,
    expires_at: expiresAt,
    updated_at: new Date().toISOString(),
  });
}

export async function saveNewConnection(
  tokenSet: TokenSet,
  tenantId: string,
  tenantName: string
) {
  await persistTokenSet(tokenSet, tenantId, tenantName);
}

/**
 * Returns a XeroClient ready to call the Accounting API, refreshing the
 * access token first if it's expired or close to it. Returns null if
 * nothing has been connected yet.
 */
export async function getReadyXeroClient(): Promise<{
  xero: XeroClient;
  tenantId: string;
} | null> {
  const conn = await getStoredConnection();
  if (!conn?.access_token || !conn.refresh_token || !conn.tenant_id) {
    return null;
  }

  const xero = getXeroClient();
  await xero.initialize();

  const expiresAt = conn.expires_at ? new Date(conn.expires_at).getTime() : 0;
  const isExpiringSoon = Date.now() > expiresAt - 60_000;

  xero.setTokenSet({
    access_token: conn.access_token,
    refresh_token: conn.refresh_token,
  });

  if (isExpiringSoon) {
    const refreshed = await xero.refreshToken();
    await persistTokenSet(refreshed, conn.tenant_id, conn.tenant_name ?? undefined);
  }

  return { xero, tenantId: conn.tenant_id };
}
