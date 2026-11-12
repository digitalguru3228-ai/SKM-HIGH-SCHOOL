# SKM High School CMS — Security Update Notes

## Included in this update
- Admin profile dropdown in the dashboard header.
- Change Password form with current-password verification.
- New passwords are hashed with bcrypt (12 rounds).
- Password changes increment the administrator token version, invalidating previously issued JWT sessions.
- Security changes are written to the existing audit log.
- Existing school database and content are preserved in `data/skm_database.json`.

## Run locally
1. Extract this folder.
2. Keep your own `.env` file out of public repositories. If you already have one, copy it into the project root. Otherwise copy `.env.example` to `.env` and set strong, private values for the environment variables.
3. Run `npm install`.
4. Run `npm run dev`.
5. Sign in with your current administrator email and password.
6. Click the profile button in the top-right corner and choose **Change Password**.

## Important limitations
- This package implements authenticated password change, not email-based password recovery. A genuine Forgot Password flow requires a configured email provider, verified sender/domain, expiring one-time reset tokens, and rate limiting. Do not treat a UI-only reset as secure.
- Change Email, user-facing session inventory/revocation, and a dedicated Login History screen are not included in this build. The existing audit log records login and password-change activity, but it is not a full device/session management system.
- Before public deployment, set a unique high-entropy `JWT_SECRET`, configure HTTPS, and move the JSON database to durable server-side storage. Do not deploy this local JSON database on ephemeral/serverless storage.
- The included database is the latest project database supplied for this update. Keep a separate backup before editing or deploying.
