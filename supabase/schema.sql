-- NaughtHill Group Client Portal — Database Schema
-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New Query) after creating your project.

-- ---------------------------------------------------------------------------
-- profiles: one row per portal user (client or staff), keyed to auth.users
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'client' check (role in ('client', 'admin')),
  full_name text,
  company_name text,
  xero_contact_id text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- A user may read only their own profile row. Cross-user reads (the admin
-- client list) go through the service-role-backed /api/admin/* routes, not
-- direct client-side queries, so we don't need a recursive "is admin" policy.
create policy "profiles: read own row"
  on public.profiles for select
  using (auth.uid() = id);

-- Users may update their own display name only — role and xero_contact_id
-- are managed exclusively via the admin API (service role).
create policy "profiles: update own display name"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- Auto-create a profile row whenever a new auth user is created (e.g. when
-- an admin invites a client via supabase.auth.admin.inviteUserByEmail).
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, company_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'company_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- xero_connection: singleton row holding the OAuth tokens for NaughtHill's
-- own Xero organisation. Deliberately has NO policies, so with RLS enabled,
-- only the service-role key (used server-side only, never in the browser)
-- can read or write it — authenticated/anon requests get zero rows.
-- ---------------------------------------------------------------------------
create table if not exists public.xero_connection (
  id int primary key default 1,
  tenant_id text,
  tenant_name text,
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  connected_by uuid references auth.users (id),
  updated_at timestamptz not null default now(),
  constraint xero_connection_singleton check (id = 1)
);

alter table public.xero_connection enable row level security;
-- No policies added on purpose — see comment above.

-- ---------------------------------------------------------------------------
-- Bootstrap: after you sign up / accept your first invite, run this once
-- (with your own user id) to make yourself an admin:
--
--   update public.profiles set role = 'admin' where id = '<your-auth-user-id>';
--
-- Find your user id in Supabase Dashboard > Authentication > Users.
-- ---------------------------------------------------------------------------
