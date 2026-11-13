-- SKM High School CMS security + site content migration
-- Run in Supabase SQL Editor after taking a database backup.
-- Assumptions: admin_profiles.id is the Supabase Auth user UUID and the table
-- uses full_name, email, role, is_active, created_at, updated_at columns.

begin;

-- 1) Ensure the SiteEditor storage table exists.
create table if not exists public.site_content (
  content_key text primary key,
  content jsonb not null default '{}'::jsonb,
  is_published boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

alter table public.site_content enable row level security;

-- 2) Ensure admin profile columns used by AdminAccess.tsx exist.
-- This does not replace or delete existing profile records.
create table if not exists public.admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  role text not null default 'viewer',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_profiles
  add column if not exists full_name text not null default '',
  add column if not exists email text not null default '',
  add column if not exists role text not null default 'viewer',
  add column if not exists is_active boolean not null default true,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

-- Keep role values constrained to the three roles used by the frontend.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'admin_profiles_role_check'
      and conrelid = 'public.admin_profiles'::regclass
  ) then
    alter table public.admin_profiles
      add constraint admin_profiles_role_check
      check (role in ('super_admin', 'content_admin', 'viewer'));
  end if;
end $$;

alter table public.admin_profiles enable row level security;

-- 3) Security-definer helpers avoid recursive RLS when policies inspect profiles.
create or replace function public.skm_is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_profiles p
    where p.id = (select auth.uid())
      and p.is_active = true
      and p.role in ('super_admin', 'content_admin', 'viewer')
  );
$$;

create or replace function public.skm_can_manage_content()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_profiles p
    where p.id = (select auth.uid())
      and p.is_active = true
      and p.role in ('super_admin', 'content_admin')
  );
$$;

create or replace function public.skm_is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_profiles p
    where p.id = (select auth.uid())
      and p.is_active = true
      and p.role = 'super_admin'
  );
$$;

revoke all on function public.skm_is_active_admin() from public;
revoke all on function public.skm_can_manage_content() from public;
revoke all on function public.skm_is_super_admin() from public;
grant execute on function public.skm_is_active_admin() to authenticated;
grant execute on function public.skm_can_manage_content() to authenticated;
grant execute on function public.skm_is_super_admin() to authenticated;

-- 4) Remove the permissive policies from the supplied schema.
drop policy if exists "Anon Full Access Announcements" on public.announcements;
drop policy if exists "Anon Full Access Staff" on public.staff;
drop policy if exists "Anon Full Access Events" on public.events;
drop policy if exists "Anon Full Access Gallery" on public.gallery;
drop policy if exists "Anon Full Access Documents" on public.documents;
drop policy if exists "Anon Full Access Achievements" on public.achievements;
drop policy if exists "Anon Full Access Admissions" on public.admissions;
drop policy if exists "Anon Full Access Programs" on public.programs;
drop policy if exists "Anon Full Access Facilities" on public.facilities;
drop policy if exists "Anon Full Access Milestones" on public.milestones;
drop policy if exists "Anon Full Access FAQs" on public.faqs;
drop policy if exists "Anon Full Access Settings" on public.settings;
drop policy if exists "Anon Full Access Logs" on public.audit_logs;
drop policy if exists "Public Read Own Admissions" on public.admissions;

-- Drop and recreate the public read policies with published-only filters.
drop policy if exists "Public Read Announcements" on public.announcements;
drop policy if exists "Public Read Staff" on public.staff;
drop policy if exists "Public Read Events" on public.events;
drop policy if exists "Public Read Gallery" on public.gallery;
drop policy if exists "Public Read Documents" on public.documents;
drop policy if exists "Public Read Achievements" on public.achievements;
drop policy if exists "Public Read Programs" on public.programs;
drop policy if exists "Public Read Facilities" on public.facilities;
drop policy if exists "Public Read Milestones" on public.milestones;
drop policy if exists "Public Read FAQs" on public.faqs;
drop policy if exists "Public Read Settings" on public.settings;

create policy "Public read published announcements"
on public.announcements for select to anon, authenticated
using (status = 'published');

create policy "Public read published staff"
on public.staff for select to anon, authenticated
using (status = 'published');

create policy "Public read published events"
on public.events for select to anon, authenticated
using (status = 'published');

create policy "Public read published gallery"
on public.gallery for select to anon, authenticated
using (status = 'published');

