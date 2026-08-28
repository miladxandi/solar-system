export interface Body {
  id: string;
  name: string;
  kind: string; // classification label
  order: number; // 0 = Sun, 1..8 planets
  /** true body facts */
  diameterKm: string;
  mass: string;
  distanceMkm: string; // million km, "0" for Sun
  distanceAU: string;
  periodDays: number; // 0 for Sun (not orbiting)
  periodLabel: string;
  dayLength: string;
  moons: string;
  velocityKms: string;
  meanTemp: string;
  fact: string;
  /** render config (not to scale — tuned for the orrery) */
  orbitR: number; // world units from Sun
  drawR: number; // world units radius
  theta0: number; // starting angle, radians
  accent: string; // UI accent color
  base: string; // sphere mid tone
  light: string; // lit side
  dark: string; // shadow side
  hasRings?: boolean;
  hasMoon?: boolean;
  bands?: string[]; // subtle stripe tints
  frameR: number; // camera framing radius when selected
}

export const SUN: Body = {
  id: "sun",
  name: "Sun",
  kind: "G-type main-sequence star",
  order: 0,
  diameterKm: "1,392,700 km",
  mass: "1.989 × 10³⁰ kg",
  distanceMkm: "0 — system center",
  distanceAU: "—",
  periodDays: 0,
  periodLabel: "orbits the Milky Way every ~230M yr",
  dayLength: "≈ 27 Earth days (equator)",
  moons: "8 planets in tow",
  velocityKms: "230 km/s around the galaxy",
  meanTemp: "5,505 °C surface",
  fact: "The Sun holds 99.86% of all mass in the solar system — everything else is rounding error.",
  orbitR: 0,
  drawR: 24,
  theta0: 0,
  accent: "#ffc94d",
  base: "#fdb813",
  light: "#fff6cf",
  dark: "#c2660a",
  frameR: 210,
};

