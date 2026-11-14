-- SKM High School live CMS publication + expanded editor groups.
-- Safe/additive: preserves existing rows and school data.

alter table public.site_content
  drop constraint if exists site_content_content_key_check;

alter table public.site_content
  add constraint site_content_content_key_check
  check (content_key in ('header','hero','footer','homepage','contact','branding','legacy','mission'));

-- Ensure published content is readable publicly, while writes remain admin-only.
alter table public.site_content enable row level security;
drop policy if exists "site_content_public_read" on public.site_content;
create policy "site_content_public_read"
  on public.site_content for select to anon, authenticated
  using (
    is_published = true
    or public.skm_is_admin(array['super_admin','content_admin','viewer'])
  );
drop policy if exists "site_content_admin_write" on public.site_content;
create policy "site_content_admin_write"
  on public.site_content for all to authenticated
  using (public.skm_is_admin(array['super_admin','content_admin']))
  with check (public.skm_is_admin(array['super_admin','content_admin']));

grant select on public.site_content to anon, authenticated;
grant insert, update, delete on public.site_content to authenticated;

-- Supabase Realtime: public clients subscribe to published CMS changes.
do $$
declare
  t text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
  foreach t in array array[
    'site_content','announcements','events','gallery','documents','staff',
    'achievements','programs','facilities','milestones','faqs','settings'
  ] loop
    if to_regclass('public.' || t) is not null
       and not exists (
         select 1 from pg_publication_tables
         where pubname = 'supabase_realtime'
           and schemaname = 'public'
           and tablename = t
       ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
  else
    raise notice 'supabase_realtime publication not found; enable Realtime in Supabase before expecting instant live updates.';
  end if;
end $$;
