/**
 * MusicLoader.tsx: a crayon music loader you can switch on and off from anywhere.
 *
 *   1. Mount <LoaderHost /> once, near the root of your app.
 *   2. Call loader.show() and loader.hide() from anywhere, even outside React.
 *
 * Needs React 18+. No other files or packages. The label and percent use the
 * Google fonts "Gochi Hand" and "Permanent Marker" (falls back to cursive).
 */
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";

/* ---------------------------------- API ---------------------------------- */

export interface LoaderOptions {
  /** text under the staff */
  label?: string;
  /** show the percent next to the label (use with loader.progress) */
  percent?: boolean;
  /** sticker on the record when progress reaches 100, e.g. "added!" */
  stamp?: string;
}

interface LoaderState {
  open: boolean;
  label: string;
  percent: boolean;
  stamp: string;
  /** null = endless loop, 0 to 100 = real progress */
  progress: number | null;
}

const DEFAULT_LABEL = "tuning the vibes...";

let state: LoaderState = {
  open: false,
  label: DEFAULT_LABEL,
  percent: false,
  stamp: "",
  progress: null,
};
let openCount = 0;
const listeners = new Set<() => void>();

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};
const getState = () => state;
const update = (patch: Partial<LoaderState>) => {
  state = { ...state, ...patch };
  listeners.forEach((fn) => fn());
};
const clamp = (n: number) => Math.min(100, Math.max(0, n));

export const loader = {
  /** open the loader. Every show() should be matched by one hide(). */
  show(options: LoaderOptions = {}) {
    openCount += 1;
    update({
      open: true,
      label: options.label ?? DEFAULT_LABEL,
      percent: options.percent ?? false,
      stamp: options.stamp ?? "",
      progress: null,
    });
  },

  /** close the loader once every show() has been matched. hide(true) closes it right away. */
  hide(force = false) {
    openCount = force ? 0 : Math.max(0, openCount - 1);
    if (openCount === 0) update({ open: false });
  },

  /** switch to real progress (0 to 100), or pass null for the endless loop */
  progress(value: number | null) {
    update({ progress: value === null ? null : clamp(value) });
  },

  /** show the loader while a promise (or an async function) runs, then hide it */
  async wrap<T>(task: Promise<T> | (() => Promise<T>), options?: LoaderOptions): Promise<T> {
    loader.show(options);
    try {
      return await (typeof task === "function" ? task() : task);
    } finally {
      loader.hide();
    }
  },
};

/* --------------------------------- Host ---------------------------------- */

/** mount once, near the root of your app */
export function LoaderHost() {
  const s = useSyncExternalStore(subscribe, getState, getState);
  const [mounted, setMounted] = useState(false);

  // stay mounted for a moment after hide() so the fade-out can play
  useEffect(() => {
    if (s.open) {
      setMounted(true);
      return;
    }
    const t = window.setTimeout(() => setMounted(false), 220);
    return () => window.clearTimeout(t);
  }, [s.open]);

  return (
    <>
      <style>{CSS}</style>
      {mounted && <Overlay s={s} closing={!s.open} />}
    </>
  );
}

function Overlay({ s, closing }: { s: LoaderState; closing: boolean }) {
  // lock page scroll while the loader is on screen
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const looping = s.progress === null;
  const loop = useLoopProgress(looping);
  const value = looping ? loop : (s.progress as number);
  const done = value >= 100;

  return (
    <div
      className={`ml-overlay${closing ? " is-closing" : ""}`}
      role={looping ? "status" : "progressbar"}
      aria-label={s.label}
      aria-busy={!closing}
      aria-valuemin={looping ? undefined : 0}
      aria-valuemax={looping ? undefined : 100}
      aria-valuenow={looping ? undefined : Math.round(value)}
    >
      <div className={`ml${done ? " ml--done" : ""}`}>
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
          <defs>
            <filter id="ml-crayon">
              <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3" result="n" />
              <feDisplacementMap in="SourceGraphic" in2="n" scale="4" />
            </filter>
          </defs>
        </svg>

        <svg className="ml__staff" viewBox="0 0 340 120" aria-hidden="true">
          <g filter="url(#ml-crayon)" className="ml__lines">
            <path d="M6 30H334M6 45H334M6 60H334M6 75H334M6 90H334" />
          </g>

          <g filter="url(#ml-crayon)">
            {NOTES.map((n, i) => {
              const down = n.y <= 60; // high notes get a downward stem
              const sx = down ? n.x - 9 : n.x + 9;
              const ey = down ? n.y + 34 : n.y - 34;
              const flag = n.flag ? (down ? "q-12 -6 -8 -20" : "q12 6 8 20") : "";
              const on = value >= ((i + 0.6) / NOTES.length) * 100;
              return (
                <g
                  key={i}
                  className={`ml__note${on ? " is-on" : ""}`}
                  style={{ "--d": `${i * 60}ms` } as CSSProperties}
                >
                  <path className="ml__stem" d={`M${sx} ${n.y}V${ey}${flag}`} />
                  <ellipse
                    className="ml__head"
                    cx={n.x}
                    cy={n.y}
                    rx={10}
                    ry={7.5}
                    transform={`rotate(-20 ${n.x} ${n.y})`}
                    style={{ fill: n.fill }}
                  />
                </g>
              );
            })}
          </g>

          <g className="ml__marker" style={{ transform: `translateX(${14 + (value / 100) * 312}px)` }}>
            <path d="M0 18V102" />
            <circle cx="0" cy="14" r="6" />
          </g>
        </svg>

        <div className="ml__meta" aria-hidden="true">
          <span className="ml__label">{s.label}</span>
          {s.percent && <span className="ml__pct">{Math.round(value)}%</span>}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- Internals ------------------------------- */

/** counts 0 to 100, holds for a moment, then starts again */
function useLoopProgress(active: boolean) {
  const [p, setP] = useState(0);
  const ref = useRef({ p: 0, hold: 0 });

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => {
      const s = ref.current;
      if (s.p < 100) s.p = Math.min(100, s.p + (s.p < 80 ? 1.3 : 0.6));
      else if (++s.hold > 30) {
        s.p = 0;
        s.hold = 0;
      }
      setP(s.p);
    }, 50);
    return () => window.clearInterval(id);
  }, [active]);

  return p;
}