export const PLANETS: Body[] = [
  {
    id: "mercury",
    name: "Mercury",
    kind: "Terrestrial planet",
    order: 1,
    diameterKm: "4,879 km",
    mass: "3.30 × 10²³ kg",
    distanceMkm: "57.9M km",
    distanceAU: "0.39 AU",
    periodDays: 88,
    periodLabel: "88 Earth days",
    dayLength: "58.6 Earth days",
    moons: "0",
    velocityKms: "47.4 km/s",
    meanTemp: "167 °C mean",
    fact: "A year on Mercury lasts just 88 days, yet one full day–night cycle takes 176 Earth days — two of its years fit inside a single day.",
    orbitR: 66,
    drawR: 3.6,
    theta0: 0.7,
    accent: "#c9b8a6",
    base: "#9c8b7a",
    light: "#e0d2ba",
    dark: "#4c443b",
    frameR: 120,
  },
  {
    id: "venus",
    name: "Venus",
    kind: "Terrestrial planet",
    order: 2,
    diameterKm: "12,104 km",
    mass: "4.87 × 10²⁴ kg",
    distanceMkm: "108.2M km",
    distanceAU: "0.72 AU",
    periodDays: 224.7,
    periodLabel: "225 Earth days",
    dayLength: "243 Earth days — retrograde",
    moons: "0",
    velocityKms: "35.0 km/s",
    meanTemp: "464 °C — hottest planet",
    fact: "Venus spins backwards, so its Sun rises in the west. Its runaway greenhouse makes it hotter than Mercury despite being twice as far out.",
    orbitR: 95,
    drawR: 5.6,
    theta0: 2.3,
    accent: "#f2c66d",
    base: "#e3bd72",
    light: "#ffeec2",
    dark: "#7c5c26",
    frameR: 145,
  },
  {
    id: "earth",
    name: "Earth",
    kind: "Terrestrial planet",
    order: 3,
    diameterKm: "12,742 km",
    mass: "5.97 × 10²⁴ kg",
    distanceMkm: "149.6M km",
    distanceAU: "1.00 AU",
    periodDays: 365.25,
    periodLabel: "365.25 days",
    dayLength: "23.9 hours",
    moons: "1 — the Moon",
    velocityKms: "29.8 km/s",
    meanTemp: "15 °C mean",
    fact: "The only world known to host life. Liquid water covers 71% of its surface, and its large Moon steadies the axial tilt that gives us seasons.",
    orbitR: 128,
    drawR: 6,
    theta0: 3.9,
    accent: "#5aa7f0",
    base: "#3f7fd4",
    light: "#c4e2ff",
    dark: "#0f2f5e",
    hasMoon: true,
    frameR: 175,
  },
  {
    id: "mars",
    name: "Mars",
    kind: "Terrestrial planet",
    order: 4,
    diameterKm: "6,779 km",
    mass: "6.42 × 10²³ kg",
    distanceMkm: "227.9M km",
    distanceAU: "1.52 AU",
    periodDays: 687,
    periodLabel: "687 Earth days",
    dayLength: "24.6 hours",
    moons: "2 — Phobos & Deimos",
    velocityKms: "24.1 km/s",
    meanTemp: "−63 °C mean",
    fact: "Home to Olympus Mons, a volcano nearly 22 km tall — almost three Everests — and to Valles Marineris, a canyon that would span the USA.",
    orbitR: 162,
    drawR: 4.6,
    theta0: 5.4,
    accent: "#e8703f",
    base: "#cf5b32",
    light: "#ffc09a",
    dark: "#5e220d",
    frameR: 205,
  },
  {
    id: "jupiter",
    name: "Jupiter",
    kind: "Gas giant",
    order: 5,
    diameterKm: "139,820 km",
    mass: "1.90 × 10²⁷ kg",
    distanceMkm: "778.5M km",
    distanceAU: "5.20 AU",
    periodDays: 4333,
    periodLabel: "11.9 Earth years",
    dayLength: "9.9 hours — fastest spin",
    moons: "95 confirmed",
    velocityKms: "13.1 km/s",
    meanTemp: "−108 °C cloud tops",
    fact: "The Great Red Spot is a storm wider than Earth that has raged for at least 190 years. Jupiter is 2.5× more massive than all other planets combined.",
    orbitR: 248,
    drawR: 15,
    theta0: 1.1,
    accent: "#e0a870",
    base: "#c9975f",
    light: "#ffe4c2",
    dark: "#5d3d1c",
    bands: ["#b47b45", "#e8c795", "#a56a38", "#dcb87f"],
    frameR: 295,
  },
  {
    id: "saturn",
    name: "Saturn",
    kind: "Gas giant",
    order: 6,
    diameterKm: "116,460 km",
    mass: "5.68 × 10²⁶ kg",
    distanceMkm: "1,434M km",
    distanceAU: "9.58 AU",
    periodDays: 10759,
    periodLabel: "29.4 Earth years",
    dayLength: "10.7 hours",
    moons: "146 confirmed",
    velocityKms: "9.7 km/s",
    meanTemp: "−139 °C cloud tops",
    fact: "Saturn is less dense than water — it would float in a big enough bathtub. Its rings span 280,000 km yet are often only ~10 metres thick.",
    orbitR: 304,
    drawR: 12,
    theta0: 2.9,
    accent: "#ecd3a0",
    base: "#e0bd82",
    light: "#ffefcb",
    dark: "#6f5327",
    hasRings: true,
    bands: ["#c9a468", "#efd9ab"],
    frameR: 350,
  },
  {
    id: "uranus",
    name: "Uranus",
    kind: "Ice giant",
    order: 7,
    diameterKm: "50,724 km",
    mass: "8.68 × 10²⁵ kg",
    distanceMkm: "2,871M km",
    distanceAU: "19.2 AU",
    periodDays: 30687,
    periodLabel: "84 Earth years",
    dayLength: "17.2 hours — tilted 98°",
    moons: "28 known",
    velocityKms: "6.8 km/s",
    meanTemp: "−195 °C",
    fact: "Uranus rolls around the Sun on its side with a 98° axial tilt — likely knocked over by an ancient collision. Each pole gets 42 years of daylight, then 42 of night.",
    orbitR: 350,
    drawR: 8.6,
    theta0: 4.6,
    accent: "#7fd8dc",
    base: "#8fd5d8",
    light: "#e2feff",
    dark: "#25565e",
    frameR: 392,
  },
  {
    id: "neptune",
    name: "Neptune",
    kind: "Ice giant",
    order: 8,
    diameterKm: "49,244 km",
    mass: "1.02 × 10²⁶ kg",
    distanceMkm: "4,495M km",
    distanceAU: "30.1 AU",
    periodDays: 60190,
    periodLabel: "164.8 Earth years",
    dayLength: "16.1 hours",
    moons: "16 known",
    velocityKms: "5.4 km/s",
    meanTemp: "−201 °C",
    fact: "Neptune's winds hit 2,100 km/h — the fastest in the solar system. Discovered by mathematics in 1846 before any telescope found it, it has completed only one orbit since.",
    orbitR: 392,
    drawR: 8.2,
    theta0: 5.95,
    accent: "#6f8ef7",
    base: "#3e66c9",
    light: "#bfd2ff",
    dark: "#131f4d",
    bands: ["#2f4fa3", "#5b7fdd"],
    frameR: 432,
  },
];

export const ALL_BODIES: Body[] = [SUN, ...PLANETS];

export const SPEED_PRESETS = [
  { label: "10 d/s", days: 10 },
  { label: "1 mo/s", days: 30 },
  { label: "3 mo/s", days: 90 },
  { label: "1 yr/s", days: 365 },
  { label: "5 yr/s", days: 1826 },
];

export const TILT = 0.48; // vertical squash for the angled view
export const NEPTUNE_R = 392;

export function formatRate(daysPerSecond: number): string {
  if (daysPerSecond >= 365) return `${(daysPerSecond / 365.25).toFixed(1)} yr/s`;
  return `${daysPerSecond} d/s`;
}

export function formatElapsed(days: number): string {
  const y = Math.floor(days / 365.25);
  const d = Math.floor(days % 365.25);
  if (y === 0) return `${d}d`;
  return `${y}y ${d}d`;
}
