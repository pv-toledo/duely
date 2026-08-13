# Duely

Adult life generates paperwork. Duely reads it for you.

Photograph a bill, an insurance card, or a lab result. A vision model extracts the vendor, the amount, the dates, and the category, classifies what kind of document it even is, and Duely emails you before the deadline arrives. No folders, no spreadsheets, no manual data entry.

[Live app](https://duely-app.vercel.app) · [Interactive demo, no signup](https://duely-app.vercel.app/demo)

<p align="center">
  <video src="https://github.com/user-attachments/assets/86a8a4a6-1812-4ae8-a68a-fd6f954a2915" width="100%" autoplay loop muted playsinline></video>
</p>

## Why it exists
 
Existing options ask you to do the work: type every field into a finance app, or dump files into cloud storage and remember to look at them. The photograph is the only part a person should have to do, and that only holds because a vision model can turn an unstructured image into the same structured fields a human would otherwise have typed. Everything downstream (reading the document, structuring it, tracking the date, sending the reminder) is work software should absorb.
 
Duely is built and deployed as a production system, not a prototype. Real authentication, row level security, a background worker, transactional email on a verified domain, and CI on every push.
 
## How it works
 
```
┌──────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  Next.js web │         │    Supabase      │         │  FastAPI worker │
│   (Vercel)   │         │                  │         │    (Render)     │
├──────────────┤         ├──────────────────┤         ├─────────────────┤
│ upload       │────────>│ Storage          │<────────│ fetch image     │
│ (WebP, RLS)  │         │                  │         │                 │
│              │         │ documents        │<────────│ poll pending    │
│ realtime UI  │<────────│  (Realtime)      │         │ Gemini extract  │
│              │         │ extractions      │<────────│ write result    │
│ review form  │────────>│  (RPC, atomic)   │         │                 │
│              │         │ deadlines        │<────────│ daily 12:00 UTC │
│ dashboard    │<────────│ notification_log │<────────│ Resend reminder │
└──────────────┘         └──────────────────┘         └─────────────────┘
```
 
1. The browser compresses the image to WebP and uploads it straight to Supabase Storage under the user's own RLS policy. The file never passes through a serverless function.
2. The worker polls for pending documents, sends the image to Google Gemini, and validates the response against a Pydantic discriminated union covering four cases: vehicle, health, bills, and unclear.
3. Supabase Realtime pushes the status change to the open tab, so the page updates without polling from the client.
4. The user confirms or corrects the extracted fields. A single Postgres function writes the document, its extraction, and its deadline atomically.
5. A cron job runs once a day. For every deadline whose reminder window opens that day, it renders a template, sends through Resend, and records the send in `notification_log` so a reminder is never sent twice.
## The extraction pipeline
 
This is the part of the product that matters most.
 
A photograph is unstructured. A deadline reminder needs structured fields: who the vendor is, how much is owed, when it's due. Closing that gap is Gemini's job, and the worker treats its output the way any external system's output should be treated: useful, but not automatically trusted.
 
**Classification is explicit, including the uncertain case.** Every document resolves to one of four outcomes: vehicle, health, bills, or unclear. Unclear isn't an error path bolted on afterward, it's a first-class member of the same schema, carrying its own reason field. A model that can't confidently place a document says so, instead of forcing a guess into the wrong category and quietly corrupting a deadline downstream.
 
**The model's response never reaches Postgres directly.** Gemini returns JSON, and that JSON is parsed against a Pydantic discriminated union in the worker before anything is written. Vehicle documents require a plate and a document number, health documents require a subject name, bills require an amount. A response that doesn't match the shape for its declared category fails validation instead of inserting partial or malformed data. The boundary between what the model said and what the database accepts is enforced in code, not assumed.
 
**A human confirms before anything becomes a deadline.** The review screen shows exactly what Gemini extracted, pre-filled and editable, next to the original image. Nothing is scheduled and no reminder is queued until a person looks at the fields and confirms them. The model does the reading. The person keeps the final say.
 
The landing page's live preview and the [interactive demo](https://duely-app.vercel.app/demo) both reproduce this same review screen with a staged extraction, so the core interaction is visible without an account or a real Gemini call.
 
## Stack
 
| Layer | Choice |
| --- | --- |
| Web | Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Forms | React Hook Form with Zod |
| Worker | Python 3.12, FastAPI, SQLAlchemy, APScheduler, uv |
| Data | Supabase Postgres with row level security, Storage, Auth, Realtime |
| AI | Google Gemini with structured output validated by Pydantic |
| Email | Resend on a verified custom domain |
| Hosting | Vercel (web), Render (worker) |
| CI | GitHub Actions |
 
## Engineering decisions
 
The interesting parts of this project are the constraints.
 
**`null` means two different things, and conflating them loses data.** The review form strips null fields before calling Postgres, which is safe when null means "not applicable" and the function's default is also null. Then reminders shipped with a nullable offset where null is a real user choice: no reminder for this deadline. Passing it through the same generic cleanup would have made a deliberate opt out indistinguishable from an untouched field. That one column now always goes explicitly, and the cleanup helper skips it.
 
**Reminders send first and log second.** Logging before sending risks a crash between the two writes silently swallowing a reminder the user needed. Sending first risks a duplicate. With a job that runs once a day on a single instance, the duplicate is nearly impossible and merely annoying, while the missed reminder defeats the product. The unique constraint on `notification_log` remains as a safety net, not as the primary guard.
 
**Email templates get one line per anchor tag.** A reminder went out with the link rendered as visible attribute text instead of a link. The provider's click tracking rewrites anchor tags, and the rewrite did not survive an anchor split across multiple lines. Inline CSS on every element for the same class of reason: many clients, Gmail included, strip `<style>` blocks.
 
**The demo runs entirely in the browser.** `/demo` renders the real dashboard, deadline rows, and review form, all reading from an in memory store instead of Supabase. Every component that talks to a Server Action takes an optional override prop, defaulting to production behavior, so the demo reuses the actual UI rather than a parallel imitation that drifts. Anonymous visitors touch no database, no AI quota, and no email provider.
 
## Running locally
 
Requires Node 20+, Python 3.12+, [uv](https://docs.astral.sh/uv/), and a Supabase project.
 
```bash
git clone https://github.com/pv-toledo/duely.git
cd duely
npm install
```
 
**Web**
 
```bash
cp apps/web/.env.example apps/web/.env.local   # fill in Supabase keys
npm run dev -w apps/web                        # http://localhost:3000
```
 
**Worker**
 
```bash
cd apps/worker
uv sync
cp .env.example .env                           # fill in database, Gemini, Resend
uv run uvicorn main:app --reload               # http://localhost:8000
```
 
Database migrations live in `supabase/migrations` and apply through the Supabase CLI or the SQL editor. The worker's SQLAlchemy models must be updated in the same commit as any migration that changes a table it reads.
 
**Checks**
 
```bash
npm run build -w apps/web
cd apps/worker && uv run ruff check . && uv run pytest
```
 
## Repository layout
 
```
apps/
  web/          Next.js app: routes, Server Actions, upload and review flows
  worker/       FastAPI service: extraction poller, reminder scheduler
packages/
  shared/       Enums and field types shared across both apps
supabase/
  migrations/   Schema, RLS policies, and Postgres functions
```
## Author
 
Built by Paulo Toledo. Metallurgical engineer turned software engineer, previously modeling steelmaking thermodynamics, now shipping full stack products.
 
[GitHub](https://github.com/pv-toledo) · [LinkedIn](https://www.linkedin.com/in/paulo-vinicius-toledo)
 
This is a personal project, published to be read. No license is attached and no commercial use is intended.