/* x = position, y = the line or space the note sits on, flag = eighth note */
const NOTES = [
  { x: 34, y: 75, fill: "var(--ml-c1)", flag: false },
  { x: 72, y: 60, fill: "var(--ml-c2)", flag: true },
  { x: 110, y: 45, fill: "var(--ml-c3)", flag: false },
  { x: 148, y: 60, fill: "var(--ml-c1)", flag: true },
  { x: 186, y: 82, fill: "var(--ml-c2)", flag: false },
  { x: 224, y: 52, fill: "var(--ml-c3)", flag: true },
  { x: 262, y: 38, fill: "var(--ml-c1)", flag: false },
  { x: 300, y: 60, fill: "var(--ml-c2)", flag: true },
];

const FLOATERS = [
  { x: "-36px", delay: "0s", fill: "var(--ml-c1)", flag: false },
  { x: "6px", delay: ".8s", fill: "var(--ml-accent)", flag: true },
  { x: "42px", delay: "1.6s", fill: "var(--ml-c2)", flag: false },
];

const CSS = `
.ml-overlay{
  --ml-ink:#1a1815;--ml-c1:#d53e0f;--ml-c2:#9b0f06;--ml-c3:#5e0006;
  --ml-accent:#ffe100;--ml-bg:#fbf4f4;--ml-grain:rgba(26,24,21,.07);
  position:fixed;inset:0;z-index:9999999;display:grid;place-items:center;padding:24px 16px;
  backdrop-filter: blur(4px);
  background-image:radial-gradient(var(--ml-grain) 1px,transparent 1.5px);
  background-size:7px 7px;color:var(--ml-ink);
  animation:ml-in .2s ease-out both;
}
.ml-overlay.is-closing{animation:ml-out .2s ease-in both;pointer-events:none}
.ml{
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:12px;
  transform:scale(0.75);
  transform-origin:center;
}
.ml__discwrap{position:relative;width:150px;height:150px;margin-top:40px}
.ml__ring{width:150px;height:150px;border-radius:50%;box-shadow:6px 6px 0 var(--ml-ink);transform:rotate(8deg)}
.ml__disc{width:100%;height:100%;display:block;animation:ml-spin 2s linear infinite}
.ml--done .ml__disc{animation-play-state:paused}

.ml__float{position:absolute;left:50%;top:0;width:24px;height:24px;opacity:0;fill:none;
  stroke:var(--ml-ink);stroke-width:2.6;stroke-linecap:round;animation:ml-rise 2.4s ease-out infinite}

.ml__stamp{position:absolute;right:-44px;top:-10px;display:none;padding:4px 14px;background:var(--ml-accent);
  border-radius:12px 20px 10px 18px;box-shadow:3px 3px 0 var(--ml-ink);
  font:400 22px "Permanent Marker",cursive;transform:rotate(-8deg)}
.ml--done .ml__stamp{display:block}

.ml__staff{width:min(380px,88vw);height:auto;overflow:visible}
.ml__lines path{fill:none;stroke:var(--ml-ink);stroke-width:3;stroke-linecap:round}
.ml__note{opacity:0;transform:scale(.2) translateY(10px);transform-box:fill-box;transform-origin:center;
  transition:opacity .2s,transform .35s cubic-bezier(.3,1.8,.5,1)}
.ml__note.is-on{opacity:1;transform:none}
.ml--done .ml__note.is-on{animation:ml-jig .6s ease-in-out var(--d) 2}
.ml__stem{fill:none;stroke:var(--ml-ink);stroke-width:3;stroke-linecap:round}
.ml__head{stroke:var(--ml-ink);stroke-width:3}
.ml__marker{transition:transform .12s linear}
.ml__marker path{stroke:var(--ml-c1);stroke-width:4;stroke-linecap:round;fill:none}
.ml__marker circle{fill:var(--ml-accent);stroke:var(--ml-ink);stroke-width:3}

.ml__meta{display:flex;align-items:baseline;gap:14px;min-height:36px}
.ml__label{font:400 24px "Gochi Hand","Comic Sans MS",cursive}
.ml__pct{font:400 28px "Permanent Marker",cursive}

@keyframes ml-in{from{opacity:0}to{opacity:1}}
@keyframes ml-out{from{opacity:1}to{opacity:0}}
@keyframes ml-spin{to{transform:rotate(360deg)}}
@keyframes ml-rise{
  0%{opacity:0;transform:translate(-50%,10px) rotate(-10deg)}
  20%{opacity:1}
  100%{opacity:0;transform:translate(calc(-50% + var(--x)),-80px) rotate(14deg)}
}
@keyframes ml-jig{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}

@media (prefers-reduced-motion:reduce){
  .ml-overlay,.ml-overlay.is-closing{animation:none}
  .ml__disc,.ml__float{animation:none}
  .ml__float{opacity:.8}
  .ml__note,.ml__marker{transition:none}
  .ml--done .ml__note.is-on{animation:none}
}
`;