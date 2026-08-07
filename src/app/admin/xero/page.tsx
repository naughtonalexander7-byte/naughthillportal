import { requireAdmin } from "@/lib/auth";
import { getStoredConnection } from "@/lib/xero/client";

export default async function AdminXeroPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  await requireAdmin();
  const { connected, error } = await searchParams;
  const connection = await getStoredConnection();
  const isConnected = Boolean(connection?.access_token);

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy">Xero Connection</h1>
      <p className="mt-1 text-grey">
        Connect NaughtHill Group&apos;s Xero organisation so the portal can
        display invoices.
      </p>

      {connected && (
        <p className="mt-4 rounded-md bg-green/10 px-4 py-3 text-sm text-green-dark">
          Connected to &ldquo;{connected}&rdquo;.
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-6 rounded-xl border border-navy/10 bg-white p-6">
        {isConnected ? (
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-green" />
              <p className="font-semibold text-navy">
                Connected to {connection?.tenant_name}
              </p>
            </div>
            <p className="mt-2 text-sm text-grey">
              Access is read-only (invoices, contacts, settings). Tokens
              refresh automatically as long as the connection stays active.
            </p>
            <div className="mt-5 flex gap-3">
              <a
                href="/api/xero/connect"
                className="rounded-md border border-navy px-4 py-2 font-heading text-sm font-semibold text-navy transition hover:bg-navy hover:text-white"
              >
                Reconnect / Switch Org
              </a>
              <form action="/api/xero/disconnect" method="post">
                <button
                  type="submit"
                  className="rounded-md border border-red-200 px-4 py-2 font-heading text-sm font-semibold text-red-700 transition hover:bg-red-50"
                >
                  Disconnect
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-grey" />
              <p className="font-semibold text-navy">Not connected</p>
            </div>
            <p className="mt-2 text-sm text-grey">
              You&apos;ll be sent to Xero to sign in and authorize NaughtHill
              Group&apos;s organisation.
            </p>
            <a
              href="/api/xero/connect"
              className="mt-5 inline-block rounded-md bg-green px-5 py-2.5 font-heading text-sm font-semibold text-white transition hover:bg-green-dark"
            >
              Connect to Xero
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
