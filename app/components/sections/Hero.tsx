import { m } from "motion/react";
import { useRef, type CSSProperties } from "react";
import { useI18n } from "~/i18n";
import { ButtonLink } from "~/components/ui/Button";
import { Hairline, HairlineNode, MarkedRule } from "~/components/hairline/Hairline";
import { NyroMark } from "~/components/hairline/NyroMark";
import { useMediaQuery, useParallax } from "~/components/motion/hooks";

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/**
 * A faint floor grid in perspective, only behind the N (right column). Drawn
 * at 1 CSS px (0.5px on 2x screens), --line at ~50%, faded out by a radial
 * mask. Decorative.
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
      className="hero-grid pointer-events-none absolute inset-0 size-full"
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
          // Lines run from the vanishing point down through the floor.
          const xBottom = vx + dx * 2.2;
          const t = (rows[0]! - vy) / (H - vy);
          const xTop = vx + (xBottom - vx) * t;
          return <line key={`c${dx}`} x1={xTop} y1={rows[0]} x2={xBottom} y2={H} vectorEffect="non-scaling-stroke" />;
        })}
      </g>
    </svg>
  );
}

export function Hero() {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  const desktop = useMediaQuery("(min-width: 1024px)");
  const gridY = useParallax(ref, 24);
  const markY = useParallax(ref, 32);

  return (
    <section ref={ref} aria-labelledby="hero-title" className="relative">
      <div className="container-site">
        <div className="grid-site items-center gap-y-12 pt-[clamp(40px,7vw,96px)] pb-[clamp(56px,8vw,104px)] lg:min-h-[calc(86svh-var(--header-h))]">
          <div className="col-span-4 md:col-span-8 lg:col-span-7">
            <p className="hero-in t-label flex items-center gap-3 text-ink-2" style={delay(0)}>
              <HairlineNode state="active" />
              <Hairline tone="strong" length={24} />
              <span>{t.hero.label}</span>
            </p>
            <h1
              id="hero-title"
              className="hero-in-solid t-display relative z-10 mt-7 md:mt-8 lg:-mr-[4.5rem] [&>span]:block lg:[&>span]:whitespace-nowrap"
              style={delay(60)}
            >
              <span>{t.hero.line1}</span>
              <span>{t.hero.line2}</span>
              <span className="text-accent">{t.hero.line3}</span>
            </h1>
            <p className="hero-in t-lead mt-7 max-w-[44ch] text-ink-2 md:mt-8" style={delay(120)}>
              {t.hero.lead}
            </p>
            <div className="hero-in mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap" style={delay(180)}>
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
              className="pointer-events-none absolute inset-[8%] rounded-full"
              style={{ background: "radial-gradient(closest-side, var(--surface-soft), transparent)" }}
            />
            <m.div className="relative mx-auto w-full max-w-[320px] lg:max-w-none" style={desktop ? { y: markY } : undefined}>
              <NyroMark label={t.hero.figureLabel} />
            </m.div>
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
