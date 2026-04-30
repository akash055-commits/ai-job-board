# Akash AI Job Board

Personal AI-powered job board for Akash Chaurasia that aggregates jobs, ranks them against his growth and product profile, and tracks applications in one clean dashboard.

## What It Does
- Aggregates jobs from LinkedIn, Indeed, Naukri, Instahyre, Wellfound, and direct company career pages.
- Pulls structured Google Jobs listings through SerpApi using profile-specific growth/product/performance-marketing queries.
- Normalizes listings into one schema and deduplicates by title, company, and apply link.
- Scores every listing against Akash's resume-derived profile memory.
- Explains why a role is a fit using heuristic reasoning, with optional OpenAI enrichment if `OPENAI_API_KEY` is set.
- Tracks application status across `Not Applied`, `Applied`, `Saved`, and `Rejected`.
- Runs daily sync through a cron endpoint and also supports manual refresh from the UI.
- Writes a GitHub-stored snapshot to `data/jobs.snapshot.json` so the discovered job links also live in the repository.

## Profile Memory Used
The scoring logic is personalized using Akash's resume and a structured profile memory file:
- [docs/akash-profile-memory.md](/Users/akashchaurasia/Documents/New%20project/docs/akash-profile-memory.md)
- [lib/ai/profile.ts](/Users/akashchaurasia/Documents/New%20project/lib/ai/profile.ts)

## Stack
- Next.js App Router + TypeScript
- Tailwind CSS
- Prisma + SQLite for local development
- Playwright for live scraping mode
- SerpApi Google Jobs API for structured job discovery
- Optional OpenAI API for richer job summaries and reasoning

## Local Setup
1. Copy `.env.example` to `.env`.
2. Keep the default local SQLite database at `prisma/dev.db` or change `DATABASE_URL` if you want a different file path.
3. Install dependencies:

```bash
npm install
```

4. Generate the Prisma client and create tables:

```bash
npm run db:generate
npm run db:push
```

5. Seed demo jobs:

```bash
npm run db:seed
```

6. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables
| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | SQLite database file URL |
| `OPENAI_API_KEY` | Optional, adds richer AI summaries and reasoning |
| `OPENAI_MODEL` | Optional model override for job narrative enrichment |
| `JOB_REFRESH_SECRET` | Secret for the cron endpoint |
| `SCRAPE_MODE` | `demo` or `live` |
| `VERIFY_LINKS` | Set `true` to HEAD-check links before ingesting |
| `APP_BASE_URL` | Public base URL for the deployed app |
| `SERPAPI_ENABLE` | Set `true` to fetch Google Jobs through SerpApi |
| `SERPAPI_API_KEY` | SerpApi private key |
| `SERPAPI_BASE_URL` | SerpApi search endpoint |
| `SERPAPI_ENGINE` | Keep as `google_jobs` |
| `SERPAPI_GOOGLE_DOMAIN` | Google domain for search localization |
| `SERPAPI_GL` | Country code, defaults to `in` |
| `SERPAPI_HL` | Language code, defaults to `en` |
| `SERPAPI_MAX_PAGES` | Pages per query-location pair |
| `SERPAPI_NO_CACHE` | Force fresh SerpApi fetches |
| `SERPAPI_LOCATIONS` | `||`-separated search locations |
| `SERPAPI_QUERIES` | `||`-separated search queries |
| `*_QUERY_URL` | Per-source search URL override for live scraping |
| `COMPANY_CAREERS_URLS` | Comma-separated list of company jobs pages |

## SerpApi Mode
SerpApi is now the cleanest way to get high-quality structured jobs into the board.

1. Rotate the API key you pasted in chat and put the fresh key into `.env` as `SERPAPI_API_KEY`.
2. Leave `SERPAPI_ENABLE=true`.
3. Start with `SERPAPI_MAX_PAGES=1` to stay conservative on quota and keep refreshes fast.
4. Tune `SERPAPI_LOCATIONS` and `SERPAPI_QUERIES` as your search focus changes.

