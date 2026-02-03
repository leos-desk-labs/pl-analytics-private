# PL Analytics — Developer Handoff

**Last updated:** February 2, 2026
**Repo:** `clay-ship-it/pl-analytics-private` (GitHub)
**Live:** Deployed on Vercel (auto-deploys from `main`)

---

## What This Is

An internal analytics dashboard for **Peoples League Golf** — a golf media/entertainment brand. It pulls data from YouTube, Instagram, Facebook, TikTok, and X (Twitter) into a single dashboard so the team can track content performance across platforms.

The dashboard is private (not public-facing). Team members view analytics; only the admin (Clay) manages API connections.

---

## Stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS** for styling, **Recharts** for charts, **lucide-react** for icons
- **Vercel** for hosting, serverless functions, and cron jobs
- No database — all data is fetched live from APIs and cached in-memory

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Overview dashboard (YTD + lifetime metrics)
│   ├── layout.tsx                  # Root layout with Sidebar
│   ├── youtube/page.tsx            # YouTube analytics
│   ├── instagram/page.tsx          # Instagram analytics
│   ├── facebook/page.tsx           # Facebook analytics
│   ├── tiktok/page.tsx             # TikTok analytics
│   ├── x/page.tsx                  # X (Twitter) analytics
│   ├── creators/page.tsx           # Creator Hub — all PL creators with follower counts
│   ├── sponsors/page.tsx           # Sponsor Hub
│   ├── linkedin/page.tsx           # Placeholder (coming soon)
│   ├── privacy/page.tsx            # Privacy policy
│   ├── terms/page.tsx              # Terms of service
│   └── api/
│       ├── youtube/route.ts        # YouTube Data API v3
│       ├── instagram/route.ts      # Meta Graph API (Business Discovery)
│       ├── instagram/debug/        # Debug endpoint for token issues
│       ├── instagram/refresh/      # Manual refresh
│       ├── facebook/route.ts       # Meta Graph API (Page + Videos)
│       ├── facebook/debug/         # Debug endpoint
│       ├── tiktok/route.ts         # Public profile scraping (no API key needed)
│       ├── tiktok/auth/            # OAuth flow (unused — TikTok rejected app)
│       ├── tiktok/callback/        # OAuth callback (unused)
│       ├── x/route.ts              # X API v2 (Bearer Token, app-only auth)
│       ├── x/auth/                 # OAuth flow (unused — switched to Bearer Token)
│       ├── x/callback/             # OAuth callback (unused)
│       ├── creators/route.ts       # Aggregates creator follower data across platforms
│       ├── pl-account/route.ts     # Internal account data
│       ├── refresh/route.ts        # Manual cache clear (POST) / cache status (GET)
│       └── cron/refresh/route.ts   # Vercel cron job — runs daily at 5am ET
├── components/
│   ├── Sidebar.tsx                 # Navigation sidebar
│   ├── MetricCard.tsx              # Reusable metric card
│   ├── SimpleChart.tsx             # Bar chart (Recharts)
│   ├── ViewsGrowthChart.tsx        # Multi-platform growth chart
│   ├── GrowthMetrics.tsx           # MoM growth calculations
│   └── QuickStatsPanel.tsx         # Compact stats display
├── data/
│   ├── creators.ts                 # Creator database (names, teams, handles, channel IDs)
│   └── sponsors.ts                 # Sponsor data
└── lib/
    └── cache.ts                    # In-memory daily cache (refreshes at 5am ET)
```

---

## How Data Flows

```
Browser → Page (client component) → fetch('/api/[platform]') → API Route
                                                                  ↓
                                                          Check in-memory cache
                                                          (valid since 5am ET today?)
                                                                  ↓
                                                        Yes: return cached data
                                                        No:  fetch from platform API
                                                              → process/aggregate
                                                              → store in cache
                                                              → return JSON
