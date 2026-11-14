# SKM High School — Supabase CMS Live Update

This update keeps the existing Vite + React website and its design. Supabase is the source of truth for the admin-managed content.

## What changed
- Admin CMS editor now reads both published and draft `site_content` rows, so an unpublished draft is not silently overwritten by defaults.
- Saving Site Editor content writes the authenticated admin's UUID to `updated_by`.
- Admin create/update/delete actions for announcements, events, gallery, documents, staff, achievements, programs, facilities, milestones, FAQs and admissions now use Supabase directly. Failed database writes are shown as errors instead of being reported as successful local/API fallback writes.
- Public reads for these modules come from Supabase. An empty published table remains empty; it is not silently replaced with sample fallback content.
- Added editable Legacy and Mission & Core Values sections.
- Footer contact information and school logo branding read their CMS values.
- Branding primary color, accent color and font are applied through CSS variables.
- Public pages subscribe to Supabase Realtime changes and refresh after CMS content changes in another session/browser.

## Required Supabase setup
1. Confirm the previous migration `supabase/migrations/20261113_admin_cms.sql` has already been applied.
2. Open Supabase Dashboard → SQL Editor.
3. Run the complete SQL in `supabase/migrations/20261114_live_cms.sql`.
4. Confirm Realtime is enabled for the tables included by that migration. The migration adds existing tables to the `supabase_realtime` publication.
5. Ensure the admin's `admin_profiles` row is active and has `super_admin` or `content_admin` role. `viewer` is read-only.

## Environment
The Vite client requires these public values in `.env`:
```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```
Never put the Supabase `service_role` key in a Vite/browser environment.

## Local verification
```bash
npm install
npm run build
```

The TypeScript compiler check (`tsc --noEmit`) passed on this updated source. A full Vite build could not be completed in the packaging environment because the uploaded Windows `node_modules` did not include Rollup's Linux optional binary. Run `npm install` on your Windows machine and then `npm run build`.

## Important
Database changes cannot be applied remotely from this ZIP. Run the new SQL migration in your own Supabase SQL Editor before testing admin saves and Realtime updates.
