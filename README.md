# Nyro-Soft

Corporate website for the Nyro Soft digital product studio.

Vite + React 19 + TypeScript, React Router v7 framework mode (`ssr: false` + prerender → static HTML), Tailwind CSS v4, Motion for React, Hairline figures.

> Work in progress — full documentation (setup, environment, brief endpoint, deployment with Nginx) is added in the documentation phase.

## Quick start

```sh
npm install
npm run dev        # http://localhost:5173
npm run build      # static output in build/client
npm run preview    # serves build/client like production (real 404s)
```

See `.env.example` for `SITE_URL`, `VITE_BRIEF_ENDPOINT` and `ROBOTS_ALLOW`.
