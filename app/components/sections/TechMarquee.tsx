import { Pause, Play } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { homeSections } from "~/content/sections";
import { tech, type Tech } from "~/content/tech";
import { useI18n } from "~/i18n";
import { cn } from "~/lib/cn";
import { easeCss } from "~/motion/tokens";
import { CornerMarks } from "~/components/hairline/Hairline";
import { requestBeam, trackBeamHost } from "~/components/hairline/beam-scheduler";
import { Section, SectionHeading } from "~/components/layout/Section";
import { prefersReducedMotion } from "~/components/motion/hooks";

const SPEED = 36; // px per second
const BEAM = 64;

function Item({ item }: { item: Tech }) {
  return (
    <li className="flex shrink-0 items-center gap-3 text-ink-2">
      <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="size-[22px] shrink-0" fill="currentColor">
        <path d={item.path} />
      </svg>
      <span className="text-[0.9375rem] whitespace-nowrap">{item.name}</span>
    </li>
  );
}

/**
 * Technologies as a CSS marquee: one real list for assistive tech, the copies
 * aria-hidden and inert. ResizeObserver measures one set and decides how many
 * copies fill the band; translateX runs linear for set width ÷ 36 px/s,
 * clamped to 35–50 s. Paused on hover, focus, the button, and off screen.
 * Under reduced motion there are no copies and the list wraps (CSS).
 */
export function TechMarquee() {
  const { t, l } = useI18n();
  const meta = homeSections.tech;
  const bandRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const topBeam = useRef<HTMLSpanElement>(null);
  const bottomBeam = useRef<HTMLSpanElement>(null);
  const [copies, setCopies] = useState(0);
  const [setWidth, setSetWidth] = useState(0);
  const [paused, setPaused] = useState(false);
  const [offscreen, setOffscreen] = useState(true);
  const [reduce, setReduce] = useState(false);

  // Measure one set and the band; recompute on resize.
  useLayoutEffect(() => {
    const band = bandRef.current;
    const list = listRef.current;
    if (!band || !list) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const measure = () => {
      const r = mq.matches;
      setReduce(r);
      const w = list.offsetWidth;
      setSetWidth(w);
      setCopies(r || w === 0 ? 0 : Math.ceil(band.clientWidth / w) + 1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(band);
    ro.observe(list);
    mq.addEventListener("change", measure);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", measure);
    };
  }, []);

  // Sleep off screen.
  useEffect(() => {
    const band = bandRef.current;
    if (!band) return;
    const io = new IntersectionObserver(([e]) => setOffscreen(!(e?.isIntersecting ?? false)));
    io.observe(band);
    return () => io.disconnect();
  }, []);

  // The band's one beam: along the top line, then back along the bottom, every ~9 s while running.
  useEffect(() => {
    const band = bandRef.current;
    const top = topBeam.current;
    const bottom = bottomBeam.current;
    if (!band || !top || !bottom || reduce || paused || offscreen) return;
    const untrack = trackBeamHost(band);
    const pass = (seg: HTMLElement, from: number, to: number, ms: number) =>
      seg.animate([{ transform: `translate3d(${from}px,0,0)`, opacity: 1 }, { transform: `translate3d(${to}px,0,0)`, opacity: 1 }], {
        duration: ms,
        easing: easeCss.inOut,
      }).finished;
    const run = async () => {
      const w = band.clientWidth;
      top.style.willChange = bottom.style.willChange = "transform";
      await pass(top, -BEAM, w, 800);
      await pass(bottom, w, -BEAM, 800);
      top.style.willChange = bottom.style.willChange = "";
    };
    const timer = window.setInterval(() => {
      if (!prefersReducedMotion()) requestBeam("tech-marquee", band, run);
    }, 9000);
    return () => {
      window.clearInterval(timer);
      untrack();
    };
  }, [reduce, paused, offscreen]);

  const duration = Math.min(50, Math.max(35, setWidth / SPEED));
  const style = {
    "--marquee-set": `${setWidth}px`,
    "--marquee-dur": `${duration}s`,
    "--marquee-state": paused || offscreen ? "paused" : "running",
  } as CSSProperties;

  return (
    <Section id={meta.id} titleId="texnologiyalar-title" container={false}>
      <div className="container-site">
        <SectionHeading titleId="texnologiyalar-title" number={meta.number} label={l(meta.label)} title={t.tech.title} lead={t.tech.lead} />
      </div>
      <div className="container-site mt-12 md:mt-16">
        <div className="relative border-y border-line-strong">
          <CornerMarks />
          <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-px h-px overflow-hidden">
            <span ref={topBeam} className="beam-seg absolute top-0 left-0 h-px opacity-0" style={{ width: BEAM }} />
          </span>
          <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 -bottom-px h-px overflow-hidden">
            <span ref={bottomBeam} className="beam-seg absolute top-0 left-0 h-px opacity-0" style={{ width: BEAM }} />
          </span>
          <div
            ref={bandRef}
            className="marquee overflow-clip [contain:paint]"
            data-ready={copies > 0 && setWidth > 0 ? "" : undefined}
            style={style}
          >
            <div className="marquee-track flex w-max py-7 md:py-9">
              <ul ref={listRef} aria-label={t.tech.listLabel} className="marquee-list flex shrink-0 items-center gap-12 pr-12">
                {tech.map((item) => (
                  <Item key={item.id} item={item} />
                ))}
              </ul>
              {Array.from({ length: copies }, (_, i) => (
                <ul key={i} aria-hidden="true" inert className="flex shrink-0 items-center gap-12 pr-12">
                  {tech.map((item) => (
                    <Item key={item.id} item={item} />
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-3 flex justify-end motion-reduce:hidden">
          <button
            type="button"
            aria-pressed={paused}
            onClick={() => setPaused((p) => !p)}
            className={cn(
              "inline-flex size-11 items-center justify-center rounded-full border border-line text-ink-2 transition-colors duration-[180ms] hover:text-ink",
            )}
            aria-label={paused ? t.tech.play : t.tech.pause}
          >
            {paused ? <Play aria-hidden="true" strokeWidth={1.5} className="size-4" /> : <Pause aria-hidden="true" strokeWidth={1.5} className="size-4" />}
          </button>
        </div>
      </div>
    </Section>
  );
}
