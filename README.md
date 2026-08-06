# Harvest Connect

A community map of local food banks, pantries, and free harvesting sites.
Built for neighbors helping neighbors — no signup, no paywall, no tracking.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **react-leaflet** + **OpenStreetMap** tiles (no API key, no quota)
- Seed data lives in `lib/data.ts` (a plain JSON-able file)

## Pages

- `/` — Hero, stats, "what you'll find", CTA to add a site
- `/map` — Interactive Leaflet map. Filter by food bank vs. harvest site. Click a pin for hours, contact, and directions.
- `/about` — Mission and principles
- `/contact` — Form to add a site or get in touch (opens user's mail client)
- `/api/sites` — JSON endpoint serving the site directory

## Running locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Replacing the seed data

Edit `lib/data.ts`. Each entry has: `id`, `name`, `type` (`food-bank` | `harvest`), `address`, `city`, `state`, `zip`, `lat`, `lng`, `phone`, `email`, `hours`, `description`, `resources[]`.

When you're ready to move to a real database, swap the import in `app/api/sites/route.ts` for a query.

## Notes

- The map is intentionally built on OpenStreetMap + Leaflet so it stays free and open.
- Default Leaflet marker icons are replaced with custom `DivIcon` markers (green for food banks, gold for harvest sites) so they show up correctly under Next.js bundling.
