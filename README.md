# GroundForce — Worker App + Company Portal

A two-sided, mobile-first prototype of **GroundForce**, the direct-hire marketplace
for ground-operations manpower (warehousing, e-commerce fulfilment, events,
short-haul delivery). It removes the labour-contractor middleman: companies post
gigs directly and verified workers accept them with one tap.

Built on the product's real stack:

> **React 18 + Vite + TypeScript + Tailwind**, Zustand state, React Router,
> Leaflet satellite maps, OSRM driving routes, a deep 7-language worker layer —
> and a **shared realtime mock backend** so the two apps stay in lock-step.

Everything is mocked in-app (persisted to `localStorage`, synced across tabs).
No accounts, no cloud, no keys — it runs entirely on the dev server.

---

## Run it

You need **Node.js 18+** (which includes `npm`). Get it from <https://nodejs.org>.

```bash
# from inside this folder
npm install
npm run dev
```

Open the URL it prints (default <http://localhost:5173>):

| Route | What |
| --- | --- |
| `/` | Landing — choose Worker App or Company Portal |
| `/worker` | **Worker App** (phone-frame UI, 7 languages) |
| `/company` | **Company Portal** (desktop + mobile dashboard) |

Other scripts:

```bash
npm run build     # type-check + production build into dist/
npm run preview   # preview the production build
```

> **Maps & routes need internet.** Satellite tiles (Esri), label tiles (CARTO),
> and driving directions (public OSRM router) are fetched live. Offline, the map
> frame still loads and routing falls back to a straight-line ETA estimate.

---

## The realtime demo (the fun part)

Open the app in **two browser tabs** — `/company` in one, `/worker` in the other:

1. In the **Company Portal → Gigs → Post a gig**, drop a pin on the map and publish.
2. Switch to the **Worker App** — the new gig appears at the top of *Nearby gigs*.
3. **Accept** it (one tap). Back on the portal, the gig's slot count ticks up and
   the worker shows under **Live tracking**.
4. In the worker's **Live tracking → I'm on the way**, watch the dot move and the
   ETA count down — the portal's fleet map moves in lock-step (throttled ~every 3s,
   like the product's 4s GPS throttle).
5. **Chat** flows both ways, scoped to that one gig.
6. **Cancel** mid-shift → a 10% penalty is *reclaimed to the company* (badge on the
   gig) and deducted from the worker's next gig.
7. Complete **KYC** on the worker side → the portal can then **release the payout**
   (payment is blocked for unverified workers).

State lives in `localStorage` and is broadcast over a `BroadcastChannel`, so both
tabs — even both apps in the same browser — see every change. Use **Reset demo**
in the portal to reseed.

---

## Architecture

```
src/
  main.tsx                 router: / , /worker , /company/*
  Landing.tsx              two-sided entry page

  backend/                 the shared "cloud" (stands in for Supabase)
    types.ts               DB row types — models the SRS §7 tables
    seed.ts                initial world (DHL company, workers, gigs, a past gig)
    store.ts               in-memory DB + localStorage + BroadcastChannel realtime
    api.ts                 write-side domain actions + live simulation tick()
    selectors.ts           read-side projections (worker view / company view)

  store/gigStore.ts        Worker store — a live projection over the backend
                           (same public API as before → worker UI unchanged)
  App.tsx  components/  screens/  i18n/  lib/     ← Worker App (existing)

  company/                 Company Portal
    companyStore.ts        company store — projection over the same backend
    CompanyApp.tsx         login gate + routes
    CompanyShell.tsx       sidebar / mobile nav + sim ticker
    ui.tsx                 badges, KYC pills, stats
    components/            PostGigModal (map-pin picker), CompanyGigCard
    screens/               Dashboard, Gigs, GigDetail, Reports (CSV export)
```

**How the two apps share one truth:** every action (`acceptGig`, `postGig`,
`sendMessage`, `tick`, …) goes through `backend/store.ts → mutate()`, which writes
the DB, persists it, and broadcasts. Both stores subscribe and re-project, so a
write in either app — or another tab — updates everywhere.

Swapping in real **Supabase/Lovable Cloud** later means reimplementing
`backend/store.ts` + `api.ts` against Postgres/Realtime; the projections and both
UIs stay the same.

---

## Coverage vs the SRS

| Requirement | Where |
| --- | --- |
| Direct posting + one-tap accept, live slot counts | `company/.../PostGigModal`, `screens/NearbyGigs`, `GigCard` |
| Gig lifecycle (Open → Filled → In Progress → Closed) | `backend/selectors` (`displayStatus`) |
| Live GPS tracking + ETA, both sides | `backend/api` (`tick`), `MiniMap`, `TrackingSheet`, `GigDetail` |
| OSRM driving route + live ETA | `lib/geo` (`fetchRoute`) |
| Per-gig chat (both directions, isolated) | `ChatSheet`, `GigDetail` chat panel |
| Cancellation penalty → company reclaim | `backend/api` (`cancelGig`) |
| KYC capture + KYC-gated payouts | `KycSheet`, `GigDetail` payout controls |
| 7-language worker app incl. dynamic content | `i18n/` (`tr`, `trDyn`) |
| Live company dashboard + reports/CSV | `company/screens/Dashboard`, `Reports` |
| Phone-frame worker UI on any device | `components/PhoneFrame` |

### Worker-app languages

English, हिन्दी, తెలుగు, தமிழ், ಕನ್ನಡ, मराठी, বাংলা. English / Hindi / Telugu are
fully translated (UI **and** dynamic content); the rest cover high-traffic strings
with English fallback. Switch from the header globe or **Profile → App language**.

---

*Prototype only — mocked data & realtime, no real payments or identity verification.*
