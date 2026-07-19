# Meridian — Real Estate Listing Portal

A production-shaped property portal: agents publish listings, an admin reviews
them, buyers search and send inquiries without exposing their phone number.

**Stack** — Next.js 15 (App Router) · TypeScript · Tailwind CSS · Prisma ORM ·
PostgreSQL (Neon) · Vercel Blob · JWT (jose) · bcrypt · Zod · React Hook Form ·
Lucide · Recharts. No paid APIs.

---

## 1. Run it locally

```bash
npm install
cp .env.example .env        # then fill in the four values
npx prisma generate
npx prisma db push          # or: npx prisma migrate dev --name init
npm run db:seed
npm run dev                 # http://localhost:3000
```

### Environment variables

| Key | Where it comes from |
|---|---|
| `DATABASE_URL` | Neon dashboard → Connection string → **Pooled** |
| `DIRECT_URL` | Neon dashboard → Connection string → **Direct** (Prisma Migrate needs it) |
| `JWT_SECRET` | `openssl rand -base64 48` — must be 32+ chars or the app throws on boot |
| `BLOB_READ_WRITE_TOKEN` | Vercel → Storage → Create Blob store → `.env.local` tab |

Without a blob token the app still runs; only image uploads fail.

### Seeded accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@meridian.test` | `Password123` |
| Agent | `agent@meridian.test` | `Password123` |
| Agent | `agent2@meridian.test` | `Password123` |
| Buyer | `buyer@meridian.test` | `Password123` |

---

## 2. Architecture

Four layers, each with one job:

```
app/          routing + Server Components (UI shell, data fetching)
components/   presentation only — no database imports
actions/      Server Actions: mutations called straight from forms
lib/          business + data logic (auth, queries, validation, blob)
prisma/       schema + seed
types/        types derived from Prisma, never hand-written
middleware.ts edge gate — reads the JWT, never touches the DB
```

The rule that keeps this honest: **only `lib/` and `actions/` import
`prisma`.** A component that needs data receives it as a prop from a Server
Component.

### Folder map

```
app/
├── (auth)/login, register             public auth screens
├── properties/                        search + [id] detail
├── agents/[id]/                       public agent profile
├── favorites/                         saved listings (signed in)
├── dashboard/
│   ├── agent/                         overview, properties/new, [id]/edit,
│   │                                  inquiries, profile
│   └── admin/                         overview, properties, agents, buyers,
│                                      inquiries
└── api/
    ├── auth/{register,login,logout,me}
    ├── properties/            GET (search) · POST
    ├── properties/[id]/       GET · PUT · DELETE
    ├── inquiries/             POST · GET
    ├── admin/dashboard/       GET
    └── upload/                POST (multipart → Vercel Blob)
```

### Why both REST routes and Server Actions?

Route handlers are the public contract — anything a future mobile app or
integration would call (search, detail, create, inquire). Server Actions cover
mutations that only ever fire from a form inside this app (moderation, favourite
toggling, profile edits), where being able to `revalidatePath` in the same
round-trip is worth more than an endpoint.

---

## 3. Data model

`User` is the single identity table with a `role` enum; `AgentProfile` and
`BuyerProfile` hang off it one-to-one and are created in the same transaction as
the user, so a profile can never go missing.

- **Money is `Int`, in whole rupees.** Floats and currency don't mix.
- **Cascade deletes** flow from `User → Property → PropertyImage / Inquiry /
  Favorite`. Removing an agent removes their listings and everything attached.
- **`Favorite` has `@@unique([userId, propertyId])`** — double-clicking the heart
  can't create duplicates.
- **Indexes mirror the filter query**: `[status, cityId, price]`,
  `[status, typeId]`, `[status, isFeatured, createdAt]`.
- **Two independent statuses.** `ListingStatus` is moderation (admin owns it);
  `Availability` is commercial (agent owns it). Conflating them was the obvious
  shortcut and the wrong one.

---

## 4. Authentication and authorization

Three layers, deliberately:

1. **`middleware.ts`** verifies the JWT at the edge and bounces the wrong role
   to `/403`. Fast, but it can only read the token.
2. **`requireRole()`** in every protected page re-reads the user from the
   database — which is how an admin deactivating an agent takes effect
   immediately instead of whenever the 7-day token expires.
3. **`authorize()`** in every route handler, returning 401/403 JSON.

Other details worth knowing:

