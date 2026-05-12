# Plan: Deeper localization, live maps, tracking, penalties, KYC

## 1. Full localization (worker side)

**Problem:** After switching languages, gig titles, company names, locations, and map labels stay English.

- Extend `src/i18n/worker.ts`:
  - Add a `tr(text, lang)` helper that looks up dynamic strings (gig titles, company names, locations, task notes) in a per-language dictionary keyed by the original English string. Falls back to original if not found.
  - Pre-translate all seed gig titles / company names / locations / notes for hi, te, ta, kn, mr, bn (transliteration where appropriate, e.g. "BlueCart Logistics" → "ब्लूकार्ट लॉजिस्टिक्स").
  - When a company posts a new gig, store an optional `translations` map keyed by lang on the gig (English by default; translation generated lazily by reusing dictionary fallback).
- In `src/pages/Worker.tsx`, render `tr(g.title, lang)`, `tr(g.companyName, lang)`, `tr(g.location, lang)` everywhere a gig is shown (cards, sheet, accepted list).
- Map labels: switch tile URL based on lang. Use Carto Voyager localized variants where available; for Indic languages, switch to OSM "humanitarian" or use a `lang` query workaround (Carto only ships en/es/de/fr). For unsupported langs, overlay a translated location pill near the gig marker instead of relying on tile labels.

## 2. Map API with directions + live ETA

- Use **OSRM public demo** (no key needed) for routing — POST `https://router.project-osrm.org/route/v1/driving/{lng1},{lat1};{lng2},{lat2}?overview=full&geometries=geojson`.
- New component `src/components/RouteMap.tsx`:
  - Renders SatelliteMap base + a `<Polyline>` of the returned route.
  - Shows live ETA + distance pulled from OSRM `duration`/`distance`.
  - Simulates "live" by re-querying every 15s and animating the worker marker along the polyline (since we have no real GPS). ETA decreases over time.
- Triggered when a worker opens a gig sheet → "Get directions" button swaps the worker map view for the route view.

## 3. Gig end time (companies)

- Extend `Gig` in `src/store/gigStore.ts` with `dailyEndTime: string` (free text like "10:00 PM").
- Add Field in `NewTicketDialog` (`src/pages/Company.tsx`) and a default ("10:00 PM").
- Display start–end on Company gig cards and in Worker gig cards/sheet (translated label).

## 4. Responsive routing

- Landing/home (`/`) must render at any size — keep current layout, just verify breakpoints.
- After role pick:
  - `/worker` and `/login/worker` → force a max-width mobile frame on desktop. Wrap content in `<div class="mx-auto w-full max-w-[440px] min-h-screen">` plus a subtle desktop-only side scaffold so it reads as a phone preview on PC.
  - `/company` and `/login/company` → already responsive, leave as is.

## 5. Live worker tracking (company portal)

- Add `workerPositions` to `gigStore`: `Record<gigId, { workerId; lat; lng; etaMin; updatedAt }[]>`.
- Add a tick in `Company.tsx` (setInterval 5s) that, for each accepted gig, walks each tracked worker's lat/lng a small step toward `gig.lat/lng` and recomputes ETA.
- New "Live tracking" panel on each Company gig card: mini SatelliteMap with worker dots + ETA chips, opens a full-screen tracking sheet on click.
- When a worker accepts a gig in `Worker.tsx`, seed a position at `workerLocation` for that gig.

## 6. Cancellation penalty + payout reallocation

- Add to `gigStore`:
  - `cancelGig(gigId, dates)` → removes worker's acceptance, marks penalty.
  - `penalties: { workerId; amount; owedToGigId }[]`.
  - When applied, on next `acceptGig`, deduct `penalty.amount` from displayed worker pay and add a "credited back to {previousCompany}" note.
- Worker sheet gets a "Cancel commitment" button when already accepted; warns about the penalty (10% of remaining day pay) before confirming.
- Company's gig card shows a small badge "₹X reclaimed from cancellation" when applicable.

## 7. Worker KYC for payouts

- New page `src/pages/WorkerKyc.tsx` (mobile-framed): collects full name, Aadhaar (12-digit, mask shown), PAN (regex AAAAA9999A), bank account #, IFSC, UPI ID (optional). Validate with zod.
- Store in `gigStore.kyc: { status: "none" | "pending" | "verified"; ... }` (client-only mock — no real backend yet).
- Worker portal header: small "KYC: Verified ✓" / "Complete KYC" pill linking to `/worker/kyc`. Block "Accept" on gigs until KYC is at least "pending"; show toast prompting completion.
- Company side: in the Live tickets card, show each accepted worker's KYC status — companies can only release payment to verified workers. Add a "Pay workers" action that lists verified workers + amounts (mock — toast confirms "Payout queued").

## Files to add
- `src/components/RouteMap.tsx`
- `src/pages/WorkerKyc.tsx`

## Files to edit
- `src/i18n/worker.ts` — dictionary + `tr()` helper
- `src/store/gigStore.ts` — `dailyEndTime`, positions, penalties, KYC, cancel/pay actions
- `src/pages/Company.tsx` — end time field, live tracking panel, payout action, penalty badge
- `src/pages/Worker.tsx` — translated dynamic text, directions button, cancel flow, KYC gate, mobile frame
- `src/pages/WorkerLogin.tsx` + `src/pages/CompanyLogin.tsx` — mobile frame for worker only
- `src/App.tsx` — `/worker/kyc` route

## Notes / trade-offs
- OSRM demo server is rate-limited; fine for a prototype but we'll cache the route per gig and only refresh ETA every 15s.
- "Live" worker movement is simulated — real GPS would need geolocation + a backend (Lovable Cloud) which we can add later.
- KYC + payouts are mocked client-side. Real KYC/UPI payouts need a payment provider and Lovable Cloud; flag this to the user before going live.