Example:

```env
SERPAPI_LOCATIONS="Gurugram, Haryana, India||Bengaluru, Karnataka, India||Remote"
SERPAPI_QUERIES="growth manager startup||performance marketing manager meta google||growth product manager"
```

The default query set is based on Akash's resume and targets:
- Growth manager roles
- Performance marketing roles with Meta/Google overlap
- Growth product roles
- Product roles with experimentation scope
- Founder's office roles tied to growth
- High-ownership growth associate roles

## GitHub Storage
This repo now includes a repository-backed snapshot layer:
- [data/jobs.snapshot.json](/Users/akashchaurasia/Documents/New%20project/data/jobs.snapshot.json) stores the latest exported jobs.
- [data/jobs.snapshot.meta.json](/Users/akashchaurasia/Documents/New%20project/data/jobs.snapshot.meta.json) stores refresh metadata.
- [.github/workflows/refresh-jobs.yml](/Users/akashchaurasia/Documents/New%20project/.github/workflows/refresh-jobs.yml) refreshes that snapshot daily on GitHub Actions.

To enable GitHub-side storage updates after you push:
1. Add `SERPAPI_API_KEY` as a GitHub Actions secret.
2. Optionally add `OPENAI_API_KEY` if you want richer summaries.
3. Enable GitHub Actions for the repo.

You can also refresh the repo snapshot locally with:

```bash
npm run jobs:export
```

## Live Scraping Mode
The app ships in `demo` mode so it works immediately after setup. To switch to live fetching:

1. Set `SCRAPE_MODE=live`.
2. Provide source query URLs in `.env` that reflect the exact searches you care about.
3. Tune selectors in [lib/jobs/adapters/shared.ts](/Users/akashchaurasia/Documents/New%20project/lib/jobs/adapters/shared.ts) if any source changes its markup.
4. If you want broken links filtered out, set `VERIFY_LINKS=true`.

## Daily Automation
The repository includes [vercel.json](/Users/akashchaurasia/Documents/New%20project/vercel.json) with a cron schedule of `30 1 * * *`, which corresponds to **7:00 AM IST** every day.

Trigger manually:

```bash
curl -H "Authorization: Bearer <JOB_REFRESH_SECRET>" http://localhost:3000/api/cron/daily
```

Or use the in-app `Find New Jobs` button to run a full refresh.

## SerpApi Notes
- The app uses the official `google_jobs` engine instead of generic Google search.
- It prefers `apply_options[].link` and falls back to `share_link`.
- It deduplicates SerpApi results using `job_id` when available.
- Google Jobs pagination uses `next_page_token`, so each extra page consumes additional searches.

## Deployment

### Recommended: Render or Railway
This repo is currently configured with SQLite, so the easiest deployment path is a host that supports persistent disk.

### Railway
1. Deploy as a Node service from GitHub.
2. Mount persistent disk storage so the SQLite database file survives restarts.
3. Set the build command to `npm install && npm run db:generate && npm run build`.
4. Set the start command to `npm start`.
5. Add a Railway cron job that hits `/api/cron/daily` at `0 7 * * * Asia/Kolkata`.

### Render
1. Create a new web service from GitHub.
2. Attach a persistent disk.
3. Set the build command to `npm install && npm run db:generate && npm run build`.
4. Set the start command to `npm start`.
5. Add a Render cron job for the same endpoint and secret.

### Vercel
Vercel is not the best fit for the current SQLite-based setup because the filesystem is ephemeral. If you want Vercel, switch Prisma back to PostgreSQL first and use a managed Postgres database.

## Suggested Next Upgrades
- Learn ranking preferences from historical apply/reject behavior.
- Add email or WhatsApp morning summaries.
- Store tailored resume bullets per job.
- Build a Chrome extension that pushes interesting jobs directly into this board.
