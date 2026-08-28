import { useEffect, useRef } from "react";
import { ALL_BODIES, NEPTUNE_R, TILT, type Body } from "../data/bodies";

interface Props {
  playing: boolean;
  daysPerSecond: number;
  selectedId: string | null;
  showOrbits: boolean;
  showLabels: boolean;
  showBelt: boolean;
  resetToken: number;
  onSelect: (id: string | null) => void;
  onTick: (days: number) => void;
}

interface Star {
  x: number;
  y: number;
  r: number;
  base: number;
  amp: number;
  tw: number;
  ph: number;
  par: number;
  tint: string;
}
interface Rock {
  r: number;
  a0: number;
  w: number;
  s: number;
  al: number;
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export default function SolarCanvas(props: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useEffect(() => {
    const canvas = canvasRef.current!;
    const wrap = wrapRef.current!;
    const ctx = canvas.getContext("2d")!;

    const size = { w: 0, h: 0 };
    let dpr = 1;
    const cam = { x: 0, y: 0, z: 0.8 };
    const tgt = { x: 0, y: 0, z: 0.8 };
    let insetCur = 0; // eased horizontal offset that reserves space for the data panel
    let userMoved = false;
    let stars: Star[] = [];
    const rocks: Rock[] = [];
    const sim = { days: 120 }; // start a little into the timeline
    let t = 0;
    let last = performance.now();
    let lastTick = 0;
    let hoverId: string | null = null;
    const drag = { on: false, sx: 0, sy: 0, cx: 0, cy: 0, moved: 0 };
    const shot = { on: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1 };

    // asteroid belt (generated once)
    for (let i = 0; i < 320; i++) {
      const bell = (Math.random() + Math.random() + Math.random()) / 3;
      rocks.push({
        r: 186 + bell * 28,
        a0: Math.random() * Math.PI * 2,
        w: (Math.PI * 2) / (1300 + Math.random() * 1100),
        s: 0.5 + Math.random() * 1.1,
        al: 0.18 + Math.random() * 0.5,
      });
    }

    const makeStars = () => {
      const { w, h } = size;
      const tints = ["#cdd9f2", "#cdd9f2", "#cdd9f2", "#cdd9f2", "#ffd9a0", "#a8c2ff"];
      const layers = [
        { n: Math.round((w * h) / 5200), par: 0.025, rMax: 0.9, aMax: 0.4 },
        { n: Math.round((w * h) / 9000), par: 0.06, rMax: 1.3, aMax: 0.6 },
        { n: Math.round((w * h) / 22000), par: 0.11, rMax: 1.9, aMax: 0.85 },
      ];
      stars = [];
      for (const L of layers) {
        for (let i = 0; i < L.n; i++) {
          stars.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: 0.3 + Math.random() * L.rMax,
            base: 0.15 + Math.random() * L.aMax * 0.6,
            amp: 0.1 + Math.random() * L.aMax * 0.4,
            tw: 0.4 + Math.random() * 1.8,
            ph: Math.random() * Math.PI * 2,
            par: L.par,
            tint: tints[Math.floor(Math.random() * tints.length)],
          });
        }
      }
    };

    const fitCamera = () => {
      const { w, h } = size;
      const z = clamp(
        Math.min(w / ((NEPTUNE_R + 66) * 2), h / ((NEPTUNE_R * TILT + 76) * 2)),
        0.22,
        2
      );
      return { x: 0, y: 0, z };
    };

    const frameBody = (b: Body) => {
      const { w, h } = size;
      const inset = w >= 768 ? 350 : 0;
      const avail = Math.max(w - inset, 320);
      const z = clamp(
        Math.min(avail / (b.frameR * 2.5), h / ((b.frameR * TILT + 84) * 2.25)),
        0.3,
        2.6
      );
      return { x: 0, y: 0, z };
    };

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      size.w = rect.width;
      size.h = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      makeStars();
      if (!userMoved) {
        const f = fitCamera();
        cam.x = tgt.x = f.x;
        cam.y = tgt.y = f.y;
        cam.z = tgt.z = f.z;
      }
    };

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    /* ---------- geometry helpers ---------- */
    const center = () => ({ cx: (size.w - insetCur) / 2, cy: size.h / 2 });
    const w2s = (wx: number, wy: number) => {
      const { cx, cy } = center();
      return { x: cx + (wx - cam.x) * cam.z, y: cy + (wy - cam.y) * cam.z };
    };
    const bodyPos = (b: Body) => {
      const th =
        b.orbitR === 0
          ? 0
          : b.theta0 + (sim.days / b.periodDays) * Math.PI * 2;
      return {
        wx: Math.cos(th) * b.orbitR,
        wy: Math.sin(th) * b.orbitR * TILT,
        th,
      };
    };
    const screenR = (b: Body) => Math.max(b.drawR * cam.z, b.orbitR === 0 ? 9 : 2.4);

