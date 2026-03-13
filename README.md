# UCR Events

A full-stack platform that automatically discovers and extracts events from UC Riverside student organization Instagram accounts. The system scrapes posts, processes flyers using OCR and LLMs, and serves structured event data through a public-facing frontend with an administrative portal.

## Architecture

The platform consists of two main components: a **TanStack Start frontend** for browsing events and managing the pipeline, and a **FastAPI backend worker** that handles Instagram scraping, OCR processing, and LLM-based event extraction.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend                                 │
│  TanStack Start · React · TanStack Query · Better Auth          │
│                                                                 │
│  Public: /events, /organizations, /feedback                     │
│  Admin:  /admin (queue, jobs, orgs, stats, messages)            │
│                                                                 │
│  Server Functions (proxy to backend with JWT)                   │
└──────────────────────┬──────────────────────────────────────────┘
                       │ Bearer JWT (server-to-server)
┌──────────────────────▼──────────────────────────────────────────┐
│                     Backend Worker                              │
│  FastAPI · APScheduler · Instaloader · Playwright               │
│                                                                 │
│  Pipeline: Ingest → OCR → LLM Extract → Dedupe → Store          │
│  Discovery: HighlanderLink scraping for new organizations       │
│  Auth: JWKS-based JWT verification (toggle via AUTH_ENABLED)    │
└──────────────────────┬──────────────────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
   PostgreSQL    Cloudflare R2   LLM APIs
    (Neon)       (flyer images)  (Gemini)
```

## Pipeline

The ingestion pipeline runs on a configurable schedule (default: every 24 hours) and can also be triggered manually from the admin portal.
<img width="954" height="349" alt="Screenshot 2026-03-12 at 11 16 54 PM" src="https://github.com/user-attachments/assets/b2fe2c6b-b1a5-4d3b-916c-8fc528e27865" />


### Post Processing States

Posts move through a state machine during processing:

| Status | Description |
|--------|-------------|
| `pending` | Scraped but not yet processed |
| `processing` | OCR and LLM extraction running |
| `completed` | Event extracted and stored |
| `failed` | Extraction failed, eligible for retry |
| `rate_limited` | Hit API limits, scheduled for retry |

Failed posts retry with exponential backoff (5 min → 30 min → 1 hour), up to 3 attempts.

### Organization Status

Organizations are tracked with a status flag to control scraping:

| Status | Description |
|--------|-------------|
| `0` | Pending review (newly discovered) |
| `1` | Approved — actively scraped for events |
| `-1` | Rejected or inactive |

New organizations are discovered automatically via HighlanderLink (UCR's student org directory) using Playwright, then reviewed and managed through the admin portal.

## Design Decisions + Tradeoffs

### OCR over Vision Models

Early experiments tested vision LLMs to analyze event flyers directly. This proved unnecessary — most flyers contain readable text that OCR handles well. OCR is significantly cheaper and faster. Occasional errors are acceptable since users can always view the original Instagram post.

### Batch LLM Processing

The first iteration processed one event per LLM request to validate the concept. Once the pipeline was stable, it moved to batch processing — up to 8 events per Gemini request. This reduced inference costs to stay within free tier limits while improving throughput.

### AI for Unstructured Data

Instagram posts are highly inconsistent. Event details appear in captions, flyers, or across multiple images with no standard format. Rather than rigid parsing, the system uses an LLM to extract structured fields (title, date, time, location) from messy social media content.

### Deduplication Strategy

Events are often reposted or shared across multiple organization accounts. Deduplication operates at two levels:

1. **Post-level**: Each Instagram post has a unique shortcode. Duplicate posts are skipped during ingestion.
2. **Content-level**: During LLM extraction, similarity scoring detects cases where different posts represent the same event (reposts, updated flyers). Matching uses title word overlap (Jaccard similarity), date proximity, and location comparison.

### Server-Side API Proxy

The frontend does not communicate with the backend worker directly from the browser. Instead, TanStack Start server functions act as a proxy layer — minting JWT tokens server-side and forwarding authenticated requests to FastAPI. This keeps the worker endpoints unexposed and ensures tokens never reach the client.

### TanStack Start

The frontend uses TanStack Start to explore its architecture and compare the experience with Next.js. Key advantages: server functions with co-located data fetching (loader functions that fetch server data in the same file as the component), strong TanStack Query integration, and an improved routing model.

### Infinite Scroll

After seeding the database with several hundred events, loading the full dataset created noticeable delays. The system now loads 2 upcoming and 2 past events on initial page load, then fetches additional events dynamically via cursor-based infinite scroll. This improves perceived performance and reduces unnecessary database queries.

### FastAPI and Instaloader

Many Instagram scraping libraries were found to be outdated or abandoned during research. Instaloader was chosen because it is actively maintained with solid documentation. FastAPI provided a clean framework for the worker with room to expand — additional services like automated newsletters or ML-powered analytics could be added in the future.

## Security and Authentication

### JWT-Based Auth

The platform uses Better Auth (Google OAuth) for user sessions and JWT/JWKS for securing the backend API.

- **Frontend**: Better Auth manages sessions via cookies. The JWT plugin exposes a JWKS endpoint for public key verification.
- **Backend**: FastAPI validates JWT tokens against the JWKS endpoint. Auth can be toggled via `AUTH_ENABLED` env var.
- **Server proxy**: JWT tokens are minted server-side in TanStack Start server functions. The browser only sees session cookies — never JWT tokens.

### Public vs Protected Routes

**Public** (no auth required): event browsing, organization directory, feedback submission, FAQ

**Protected** (admin role required): event management, organization approval/rejection, queue management, pipeline controls, feedback review

## Feedback System

The platform includes a feedback system supporting two submission types:

- **Anonymous feedback**: Bug reports or general suggestions (no login required)
- **Organization-linked feedback**: Organizations can submit feedback tied to their specific page (requires authentication)

## Getting Started

### Prerequisites

- Python 3.13+ and [uv](https://docs.astral.sh/uv/)
- Node.js 20+ and [Bun](https://bun.sh/)
- PostgreSQL database (or [Neon](https://neon.tech/) account)
- Tesseract OCR (`brew install tesseract` on macOS)
- Cloudflare R2 bucket (for flyer image storage)
- Google OAuth credentials (for Better Auth)
- Gemini API key (for LLM extraction)

### Backend Setup

```bash