create policy "Public read published documents"
on public.documents for select to anon, authenticated
using (status = 'published');

create policy "Public read published achievements"
on public.achievements for select to anon, authenticated
using (status = 'published');

create policy "Public read published programs"
on public.programs for select to anon, authenticated
using (status = 'published');

create policy "Public read published facilities"
on public.facilities for select to anon, authenticated
using (status = 'published');

create policy "Public read published milestones"
on public.milestones for select to anon, authenticated
using (status = 'published');

create policy "Public read published faqs"
on public.faqs for select to anon, authenticated
using (status = 'published');

create policy "Public read settings"
on public.settings for select to anon, authenticated
using (true);

-- Admissions: public can submit, but cannot read enquiries.
drop policy if exists "Public Insert Admissions" on public.admissions;
create policy "Public submit admission enquiries"
on public.admissions for insert to anon, authenticated
with check (true);

-- Admin read/write policies for content tables.
do $$
declare
  t text;
begin
  foreach t in array array[
    'announcements','staff','events','gallery','documents','achievements',
    'programs','facilities','milestones','faqs','settings'
  ]
  loop
    execute format('drop policy if exists %I on public.%I', 'Active admins read ' || t, t);
    execute format('drop policy if exists %I on public.%I', 'Content admins manage ' || t, t);
    execute format(
      'create policy %I on public.%I for select to authenticated using (public.skm_is_active_admin())',
      'Active admins read ' || t, t
    );
    execute format(
      'create policy %I on public.%I for all to authenticated using (public.skm_can_manage_content()) with check (public.skm_can_manage_content())',
      'Content admins manage ' || t, t
    );
  end loop;
end $$;

-- Admissions and audit logs are private to active admins.
create policy "Active admins read admissions"
on public.admissions for select to authenticated
using (public.skm_is_active_admin());

create policy "Active admins update admissions"
on public.admissions for update to authenticated
using (public.skm_is_active_admin())
with check (public.skm_is_active_admin());

create policy "Active admins read audit logs"
on public.audit_logs for select to authenticated
using (public.skm_is_active_admin());

create policy "Active admins insert audit logs"
on public.audit_logs for insert to authenticated
with check (public.skm_is_active_admin());

-- Site content: public reads published rows; active content admins write.
drop policy if exists "Public read published site content" on public.site_content;
drop policy if exists "Content admins manage site content" on public.site_content;

create policy "Public read published site content"
on public.site_content for select to anon, authenticated
using (is_published = true);

create policy "Content admins manage site content"
on public.site_content for all to authenticated
using (public.skm_can_manage_content())
with check (public.skm_can_manage_content());

-- Admin profiles: users can read their own profile; only super admins can
-- list/update profiles. The UI should not be treated as the security boundary.
drop policy if exists "Users read own admin profile" on public.admin_profiles;
drop policy if exists "Super admins read all admin profiles" on public.admin_profiles;
drop policy if exists "Super admins manage admin profiles" on public.admin_profiles;

create policy "Users read own admin profile"
on public.admin_profiles for select to authenticated
using (id = (select auth.uid()));

create policy "Super admins read all admin profiles"
on public.admin_profiles for select to authenticated
using (public.skm_is_super_admin());

create policy "Super admins manage admin profiles"
on public.admin_profiles for all to authenticated
using (public.skm_is_super_admin())
with check (public.skm_is_super_admin());

-- Restrict table privileges as an additional layer; RLS still applies.
revoke all on public.site_content from anon, authenticated;
grant select on public.site_content to anon, authenticated;
grant insert, update, delete on public.site_content to authenticated;

revoke all on public.admin_profiles from anon, authenticated;
grant select on public.admin_profiles to authenticated;
grant insert, update, delete on public.admin_profiles to authenticated;

commit;

-- 5) FIRST SUPER ADMIN BOOTSTRAP (run separately after the migration):
-- Replace the UUID and values with the actual Supabase Auth user details.
-- INSERT INTO public.admin_profiles (id, full_name, email, role, is_active)
-- VALUES ('YOUR-AUTH-USER-UUID', 'School Administrator', 'admin@example.com',
--         'super_admin', true)
-- ON CONFLICT (id) DO UPDATE SET
--   full_name = excluded.full_name,
--   email = excluded.email,
--   role = 'super_admin',
--   is_active = true,
--   updated_at = now();
