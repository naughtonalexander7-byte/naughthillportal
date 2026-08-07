# NaughtHill Group — Client Portal

A private portal where NaughtHill clients sign in to view their invoices and
billing history, pulled live from Xero. Built with Next.js (App Router),
Supabase (auth + database), and the Xero Accounting API.

- **Clients** see only their own invoices.
- **Staff (admins)** invite clients, link each account to a Xero contact, and
  manage the Xero connection.
- There is no public sign-up — every account is created by an admin invite.

---

## 1. Prerequisites

- Node.js (already installed if you're reading this locally — check with `node -v`)
- A [Supabase](https://supabase.com) account (free tier is fine)
- A [Xero](https://developer.xero.com) account with access to NaughtHill's
  organisation, and permission to create an app at
  [developer.xero.com/app/manage](https://developer.xero.com/app/manage)

## 2. Install

```bash
npm install
cp .env.local.example .env.local
```

You'll fill in `.env.local` in the steps below. It's already git-ignored —
never commit it.

## 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com/dashboard).
2. **Project Settings > API** — copy three values into `.env.local`:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret —
     it bypasses all database security rules)
3. **SQL Editor > New query** — paste the contents of
   [`supabase/schema.sql`](supabase/schema.sql) and run it. This creates the
   `profiles` and `xero_connection` tables, their security policies, and a
   trigger that creates a profile automatically whenever someone accepts an
   invite.
4. **Authentication > URL Configuration** — set:
   - Site URL: `http://localhost:3000` (change to your production URL later)
   - Redirect URLs: add `http://localhost:3000/auth/callback`
5. (Optional but recommended before inviting real clients) **Authentication
   > Emails** — Supabase's built-in email sender is rate-limited and meant
   for testing only. For real client invites, configure a custom SMTP
   provider under **Project Settings > Auth > SMTP Settings**.

### Bootstrap your own admin account

There's no public sign-up, so the very first account has to be created by
hand:

1. In Supabase: **Authentication > Users > Add user > Send invite email**,
   using your own email address.
2. Check your email, click the invite link — it'll land you on `/auth/set-password`
   to set a password (make sure the app is running locally first, see step 5).
3. Back in Supabase **SQL Editor**, find your new user's ID under
   **Authentication > Users**, then run:
   ```sql
   update public.profiles set role = 'admin' where id = '<your-user-id>';
   ```
4. Log in at `/login` — you'll land on `/admin`. From here you can invite
   every other client or staff member through the UI (**Clients > Invite
   Client**) instead of the Supabase dashboard.

## 4. Set up Xero

1. Go to [developer.xero.com/app/manage](https://developer.xero.com/app/manage)
   and create a new app — type **Web app**.
2. Under **Configuration**, add this redirect URI (must match exactly):
   ```
   http://localhost:3000/api/xero/callback
   ```
3. Copy the **Client ID** and **Client Secret** into `.env.local`:
   - `XERO_CLIENT_ID`
   - `XERO_CLIENT_SECRET`
4. Leave `XERO_REDIRECT_URI` as `http://localhost:3000/api/xero/callback` for
   local development.
5. Once the app is running (next step) and you're logged in as an admin, go
   to **Xero Connection** in the sidebar and click **Connect to Xero** —
   you'll be sent to Xero to sign in and authorize NaughtHill's organisation.

The portal only requests **read-only** scopes (invoices, contacts, settings)
— it can never create, edit, or delete anything in Xero.

## 5. Run it

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## 6. Linking a client to their invoices

Xero doesn't know which invoices "belong" to a portal login — that link is
made manually:

1. As an admin, go to **Clients**, invite the client (or find them if
   already invited).
2. Open their detail page and choose their **Linked Xero Contact** from the
   dropdown (populated from Xero once it's connected).
3. Save. The client will now see only invoices billed to that Xero contact.

## Project structure

```
src/
  app/
    login/              Email + password sign-in
    auth/callback/       Handles Supabase invite/magic-link redirects
    auth/set-password/   First-time password setup after an invite
    dashboard/            Client-facing invoice view
    admin/                Staff-only: clients, all invoices, Xero connection
    api/xero/             OAuth connect/callback/disconnect routes
    api/invoices/         Invoice data + per-invoice PDF download
    api/admin/            Admin-only data routes (contacts, invoices)
  lib/
    supabase/             Browser / server / service-role Supabase clients
    xero/                 Xero client, token refresh, invoice fetch/mapping
  components/              Shared UI (portal shell, invoice table)
supabase/schema.sql        Database schema — run once in Supabase SQL Editor
```

## Security notes

- The Xero **client secret** and Supabase **service role key** are read only
  in server-side code (routes, Server Components, Server Actions) — never
  sent to the browser.
- Xero OAuth tokens live in the `xero_connection` table, which has Row Level
  Security enabled with **no policies at all** — normal authenticated
  requests get zero rows back. Only the service-role key (server-only) can
  read or write it.
- Invoice PDF downloads check that the requesting client's linked Xero
  contact actually matches the invoice's contact before streaming it back —
  clients can't guess another client's invoice URL to view their PDF.
- Client accounts are created exclusively via admin invite; there's no
  public registration endpoint.

### Hardening ideas for production

- Encrypt Xero tokens at rest (e.g. Supabase Vault / `pgsodium`) instead of
  storing them as plain text columns.
- Add rate limiting to the `/api/*` routes.
- Invoice lists are fetched live from Xero on each page load and capped at
  200 records with no pagination yet — fine for a small client base, worth
  revisiting if it grows. Xero's API allows 60 calls/minute and 5,000/day.

## Deploying (e.g. to Vercel)

1. Push this repo to GitHub and import it into Vercel.
2. Add every variable from `.env.local` to the Vercel project's Environment
   Variables — except update:
   - `XERO_REDIRECT_URI` → `https://your-domain.com/api/xero/callback`
   - `NEXT_PUBLIC_SITE_URL` → `https://your-domain.com`
3. Update the redirect URI in the Xero app config to match the production
   one, and add it as an additional redirect URI (you can keep the
   `localhost` one too for local dev).
4. In Supabase **Authentication > URL Configuration**, add your production
   domain's `/auth/callback` to the Redirect URLs list.
5. Reconnect Xero from `/admin/xero` on the production deployment once it's live.