- Password hashing is bcrypt at 12 rounds.
- The session cookie is `httpOnly`, `sameSite=lax`, `secure` in production.
- `jose` is used rather than `jsonwebtoken` because middleware runs on the Edge
  runtime, where Node's `crypto` isn't available. One library, everywhere.
- Login returns the same message for an unknown email and a wrong password —
  distinct errors let an attacker enumerate registered accounts.
- `role` on registration is limited to `AGENT | BUYER` at the schema level.
  Admins are seeded.

---

## 5. Feature notes

**Search.** The query string *is* the state. Every filter writes to the URL, the
Server Component re-queries, and results are shareable and survive a refresh.
The text box is debounced 350 ms; bedroom/bathroom pickers mean "N or more".

**Moderation.** New and edited listings enter `PENDING`. An agent editing an
approved listing sends it back to review; an admin editing it does not.
Rejection requires a note, and the agent sees that note on their dashboard.

**Inquiries.** The buyer's stored phone number is never attached to an inquiry —
the agent gets name, email, and whatever the buyer chose to type in the
"how should they reach you" field. One inquiry per buyer per listing per hour.

**Images.** Uploaded to Vercel Blob via `/api/upload`, validated for type and a
5 MB ceiling. Deleting a listing removes the DB rows by cascade and then the
blobs; a failed blob delete is logged, never thrown, so it can't break the
request.

**Dark mode.** A blocking inline script in `<head>` applies the stored theme
before first paint — no white flash for dark-mode users.

---

## 6. Testing it by hand

Each flow, in order. All of them work against the seeded data.

**Auth**
1. `/register` → pick "I'm an agent" → the company field appears → submit → you
   land on `/dashboard/agent`.
2. Sign out. Visit `/dashboard/admin` directly → redirected to `/login?next=...`.
3. Sign in as the agent → you're returned to `/dashboard/admin`? No — you get
   `/403`. That's the role check working.
4. Sign in as admin → `/login` redirects you away, because you're already in.

**Agent → listing**
5. Add property with a 3-character title → the field errors before any request.
6. Fill it properly, upload 2 photos, star the second → publish → your dashboard
   shows it as "In review", not in public search.

**Admin → moderation**
7. `/dashboard/admin/properties` → "In review" tab → Reject with no note → the
   action refuses. Add a note → reject.
8. The agent's dashboard now shows the rejection note.
9. Approve it → it appears at `/properties`. Feature it → it appears on `/`.

**Buyer → inquiry**
10. Sign in as buyer → open the listing → send an inquiry → the form flips to a
    confirmation.
11. Send a second one immediately → 429, "you already contacted this agent".
12. The agent's Inquiries tab shows the message with the buyer's email — and no
    phone number.

**Filters**
13. `/properties?city=islamabad&minPrice=10000000&bedrooms=3` → results match,
    the filter panel reflects the URL, and the URL survives a refresh.
14. Filters that match nothing → the empty state offers to clear them.

**Access control on the API**
```bash
# 401 — no session
curl -X POST localhost:3000/api/properties -d '{}' -H 'Content-Type: application/json'

# 403 — buyer trying to create a listing (sign in first, keep the cookie)
curl -c j.txt -X POST localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"buyer@meridian.test","password":"Password123"}'
curl -b j.txt -X POST localhost:3000/api/properties \
  -H 'Content-Type: application/json' -d '{"title":"x"}'

# 200 — public search needs no auth
curl 'localhost:3000/api/properties?city=islamabad&sort=price_asc'
```

**Type safety**
```bash
npm run typecheck   # must pass clean
```

---

## 7. Deploying to Vercel

1. Push to GitHub, import the repo in Vercel.
2. Add all four env vars in **Settings → Environment Variables**.
3. Create a Blob store under **Storage** — Vercel injects
   `BLOB_READ_WRITE_TOKEN` automatically.
4. The build script already runs `prisma generate`. For the first deploy, run
   `npx prisma db push` locally against the production database, then seed.

---

## 8. What's deliberately not here

Honest gaps, so nobody discovers them in a demo:

- **No email delivery.** Inquiries live in the dashboard. Wiring Resend or
  Nodemailer into `POST /api/inquiries` is the natural next step.
- **No password reset.** Needs a token table and an email transport.
- **Rate limiting is per-inquiry only**, enforced with a database check. A real
  deployment wants an IP-level limiter on `/api/auth/login`.
- **Search is `ILIKE`-based.** Fine to a few thousand listings; past that,
  Postgres full-text search or a dedicated index.
- **No automated tests.** Section 6 is a manual script. The seams are set up for
  Vitest on `lib/` and Playwright on the flows.
