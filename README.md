# automai Portfolio (React + Vite + Tailwind)

A modern, multilingual single-page site with animated sections, language-aware routing, and MDX-backed project pages.

## Tech Stack
- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3 (+ Typography plugin)
- framer-motion (animations)
- lucide-react (icons)
- react-intersection-observer (in-view animations)
- react-router-dom (routing with language prefixes)
- MDX via @mdx-js (content pages)

## Quickstart

1) Install dependencies (project root)
```bash
npm install
```

2) Start the backend API (Terminal A)
```bash
export OPENAI_API_KEY="your-openai-api-key"   # macOS/Linux example
npm run server
```
Health check: `curl http://localhost:3001/api/health`

3) Start the frontend (Terminal B)
```bash
npm run dev
```

Open the app at:
- Home (redirects): http://localhost:5173/
- Dutch home: http://localhost:5173/nl
- English home: http://localhost:5173/en

4) Build & preview production
```bash
npm run build
npm run preview
```

## Features

- Multilingual (Dutch default) with instant toggle
  - Implemented with `react-i18next` in `frontend/src/i18n/I18nProvider.tsx`
  - UI strings live in `frontend/src/i18n/translations.json`
  - Language preference persisted to `localStorage`

- Language-aware routing
  - Home: `/:lang` (e.g., `/nl`, `/en`)
  - Project page: `/:lang/project/:slug`
  - Root `/` redirects to `/nl`

- MDX-backed portfolio and project pages
  - Content stored in `frontend/src/content/{nl,en}/<slug>.mdx`
  - Portfolio cards now read title/description/tags from MDX frontmatter (per locale)
  - MDX files loaded dynamically with `import.meta.glob`
  - Global MDX styling via `MDXProvider` + Tailwind Typography
  - Reusable MDX components: `ProjectLayout`, `Callout`

- Modern UI/UX
  - Responsive, dark theme, gradient headings, animated sections
  - Smooth scroll and active-section highlight

## Authoring Content (MDX)

Create or edit project pages per language using MDX.

1) Create MDX files per language
   - Dutch: `frontend/src/content/nl/<slug>.mdx`
   - English: `frontend/src/content/en/<slug>.mdx`

2) Add frontmatter for portfolio cards (title, description, tags)
   ```mdx
   ---
   title: "Geautomatiseerd Voorraadbeheer"
   description: "Realtime synchronisatie tussen verkoopkanalen en magazijnvoorraad."
   tags: ["E-commerce", "API-integratie", "Realtime"]
   ---
   <ProjectLayout
     title="Geautomatiseerd Voorraadbeheer"
     subtitle="Realtime synchronisatie tussen verkoopkanalen en magazijnvoorraad"
     tags={["E-commerce", "API-integratie", "Realtime"]}
     heroImageUrl="https://images.unsplash.com/photo-..."
   >
   ...
   </ProjectLayout>
   ```

3) Use the provided MDX components without imports
   - `ProjectLayout`: renders a hero-like header + tags + content area
   - `Callout`: brand-styled callout block (`info | success | warning | danger`)

Example MDX:
```mdx
<ProjectLayout
  title="Geautomatiseerd Voorraadbeheer"
  subtitle="Realtime synchronisatie tussen verkoopkanalen en magazijnvoorraad"
  tags={["E-commerce", "API-integratie", "Realtime"]}
  heroImageUrl="https://images.unsplash.com/photo-..."
>

Introductie van het project...

<Callout type="warning" title="Belangrijk knelpunt">
Parallelle verkopen veroorzaakten inconsistenties binnen minuten.
</Callout>

## Oplossing
Tekst en code…

```ts
// Voorbeeld code
```

</ProjectLayout>
```

## Structure

- `frontend/`
  - `index.html`
  - `public/`
  - `src/`
    - `components/`
      - `Header`, `HeroSection`, `PortfolioSection`, `AboutSection`, `ContactSection`, `Footer`, `AnimatedSection`
      - `mdx/ProjectLayout.tsx`, `mdx/Callout.tsx`
    - `pages/ProjectPage.tsx` — MDX loader + provider + page chrome
    - `content/{nl,en}/` — MDX project pages per language (with frontmatter for cards)
    - `i18n/` — `translations.json` and provider (react-i18next)
    - `index.css` — Tailwind + custom utilities (grid background, blob animation, delays)
  - `postcss.config.js`
