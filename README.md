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
SUPABASE_SERVICE_ROLE_KEY=your-role-key

```

2. Open your Supabase project SQL editor and run these files in order:

- `supabase/schema.sql`
- `supabase/seed.sql`

3. Start the app.

The app now reads offers, features, steps, and testimonials from Supabase instead of static arrays.
