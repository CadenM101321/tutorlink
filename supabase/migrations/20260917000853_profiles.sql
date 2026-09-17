-- Profiles: one row per person, created automatically when they sign up.
-- This table is private. Public tutor details get their own table in Slice 2.

create type public.user_role as enum ('student', 'tutor', 'admin');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (char_length(full_name) between 1 and 100),
  role public.user_role not null,
  timezone text not null default 'UTC' check (char_length(timezone) between 1 and 64),
  avatar_url text check (avatar_url is null or char_length(avatar_url) <= 2048),
  confirmed_adult_at timestamptz not null,
  accepted_terms_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Private account details, one row per auth user.';
comment on column public.profiles.confirmed_adult_at is 'When the person confirmed they are 18 or older at sign-up.';
comment on column public.profiles.accepted_terms_at is 'When the person accepted the terms of service at sign-up.';

-- Row-level security: every query is filtered so people only see their own row.
alter table public.profiles enable row level security;

create policy "People can read their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "People can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Table and column privileges: start from nothing, then grant only what's needed.
-- Logged-out visitors get no access. Logged-in people can read their row and edit
-- only their name, timezone, and photo, never their role or consent timestamps.
-- There are no insert or delete grants: rows are created by the sign-up trigger
-- below and removed when the auth user is deleted.
revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
grant update (full_name, timezone, avatar_url) on table public.profiles to authenticated;

-- Keep updated_at current on every change.
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Create the profile when an auth user is created. The sign-up form sends these
-- values as user metadata, but anyone can call the Supabase sign-up API directly
-- with any metadata, so every rule is enforced here too: a failed check cancels
-- the whole sign-up.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  requested_role text := coalesce(meta ->> 'role', '');
  requested_name text := btrim(coalesce(meta ->> 'full_name', ''));
  requested_timezone text := coalesce(meta ->> 'timezone', '');
begin
  if coalesce(meta ->> 'confirmed_adult', '') <> 'true' then
    raise exception 'Sign-up requires confirming you are 18 or older.';
  end if;

  if coalesce(meta ->> 'accepted_terms', '') <> 'true' then
    raise exception 'Sign-up requires accepting the terms of service.';
  end if;

  -- Admin can never be chosen at sign-up.
  if requested_role not in ('student', 'tutor') then
    raise exception 'Role must be student or tutor.';
  end if;

  if requested_name = '' then
    raise exception 'A name is required.';
  end if;

  if not exists (
    select 1 from pg_catalog.pg_timezone_names where name = requested_timezone
  ) then
    requested_timezone := 'UTC';
  end if;

  insert into public.profiles (
    id, full_name, role, timezone, confirmed_adult_at, accepted_terms_at
  )
  values (
    new.id, requested_name, requested_role::public.user_role, requested_timezone, now(), now()
  );

  return new;
end;
$$;

-- Trigger functions can't be called directly, but remove the default execute
-- grant anyway so these never show up as callable API functions.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
