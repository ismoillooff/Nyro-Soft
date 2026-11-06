# Nyro-Soft

Corporate website for **Nyro Soft**, a digital product studio: services, concept projects, an interactive demo and a four-step project brief. Uzbek (Latin) first; Russian is prepared (see [Localization](#localization)).

The site builds to **static files** — every route is prerendered to HTML at build time and hydrated in the browser. No Node server is needed in production.

## Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Build | Vite 8 | Fast dev server, plain static output |
| UI | React 19 + TypeScript (strict) | |
| Routing / prerender | React Router 7 framework mode, `ssr: false` + `prerender` | Real HTML per route for search engines and link previews; `<Link viewTransition>`, `<ScrollRestoration>` |
| Styles | Tailwind CSS 4 (`@tailwindcss/vite`) + CSS custom properties | Tokens live in `app/styles/app.css` (`:root` + `@theme`) |
| Motion | `motion` (`motion/react`), `LazyMotion` + `m`, strict | One animation library; `domMax` features load asynchronously |
| Figures | `@lucasmarkes/hairline` (MIT) | The pointer-answering line figures (Laptop, Phone, Exploded, Settle, Drawer, Query, Plug) |
| Hero N | Vendored Hairline kernel (MIT) + own figure | Built with the `hairline-create` skill, see [Hero N](#hero-n) |
| Icons | `lucide-react` | One stroke style (`strokeWidth={1.5}`) |
| Tech logos | Simple Icons paths (CC0) copied into `app/content/tech.ts` | No package needed |
| Fonts | `@fontsource-variable/geist`, `geist-mono` | Self-hosted, latin + latin-ext woff2, metric-matched fallbacks |
| Tests | `vitest` (logic), `@playwright/test` (e2e) | |
| Lint | ESLint 10 + `typescript-eslint` + `eslint-plugin-react-hooks` | |

Not used on purpose: Next.js, GSAP, smooth-scroll libraries, three.js/WebGL, Lottie, UI kits, CSS-in-JS, a second animation library, validation libraries.

## Getting started

Requirements: Node ≥ 22.12 (developed on Node 24).

```sh
npm install
cp .env.example .env      # then fill in the values
npm run dev               # http://localhost:5173
```

| Script | |
| --- | --- |
| `npm run dev` | Dev server with HMR |
| `npm run build` | Prerendered static site in `build/client` (+ sitemap.xml, robots.txt, 404.html) |
| `npm run preview` | Serves `build/client` like production: real `404` for unknown URLs |
| `npm run typecheck` | `react-router typegen && tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (brief validation, reducer, submitters) |
| `npm run test:e2e` | Playwright against the build (`npm run build` first; uses installed Chrome locally) |
| `npm run check:i18n` | Russian translation coverage; exits 1 below 100% |

Asset generation (favicons, `og.png`, fallback font metrics): `node scripts/generate-assets.mjs` (needs Chrome).

### Environment

| Variable | Used for |
| --- | --- |
| `SITE_URL` | Production origin, no trailing slash. Canonical URLs, Open Graph, `sitemap.xml`. Without it the build warns and URLs point at localhost. |
| `VITE_BRIEF_ENDPOINT` | URL of **your** backend that receives the brief (contract below). Public — it ends up in the browser bundle. |
| `ROBOTS_ALLOW` | `true` in production; `false` for staging (every page `noindex`, `robots.txt` disallows all). |

`VITE_*` values are bundled into client JavaScript and are readable by anyone. Never put a secret there (Telegram bot token, API key, SMTP password).

**Release blocker:** if neither `VITE_BRIEF_ENDPOINT` nor a real contact channel in `app/content/site.ts` is set, the visitor cannot reach the studio. The build prints a red `RELEASE BLOCKER` line in that case.

## Project structure

```
app/
  root.tsx               html shell (lang="uz"), fonts, MotionProvider, header/footer, error boundary
  entry.server.tsx       prerender-only renderer (waits for the whole document)
  routes.ts              / · /xizmatlar/:slug · /loyihalar/:slug · *
  routes/                home, service, project, not-found
  components/
    layout/              Header, MobileMenu (<dialog>), Footer, Section, Breadcrumb, Logo
    hairline/            Hairline, HairlineFrame, CornerMarks, HairlineNode, HairlineBeam,
                         beam-scheduler, SectionRail, DrawnFrame, HairlineFigure, NyroMark
    motion/              MotionProvider, Reveal/RevealGroup, hooks (scroll progress, parallax, active section)
    sections/            Hero, Projects, Services, TechMarquee, Demo, Process, Deliverables, Team, Support, Faq, Brief
    demo/                DashboardMock, FinanceMock, OrdersApp (the working "Natija" sample, own chunk)
    brief/               brief steps, progress, review, result states
    ui/                  Button, Tabs, Accordion, CompareSlider, Field, Chip, Tag
  content/               typed content: services, projects, tech, team, faq, process, deliverables, support, principles, brief, site
  i18n/                  uz.ts (source of truth), ru.ts, index.tsx
  lib/                   seo.ts (meta, canonical, OG, JSON-LD), brief/ (types, validate, format, reducer, submitters)
  motion/                tokens.ts (durations, easing, springs), features.ts (domMax)
  styles/app.css         Tailwind + tokens + fonts + a few global rules
  vendor/hairline/       Hairline kernel (unchanged, MIT) + Nyro N figure + live mount
figures/                 the Hero N source for hairline-create (look/validate artifacts are ignored)
scripts/                 build-end (sitemap/robots/404), preview server, check-i18n, generate-assets, screenshots
tests/                   unit/*.test.ts, e2e/*.spec.ts
docs/brief-endpoint.md   the brief API contract
```

## Editing content

- Copy lives in `app/content/*.ts` (typed; each text is `{ uz, ru? }`) and interface strings in `app/i18n/uz.ts`.
- **Technologies:** edit only `app/content/tech.ts` (name + a Simple Icons path for a 24×24 viewBox).
- **Contacts and social links:** `app/content/site.ts`. Empty lists are not rendered anywhere — no fake contacts.
- **Team:** `app/content/team.ts`. Entries with `status: "placeholder"` are shown only in development with a visible label; production shows `ready` members, or the working principles when there are none. Use real people and real photos only.
- **Projects:** `app/content/projects.ts`. Both current items are concept projects and are labelled as such on every card and case study.

## Hero N

The hero's layered N is a custom Hairline figure (spec path A):

- `figures/nyro.js` is the figure in the `hairline-create` format; it passes the skill's `validate.mjs` and `look.mjs`.
- `app/vendor/hairline/kernel.js` is the skill's kernel, byte-identical (sha256 in its header), MIT — see `app/vendor/hairline/LICENSE`. `vite.config.ts` appends `export default HL;` while bundling, so the file on disk stays untouched.
- `app/components/hairline/nyro-rest.ts` is the rest pose captured in Chrome; it is in the prerendered HTML, so the live figure replaces it without a shift or flash.
- After changing `figures/nyro.js`, regenerate with `node figures/export.mjs`.

## Brief endpoint

The browser POSTs the brief as JSON to `VITE_BRIEF_ENDPOINT` with an `Idempotency-Key` header (reused on retry) and a 15 s timeout; success is shown only for a real `2xx`. The full contract — body, responses, CORS, honeypot and rate limiting on the server, and a minimal FastAPI → Telegram example — is in **[docs/brief-endpoint.md](docs/brief-endpoint.md)**.

## Deployment

`npm run build` → upload `build/client/` to any static host. Each route is a folder with `index.html`; unknown URLs must get `404.html` **with status 404**.

### Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;
    root /var/www/nyro-soft/build/client;

    # Real 404 for unknown URLs (404.html is static, it needs no JavaScript).
    error_page 404 /404.html;
    location = /404.html { internal; }

    location / {
        try_files $uri $uri/index.html =404;
        add_header Cache-Control "no-cache";
    }

    # Hashed assets never change.
    location /assets/ {
        try_files $uri =404;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    gzip on;
    gzip_types text/css application/javascript image/svg+xml application/xml;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;
}
```

`__spa-fallback.html` is generated by React Router but not needed: every public URL is prerendered.

## Localization

Uzbek (Latin) is the source and lives at the root (`/`, `/xizmatlar/…`); Russian is published under `/ru` (`/ru`, `/ru/xizmatlar/…`) with the same slugs.

- Interface strings: `app/i18n/uz.ts` and `app/i18n/ru.ts`; content: `{ uz, ru }` fields in `app/content`.
- `npm run check:i18n` must report 100% before a language is published; `ENABLED_LOCALES` in `app/i18n/types.ts` turns on its routes, prerender, sitemap entries, `hreflang` alternates and the UZ / RU switch.
- Internal links use `LocaleLink` (or `p(path)` from `useI18n()`), which adds the `/ru` prefix on Russian pages.
- Cyrillic font subsets are declared with `unicode-range`, so Uzbek pages never download them.
- The product mock-ups and the working "Natija" sample keep Uzbek UI text on both languages (they depict a product for the Uzbek market).

## Accessibility and motion

WCAG 2.2 AA target: skip link, one `h1` per page, landmarks, visible `:focus-visible`, native `<dialog>` menu, WAI-ARIA tabs and disclosures, labelled form errors with focus management, 44 px touch targets. Every animation has a `prefers-reduced-motion` path: no reveals, parallax, beams, marquee loop (static wrap), sticky process or figure autoplay. Content is fully visible in the prerendered HTML without JavaScript.

## Licenses

- `@lucasmarkes/hairline` and the vendored kernel: MIT © Lucas Marques.
- Simple Icons paths: CC0 1.0. Brand marks belong to their owners and are used only to name the tools.
- Geist / Geist Mono: SIL Open Font License 1.1.
