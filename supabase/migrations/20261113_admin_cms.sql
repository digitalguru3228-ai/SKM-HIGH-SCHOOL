-- SKM High School: Supabase Auth + global website CMS
-- Safe additive migration: does not truncate, rewrite, or seed existing school content.

create table if not exists public.admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default 'Administrator',
  email text not null,
  role text not null default 'viewer' check (role in ('super_admin','content_admin','viewer')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_content (
  content_key text primary key check (content_key in ('header','hero','footer','homepage','contact','branding')),
  content jsonb not null default '{}'::jsonb,
  is_published boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table if not exists public.admin_login_history (
  id bigint generated always as identity primary key,
  admin_id uuid references auth.users(id) on delete set null,
  email text not null,
  event_type text not null check (event_type in ('login','logout','failed_login','password_reset')),
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create or replace function public.skm_is_admin(allowed_roles text[] default array['super_admin','content_admin','viewer'])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admin_profiles p
    where p.id = auth.uid() and p.is_active = true and p.role = any(allowed_roles)
  );
$$;

alter table public.admin_profiles enable row level security;
alter table public.site_content enable row level security;
alter table public.admin_login_history enable row level security;

-- Profiles: users can read their own profile; only Super Admins can manage all profiles.
drop policy if exists "admin_profiles_self_read" on public.admin_profiles;
create policy "admin_profiles_self_read" on public.admin_profiles for select to authenticated using (id = auth.uid() or public.skm_is_admin(array['super_admin']));
drop policy if exists "admin_profiles_super_admin_manage" on public.admin_profiles;
create policy "admin_profiles_super_admin_manage" on public.admin_profiles for all to authenticated using (public.skm_is_admin(array['super_admin'])) with check (public.skm_is_admin(array['super_admin']));

-- Published CMS content is public-readable. Writes require an active content-capable admin.
drop policy if exists "site_content_public_read" on public.site_content;
create policy "site_content_public_read" on public.site_content for select to anon, authenticated using (is_published = true or public.skm_is_admin(array['super_admin','content_admin','viewer']));
drop policy if exists "site_content_admin_write" on public.site_content;
create policy "site_content_admin_write" on public.site_content for all to authenticated using (public.skm_is_admin(array['super_admin','content_admin'])) with check (public.skm_is_admin(array['super_admin','content_admin']));

-- Login history is private to Super Admins.
drop policy if exists "login_history_super_admin_read" on public.admin_login_history;
create policy "login_history_super_admin_read" on public.admin_login_history for select to authenticated using (public.skm_is_admin(array['super_admin']));
drop policy if exists "login_history_super_admin_manage" on public.admin_login_history;
create policy "login_history_super_admin_manage" on public.admin_login_history for all to authenticated using (public.skm_is_admin(array['super_admin'])) with check (public.skm_is_admin(array['super_admin']));

grant select on public.site_content to anon, authenticated;
grant insert, update, delete on public.site_content to authenticated;
grant select, insert, update, delete on public.admin_profiles to authenticated;
grant select, insert, update, delete on public.admin_login_history to authenticated;

-- Bootstrap instructions:
-- 1) Create the first administrator in Supabase Dashboard > Authentication > Users.
-- 2) Copy that user's UUID and run the statement below, replacing all placeholders.
-- insert into public.admin_profiles (id, full_name, email, role, is_active)
-- values ('AUTH_USER_UUID', 'School Super Admin', 'ADMIN_EMAIL', 'super_admin', true)
-- on conflict (id) do update set role='super_admin', is_active=true, email=excluded.email;

-- Replace legacy permissive anonymous CMS policies with public read-only access
-- and authenticated administrator writes. Existing rows are not modified.
do $$
declare
  t text;
  pol record;
begin
  foreach t in array array['announcements','staff','events','gallery','documents','achievements','programs','facilities','milestones','faqs','settings','audit_logs','admissions'] loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table public.%I enable row level security', t);
      for pol in select policyname from pg_policies where schemaname='public' and tablename=t loop
        execute format('drop policy if exists %I on public.%I', pol.policyname, t);
      end loop;
      if t = 'settings' then
        execute format('create policy %I on public.%I for select to anon, authenticated using (true)', t || '_public_read', t);
      elsif t = 'admissions' then
        execute format('create policy %I on public.%I for insert to anon, authenticated with check (true)', t || '_public_insert', t);
      elsif t = 'audit_logs' then
        execute format('create policy %I on public.%I for select to authenticated using (public.skm_is_admin(array[''super_admin'']))', t || '_super_admin_read', t);
      else
        execute format('create policy %I on public.%I for select to anon, authenticated using (status = ''published'' or public.skm_is_admin(array[''super_admin'',''content_admin'',''viewer'']))', t || '_public_read', t);
      end if;
      if t <> 'audit_logs' then
        execute format('create policy %I on public.%I for all to authenticated using (public.skm_is_admin(array[''super_admin'',''content_admin''])) with check (public.skm_is_admin(array[''super_admin'',''content_admin'']))', t || '_admin_write', t);
      end if;
    end if;
  end loop;
end $$;

drop policy if exists "login_history_self_insert" on public.admin_login_history;
create policy "login_history_self_insert" on public.admin_login_history for insert to authenticated with check (admin_id = auth.uid() and event_type in ('login','logout'));

-- Keep the profile email synchronized after Supabase Auth email confirmation.
create or replace function public.skm_sync_admin_email()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.admin_profiles set email = new.email, updated_at = now() where id = new.id;
  return new;
end;
$$;
drop trigger if exists skm_sync_admin_email_trigger on auth.users;
create trigger skm_sync_admin_email_trigger after update of email on auth.users
for each row execute function public.skm_sync_admin_email();
