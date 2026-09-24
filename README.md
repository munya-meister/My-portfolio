# Munyaradzi Mbewe — Portfolio

Personal portfolio built with React and Vite, with a Netlify Functions API and Supabase for persistent data and file storage.

## Stack

- React 19 + Vite
- Netlify Functions
- Supabase Postgres + Storage
- Framer Motion
- Resend for contact email delivery

## Local development

```bash
npm install
npm run dev
```

For the full Netlify Functions flow, use Netlify's local development environment after configuring the required environment variables.

## Environment variables

Never commit real credentials. Configure server-side secrets in Netlify and keep local values in ignored environment files.

```text
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PASSWORD=
RESEND_API_KEY=
CONTACT_EMAIL=
```

Optional frontend development variable:

```text
VITE_API_BASE_URL=
```

Do not expose the Supabase service-role key or admin password through a `VITE_` variable.

## Supabase setup

Run `supabase/schema.sql` in the Supabase SQL editor. It creates the portfolio tables, public-read RLS policies, and the four storage buckets used by the API:

- `certificates`
- `projects`
- `profile`
- `documents`

The buckets are public because the portfolio serves uploaded assets using Supabase public URLs. Uploads and destructive admin operations are performed server-side with the service-role key.

If migrating the old local JSON/upload data, configure a local `.env` and run:

```bash
npm run migrate
```

## Netlify deployment

The repository includes `netlify.toml` with:

- build command: `npm run build`
- publish directory: `dist`
- functions directory: `netlify/functions`
- `/api/*` routing to the portfolio API function
- SPA fallback to `index.html`

Before deploying, add the server-side environment variables listed above to the Netlify site configuration.

## Admin

The admin UI authenticates against `/api/admin/login`. A successful login receives a time-limited token stored in `sessionStorage`; the admin password itself is not bundled into the frontend.

## Useful commands

```bash
npm run dev
npm run build
npm run lint
npm run preview
npm run migrate
```

## Security

- `.env` and environment-specific secret files are ignored by Git.
- Never commit a Supabase service-role key.
- Never put server secrets in variables prefixed with `VITE_`.