# Install dependencies
uv sync

# Configure environment
cp .env.example .env

# Install Playwright browsers (for HighlanderLink scraping)
playwright install chromium

# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash

# Install dependencies
bun install

# Configure environment
cp .env.example .env

# Run database migrations
bunx drizzle-kit push

# Start the dev server
bun dev
```

### Environment Variables

**Backend (`dj-cv/.env`)**:
```env
DATABASE_URL=postgresql://user:pass@host/db
GEMINI_API_KEY=...
OPENROUTER_API_KEY=...          # optional fallback
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=flyers
R2_PUBLIC_URL=...
AUTH_ENABLED=false               # set to true in production
JWKS_URL=http://localhost:3000/api/auth/jwks
FRONTEND_URL=http://localhost:3000
ENABLE_BATCH_EXTRACTION=true
BATCH_EXTRACTION_SIZE=8
SCHEDULER_INTERVAL_HOURS=24
```

**Frontend (`weezer/.env`)**:
```env
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
DATABASE_URL=postgresql://user:pass@host/db
VITE_BACKEND_URL=http://localhost:8000
VITE_BASE_URL=http://localhost:3000
VITE_PUBLIC_POSTHOG_KEY=...
VITE_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

## Tech Stack

### Frontend
- TanStack Start (React 19, TypeScript)
- TanStack Query (server state + caching)
- TanStack Router (file-based routing)
- Tailwind CSS + Radix UI
- Drizzle ORM (PostgreSQL)
- Better Auth (Google OAuth + JWT)
- PostHog (analytics)

### Backend Worker
- FastAPI (Python 3.13+)
- Instaloader (Instagram scraping)
- Playwright (HighlanderLink scraping)
- Tesseract / pytesseract (OCR)
- Gemini / OpenRouter (LLM extraction)
- APScheduler (background scheduling)
- Boto3 (Cloudflare R2 storage)

### Infrastructure
- PostgreSQL (Neon)
- Cloudflare R2 (S3-compatible image storage)
- Drizzle ORM (frontend) / raw SQL with psycopg (backend)

