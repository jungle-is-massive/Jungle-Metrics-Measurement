# Jungle Metrics & Measurement Hub

Internal CRUD hub for Jungle Creations lead sources, lifecycle stages, scoring rules, thresholds, and funnel movement rules.

## Run Locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Create a Supabase project and run `supabase/001_metrics_measurement_schema.sql` in the SQL editor.
4. Fill `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Start the app with `npm run dev`.

## Deploy To GitHub Pages

Build the static export with `GITHUB_PAGES=true npm run build` and deploy the `out` directory to GitHub Pages. Add the Supabase public env vars as repository secrets if you add a GitHub Actions workflow:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Then enable GitHub Pages. The current token used for the initial push did not include GitHub's `workflow` scope, so the Pages workflow should be added after rotating to a token that can create workflow files.
