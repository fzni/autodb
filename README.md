# AutoDB

> **The Open Vehicle Specification & Database Engine**  
> Modern, community-driven database for road cars, motorsport prototypes, and heavy commercial machines.  
> Live at [autodb.tech](https://autodb.tech) · **Beta**

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Key Features](#key-features)
  - [Top 5 Most Rated Slideshow Hero](#top-5-most-rated-slideshow-hero)
  - [Mobile-First & Clean UI](#mobile-first--clean-ui)
  - [Global Metric (SI) / Imperial Unit Toggle](#global-metric-si--imperial-unit-toggle)
  - [Power & Weight Simulator](#power--weight-simulator)
  - [Aerodynamics & Efficiency Telemetry](#aerodynamics--efficiency-telemetry)
  - [Side-by-Side Comparison Matrix](#side-by-side-comparison-matrix)
  - [Manufacturer Directory](#manufacturer-directory)
  - [Contributor Profiles & Garage Collections](#contributor-profiles--garage-collections)
  - [Spec Revision Proposals](#spec-revision-proposals)
  - [Studio Fast Entry & Bulk Import](#studio-fast-entry--bulk-import)
  - [Technical SEO & JSON-LD](#technical-seo--json-ld)
- [Authentication & Security](#authentication--security)
- [Database Architecture](#database-architecture)
- [Folder Structure](#folder-structure)
- [Environment Configuration](#environment-configuration)
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [API Reference](#api-reference)

---

## Overview

**AutoDB** is an open automotive database designed with clean, human-centered UI patterns inspired by modern platforms. It covers four major automotive domains:

| Domain | Scope & Examples |
|---|---|
| **Road** | Production sports cars, hypercars, hot hatches (Porsche 911 GT3, Rimac Nevera, Honda Civic Type R) |
| **Motorsport** | Formula 1, WEC Hypercars, WRC rally cars (Red Bull RB19, Porsche 963 LMDh, GR Yaris Rally1) |
| **Commercial** | Heavy prime movers, mining haulers, electric delivery vans (Scania R770 V8, Caterpillar 797F) |
| **Concept** | Vision prototypes and technological demonstrators (Mazda Furai) |

---

## Tech Stack

- **Framework:** [Next.js 14.2](https://nextjs.org/) (App Router, Server Components, SSR)
- **Runtime:** Node.js 22+ (using native `node:sqlite` built-in database module)
- **Database:** SQLite with WAL mode (zero-config, stored in `data/autodb.db`)
- **Typography:** [Geist Sans](https://vercel.com/font) + [Geist Mono](https://vercel.com/font) via the official `geist` package
- **Styling:** [Tailwind CSS 3](https://tailwindcss.com/) with light/dark theme variables
- **Icons:** [Lucide React](https://lucide.dev/)
- **Email:** [Nodemailer](https://nodemailer.com/) with dev-mode console fallback
- **Authentication:** Web Crypto API ECDSA P-256 keypairs with HttpOnly session cookies

---

## Key Features

### Top 5 Most Rated Slideshow Hero
- Automatically queries and ranks the **top 5 most rated/upvoted vehicles** from SQLite (`ORDER BY votes_count DESC`).
- **Touch-Swipe Gestures:** Full touch support (`onTouchStart`, `onTouchMove`, `onTouchEnd`) for natural mobile swiping.
- **Responsive Aspect Ratios:** Adapts from `aspect-[4/3]` on mobile (`min-h-[400px]`) up to `aspect-[21/9]` on desktop.
- **Controls & Telemetry:** Features slide indicators, manual arrows, pause-on-hover/touch, "Top Rated" pill with live upvote counter, and quick spec previews.

### Mobile-First & Clean UI
- **Responsive Navbar:**
  - Compact `SI` / `IMP` switcher for mobile viewports.
  - Animated mobile navigation drawer with quick links to Explore, Compare, Brands, and Garage.
- **Adaptive Filter Strip:**
  - Drivetrain and Sort dropdowns arranged side-by-side in a 2-column mobile grid.
  - Horizontal touch-scrolling chips for domain categories and spec presets.
- **Touch-Optimized Targets:** 36–44px minimum tap targets across all action buttons and modals.
- **Responsive Tables:** Wrapped with horizontal scrolling containers (`min-w-[580px]`) so complex tables never crush on small phone screens.

### Global Metric (SI) / Imperial Unit Toggle
- Global switcher persisted in `localStorage`.
- Real-time conversion across the entire app:
  - **Power:** HP ↔ kW
  - **Torque:** Nm ↔ lb-ft
  - **Weight:** kg ↔ lbs
  - **Speed:** km/h ↔ mph
  - **Displacement:** L ↔ cu in
  - **Dimensions:** mm ↔ in

### Power & Weight Simulator
- Located on every vehicle page (`/vehicles/[slug]`).
- Toggle between **Crank HP** and **Estimated Wheel HP** using drivetrain-specific mechanical loss models:
  - **FWD:** ~12% loss
  - **RWD:** ~15% loss
  - **AWD / 4WD / 6x4:** ~20% loss
- Interactive slider to add **driver/fuel ballast** (+kg) and recalculate live HP/ton.

### Aerodynamics & Efficiency Telemetry
- Evaluates downforce (kg) at reference speeds, drag coefficient ($C_d$), and frontal area ($m^2$).
- Computes the aerodynamic **Lift-to-Drag ($L/D$) ratio** when telemetry is available.
- Displays verified source citations with outbound badges.

### Side-by-Side Comparison Matrix
- Compare up to 3 vehicles at `/compare`.
- **URL Synchronization:** Selected vehicles are automatically synced to query parameters (`/compare?v=porsche-911-gt3-992,rimac-nevera`).
- **Differences Only Toggle:** Hides identical attributes to highlight differentiators.
- **Winner Highlights:** Automatically calculates and marks category-winning numbers with green accents.

### Manufacturer Directory
- Located at `/brands`.
- Groups vehicles by manufacturer/marque with vehicle counts, domain tags, and search filtering.
- Engine architecture and layout pills (e.g., `Rear-Mid, Longitudinal`, `Front, Transverse`) link directly to filtered searches.

### Contributor Profiles & Garage Collections
- Contributor profiles at `/u/[handle]`.
- Displays public key fingerprint, verified status, submitted machines, and total received upvotes.
- **Garage Collections:** Key-authenticated members can create custom bookmark lists (e.g., "Track Day Weapons", "Dream V10s") and save vehicles.

### Spec Revision Proposals & Contributor Attribution
- **Proposing Spec Corrections:** Any authenticated member can propose field corrections (e.g. horsepower, curb weight, aerodynamic drag, summary, or source citations) directly from vehicle dossiers (`/vehicles/[slug]`).
- **Live Admin Notification & Queue:**
  - Administrators are instantly alerted with a live pending proposals badge in both the top navigation bar and `/studio`.
  - The `/studio` dashboard features a dedicated **Proposed Spec Edits** tab displaying pending proposals along with vehicle thumbnails, proposer handles, timestamps, and change summaries.
- **Admin Value Adjustment & Moderation:**
  - Before approving, administrators can fine-tune or override the proposed value directly within an editable input field.
  - One-click approval updates the live vehicle telemetry and permanently records the revision.
- **Permanent Contributor Credits & Revision History:**
  - Approved contributors are automatically appended to the vehicle's `contributors` list and recorded as `last_edited_by`.
  - The vehicle dossier page visibly credits all contributors under the vehicle title with clickable profile links (`/u/[handle]`).
  - A dedicated **Contributors & Spec History** card displays the full audit log of approved spec adjustments, including proposer attribution, values changed, and reviewer sign-off stamps.

### Studio Fast Entry & Bulk Import
- Dedicated administration workspace at `/studio`.
- **Paste Spec JSON:** One-click drawer that parses vehicle JSON and auto-populates all form inputs.
- **Bulk JSON Import:** Uploads an array of vehicles, validates schemas, skips duplicate slugs, and reports import summaries.
- Local image uploader writing to `/public/uploads/vehicles/`.

### Technical SEO & JSON-LD
- Configured with `metadataBase: new URL('https://autodb.tech')`.
- Dynamic OpenGraph and Twitter card metadata on `/vehicles/[slug]`, `/brands`, and `/u/[handle]`.
- Schema.org structured data (`Vehicle` and `BreadcrumbList` JSON-LD) embedded on vehicle pages.
- Dynamic `/sitemap.xml` and `/robots.txt` generation.

---

## Authentication & Security

AutoDB features a **cryptographic keypair identity system**:

1. **Registration:** Generates an ECDSA P-256 keypair via the browser's Web Crypto API. The user receives a unique `secp256r1-priv-...` Secret Key.
2. **Authentication:** Server issues a cryptographic challenge nonce; client signs the nonce with the private key (or verifies via secret key hash).
3. **Session:** Authenticated sessions are held in secure, `HttpOnly`, `SameSite=Lax` cookies.
4. **Layered Email Verification:**
   - Members can attach an email address to their public key identity.
   - Generates a 6-digit verification code and magic link (`/api/auth/verify-email?token=...`).
   - If SMTP is unconfigured, codes log to the server console and auto-fill in development mode.
   - Verified accounts receive a **Verified Contributor** badge.

---

## Database Architecture

AutoDB uses **SQLite** through Node 22's native `node:sqlite` module with WAL (Write-Ahead Logging) enabled.

### Tables

- `vehicles`: Core catalog records, powertrain, chassis, dimensions, aerodynamics, and source citations.
- `users`: User profiles, public keys, roles (`admin` | `user`), email, and verification status.
- `votes`: Unique vehicle upvotes (`UNIQUE(vehicle_slug, voter_id)`).
- `comments`: Community discussion comments.
- `collections`: User-created garage bookmark lists.
- `collection_items`: Vehicles saved inside collections.
- `spec_revisions`: Proposed spec edits awaiting creator/admin review.

Migrations run safely on startup using non-destructive `CREATE TABLE IF NOT EXISTS` and `ALTER TABLE` statements.

---

## Folder Structure

```
adb/
├── app/                              # Next.js App Router
│   ├── api/                          # REST API Endpoints
│   │   ├── auth/                     # Key auth & email verification
│   │   ├── collections/              # Garage lists CRUD
│   │   ├── revisions/                # Spec proposals review
│   │   ├── upload/                   # Local image uploads
│   │   └── vehicles/                 # Vehicles, comments, voting, bulk import
│   ├── brands/                       # Brand directory page
│   ├── compare/                      # Side-by-side comparison page
│   ├── studio/                       # Admin vehicle studio & bulk importer
│   ├── u/[handle]/                   # Contributor profile & garage
│   ├── vehicles/[slug]/              # Vehicle dossier page
│   ├── globals.css                   # Global Tailwind CSS styles & animations
│   ├── layout.tsx                    # Root layout with Geist font providers
│   ├── page.tsx                      # Fleet explorer homepage
│   ├── robots.ts                     # Dynamic robots.txt
│   └── sitemap.ts                    # Dynamic sitemap.xml
├── components/                       # Client & UI Components
│   ├── BrandsClient.tsx              # Brand directory client
│   ├── CompareClient.tsx             # Compare matrix client
│   ├── Footer.tsx                    # Global footer with Discord integration
│   ├── HomeExplorerClient.tsx        # Top 5 slideshow & fleet explorer
│   ├── KeyAuthModal.tsx              # Cryptographic sign-in / signup modal
│   ├── Navbar.tsx                    # Header with responsive mobile menu
│   ├── StudioClient.tsx              # Studio fast entry & bulk JSON importer
│   ├── UserProfileClient.tsx         # Contributor profile & revision manager
│   ├── VehicleCard.tsx               # Vehicle card with lift animation
│   └── VehicleDossierClient.tsx      # Vehicle dossier & simulator client
├── data/
│   └── autodb.db                     # SQLite database file
├── lib/
│   ├── auth.ts                       # Server-side auth & session utilities
│   ├── db.ts                         # SQLite schema, queries, and migrations
│   ├── email.ts                      # Nodemailer SMTP & dev-mode email service
│   ├── types.ts                      # TypeScript schemas
│   └── units.ts                      # Metric ↔ Imperial conversion engine
├── public/
│   └── uploads/vehicles/             # Local vehicle hero images
├── tailwind.config.ts                # Tailwind configuration with Geist fonts
└── tsconfig.json                     # TypeScript configuration
```

---

## Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Optional Custom Port (default: 3000)
PORT=3000

# Canonical Site URL
NEXT_PUBLIC_SITE_URL=https://autodb.tech

# Community Discord Server URL
NEXT_PUBLIC_DISCORD_URL=https://discord.gg/autodb

# SMTP Email Configuration (Optional - logs to terminal if omitted)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=AutoDB Verification <noreply@autodb.tech>
```

---

## Local Development

### Prerequisites
- **Node.js 22.5.0 or higher** (required for `node:sqlite`)

### Setup Commands

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# 3. Open in browser
# http://localhost:3000
```

### Production Build

```bash
# Build the production bundle
npm run build

# Start the production server
npm start
```

---

## Production Deployment

### Linux Server (Ubuntu/Debian VPS)

1. **Install Node.js 22+**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Clone & Setup**:
   ```bash
   git clone https://github.com/your-username/autodb.git /var/www/autodb
   cd /var/www/autodb
   npm install
   cp .env.example .env.local
   # Edit .env.local with your settings
   npm run build
   ```

3. **Process Management (PM2)**:
   ```bash
   sudo npm install -g pm2
   pm2 start npm --name "autodb" -- start
   pm2 save
   pm2 startup
   ```

4. **Nginx Reverse Proxy**:
   ```nginx
   server {
       server_name autodb.tech www.autodb.tech;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

5. **SSL Certificate (Certbot)**:
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d autodb.tech -d www.autodb.tech
   ```

---

## API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/vehicles` | `GET` | List vehicles with filters (query, domain, drivetrain, sort) |
| `/api/vehicles` | `POST` | Create a new vehicle (admin only) |
| `/api/vehicles/bulk` | `POST` | Bulk JSON vehicle import (admin only) |
| `/api/vehicles/[slug]` | `GET` | Get single vehicle dossier |
| `/api/vehicles/[slug]` | `PUT` | Update vehicle specs (admin only) |
| `/api/vehicles/[slug]` | `DELETE` | Delete vehicle (admin only) |
| `/api/vehicles/[slug]/vote` | `POST` | Toggle upvote on vehicle (authenticated) |
| `/api/vehicles/[slug]/comments` | `GET`, `POST` | Retrieve or post comments (authenticated) |
| `/api/vehicles/[slug]/revisions` | `POST` | Submit spec edit proposal (authenticated) |
| `/api/revisions/[id]/review` | `POST` | Approve or reject proposal (creator/admin) |
| `/api/collections` | `GET`, `POST` | Retrieve or create garage collections |
| `/api/collections/[id]` | `DELETE` | Delete garage collection |
| `/api/collections/[id]/items` | `POST`, `DELETE` | Add or remove vehicle from collection |
| `/api/auth/register` | `POST` | Register handle and create key |
| `/api/auth/login` | `POST` | Sign in with private key |
| `/api/auth/logout` | `POST` | Invalidate session cookie |
| `/api/auth/send-verification` | `POST` | Request email verification code |
| `/api/auth/verify-code` | `POST` | Verify 6-digit email code |
| `/api/auth/verify-email` | `GET` | Verify email via magic link |
| `/api/upload` | `POST` | Upload hero image (admin only) |
| `/api/health` | `GET` | System health check and database statistics |

---

## License

MIT © [AutoDB](https://autodb.tech)