```

Cache is in-memory (a `Map` in `src/lib/cache.ts`). It resets on server restart and refreshes daily at 5am ET. A Vercel cron job (`vercel.json`) hits `/api/cron/refresh` at 10:00 UTC (5am ET) to warm the cache. You can also manually clear it via `POST /api/refresh`.

---

## Platform-by-Platform Breakdown

### YouTube (`/api/youtube`)
- **Auth:** `YOUTUBE_API_KEY` (API key, no OAuth)
- **What it fetches:** Channel stats (subs, views, video count) + last 50 videos with full metadata
- **Special logic:** Classifies videos as **Shorts** (≤60s) vs **Long-form**. YTD metrics calculated by filtering to videos published in current year. Top performers sorted by view count.
- **Works well.** No known issues.

### Instagram (`/api/instagram`)
- **Auth:** `META_ACCESS_TOKEN` + `META_INSTAGRAM_ID`
- **What it fetches:** Account info via Business Discovery API, all media (up to 500), Reels insights (views, reach, saved, shares)
- **Special logic:** Reels insights fetched in batches of 10 to avoid rate limits. Engagement rate = (likes + comments + shares + saves) / reach * 100. Separates Reels/Images/Carousels.
- **Token note:** Meta tokens expire. If Instagram stops working, generate a new long-lived token from the Graph API Explorer with permissions: `instagram_basic`, `instagram_insights`, `pages_read_engagement`, `pages_read_user_content`.

### Facebook (`/api/facebook`)
- **Auth:** `META_ACCESS_TOKEN` + `META_PAGE_ID`
- **What it fetches:** Page info, all videos with lifetime views, posts with reactions/comments/shares
- **Special logic:** Handles both User tokens (looks up page token) and Page tokens directly. Paginates through all content. YTD filtering for 2026 metrics.
- **Same token as Instagram** — one Meta token covers both.

### TikTok (`/api/tiktok`)
- **Auth:** None needed
- **What it fetches:** Scrapes the public profile page HTML for `@peoplesleaguegolf`
- **How:** Fetches `https://www.tiktok.com/@peoplesleaguegolf` with a browser User-Agent, extracts the `__UNIVERSAL_DATA_FOR_REHYDRATION__` JSON script tag which contains follower count, total likes, video count.
- **Limitation:** Per-video analytics (views, comments, shares per video) are **not available**. TikTok's Developer API rejected our app because they don't approve apps for internal/company use. The auth/callback routes still exist but are unused.
- **Risk:** This is HTML scraping — if TikTok changes their page structure, it will break. Monitor for changes.

### X / Twitter (`/api/x`)
- **Auth:** `X_BEARER_TOKEN` (app-only) + `X_USERNAME` (defaults to `PeoplesLeagueX`)
- **What it fetches:** User profile by username, last 100 tweets with public metrics
- **Special logic:** Calculates engagement totals from recent tweets, identifies top 5 by likes
- **Limitation:** `impression_count` requires OAuth 2.0 user auth (not app-only). Currently impressions show as 0. The auth/callback routes exist from an earlier OAuth attempt but are unused — we switched to Bearer Token to avoid serverless cookie issues with PKCE.
- **Status:** Needs `X_BEARER_TOKEN` added to Vercel env vars to work. Without it, the page shows "Configuration Required."

### Creator Hub (`/api/creators`)
- **What it does:** Iterates through the creator database (`src/data/creators.ts`), fetches live follower counts from YouTube and Instagram for each creator
- **Data source:** YouTube channel IDs + Instagram Business Discovery API
- **Note:** Creator list is hardcoded in `src/data/creators.ts`. To add/remove creators, edit that file.

---

## Environment Variables

