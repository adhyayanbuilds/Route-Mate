# RouteMate

A polished, production-ready companion app for delivery professionals (Swiggy, Zomato, Blinkit, Amazon Flex, etc.).  
Find washrooms, budget meals, drinking water, fuel stations, repair shops, hospitals, rest stops, and parking — all sorted by live GPS distance.

---

## Features

- **8 essential service categories** — fetched live from OpenStreetMap via Overpass API
- **Live weather & heat index** — Open-Meteo API with ride-condition advice
- **Daily delivery log** — track deliveries, earnings, distance, and hours per day
- **Favorites** — save any place, searchable and filterable by category
- **Interactive map** — Leaflet with dark theme, category filters, and one-tap Google Maps directions
- **Authentication** — Supabase email/password with protected routes
- **Settings** — search radius, units, notification preferences (persisted to DB)
- **Fully responsive** — optimised from 320 px mobile to desktop

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Bundler | Vite 5 |
| Styling | Tailwind CSS 3 |
| Routing | React Router v6 |
| Backend / Auth / DB | Supabase (PostgreSQL + Row Level Security) |
| Map | Leaflet + react-leaflet |
| Icons | Lucide React |
| Weather | Open-Meteo (free, no API key needed) |
| Geocoding | Nominatim / OpenStreetMap (free, no API key needed) |
| POI data | Overpass API / OpenStreetMap (free, no API key needed) |

---

## Prerequisites

- **Node.js 18+** and **npm 9+**
- A **Supabase** account and project (free tier is fine) — [supabase.com](https://supabase.com)

---

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/routemate.git
cd routemate
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Once provisioned, go to **Project Settings → API**.
3. Copy your **Project URL** and **anon/public key**.

### 4. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Run the database migrations

The `supabase/migrations/` folder contains all the SQL needed to set up the schema.  
Run them in order in the Supabase **SQL Editor** (Dashboard → SQL Editor → New query):

**Migration 1** — `supabase/migrations/20260628032927_create_routemate_schema.sql`  
Creates the `profiles`, `delivery_logs`, and `favorites` tables with full RLS policies.

**Migration 2** — `supabase/migrations/20260628040844_add_profiles_meta_column.sql`  
Adds the `meta` JSONB column to `profiles` for settings persistence.

You can also run them with the Supabase CLI if you have it set up:

```bash
npx supabase db push
```

### 6. Start the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Database Schema

### `profiles`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | References `auth.users(id)` |
| `full_name` | text | |
| `vehicle_type` | text | Default: `'bike'` |
| `city` | text | |
| `avatar_url` | text | |
| `phone` | text | |
| `meta` | jsonb | User settings (notifications, radius, units) |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### `delivery_logs`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid FK | References `auth.users(id)` |
| `log_date` | date | Unique per user per day |
| `deliveries` | int | |
| `earnings` | numeric(10,2) | |
| `distance_km` | numeric(8,2) | |
| `hours_worked` | numeric(5,2) | |
| `notes` | text | |
| `created_at` | timestamptz | |

### `favorites`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid FK | References `auth.users(id)` |
| `category` | text | e.g. `'washrooms'`, `'meals'` |
| `name` | text | Place name |
| `lat` / `lng` | numeric | Coordinates |
| `address` | text | |
| `meta` | jsonb | Tags, extra data |
| `created_at` | timestamptz | |

All tables have **Row Level Security** enabled. Users can only read and write their own rows.

---

## Project Structure

```
routemate/
├── public/
│   └── favicon.svg
├── src/
│   ├── App.tsx                    # Routes + lazy loading
│   ├── main.tsx
│   ├── index.css                  # Design system (tokens, components, keyframes)
│   ├── vite-env.d.ts
│   ├── components/
│   │   ├── layout/
│   │   │   └── AppLayout.tsx      # Sidebar (desktop) + bottom nav (mobile)
│   │   ├── map/
│   │   │   └── RouteMap.tsx       # Leaflet map with dark theme
│   │   └── ui/
│   │       ├── EmptyState.tsx
│   │       ├── PageHeader.tsx
│   │       ├── Skeleton.tsx
│   │       └── Spinner.tsx
│   ├── context/
│   │   └── AuthContext.tsx        # Supabase auth state
│   ├── hooks/
│   │   └── useGeolocation.ts
│   ├── lib/
│   │   ├── categories.ts          # Service category metadata
│   │   ├── geo.ts                 # Overpass API + distance utils
│   │   ├── supabase.ts            # Supabase client
│   │   └── weather.ts             # Open-Meteo + Nominatim
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── MapPage.tsx
│   │   ├── WeatherPage.tsx
│   │   ├── ServiceCategoryPage.tsx
│   │   ├── FavoritesPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── SettingsPage.tsx
│   │   └── auth/
│   │       ├── LoginPage.tsx
│   │       ├── SignUpPage.tsx
│   │       └── ForgotPasswordPage.tsx
│   └── types/
│       └── index.ts
├── supabase/
│   └── migrations/
│       ├── 20260628032927_create_routemate_schema.sql
│       └── 20260628040844_add_profiles_meta_column.sql
├── .env.example
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server at localhost:5173 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type check (no emit) |

---

## Deployment

This is a standard Vite + React SPA. It can be deployed anywhere that serves static files.

### Vercel (recommended)

1. Push this repo to GitHub.
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. Vercel auto-detects Vite. No build settings needed.
4. Add environment variables in **Settings → Environment Variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy.

### Netlify

1. Push to GitHub and import at [app.netlify.com](https://app.netlify.com).
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add the two environment variables under **Site settings → Environment variables**.
5. Add a `_redirects` file inside `public/` for SPA routing:

```
/*  /index.html  200
```

### Cloudflare Pages

1. Import the repo in Cloudflare Pages.
2. Build command: `npm run build`, output: `dist`.
3. Add environment variables in the Pages dashboard.

> **Important:** After deploying, go to your Supabase project → **Authentication → URL Configuration** and add your production URL to the **Allowed redirect URLs** list.

---

## Supabase Auth Configuration

In the Supabase Dashboard → **Authentication → Settings**:

- **Site URL** — set to your production domain (e.g. `https://routemate.vercel.app`)
- **Email confirmations** — can be left **off** for development; enable for production if you want email verification
- **Password minimum length** — set to 6 (or higher)

---

## External APIs Used

All three external APIs are **free** and require **no API key**:

| API | Usage | Rate limits |
|-----|-------|-------------|
| [Open-Meteo](https://open-meteo.com) | Weather & heat index | 10 000 req/day free |
| [Overpass API](https://overpass-api.de) | Nearby POIs via OpenStreetMap | Fair use |
| [Nominatim](https://nominatim.org) | Reverse geocoding (city name) | 1 req/sec, `User-Agent` required |

The app already sets a valid `User-Agent` header on Nominatim requests as per their usage policy.

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## License

MIT — free to use, modify, and distribute.
