import { SPEED_PRESETS, formatRate } from "../data/bodies";

interface Props {
  playing: boolean;
  daysPerSecond: number;
  showOrbits: boolean;
  showLabels: boolean;
  showBelt: boolean;
  onTogglePlay: () => void;
  onSpeed: (v: number) => void;
  onToggle: (key: "showOrbits" | "showLabels" | "showBelt") => void;
  onResetView: () => void;
}

function Toggle({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={`group flex items-center gap-1.5 border px-2 py-1.5 font-data text-[9.5px] uppercase tracking-[0.18em] transition-all duration-200
        ${on ? "border-fog-dim/70 text-icefog" : "border-line/70 text-fog-dim hover:border-fog-dim hover:text-fog"}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full transition-all duration-200 ${on ? "bg-signal shadow-[0_0_6px_#57e6c3]" : "bg-fog-dim/50 group-hover:bg-fog-dim"}`}
      />
      {label}
    </button>
  );
}

export default function ControlBar(p: Props) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-2 pb-2.5 md:pb-3.5">
      <div className="pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-2 border border-line bg-hull/90 px-3 py-2.5 shadow-[0_14px_44px_rgba(0,0,0,0.5)] backdrop-blur-md md:gap-x-4 md:px-4">
        {/* play / pause */}
        <button
          onClick={p.onTogglePlay}
          aria-label={p.playing ? "Pause simulation" : "Play simulation"}
          className={`group relative grid h-11 w-11 shrink-0 place-items-center rounded-full border transition-all duration-200
            ${
              p.playing
                ? "border-solar/80 bg-solar/10 text-solar hover:bg-solar/20 hover:shadow-[0_0_22px_rgba(255,201,77,0.35)]"
                : "border-signal/80 bg-signal/10 text-signal hover:bg-signal/20 hover:shadow-[0_0_22px_rgba(87,230,195,0.35)]"
            }`}
        >
          {p.playing ? (
            <svg width="13" height="14" viewBox="0 0 13 14" fill="currentColor">
              <rect x="1.5" width="3.4" height="14" rx="0.8" />
              <rect x="8.1" width="3.4" height="14" rx="0.8" />
            </svg>
          ) : (
            <svg width="13" height="14" viewBox="0 0 13 14" fill="currentColor">
              <path d="M1.5 1.1c0-.8.9-1.3 1.6-.9l9.4 5.9c.6.4.6 1.4 0 1.8l-9.4 5.9c-.7.4-1.6-.1-1.6-.9V1.1z" />
            </svg>
          )}
        </button>

        {/* time warp */}
        <div className="flex items-center gap-2">
          <span className="hidden font-data text-[9px] uppercase tracking-[0.22em] text-fog-dim sm:block">
            Time&nbsp;warp
            <span className="mt-0.5 block text-[10px] tracking-normal text-solar">{formatRate(p.daysPerSecond)}</span>
          </span>
          <div className="flex">
            {SPEED_PRESETS.map((s) => {
              const on = p.daysPerSecond === s.days;
              return (
                <button
                  key={s.days}
                  onClick={() => p.onSpeed(s.days)}
                  aria-pressed={on}
                  className={`-ml-px border px-2 py-1.5 font-data text-[10.5px] transition-all duration-150 first:ml-0
                    ${
                      on
                        ? "z-10 border-solar bg-solar text-[#1a1204] shadow-[0_0_14px_rgba(255,201,77,0.35)]"
                        : "border-line bg-transparent text-fog hover:z-10 hover:border-fog-dim hover:text-icefog"
                    }`}
                  style={{ borderRadius: 0 }}
                  title={`${s.label} of simulated time per real second`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        <span className="hidden h-7 w-px bg-line md:block" />

        {/* view toggles */}
        <div className="flex items-center gap-1.5">
          <Toggle label="Orbits" on={p.showOrbits} onClick={() => p.onToggle("showOrbits")} />
          <Toggle label="Labels" on={p.showLabels} onClick={() => p.onToggle("showLabels")} />
          <Toggle label="Belt" on={p.showBelt} onClick={() => p.onToggle("showBelt")} />
          <button
            onClick={p.onResetView}
            aria-label="Reset camera view"
            title="Reset view"
            className="ml-1 grid h-[27px] w-[27px] place-items-center border border-line text-fog transition-all duration-200 hover:border-fog-dim hover:text-icefog"
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3">
              <circle cx="7" cy="7" r="3.1" />
              <path d="M7 0.8v2.4M7 10.8v2.4M0.8 7h2.4M10.8 7h2.4" />
            </svg>
          </button>
        </div>

        {/* hints */}
        <div className="hidden items-center gap-2.5 font-data text-[9.5px] uppercase tracking-[0.14em] text-fog-dim lg:flex">
          <span className="h-7 w-px bg-line" />
          <span>click a body</span>
          <span className="text-line">·</span>
          <span>scroll zoom</span>
          <span className="text-line">·</span>
          <span>drag pan</span>
          <span className="text-line">·</span>
          <span className="flex items-center gap-1">
            <kbd>space</kbd> pause
          </span>
        </div>
      </div>
    </div>
  );
}
