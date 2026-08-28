import { ALL_BODIES } from "../data/bodies";

interface Props {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function PlanetDock({ selectedId, onSelect }: Props) {
  return (
    <>
      {/* left rail — desktop */}
      <nav
        aria-label="Planets"
        className="pointer-events-auto absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-0.5 md:flex"
      >
        <div className="mb-1.5 pl-2 font-data text-[9px] uppercase tracking-[0.28em] text-fog-dim">
          Bodies
        </div>
        {ALL_BODIES.map((b) => {
          const on = selectedId === b.id;
          return (
            <button
              key={b.id}
              onClick={() => onSelect(b.id)}
              className={`group flex items-center gap-2.5 border-l-2 py-[7px] pl-2.5 pr-3 text-left transition-all duration-200
                ${on ? "bg-hull/80" : "border-transparent hover:bg-hull/50"}`}
              style={{ borderColor: on ? b.accent : undefined }}
            >
              <span
                className="h-[9px] w-[9px] shrink-0 rounded-full transition-transform duration-200 group-hover:scale-125"
                style={{
                  background: `radial-gradient(circle at 35% 35%, ${b.light}, ${b.base} 55%, ${b.dark})`,
                  boxShadow: on ? `0 0 10px ${b.accent}` : `0 0 4px ${b.accent}66`,
                }}
              />
              <span
                className={`font-data text-[10px] uppercase tracking-[0.2em] transition-colors duration-200 ${on ? "" : "text-fog group-hover:text-icefog"}`}
                style={on ? { color: b.accent } : undefined}
              >
                {b.name}
              </span>
              <span className="ml-auto pl-2 font-data text-[8.5px] text-fog-dim/70">{b.order}</span>
            </button>
          );
        })}
      </nav>

      {/* horizontal strip — mobile */}
      <nav
        aria-label="Planets"
        className="slim-scroll pointer-events-auto absolute inset-x-0 bottom-[86px] z-20 flex gap-1 overflow-x-auto px-3 py-1 md:hidden"
      >
        {ALL_BODIES.map((b) => {
          const on = selectedId === b.id;
          return (
            <button
              key={b.id}
              onClick={() => onSelect(b.id)}
              className={`flex shrink-0 items-center gap-1.5 border px-2 py-1 transition-all duration-200 ${
                on ? "border-fog-dim bg-hull/85" : "border-line/60 bg-hull/60"
              }`}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: b.base, boxShadow: on ? `0 0 8px ${b.accent}` : "none" }}
              />
              <span
                className="font-data text-[9px] uppercase tracking-[0.12em]"
                style={{ color: on ? b.accent : "#8fa3c4" }}
              >
                {b.name}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