- `server/`
  - `server.mjs` — Express API (`/api/chat`, `/api/health`, `/api/reindex`)
  - `knowledgeIndexer.mjs` — builds search index from `frontend/src/...`; prefers MDX frontmatter for title/description/tags
  - `Dockerfile` — Cloud Run container for the backend
- `tailwind.config.ts` — Tailwind + Typography plugin, dark prose tuning (supports new structure)
- `vite.config.ts` — configured to use `frontend/` as Vite root and proxy `/api` to `http://localhost:3001`
- `tsconfig.json` — includes both `frontend/src` and legacy `src` (for transition)

## Scripts

- `npm run dev` — start Vite dev server
- `npm run build` — type-check + build for production
- `npm run preview` — preview the production build

## i18n (react-i18next)

- Provider: `frontend/src/i18n/I18nProvider.tsx`
- Resources: `frontend/src/i18n/translations.json`
- Usage in components:
  - `const { t, lang, setLang } = useI18n()`
  - `t('nav.portfolio')`
- Language persisted in `localStorage` and `<html lang>` is kept in sync.

## Scrolling and Navigation

- The homepage uses an internal scroll container (`#scroll-container`) with snap sections.
- The header and scroll dots offset the fixed header height; intersections are tuned for accurate section highlighting.
- Project pages have their own scroll container (`h-screen overflow-y-auto pt-20`) so layout remains consistent.
- Navigating from a project page to a section on the homepage smoothly navigates to `/:lang` and scrolls to the target section.

## Production Config

- The chatbot widget calls the backend at `/api/chat` in development via the Vite proxy.
- In production, set `VITE_API_BASE` to your API base URL (e.g., `https://api.example.com`) so the widget calls `${VITE_API_BASE}/chat`.
- Backend uses `OPENAI_API_KEY` (server-side only). Never expose this key in the browser.

## AWS Deployment

This project splits into a static frontend (S3/CloudFront) and a serverless backend (API Gateway + Lambda) for the chat/LLM API.

### Frontend: S3 + CloudFront

1) Build the app
   ```bash
   npm run build
   ```
   This produces the static site in `dist/`.

2) Create an S3 bucket (e.g., `my-portfolio-site`) and enable static website hosting (or use CloudFront default root object).

3) Upload `dist/` to S3 (via AWS CLI or console)
   ```bash
   aws s3 sync dist/ s3://my-portfolio-site --delete
   ```

4) Put CloudFront in front of S3 for HTTPS and caching
   - Origin: the S3 bucket (static website endpoint or S3 origin)
   - Default Root Object: `index.html`
   - Error Responses (for SPA routing): map 403/404 to `/index.html` with 200 status
   - Custom domain and certificate (ACM) as needed

### Backend: API Gateway + Lambda (Node)

You can adapt `server/server.mjs` for Lambda. Two options:

- Simple adapter (recommended): use `@vendia/serverless-express` to wrap the existing Express app.
- Native Lambda handler: extract the chat logic to a `handler.mjs` and map API Gateway routes to the handler.

Minimal outline using `@vendia/serverless-express`:

```js
// lambda.js
import serverlessExpress from '@vendia/serverless-express';
import app from './express-app.mjs'; // export the Express app from server/server.mjs after refactor

export const handler = serverlessExpress({ app });
```

Environment variables:
- `OPENAI_API_KEY`: stored in Lambda env vars or AWS Secrets Manager

API Gateway:
- Create a REST/HTTP API that routes `POST /chat` to the Lambda handler
- Enable CORS to allow your CloudFront domain (e.g., `https://www.example.com`)
- Optional: add `POST /reindex` for content refresh

### Frontend → Backend connection (production)

Set `VITE_API_BASE` in your frontend build environment to the deployed API base:

```bash
export VITE_API_BASE="https://api.example.com"
npm run build
```

Deploy the resulting `dist/` to S3. The chat widget will call `${VITE_API_BASE}/chat` in production and `/api/chat` in local dev.

### CORS