    const hitTest = (mx: number, my: number): string | null => {
      const items = ALL_BODIES.map((b) => {
        const { wx, wy } = bodyPos(b);
        const s = w2s(wx, wy);
        return { b, x: s.x, y: s.y, r: screenR(b) };
      }).sort((a, c) => c.y - a.y); // front-most first
      for (const it of items) {
        const hr = Math.max(it.r + 6, 14);
        const dx = mx - it.x;
        const dy = my - it.y;
        if (dx * dx + dy * dy <= hr * hr) return it.b.id;
      }
      return null;
    };

    /* ---------- pointer interaction ---------- */
    const localXY = (e: PointerEvent | WheelEvent) => {
      const r = canvas.getBoundingClientRect();
      return { mx: e.clientX - r.left, my: e.clientY - r.top };
    };

    const onDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      const { mx, my } = localXY(e);
      drag.on = true;
      drag.sx = mx;
      drag.sy = my;
      drag.cx = tgt.x;
      drag.cy = tgt.y;
      drag.moved = 0;
    };
    const onMove = (e: PointerEvent) => {
      const { mx, my } = localXY(e);
      if (drag.on) {
        const dx = mx - drag.sx;
        const dy = my - drag.sy;
        drag.moved += Math.abs(e.movementX) + Math.abs(e.movementY);
        tgt.x = drag.cx - dx / cam.z;
        tgt.y = drag.cy - dy / cam.z;
        cam.x = tgt.x;
        cam.y = tgt.y;
        if (drag.moved > 8) userMoved = true;
        canvas.style.cursor = "grabbing";
        return;
      }
      hoverId = hitTest(mx, my);
      canvas.style.cursor = hoverId ? "pointer" : "grab";
    };
    const onUp = (e: PointerEvent) => {
      if (!drag.on) return;
      drag.on = false;
      canvas.style.cursor = "grab";
      if (drag.moved < 6) {
        const { mx, my } = localXY(e);
        propsRef.current.onSelect(hitTest(mx, my));
      }
    };
    const onLeave = () => {
      hoverId = null;
      if (!drag.on) canvas.style.cursor = "grab";
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const { mx, my } = localXY(e);
      const { cx, cy } = center();
      const factor = Math.exp(-e.deltaY * 0.0013);
      const nz = clamp(tgt.z * factor, 0.28, 4.2);
      const wx = tgt.x + (mx - cx) / tgt.z;
      const wy = tgt.y + (my - cy) / tgt.z;
      tgt.z = nz;
      tgt.x = wx - (mx - cx) / nz;
      tgt.y = wy - (my - cy) / nz;
      userMoved = true;
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.style.cursor = "grab";
    canvas.style.touchAction = "none";

    /* ---------- draw helpers ---------- */
    const drawSun = (sx: number, sy: number, r: number, active: boolean) => {
      const pulse = 1 + 0.05 * Math.sin(t * 1.8);
      // corona
      const g = ctx.createRadialGradient(sx, sy, r * 0.4, sx, sy, r * 6 * pulse);
      g.addColorStop(0, "rgba(255,190,70,0.34)");
      g.addColorStop(0.35, "rgba(255,150,50,0.10)");
      g.addColorStop(1, "rgba(255,120,40,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(sx, sy, r * 6 * pulse, 0, Math.PI * 2);
      ctx.fill();
      // anamorphic flare
      ctx.save();
      ctx.globalAlpha = 0.07 + 0.02 * Math.sin(t * 1.3);
      ctx.strokeStyle = "#ffd98a";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sx - r * 10, sy);
      ctx.lineTo(sx + r * 10, sy);
      ctx.moveTo(sx, sy - r * 6);
      ctx.lineTo(sx, sy + r * 6);
      ctx.stroke();
      ctx.restore();
      // body
      const bg = ctx.createRadialGradient(sx - r * 0.3, sy - r * 0.3, r * 0.1, sx, sy, r);
      bg.addColorStop(0, "#fff8dc");
      bg.addColorStop(0.4, "#ffd75e");
      bg.addColorStop(0.78, "#f59e0b");
      bg.addColorStop(1, "#b45309");
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,224,140,0.55)";
      ctx.lineWidth = 1;
      ctx.stroke();
      if (active) selectionRing(sx, sy, r, "#ffc94d");
    };

    const selectionRing = (sx: number, sy: number, r: number, color: string) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.9;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 5]);
      ctx.lineDashOffset = -t * 16;
      ctx.beginPath();
      ctx.arc(sx, sy, r + 7 + 1.6 * Math.sin(t * 3), 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 0.22;
      ctx.beginPath();
      ctx.arc(sx, sy, r + 13, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    };

    const drawRings = (sx: number, sy: number, r: number, back: boolean) => {
      const rx = r * 2.15;
      const ry = rx * 0.3;
      const a0 = back ? Math.PI : 0;
      const a1 = back ? Math.PI * 2 : Math.PI;
      ctx.save();
      ctx.strokeStyle = "rgba(216,190,138,0.6)";
      ctx.lineWidth = Math.max(1.4, r * 0.3);
      ctx.beginPath();
      ctx.ellipse(sx, sy, rx, ry, -0.12, a0, a1);
      ctx.stroke();
      ctx.strokeStyle = "rgba(150,128,88,0.35)";
      ctx.lineWidth = Math.max(1, r * 0.12);
      ctx.beginPath();
      ctx.ellipse(sx, sy, rx * 0.8, ry * 0.8, -0.12, a0, a1);
      ctx.stroke();
      ctx.restore();
    };

    const drawPlanet = (b: Body, sx: number, sy: number, r: number, active: boolean) => {
      const sc = w2s(0, 0);
      const dx = sc.x - sx;
      const dy = sc.y - sy;
      const d = Math.hypot(dx, dy) || 1;
      const nx = dx / d;
      const ny = dy / d;

      if (b.hasRings) drawRings(sx, sy, r, true);

      // soft accent glow when active
      if (active) {
        const gg = ctx.createRadialGradient(sx, sy, r * 0.5, sx, sy, r * 3.2);
        gg.addColorStop(0, b.accent + "55");
        gg.addColorStop(1, b.accent + "00");
        ctx.fillStyle = gg;
        ctx.beginPath();
        ctx.arc(sx, sy, r * 3.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // moon (behind part)
      let moonA = 0;
      if (b.hasMoon) {
        moonA = (sim.days / 27.3) * Math.PI * 2 + 1.2;
        const behind = Math.sin(moonA) < 0;
        const md = 13 * cam.z;
        const mx = sx + Math.cos(moonA) * md;
        const my = sy + Math.sin(moonA) * md * TILT;
        if (behind) drawMoon(mx, my, r);
      }

      // shaded sphere, lit toward the Sun
      const lx = sx + nx * r * 0.5;
      const ly = sy + ny * r * 0.5;
      const g = ctx.createRadialGradient(lx, ly, r * 0.12, sx, sy, r * 1.05);
      g.addColorStop(0, b.light);
      g.addColorStop(0.5, b.base);
      g.addColorStop(1, b.dark);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();

      // cloud / gas bands
      if (b.bands) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(sx, sy, r * 0.99, 0, Math.PI * 2);
        ctx.clip();
        const n = b.bands.length;
        b.bands.forEach((c, i) => {
          const y = sy - r + ((i + 1) / (n + 1)) * 2 * r;
          ctx.globalAlpha = 0.28;
          ctx.fillStyle = c;
          ctx.fillRect(sx - r, y - r * 0.09, r * 2, r * 0.18);
        });
        ctx.restore();
      }
      // rough continents for Earth
      if (b.id === "earth" && r > 4) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(sx, sy, r * 0.99, 0, Math.PI * 2);
        ctx.clip();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = "#5f9e57";
        ctx.beginPath();
        ctx.ellipse(sx - r * 0.3 + nx * r * 0.2, sy - r * 0.25, r * 0.34, r * 0.22, 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(sx + r * 0.25 + nx * r * 0.2, sy + r * 0.3, r * 0.26, r * 0.18, -0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      // night-side deepening
      const sh = ctx.createRadialGradient(lx, ly, r * 0.5, sx - nx * r * 0.6, sy - ny * r * 0.6, r * 1.5);
      sh.addColorStop(0, "rgba(2,4,12,0)");
      sh.addColorStop(1, "rgba(2,4,12,0.55)");
      ctx.fillStyle = sh;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();

      // moon (front part)
      if (b.hasMoon) {
        const behind = Math.sin(moonA) < 0;
        const md = 13 * cam.z;
        const mx = sx + Math.cos(moonA) * md;
        const my = sy + Math.sin(moonA) * md * TILT;
        if (!behind) drawMoon(mx, my, r);
      }

      if (b.hasRings) drawRings(sx, sy, r, false);
      if (active) selectionRing(sx, sy, b.hasRings ? r * 2.45 : r, b.accent);
      else if (hoverId === b.id) {
        ctx.save();
        ctx.strokeStyle = b.accent;
        ctx.globalAlpha = 0.55;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(sx, sy, r + 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    };

    const drawMoon = (mx: number, my: number, pr: number) => {
      const mr = Math.max(pr * 0.26, 1.3);
      ctx.fillStyle = "#c3cad6";
      ctx.beginPath();
      ctx.arc(mx, my, mr, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(20,26,40,0.4)";
      ctx.beginPath();
      ctx.arc(mx + mr * 0.3, my + mr * 0.25, mr * 0.75, 0, Math.PI * 2);
      ctx.fill();
    };

    /* ---------- main loop ---------- */
    let raf = 0;
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      t += dt;
      const p = propsRef.current;
      if (p.playing) sim.days += dt * p.daysPerSecond;

      // camera easing
      const k = Math.min(1, dt * 5.5);
      cam.x += (tgt.x - cam.x) * k;
      cam.y += (tgt.y - cam.y) * k;
      cam.z += (tgt.z - cam.z) * k;
      const insetTarget = p.selectedId && size.w >= 768 ? 350 : 0;
      insetCur += (insetTarget - insetCur) * Math.min(1, dt * 7);

      const { w, h } = size;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // deep space backdrop
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "#04060d");
      bg.addColorStop(0.5, "#070c19");
      bg.addColorStop(1, "#04070f");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const sc = w2s(0, 0);
      const warm = ctx.createRadialGradient(sc.x, sc.y, 0, sc.x, sc.y, Math.max(w, h) * 0.62);
      warm.addColorStop(0, "rgba(255,166,60,0.06)");
      warm.addColorStop(0.5, "rgba(120,90,40,0.02)");
      warm.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = warm;
      ctx.fillRect(0, 0, w, h);

      // stars
      for (const s of stars) {
        const sx = ((s.x - cam.x * s.par * cam.z * 8) % w + w) % w;
        const sy = ((s.y - cam.y * s.par * cam.z * 8) % h + h) % h;
        const a = s.base + s.amp * Math.sin(t * s.tw + s.ph);
        ctx.globalAlpha = Math.max(0.05, a);
        ctx.fillStyle = s.tint;
        ctx.beginPath();
        ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // shooting star
      if (!shot.on && Math.random() < dt * 0.09) {
        shot.on = true;
        shot.x = Math.random() * w * 0.8;
        shot.y = Math.random() * h * 0.35;
        shot.vx = 340 + Math.random() * 220;
        shot.vy = 130 + Math.random() * 90;
        shot.max = shot.life = 0.9 + Math.random() * 0.5;
      }
      if (shot.on) {
        shot.life -= dt;
        shot.x += shot.vx * dt;
        shot.y += shot.vy * dt;
        if (shot.life <= 0) shot.on = false;
        else {
          const f = Math.sin((shot.life / shot.max) * Math.PI);
          const grad = ctx.createLinearGradient(shot.x, shot.y, shot.x - shot.vx * 0.14, shot.y - shot.vy * 0.14);
          grad.addColorStop(0, `rgba(220,235,255,${0.85 * f})`);
          grad.addColorStop(1, "rgba(220,235,255,0)");
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(shot.x, shot.y);
          ctx.lineTo(shot.x - shot.vx * 0.14, shot.y - shot.vy * 0.14);
          ctx.stroke();
        }
      }

      // orbit paths
      if (p.showOrbits) {
        for (const b of ALL_BODIES) {
          if (b.orbitR === 0) continue;
          const sel = p.selectedId === b.id;
          const hov = hoverId === b.id;
          ctx.beginPath();
          ctx.ellipse(sc.x, sc.y, b.orbitR * cam.z, b.orbitR * TILT * cam.z, 0, 0, Math.PI * 2);
          if (sel) {
            ctx.strokeStyle = b.accent;
            ctx.globalAlpha = 0.16;
            ctx.lineWidth = 5;
            ctx.stroke();
            ctx.globalAlpha = 0.85;
            ctx.lineWidth = 1.3;
            ctx.stroke();
          } else {
            ctx.strokeStyle = "#8fa3c4";
            ctx.globalAlpha = hov ? 0.4 : 0.16;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
          ctx.globalAlpha = 1;
        }
      }

      // asteroid belt
      if (p.showBelt) {
        ctx.fillStyle = "#97a3ba";
        for (const rk of rocks) {
          const a = rk.a0 + sim.days * rk.w;
          const s = w2s(Math.cos(a) * rk.r, Math.sin(a) * rk.r * TILT);
          if (s.x < -10 || s.x > w + 10 || s.y < -10 || s.y > h + 10) continue;
          ctx.globalAlpha = rk.al;
          const px = rk.s * Math.max(cam.z, 0.6);
          ctx.fillRect(s.x, s.y, px, px);
        }
        ctx.globalAlpha = 1;
      }

      // bodies, painter's order (back → front)
      const items = ALL_BODIES.map((b) => {
        const { wx, wy } = bodyPos(b);
        const s = w2s(wx, wy);
        return { b, x: s.x, y: s.y, r: screenR(b) };
      }).sort((a, c) => a.y - c.y);

      const labels: { text: string; x: number; y: number; r: number; color: string; strong: boolean }[] = [];
      for (const it of items) {
        const active = p.selectedId === it.b.id || hoverId === it.b.id;
        if (it.b.orbitR === 0) drawSun(it.x, it.y, it.r, p.selectedId === it.b.id || hoverId === it.b.id);
        else drawPlanet(it.b, it.x, it.y, it.r, active);
        const show = p.showLabels || p.selectedId === it.b.id || hoverId === it.b.id;
        if (show)
          labels.push({
            text: it.b.name.toUpperCase(),
            x: it.x,
            y: it.y,
            r: it.b.hasRings ? it.r * 2.2 : it.r,
            color: it.b.accent,
            strong: p.selectedId === it.b.id || hoverId === it.b.id,
          });
      }

      // labels
      ctx.font = '600 10px "IBM Plex Mono", monospace';
      ctx.textBaseline = "middle";
      for (const L of labels) {
        const lx = L.x + L.r + 9;
        const ly = L.y;
        ctx.strokeStyle = L.color;
        ctx.globalAlpha = L.strong ? 0.85 : 0.4;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(L.x + L.r + 3, ly);
        ctx.lineTo(lx - 3, ly);
        ctx.stroke();
        ctx.globalAlpha = L.strong ? 1 : 0.62;
        ctx.fillStyle = L.color;
        ctx.fillText(L.text, lx, ly);
      }
      ctx.globalAlpha = 1;

      // throttled telemetry back to React
      if (now - lastTick > 180) {
        lastTick = now;
        p.onTick(sim.days);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onFrame = (e: Event) => {
      const id = (e as CustomEvent).detail as string | null;
      if (!id) return;
      const b = ALL_BODIES.find((x) => x.id === id);
      if (!b) return;
      const f = frameBody(b);
      tgt.x = f.x;
      tgt.y = f.y;
      tgt.z = f.z;
      userMoved = true;
    };
    const onReset = () => {
      const f = fitCamera();
      tgt.x = f.x;
      tgt.y = f.y;
      tgt.z = f.z;
      cam.x = f.x;
      cam.y = f.y;
      cam.z = f.z;
      userMoved = false;
    };
    window.addEventListener("orrery:frame", onFrame);
    window.addEventListener("orrery:reset", onReset);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("orrery:frame", onFrame);
      window.removeEventListener("orrery:reset", onReset);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("wheel", onWheel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // camera framing on selection
  useEffect(() => {
    const ev = new CustomEvent("orrery:frame", { detail: props.selectedId });
    window.dispatchEvent(ev);
  }, [props.selectedId]);

  // camera reset
  useEffect(() => {
    if (props.resetToken === 0) return;
    const ev = new CustomEvent("orrery:reset");
    window.dispatchEvent(ev);
  }, [props.resetToken]);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="block" />
    </div>
  );
}
