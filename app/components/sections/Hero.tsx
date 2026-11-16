import { m } from "motion/react";
import { useCallback, useRef, useState, type CSSProperties } from "react";
import { useI18n } from "~/i18n";
import { cn } from "~/lib/cn";
import { parallax } from "~/motion/tokens";
import { ButtonLink } from "~/components/ui/Button";
import { Hairline, HairlineNode, MarkedRule } from "~/components/hairline/Hairline";
import { NyroMark } from "~/components/hairline/NyroMark";
import { useMediaQuery, useParallax } from "~/components/motion/hooks";

/** The figure names its layers in Uzbek; Russian pages translate the read-out. */
const RU_READ = { "01 · tuzilma": "01 · структура", "02 · dizayn": "02 · дизайн", "03 · natija": "03 · результат" } as const;

/**
 * Width of the longest h1 line in em, per language (measured in Chrome). On
 * desktop the h1 shrinks below the display size only when that line would not
 * fit its column, so the three lines never wrap or run into the figure.
 */
const FIT = { uz: 8.4, ru: 10.35 } as const;

/** Entrance order (ms): label → three headline lines → lead → CTA → the N settles → its legend. */
const AT = { label: 0, lines: [60, 110, 160], lead: 210, cta: 260, legend: 520 } as const;

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/**
 * A faint floor grid in perspective, only behind the N (right column). Drawn
 * at 1 CSS px, --line at ~50%, faded out by a radial mask. Decorative.
 */
function PerspectiveGrid() {
  const W = 480;
  const H = 400;
  const vx = W / 2;
  const vy = -260;
  const rows = [150, 176, 206, 242, 286, 340, 400];
  const cols = Array.from({ length: 15 }, (_, i) => (i - 7) * 70);
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 size-full"
      style={{
        maskImage: "radial-gradient(closest-side at 50% 58%, #000 30%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(closest-side at 50% 58%, #000 30%, transparent 100%)",
      }}
    >
      <g fill="none" stroke="rgba(23,27,36,0.05)" vectorEffect="non-scaling-stroke">
        {rows.map((y) => (
          <line key={`r${y}`} x1="0" x2={W} y1={y + 0.5} y2={y + 0.5} vectorEffect="non-scaling-stroke" />
        ))}
        {cols.map((dx) => {
          const xBottom = vx + dx * 2.2;
          const t = (rows[0]! - vy) / (H - vy);
          const xTop = vx + (xBottom - vx) * t;
          return <line key={`c${dx}`} x1={xTop} y1={rows[0]} x2={xBottom} y2={H} vectorEffect="non-scaling-stroke" />;
        })}
      </g>
    </svg>
  );
}

/**
 * The hero. The h1, the lead and the buttons are in the prerendered HTML and
 * only rise 8px on entry (never transparent), so they are readable before
 * any JavaScript. The layered N explains itself with a three-step legend —
 * structure → design → result — that follows the figure's read-out as the
 * pointer (or the idle tour) moves through its plates.
 */
export function Hero() {
  const { t, locale } = useI18n();
  const ref = useRef<HTMLElement>(null);
  const desktop = useMediaQuery("(min-width: 1024px)");
  const gridY = useParallax(ref, parallax.grid);
  const markY = useParallax(ref, parallax.figure);
  const [layer, setLayer] = useState(-1);
  const onRead = useCallback((text: string) => {
    const n = Number.parseInt(text, 10);
    setLayer(Number.isFinite(n) ? n - 1 : -1);
  }, []);
  const layers = [t.hero.layerStructure, t.hero.layerDesign, t.hero.layerResult];

  return (
    <section ref={ref} aria-labelledby="hero-title" data-build-hero="" className="relative">
      <div className="container-site">
        <div className="grid-site items-center gap-y-8 pt-[clamp(28px,6vw,88px)] pb-[clamp(48px,7vw,96px)] md:gap-y-12 lg:min-h-[calc(84svh-var(--header-h))]">
          <div className="hero-fit col-span-4 md:col-span-8 lg:col-span-7">
            <p className="hero-in t-label flex items-center gap-3 text-ink-2" style={delay(AT.label)}>
              <HairlineNode state="active" />
              <Hairline tone="strong" length={24} />
              <span>{t.hero.label}</span>
            </p>
            <h1
              id="hero-title"
              className="t-display relative z-10 mt-6 md:mt-8 lg:-mr-[4.5rem] [&>span]:block lg:[&>span]:whitespace-nowrap"
              style={{ ["--fit" as string]: FIT[locale] }}
            >
              <span className="hero-in-solid" style={delay(AT.lines[0])}>
                {t.hero.line1}
              </span>
              <span className="hero-in-solid" style={delay(AT.lines[1])}>
                {t.hero.line2}
              </span>
              <span className="hero-in-solid text-accent" style={delay(AT.lines[2])}>
                {t.hero.line3}
              </span>
            </h1>
            <p className="hero-in-solid t-lead mt-6 max-w-[44ch] text-ink-2 md:mt-8" style={delay(AT.lead)}>
              {t.hero.lead}
            </p>
            <div className="hero-in-solid mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap md:mt-9" style={delay(AT.cta)}>
              <ButtonLink to="#brif" arrow="up-right">
                {t.hero.primary}
              </ButtonLink>
              <ButtonLink to="#loyihalar" variant="secondary" arrow="down">
                {t.hero.secondary}
              </ButtonLink>
            </div>
          </div>

          <div className="relative col-span-4 md:col-span-8 lg:col-span-5">
            <m.div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-6 -inset-y-10 hidden md:block"
              style={desktop ? { y: gridY } : undefined}
            >
              <PerspectiveGrid />
            </m.div>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-[10%] rounded-full"
              style={{ background: "radial-gradient(closest-side, var(--surface-soft), transparent)" }}
            />
            <m.div
              data-hero-n=""
              className="relative mx-auto w-full max-w-[232px] sm:max-w-[280px] md:max-w-[320px] lg:max-w-none"
              style={desktop ? { y: markY } : undefined}
            >
              <NyroMark label={t.hero.figureLabel} readMap={locale === "ru" ? RU_READ : undefined} onRead={onRead} showRead={false} />
            </m.div>
            <ol
              aria-label={t.hero.layersLabel}
              className="hero-in t-label relative mx-auto mt-3 flex w-fit items-center gap-2 text-ink-3 md:mt-5 md:gap-3"
              style={delay(AT.legend)}
            >
              {layers.map((name, i) => (
                <li key={name} className="flex items-center gap-2 md:gap-3">
                  {i > 0 && <Hairline tone="strong" length={16} className="md:w-6!" />}
                  <span className={cn("flex items-center gap-1.5 transition-colors duration-(--dur-micro)", layer === i && "text-ink")}>
                    <HairlineNode state={layer === i ? "active" : layer > i ? "done" : "idle"} />
                    {name}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* The bridge to the next section: a container-wide rule with "+" at both ends. */}
      <div className="container-site">
        <MarkedRule />
      </div>
    </section>
  );
}