On API Gateway (or Lambda if returning manually):
- Allow `Access-Control-Allow-Origin: https://your-frontend-domain`
- Allow `POST` and `OPTIONS` methods
- Allow `Content-Type` header

### Google Cloud Deployment

This repo is optimized for Google Cloud. Use Cloud Run for the backend API and either Cloud Storage + Cloud CDN or Firebase Hosting for the frontend.

### Backend: Cloud Run (Express LLM API)

Files:
- `server/Dockerfile` — container image for the Express server
- `server/.dockerignore` — excludes unnecessary files from the image

Prerequisites:
- Install and initialize the gcloud CLI
- Enable services: Cloud Run, Artifact Registry, Cloud Build

Build & deploy (one-time setup for Artifact Registry):
```bash
gcloud auth login
gcloud config set project <YOUR_PROJECT_ID>

# Create an Artifact Registry repository for Node images (adjust region)
gcloud artifacts repositories create portfolio-api \
  --repository-format=docker \
  --location=europe-west1 \
  --description="Portfolio API images"

# Build and push the image from the project root (contains server/ and src/)
gcloud builds submit --tag \
  europe-west1-docker.pkg.dev/<YOUR_PROJECT_ID>/portfolio-api/portfolio-api:latest

# Deploy to Cloud Run (public HTTPS)
gcloud run deploy portfolio-api \
  --image=europe-west1-docker.pkg.dev/<YOUR_PROJECT_ID>/portfolio-api/portfolio-api:latest \
  --region=europe-west1 \
  --allow-unauthenticated \
  --port=8080

# Set environment variables (server-side only)
gcloud run services update portfolio-api \
  --region=europe-west1 \
  --set-env-vars OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
```

Take note of the Cloud Run URL (e.g., `https://portfolio-api-xxxx-uc.a.run.app`).

### Frontend: Cloud Storage + Cloud CDN (or Firebase Hosting)

Option A — Cloud Storage + Cloud CDN:
```bash
# Build frontend
VITE_API_BASE="https://portfolio-api-xxxx-uc.a.run.app" npm run build

# Create a bucket and upload (adjust bucket name and region)
gsutil mb -l EU gs://my-portfolio-site
gsutil -m rsync -r dist/ gs://my-portfolio-site

# Make public (or use Cloud CDN + Load Balancer for HTTPS)
gsutil iam ch allUsers:objectViewer gs://my-portfolio-site
```

For HTTPS, custom domain, and SPA routing, place Cloud CDN in front of the bucket via an HTTP(S) Load Balancer (set default object `index.html` and map 404 to `index.html`).

Option B — Firebase Hosting (easier HTTPS + CDN):
```bash
npm install -g firebase-tools
firebase login
firebase init hosting  # select existing project

# Configure rewrite for SPA (respond with /index.html)
# Then build with API base and deploy
VITE_API_BASE="https://portfolio-api-xxxx-uc.a.run.app" npm run build
firebase deploy --only hosting
```

### Production Build Config

- At build time, set `VITE_API_BASE` to your Cloud Run URL (or a custom domain pointing to Cloud Run). The chat widget will call `${VITE_API_BASE}/chat` in production.
- See `.env.production.example` for an example.
- Keep `OPENAI_API_KEY` in Cloud Run env vars (never in the browser).

### CORS

The Express app runs on Cloud Run and returns JSON. If you restrict CORS, allow your frontend’s domain in the response headers. By default, this project includes `cors()` middleware in `server/server.mjs`.

## Notes

- The backend must not be hosted on S3 (S3 is static-only). Use Lambda, ECS/Fargate, or EC2.
- Keep `OPENAI_API_KEY` server-side only. Do not embed it in frontend code.
- For better performance, you can cache the MDX index at cold start and provide a `/reindex` endpoint for manual refresh.

## Notes

- The contact details in the contact section are placeholders.
- If you add new MDX components, register them in `MDXProvider` in `ProjectPage.tsx`.
- To deep-link to a project in a specific language, use `/:lang/project/:slug`.

## Roadmap Ideas

- Breadcrumbs on project pages (Home › Portfolio › Project)
- Copy-to-clipboard button for code blocks
- Metrics component for KPI highlights
- SEO: meta tags per page (title/description/OG)
