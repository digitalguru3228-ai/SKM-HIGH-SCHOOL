# SKM High School – 15 Nov 2026 fixes

## Included
- Achievements mobile layout: category filters are non-shrinking, horizontally scrollable tabs; stat cards and achievement cards wrap long content; extra bottom spacing protects content from the floating navigation.
- Added `20261115_seed_existing_site_content.sql` (also under `supabase/migrations/`). This imports the website's existing static events, academic streams, facilities, legacy milestones, gallery, documents, staff, achievements and FAQs into Supabase **only when the corresponding table is empty**. It never overwrites or deletes existing rows.
- Admin dashboard continues to calculate module counts from actual Supabase records. After seeding, the module counts should correspond to manageable database records. Admission enquiries are real submissions and are intentionally not fabricated; zero is correct until a parent submits an enquiry.

## Required database step
Run `supabase/migrations/20261115_seed_existing_site_content.sql` once in Supabase SQL Editor after the previous CMS migrations. It is safe to rerun: each content table is seeded only if empty.

If a table already contains some records, this migration intentionally does not append the static fallback records to avoid duplicates. Review that table manually before importing additional records.

## Local verification
Keep your own `.env` file (it is intentionally not included in this ZIP), then run:

```bash
npm install
npm run build
npm run dev
```

Verify the achievements page at mobile width and check the Admin Dashboard module counts. The ZIP does not include `.env`, `.git`, `node_modules`, or `dist`.
