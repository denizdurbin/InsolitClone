# InsolitClone-
A clone of the application INSOLIT, created by Los Marouanos

## Run locally

```bash
pnpm i
pnpm dev
```

## Supabase setup

1. Add environment variables in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-publishable-key
# Admin (dashboard + API)
ADMIN_EMAILS=admin@example.com,admin2@example.com
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

2. Open your Supabase project SQL editor and run these files in order:

- `supabase/schema.sql`
- `supabase/seed.sql`

3. Start the app.

## Admin dashboard

- Page: `/admin` (protégée côté serveur par la liste `ADMIN_EMAILS`).
- Endpoints :
	- `GET /api/admin/check` (vérifie l'email via l'en-tête `x-admin-email`)
	- `GET /api/admin/analytics`
	- `POST /api/admin/offers` (crée une offre, nécessite `SUPABASE_SERVICE_ROLE_KEY`).

The app now reads offers, features, steps, and testimonials from Supabase instead of static arrays.
