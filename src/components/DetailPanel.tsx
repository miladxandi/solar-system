import type { Body } from "../data/bodies";

interface Props {
  body: Body;
  days: number;
  onClose: () => void;
}

function Corner({ pos, color }: { pos: string; color: string }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute h-3 w-3 ${pos}`}
      style={{ borderColor: color, borderStyle: "solid", borderWidth: 0 }}
      ref={(el) => {
        if (!el) return;
        if (pos.includes("top")) el.style.borderTopWidth = "2px";
        if (pos.includes("bottom")) el.style.borderBottomWidth = "2px";
        if (pos.includes("left")) el.style.borderLeftWidth = "2px";
        if (pos.includes("right")) el.style.borderRightWidth = "2px";
      }}
    />
  );
}

function Stat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent: string }) {
  return (
    <div className="border border-line/80 bg-hull/70 px-3 py-2.5 transition-colors duration-200 hover:border-fog-dim/60">
      <div className="font-data text-[9px] uppercase tracking-[0.22em] text-fog-dim">{label}</div>
      <div className="mt-1 font-data text-[13px] font-medium leading-tight text-icefog">{value}</div>
      {sub && (
        <div className="font-data text-[10px] leading-tight" style={{ color: accent }}>
          {sub}
        </div>
      )}
    </div>
  );
}

export default function DetailPanel({ body, days, onClose }: Props) {
  const progress =
    body.periodDays > 0 ? ((days % body.periodDays) / body.periodDays) * 100 : null;

  return (
    <aside
      key={body.id}
      className="anim-panel pointer-events-auto absolute z-30 flex flex-col overflow-hidden border bg-[#0a1120]/95 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-sm
        inset-x-2 bottom-[118px] top-auto max-h-[46vh]
        md:inset-x-auto md:right-4 md:bottom-[104px] md:top-20 md:max-h-none md:w-[340px]"
      style={{ borderColor: `${body.accent}44` }}
      role="dialog"
      aria-label={`${body.name} facts`}
    >
      <Corner pos="top left" color={body.accent} />
      <Corner pos="top right" color={body.accent} />
      <Corner pos="bottom left" color={body.accent} />
      <Corner pos="bottom right" color={body.accent} />

      <div className="slim-scroll overflow-y-auto">
        {/* header */}
        <div className="flex items-start justify-between gap-3 px-5 pt-4">
          <div>
            <div
              className="inline-flex items-center gap-1.5 border px-2 py-0.5 font-data text-[9px] uppercase tracking-[0.2em]"
              style={{ borderColor: `${body.accent}66`, color: body.accent }}
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: body.accent }} />
              {body.kind}
            </div>
            <h2
              className="mt-2 font-display text-[30px] font-800 leading-none tracking-wide"
              style={{ color: body.accent, fontWeight: 800, textShadow: `0 0 24px ${body.accent}55` }}
            >
              {body.name.toUpperCase()}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close panel"
            className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center border border-line text-fog transition-all duration-200 hover:border-fog hover:text-icefog"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M1 1l10 10M11 1L1 11" />
            </svg>
          </button>
        </div>

        {/* live orbit progress */}
        {progress !== null && (
          <div className="mt-4 px-5">
            <div className="flex items-baseline justify-between font-data text-[9px] uppercase tracking-[0.22em] text-fog-dim">
              <span>Orbit progress · live</span>
              <span style={{ color: body.accent }}>{progress.toFixed(1)}%</span>
            </div>
            <div className="mt-1.5 h-1 w-full overflow-hidden bg-line/60">
              <div
                className="h-full transition-[width] duration-200 ease-linear"
                style={{ width: `${progress}%`, background: body.accent, boxShadow: `0 0 8px ${body.accent}` }}
              />
            </div>
          </div>
        )}

        {/* fact */}
        <p
          className="mx-5 mt-4 border-l-2 py-0.5 pl-3 text-[13px] leading-relaxed text-icefog/90"
          style={{ borderColor: body.accent }}
        >
          {body.fact}
        </p>

        {/* stats */}
        <div className="grid grid-cols-2 gap-2 px-5 pb-5 pt-4">
          <Stat label="Diameter" value={body.diameterKm} accent={body.accent} />
          <Stat label="Mass" value={body.mass} accent={body.accent} />
          <Stat label="Dist. from Sun" value={body.distanceMkm} sub={body.distanceAU} accent={body.accent} />
          <Stat label="Orbital period" value={body.periodLabel} accent={body.accent} />
          <Stat label="Day length" value={body.dayLength} accent={body.accent} />
          <Stat label="Moons" value={body.moons} accent={body.accent} />
          <Stat label="Orbital velocity" value={body.velocityKms} accent={body.accent} />
          <Stat label="Temperature" value={body.meanTemp} accent={body.accent} />
        </div>
      </div>
    </aside>
  );
}