Set these in Vercel → Project Settings → Environment Variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `YOUTUBE_API_KEY` | Yes | Google Cloud API key with YouTube Data API v3 enabled |
| `META_ACCESS_TOKEN` | Yes | Meta Graph API token (covers both Instagram + Facebook) |
| `META_PAGE_ID` | Yes | Facebook Page ID (`719290654611865`) |
| `META_INSTAGRAM_ID` | Yes | Instagram Business Account ID (`17841466383183078`) |
| `X_BEARER_TOKEN` | For X | App-only Bearer Token from X Developer Portal |
| `X_USERNAME` | No | Defaults to `PeoplesLeagueX` |
| `TIKTOK_USERNAME` | No | Defaults to `peoplesleaguegolf` |
| `CRON_SECRET` | Recommended | Vercel cron job auth secret |
| `ADMIN_SECRET` | Recommended | Protects `/api/tiktok/auth` and `/api/x/auth` from team access |

**Token that expires:** The `META_ACCESS_TOKEN` is the main one to watch. When Instagram/Facebook stop returning data, regenerate it from the [Meta Graph API Explorer](https://developers.facebook.com/tools/explorer/) with the right permissions.

---

## Cron Job

Defined in `vercel.json`:
```json
{ "crons": [{ "path": "/api/cron/refresh", "schedule": "0 10 * * *" }] }
```
Runs at 10:00 UTC (5:00 AM ET) daily. Hits the refresh endpoint which fetches fresh data for Instagram and Creators, warming the cache for the day.

---

## Known Issues & Gotchas

1. **In-memory cache doesn't persist across deploys or cold starts.** First request after a deploy will be slow as it fetches fresh data from all APIs. The cron job helps, but if Vercel spins down the function, cache is lost.

2. **TikTok scraping is fragile.** It parses HTML structure that TikTok can change at any time. If TikTok data stops working, check if the `__UNIVERSAL_DATA_FOR_REHYDRATION__` script tag still exists on their profile pages.

3. **X (Twitter) may not be fully configured yet.** The `X_BEARER_TOKEN` needs to be added to Vercel env vars. The app "PL Analytics" was created in the X Developer Portal under Clay's account.

4. **Unused OAuth routes.** `/api/tiktok/auth`, `/api/tiktok/callback`, `/api/x/auth`, `/api/x/callback` are leftover from OAuth attempts. They're protected by `ADMIN_SECRET` but could be deleted for cleanup.

5. **Meta token expiration.** Long-lived tokens last ~60 days. When Instagram + Facebook both break, it's the token. Short-lived tokens from the explorer last 1 hour.

6. **YouTube Shorts classification.** Videos ≤60 seconds are classified as Shorts. This is a heuristic — it's possible a non-Short video is under 60s, but it's accurate for this account's content.

7. **No persistent storage.** Everything is ephemeral. There's no database, no historical tracking. Each refresh gets the current snapshot. If you want historical trend data, you'd need to add a database.

---

## What Was Being Worked On

The most recent work (February 2026) focused on:

1. **YTD 2026 metrics overhaul** — All platform pages now lead with Year-to-Date metrics and separate lifetime stats
2. **X (Twitter) integration** — Started with OAuth 2.0 + PKCE, hit serverless cookie issues, simplified to Bearer Token (app-only auth)
3. **TikTok pivot** — App was rejected by TikTok for internal use. Rebuilt to scrape public profile data instead. Per-video analytics are gone.
4. **Admin protection** — Added `ADMIN_SECRET` to auth endpoints so team members can't trigger OAuth flows

---

## Local Development

```bash
cd pl-analytics-vercel
npm install
cp .env.local.example .env.local  # Add your API keys
npm run dev                        # http://localhost:3000
```

There's no `.env.local.example` file — you'll need to create `.env.local` manually with the variables listed above. The existing `.env.local` on Clay's machine has all the current keys.

---

## Deployment

Push to `main` → Vercel auto-deploys. That's it.

```bash
git push origin main
```

To manually clear the cache after a deploy:
```bash
curl -X POST https://pl-analytics-private.vercel.app/api/refresh
```
