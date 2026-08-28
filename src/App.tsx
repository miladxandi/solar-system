import { useCallback, useEffect, useState } from "react";
import SolarCanvas from "./components/SolarCanvas";
import DetailPanel from "./components/DetailPanel";
import ControlBar from "./components/ControlBar";
import PlanetDock from "./components/PlanetDock";
import { ALL_BODIES, formatElapsed, formatRate } from "./data/bodies";

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(true);
  const [daysPerSecond, setDaysPerSecond] = useState(30);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showBelt, setShowBelt] = useState(true);
  const [resetToken, setResetToken] = useState(0);
  const [simDays, setSimDays] = useState(120);

  const selected = ALL_BODIES.find((b) => b.id === selectedId) ?? null;

  const onSelect = useCallback((id: string | null) => setSelectedId(id), []);
  const onTick = useCallback((days: number) => setSimDays(days), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      if (e.code === "Space") {
        e.preventDefault();
        setPlaying((v) => !v);
      } else if (e.key === "Escape") {
        setSelectedId(null);
      } else if (/^[0-8]$/.test(e.key)) {
        const b = ALL_BODIES[Number(e.key)];
        if (b) setSelectedId(b.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onToggle = (key: "showOrbits" | "showLabels" | "showBelt") => {
    if (key === "showOrbits") setShowOrbits((v) => !v);
    if (key === "showLabels") setShowLabels((v) => !v);
    if (key === "showBelt") setShowBelt((v) => !v);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-void font-body">
      {/* ---- the orrery ---- */}
      <SolarCanvas
        playing={playing}
        daysPerSecond={daysPerSecond}
        selectedId={selectedId}
        showOrbits={showOrbits}
        showLabels={showLabels}
        showBelt={showBelt}
        resetToken={resetToken}
        onSelect={onSelect}
        onTick={onTick}
      />

      {/* ---- ambient layers over the canvas ---- */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <div
          className="absolute inset-0 mix-blend-screen"
          style={{
            background:
              "radial-gradient(42% 36% at 16% 20%, rgba(30,82,99,0.30), transparent 70%), radial-gradient(38% 34% at 84% 78%, rgba(118,62,26,0.16), transparent 70%), radial-gradient(30% 28% at 72% 12%, rgba(38,58,120,0.20), transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: "radial-gradient(rgba(140,165,210,0.08) 1px, transparent 1px)",
            backgroundSize: "34px 34px",
            maskImage: "radial-gradient(75% 70% at 50% 48%, black 30%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(75% 70% at 50% 48%, black 30%, transparent 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(120% 95% at 50% 44%, transparent 55%, rgba(2,4,9,0.6) 100%)" }}
        />
      </div>

      {/* ---- header ---- */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between px-4 pt-3.5 md:px-5">
        <div className="anim-rise flex items-center gap-3">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
            <circle cx="20" cy="20" r="5" fill="#ffc94d" />
            <circle cx="20" cy="20" r="5.4" stroke="#ffc94d" strokeOpacity="0.4" />
            <g className="brand-ring">
              <ellipse cx="20" cy="20" rx="16" ry="7.5" stroke="#8fa3c4" strokeOpacity="0.65" strokeWidth="1" transform="rotate(-18 20 20)" />
              <circle cx="34.6" cy="15.4" r="2" fill="#5aa7f0" transform="rotate(-18 20 20)" />
            </g>
            <ellipse cx="20" cy="20" rx="10.5" ry="4.6" stroke="#8fa3c4" strokeOpacity="0.3" strokeWidth="1" transform="rotate(-18 20 20)" />
          </svg>
          <div>
            <h1 className="font-display text-[17px] font-bold leading-none tracking-[0.24em] text-icefog">
              ORRERY<span className="text-solar">·01</span>
            </h1>
            <p className="mt-1 font-data text-[8.5px] uppercase tracking-[0.3em] text-fog-dim">
              Interactive solar system · 8 planets
            </p>
          </div>
        </div>

        {/* telemetry */}
        <div className="anim-rise hidden text-right font-data text-[10px] leading-[1.7] sm:block" style={{ animationDelay: "0.1s" }}>
          <div className="text-fog-dim">
            MISSION CLOCK <span className="ml-2 text-icefog">T+ {formatElapsed(simDays)}</span>
          </div>
          <div className="text-fog-dim">
            TIME WARP <span className="ml-2 text-solar">1s ≈ {formatRate(daysPerSecond)}</span>
          </div>
          <div className="flex items-center justify-end gap-2 text-fog-dim">
            STATUS
            <span className={`ml-1 inline-block h-1.5 w-1.5 rounded-full ${playing ? "bg-signal dot-live" : "bg-ember dot-paused"}`} />
            <span className={playing ? "text-signal" : "text-ember"}>{playing ? "ORBITING" : "HOLD"}</span>
          </div>
        </div>
      </header>

      {/* ---- dock / panel / controls ---- */}
      <PlanetDock selectedId={selectedId} onSelect={(id) => setSelectedId(id)} />
      {selected && <DetailPanel body={selected} days={simDays} onClose={() => setSelectedId(null)} />}
      <ControlBar
        playing={playing}
        daysPerSecond={daysPerSecond}
        showOrbits={showOrbits}
        showLabels={showLabels}
        showBelt={showBelt}
        onTogglePlay={() => setPlaying((v) => !v)}
        onSpeed={setDaysPerSecond}
        onToggle={onToggle}
        onResetView={() => setResetToken((v) => v + 1)}
      />

      {/* footnote */}
      <div className="pointer-events-none absolute bottom-3 left-4 z-10 hidden font-data text-[9px] uppercase tracking-[0.18em] text-fog-dim/80 md:block">
        Sizes &amp; distances not to scale — orbital ratios are true
        <span className="ml-3 text-fog-dim/50">keys 0–8 select a body</span>
      </div>
    </div>
  );
}
