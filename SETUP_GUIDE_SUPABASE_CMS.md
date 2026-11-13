# SKM High School — Supabase CMS Setup

This delivery adds a Supabase-backed website content studio, Supabase Auth admin sign-in, administrator roles, and live public rendering for the CMS-managed header/navigation, hero, homepage section headings, footer and logo. Existing announcements, gallery, events, staff, facilities, programs, FAQs, achievements, documents, admissions and settings tables are retained; the migration does not delete or reseed their rows.

## 1. Back up first

Before changing production policies, take a Supabase database backup (Dashboard → Database → Backups, or export the relevant tables). Do not run the migration against production until you have a backup.

## 2. Apply the SQL migration

Open Supabase → SQL Editor → New query. Paste and run:

`supabase/migrations/20261113_admin_cms.sql`

The migration creates `admin_profiles`, `site_content`, and `admin_login_history`, enables RLS, replaces legacy permissive policies on the listed CMS tables, and adds role checks. It is additive with respect to table data: it does not truncate or overwrite existing content rows.

## 3. Configure the first Super Admin

1. In Supabase → Authentication → Users, create/invite the administrator account using the email you want to use at `/admin`.
2. Copy that user's UID.
3. In SQL Editor run the following, replacing the placeholders:

```sql
insert into public.admin_profiles (id, full_name, email, role, is_active)
values ('AUTH_USER_UUID', 'School Super Admin', 'ADMIN_EMAIL', 'super_admin', true)
on conflict (id) do update
set full_name = excluded.full_name,
    email = excluded.email,
    role = 'super_admin',
    is_active = true;
```

4. The administrator sets their password using the Supabase invitation/password-reset email, then signs in at `https://YOUR-DOMAIN/admin`.

**Existing JSON bcrypt passwords cannot be imported directly into Supabase Auth.** Preserve the existing admin email address if desired, but create/reset the password through Supabase Auth. The old JSON admin user is not automatically converted.

## 4. Add further administrators

Create/invite each user in Supabase Authentication → Users, then insert their UID into `admin_profiles`:

```sql
insert into public.admin_profiles (id, full_name, email, role, is_active)
values ('AUTH_USER_UUID', 'Staff Name', 'staff@example.com', 'content_admin', true);
```

Allowed roles:
- `super_admin`: manage admin profiles and full CMS.
- `content_admin`: edit/publish website content and CMS records.
- `viewer`: read-only CMS access.

Super Admins can adjust roles and deactivate profiles in Admin → Supabase Admin Access. New Auth identities are still created/invited in Supabase Auth; the browser must never receive a service-role key.

## 5. Configure Vercel environment variables

In Vercel → Project → Settings → Environment Variables add:

- `VITE_SUPABASE_URL` = Supabase Project URL
- `VITE_SUPABASE_ANON_KEY` = Supabase publishable/anon key

Use these for Production, Preview and Development as appropriate, then redeploy. Do **not** put `SUPABASE_SERVICE_ROLE_KEY`, database passwords, SMTP passwords or JWT secrets in `VITE_*` variables or client code.

For local development copy `.env.example` to `.env` and fill the two public Supabase values.

## 6. Using the Website Content Studio

1. Sign in at `/admin`.
2. Open **Website Content Studio**.
3. Edit Navbar & Header, Homepage Hero, Homepage Sections, Footer, Contact Details or Branding & Theme.
4. Leave “Publish immediately” checked and click **Save to Supabase**.
5. Reload the public website. Published header, nav links, hero content/background, homepage headings, footer copy and logo URL are read from `site_content`.

Navigation link format: one per line, `Label | #section`, for example `About | #about`. Use existing section IDs such as `#home`, `#announcements`, `#legacy`, `#academics`, `#teachers`, `#achievements`, `#facilities`, `#gallery`, `#admissions`, `#contact`.

## 7. Important deployment notes / current limits

- This package does not contain your `.env`, `node_modules`, or `data/skm_database.json` (which contains local admin/session data). Never upload those files to a public repository.
- Existing Supabase content rows are not migrated or overwritten. The SQL policy section removes old permissive policies and adds role-based access; test every public/admin workflow in a Supabase staging project first.
- The CMS editor currently provides live controls for the header/navigation, hero text and background image URL, homepage section headings, footer copy and logo URL. Contact and theme settings are stored in Supabase but not every old component consumes every field yet. Some deep section layouts, decorative elements, all individual text labels and image placements still require additional CMS binding work.
- The older Express/JSON API remains in the repository for legacy endpoints. Do not rely on JSON persistence on Vercel. The current delivery does not claim that every legacy API route has been fully rewritten to Supabase.
- Image URL fields expect a publicly accessible URL. Supabase Storage bucket upload UI is not included in this delivery; upload images in Supabase Storage and paste their public URL.
- `admin_login_history` currently records successful Supabase logins from the browser. It is not a tamper-proof audit trail; production-grade IP capture, failed-login capture and forced revocation of already-issued Supabase sessions require server-side functions.

## 8. Validation

`npm run lint` passed in the preparation environment. A production Vite build could not be verified because the ZIP's bundled `node_modules` were Windows-built and lacked the Linux Rollup optional binary. On your machine, install dependencies cleanly (`npm install`) and run `npm run build` before deploying.
