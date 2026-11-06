import fontUrl from "@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url";
import type { ReactNode } from "react";
import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import type { Route } from "./+types/root";
import { Footer } from "./components/layout/Footer";
import { Header } from "./components/layout/Header";
import { MotionProvider } from "./components/motion/MotionProvider";
import { buttonClass } from "./components/ui/Button";
import { I18nProvider, useI18n } from "./i18n";
import { uz } from "./i18n/uz";
import stylesheet from "./styles/app.css?url";

export const links: Route.LinksFunction = () => [
  // The one font file every page needs first; the rest swap in metric-matched.
  { rel: "preload", href: fontUrl, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
  { rel: "stylesheet", href: stylesheet },
  { rel: "icon", href: "/favicon.ico", sizes: "32x32" },
  { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
  { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
];

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="uz" dir="ltr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light" />
        <meta name="theme-color" content="#FAFAF7" />
        <Meta />
        <Links />
      </head>
      <body id="top">
        {/* Header scroll state: when this 8px strip leaves the viewport, the header gets its backdrop. */}
        <div id="top-sentinel" aria-hidden="true" className="pointer-events-none absolute top-0 left-0 h-2 w-px" />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function SkipLink() {
  const { t } = useI18n();
  return (
    <a
      href="#main"
      className="fixed top-2 left-2 z-50 -translate-y-[200%] rounded-[var(--radius-md)] bg-ink px-4 py-3 text-white focus-visible:translate-y-0"
    >
      {t.a11y.skipLink}
    </a>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <I18nProvider locale="uz">
      <MotionProvider>
        <div className="flex min-h-svh flex-col">
          <SkipLink />
          <Header />
          <main id="main" tabIndex={-1} className="relative flex-1 outline-none">
            {children}
          </main>
          <Footer />
        </div>
      </MotionProvider>
    </I18nProvider>
  );
}

export default function App() {
  return (
    <Shell>
      <Outlet />
    </Shell>
  );
}

export function HydrateFallback() {
  return <div className="min-h-svh" />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const t = uz.error;
  let detail: string | null = null;
  if (import.meta.env.DEV) {
    detail = isRouteErrorResponse(error)
      ? `${error.status} ${error.statusText}`
      : error instanceof Error
        ? (error.stack ?? error.message)
        : null;
  }
  return (
    <Shell>
      <div className="container-site section-y">
        <h1 className="t-h2">{t.title}</h1>
        <p className="t-lead mt-4 max-w-[44ch] text-ink-2">{t.text}</p>
        <a href="/" className={buttonClass("secondary", "mt-8")}>
          {uz.notFound.home}
        </a>
        {detail && <pre className="mt-8 overflow-x-auto text-[0.875rem] text-ink-3">{detail}</pre>}
      </div>
    </Shell>
  );
}
