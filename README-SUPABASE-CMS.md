# SKM High School — CMS Upgrade

Start with **SETUP_GUIDE_SUPABASE_CMS.md**. It explains the Supabase SQL migration, first Super Admin bootstrap, roles and Vercel environment variables.

The new Admin Dashboard includes **Website Content Studio** and **Supabase Admin Access**. Public components load the published header/navigation, hero, homepage headings, footer, contact details and logo from Supabase `site_content`.

Before deploying, back up the Supabase database, apply `supabase/migrations/20261113_admin_cms.sql`, configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, create the first Supabase Auth user and insert its `admin_profiles` row. Then run `npm install`, `npm run lint`, and `npm run build` locally.

See **DELIVERY-STATUS.md** for what is implemented and what still needs completion. This is not represented as a fully rewritten replacement for every legacy JSON API endpoint.
