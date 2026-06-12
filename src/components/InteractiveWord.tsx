import React, { useEffect, useRef } from 'react';

const WORD = 'interactive';

/** Hard cap on particle count — sampling step adapts to stay under this. */
const MAX_PARTICLES = 320;
/** Lower budget for touch devices, where GPUs/CPUs tend to be weaker. */
const MAX_PARTICLES_COARSE = 200;
/** Max physics timestep (s) — clamps tab-switch jumps. */
const MAX_DT = 0.032;

// ---------------------------------------------------------------------------
// Shared sampling
// ---------------------------------------------------------------------------

interface SampledWord {
  /** Filled glyph points as offsets relative to the word's bounding box. */
  pts: { hx: number; hy: number }[];
  /** Grid step used for sampling — particle sizing derives from this. */
  step: number;
  /** The rasterized word (CSS pixels), padded by padX/padY. */
  raster: HTMLCanvasElement;
  padX: number;
  padY: number;
}

interface View {
  vw: number;
  vh: number;
  /** Live bounding rect of the word — recomputed every frame. */
  rect: DOMRect;
  /** Live computed text color — theme toggles repaint correctly. */
  color: string;
}

type EffectStatus = 'active' | 'resting' | 'done';

/**
 * A word-destruction effect. Lifecycle: init() on hover, step() each frame
 * (returns 'resting' once everything is still so the host can pause the rAF
 * loop), release() on click to begin the exit, then 'done' → host teardown.
 */
interface WordEffect {
  init(sample: SampledWord, rect: DOMRect, t: number): void;
  step(ctx: CanvasRenderingContext2D, dt: number, t: number, view: View): EffectStatus;
  /** Begin the exit tween; returns its total duration (ms) so the host can
   *  crossfade the real text back in during the final stretch. */
  release(t: number): number;
}

// ---------------------------------------------------------------------------
// Effect 1: Marbles — bouncy cascade to the viewport floor
// ---------------------------------------------------------------------------

const M_GRAVITY = 2600;
const M_RESTITUTION = 0.45;
const M_FLOOR_FRICTION = 0.92;
const M_RETURN_MS = 380;
const M_RETURN_STAGGER_MS = 180;

interface Marble {
  hx: number; hy: number;
  x: number; y: number;
  vx: number; vy: number;
  r: number;
  sx: number; sy: number;
  dur: number;
}

function createMarbleEffect(): WordEffect {
  let marbles: Marble[] = [];
  let phase: 'out' | 'back' = 'out';
  let returnT0 = 0;

  const drawMarble = (c: CanvasRenderingContext2D, m: Marble, color: string) => {
    c.fillStyle = color;
    c.beginPath();
    c.arc(m.x, m.y, m.r, 0, Math.PI * 2);
    c.fill();

    // Specular highlight (upper left)
    const hl = c.createRadialGradient(
      m.x - m.r * 0.35, m.y - m.r * 0.35, 0,
      m.x - m.r * 0.35, m.y - m.r * 0.35, m.r * 0.9,
    );
    hl.addColorStop(0, 'rgba(255,255,255,0.65)');
    hl.addColorStop(0.5, 'rgba(255,255,255,0.08)');
    hl.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = hl;
    c.beginPath();
    c.arc(m.x, m.y, m.r, 0, Math.PI * 2);
    c.fill();

    // Soft shading toward the lower right
    const sh = c.createRadialGradient(
      m.x + m.r * 0.4, m.y + m.r * 0.4, m.r * 0.2,
      m.x, m.y, m.r,
    );
    sh.addColorStop(0, 'rgba(0,0,0,0)');
    sh.addColorStop(1, 'rgba(0,0,0,0.22)');
    c.fillStyle = sh;
    c.beginPath();
    c.arc(m.x, m.y, m.r, 0, Math.PI * 2);
    c.fill();
  };

  return {
    init(sample, rect) {
      phase = 'out';
      marbles = sample.pts.map(({ hx, hy }) => ({
        hx, hy,
        x: rect.left + hx,
        y: rect.top + hy,
        vx: (Math.random() - 0.5) * 240,
        vy: -60 - Math.random() * 220,
        r: sample.step * (0.5 + Math.random() * 0.22),
        sx: 0, sy: 0,
        dur: M_RETURN_MS + Math.random() * M_RETURN_STAGGER_MS,
      }));
    },

    release(t) {
      phase = 'back';
      returnT0 = t;
      let total = 0;
      for (const m of marbles) {
        m.sx = m.x;
        m.sy = m.y;
        if (m.dur > total) total = m.dur;
      }
      return total;
    },

    step(ctx, dt, t, view) {
      if (phase === 'out') {
        let allResting = true;
        for (const m of marbles) {
          m.vy += M_GRAVITY * dt;
          m.x += m.vx * dt;
          m.y += m.vy * dt;

          // Floor — bounce, then roll with friction. The bounce-kill threshold
          // must exceed GRAVITY * MAX_DT (~83) or marbles micro-bounce forever
          // and the loop can never sleep.
          if (m.y + m.r > view.vh) {
            m.y = view.vh - m.r;
            if (Math.abs(m.vy) > 100) {
              m.vy = -m.vy * (M_RESTITUTION + Math.random() * 0.08);
            } else {
              m.vy = 0;
            }
            m.vx *= M_FLOOR_FRICTION;
          }
          // Side walls
          if (m.x - m.r < 0) {
            m.x = m.r;
            m.vx = Math.abs(m.vx) * 0.6;
          } else if (m.x + m.r > view.vw) {
            m.x = view.vw - m.r;
            m.vx = -Math.abs(m.vx) * 0.6;
          }

          if (m.vy !== 0 || Math.abs(m.vx) > 2 || m.y + m.r < view.vh - 0.5) allResting = false;
          drawMarble(ctx, m, view.color);
        }
        return allResting ? 'resting' : 'active';
      }

      // Fixed-duration ease-out tween — frame-rate independent regroup.
      let settled = true;
      for (const m of marbles) {
        const p = Math.min(1, (t - returnT0) / m.dur);
        const e = 1 - (1 - p) ** 3;
        m.x = m.sx + (view.rect.left + m.hx - m.sx) * e;
        m.y = m.sy + (view.rect.top + m.hy - m.sy) * e;
        if (p < 1) settled = false;
        drawMarble(ctx, m, view.color);
      }
      return settled ? 'done' : 'active';
    },
  };
}

// ---------------------------------------------------------------------------
// Effect 2: Eraser — an invisible front sweeps the word away into crumbs that
// pile up just below the baseline; click re-writes the word left → right
// ---------------------------------------------------------------------------

const E_SWEEP_MS = 700;
const E_GRAVITY = 1500;
const E_RETURN_MS = 300;
const E_RETURN_STAGGER_MS = 140;
/** Click-to-rewrite spread — crumbs return in x order over this window. */
const E_REWRITE_SPREAD_MS = 320;

interface Crumb {
  hx: number; hy: number;
  x: number; y: number;
  vx: number; vy: number;
  /** Elongated chip shape + tumble. */
  rx: number; ry: number;
  angle: number; va: number;
  alpha: number;
  active: boolean;
  sx: number; sy: number;
  dur: number; delay: number;
}

function createEraserEffect(): WordEffect {
  let crumbs: Crumb[] = [];
  let raster: HTMLCanvasElement | null = null;
  let padX = 0;
  let padY = 0;
  let sweepT0 = 0;
  let returnT0 = 0;
  let phase: 'out' | 'back' = 'out';

  const drawCrumb = (c: CanvasRenderingContext2D, m: Crumb, color: string) => {
    c.save();
    c.translate(m.x, m.y);
    c.rotate(m.angle);
    // Multiply (don't overwrite) so the host's crossfade alpha still applies
    c.globalAlpha *= m.alpha;
    c.fillStyle = color;
    c.beginPath();
    c.ellipse(0, 0, m.rx, m.ry, 0, 0, Math.PI * 2);
    c.fill();
    c.restore();
  };

  return {
    init(sample, rect, t) {
      phase = 'out';
      sweepT0 = t;
      raster = sample.raster;
      padX = sample.padX;
      padY = sample.padY;
      crumbs = sample.pts.map(({ hx, hy }) => ({
        hx, hy,
        x: rect.left + hx,
        y: rect.top + hy,
        vx: 0, vy: 0,
        rx: sample.step * (0.55 + Math.random() * 0.35),
        ry: sample.step * (0.28 + Math.random() * 0.18),
        angle: Math.random() * Math.PI,
        va: (Math.random() - 0.5) * 10,
        alpha: 0.75 + Math.random() * 0.25,
        active: false,
        sx: 0, sy: 0,
        dur: E_RETURN_MS + Math.random() * E_RETURN_STAGGER_MS,
        delay: 0,
      }));
    },

    release(t) {
      phase = 'back';
      returnT0 = t;
      const maxHx = crumbs.reduce((m, c) => Math.max(m, c.hx), 1);
      let total = 0;
      for (const c of crumbs) {
        // Crumbs the sweep never reached are still sitting at home
        c.sx = c.x;
        c.sy = c.y;
        // Stagger by x so the word appears to re-write left → right
        c.delay = (c.hx / maxHx) * E_REWRITE_SPREAD_MS;
        if (c.delay + c.dur > total) total = c.delay + c.dur;
      }
      return total;
    },

    step(ctx, dt, t, view) {
      const { rect, color } = view;

      if (phase === 'out') {
        if (!raster) return 'resting';
        const rasterW = raster.width;
        // Front position in raster coordinates (sweeps the padded width)
        const frontX = Math.min(((t - sweepT0) / E_SWEEP_MS) * rasterW, rasterW);
        const sweepDone = frontX >= rasterW;

        // Un-erased remainder of the word, pixel-perfect from the raster
        if (!sweepDone) {
          const w = rasterW - frontX;
          ctx.drawImage(
            raster,
            frontX, 0, w, raster.height,
            rect.left - padX + frontX, rect.top - padY, w, raster.height,
          );
        }

        let allResting = sweepDone;
        for (const m of crumbs) {
          // Shed crumbs as the front passes them
          if (!m.active) {
            if (m.hx + padX <= frontX) {
              m.active = true;
              m.x = rect.left + m.hx;
              m.y = rect.top + m.hy;
              m.vx = 20 + Math.random() * 50; // nudged along the sweep
              m.vy = -10 - Math.random() * 50;
            } else {
              allResting = false;
              continue;
            }
          }

          m.vy += E_GRAVITY * dt;
          m.x += m.vx * dt;
          m.y += m.vy * dt;

          // Same floor as the marbles — the bottom of the viewport
          if (m.y + m.ry > view.vh) {
            m.y = view.vh - m.ry;
            // Crumbs land dead — a dull thud, barely a bounce
            if (Math.abs(m.vy) > 120) {
              m.vy = -m.vy * 0.15;
            } else {
              m.vy = 0;
            }
            m.vx *= 0.8;
            m.va *= 0.8;
          }
          // Side walls
          if (m.x - m.rx < 0) {
            m.x = m.rx;
            m.vx = Math.abs(m.vx) * 0.6;
          } else if (m.x + m.rx > view.vw) {
            m.x = view.vw - m.rx;
            m.vx = -Math.abs(m.vx) * 0.6;
          }
          if (m.vy !== 0 || Math.abs(m.vx) > 2) {
            m.angle += m.va * dt;
            allResting = false;
          }

          drawCrumb(ctx, m, color);
        }
        return allResting ? 'resting' : 'active';
      }

      // Rewrite: staggered ease-out tween, left → right
      let settled = true;
      for (const m of crumbs) {
        const p = Math.min(1, Math.max(0, (t - returnT0 - m.delay) / m.dur));
        const e = 1 - (1 - p) ** 3;
        m.x = m.sx + (rect.left + m.hx - m.sx) * e;
        m.y = m.sy + (rect.top + m.hy - m.sy) * e;
        if (p < 1) settled = false;
        drawCrumb(ctx, m, color);
      }
      return settled ? 'done' : 'active';
    },
  };
}

// ---------------------------------------------------------------------------
// Effect 3: Bubbles — the word fizzes into bubbles that wobble upward and settle
// against the top of the viewport; click pulls them back down into the word
// ---------------------------------------------------------------------------

const B_BUOYANCY = -420;
/** Staggered lift-off window — the word fizzes apart rather than detaching all at once. */
const B_LIFT_STAGGER_MS = 720;
/** Per-bubble ease-in before full buoyancy kicks in. */
const B_LIFT_RAMP_MS = 320;
/** Soft-brake zone (px) as bubbles approach the ceiling. */
const B_CEILING_EASE = 56;
const B_RETURN_MS = 460;
const B_RETURN_STAGGER_MS = 240;
/** Top bubbles wait slightly longer on restore — a gentle cascade downward. */
const B_RETURN_Y_STAGGER_MS = 280;

interface Bubble {
  hx: number; hy: number;
  x: number; y: number;
  vy: number;
  r: number;
  /** Horizontal wobble — position offset from anchorX, not integrated velocity. */
  phase: number; freq: number;
  amp: number; maxAmp: number;
  /** Per-bubble rise terminal velocity (px/s, negative = up). */
  terminal: number;
  delay: number;
  /** Timestamp when this bubble detached; 0 while still glued to the word. */
  liftAt: number;
  /** X at lift-off — wobble oscillates around this anchor. */
  anchorX: number;
  ceiling: boolean;
  sx: number; sy: number;
  dur: number;
  /** Restore stagger derived from how high the bubble ended up. */
  returnDelay: number;
}

/** Smoothstep 0→1. */
const smooth = (t: number) => t * t * (3 - 2 * t);

function createBubbleEffect(): WordEffect {
  let bubbles: Bubble[] = [];
  let phase: 'out' | 'back' = 'out';
  let liftT0 = 0;
  let returnT0 = 0;
  let viewH = 800;

  const drawBubble = (c: CanvasRenderingContext2D, b: Bubble, color: string) => {
    const base = c.globalAlpha;

    // Faint fill so the bubble reads as a volume, not just a ring
    c.globalAlpha = base * 0.14;
    c.fillStyle = color;
    c.beginPath();
    c.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    c.fill();

    // Rim
    c.globalAlpha = base * 0.9;
    c.strokeStyle = color;
    c.lineWidth = Math.max(1, b.r * 0.16);
    c.beginPath();
    c.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    c.stroke();

    // Specular glint — a short inner arc in the upper left. Same color as the
    // rim so it works in both themes.
    c.globalAlpha = base * 0.55;
    c.lineWidth = Math.max(1, b.r * 0.12);
    c.beginPath();
    c.arc(b.x, b.y, b.r * 0.62, Math.PI * 1.05, Math.PI * 1.45);
    c.stroke();

    c.globalAlpha = base;
  };

  const applyWobble = (b: Bubble, t: number) => {
    b.x = b.anchorX + Math.sin((t / 1000) * b.freq + b.phase) * b.amp;
  };

  return {
    init(sample, rect, t) {
      phase = 'out';
      liftT0 = t;
      viewH = window.innerHeight;
      bubbles = sample.pts.map(({ hx, hy }) => ({
        hx, hy,
        x: rect.left + hx,
        y: rect.top + hy,
        vy: 0,
        r: sample.step * (0.5 + Math.random() * 0.3),
        phase: Math.random() * Math.PI * 2,
        freq: 1.4 + Math.random() * 1.6,
        amp: 0,
        maxAmp: 14 + Math.random() * 22,
        terminal: -(140 + Math.random() * 120),
        delay: Math.random() * B_LIFT_STAGGER_MS,
        liftAt: 0,
        anchorX: rect.left + hx,
        ceiling: false,
        sx: 0, sy: 0,
        dur: B_RETURN_MS + Math.random() * B_RETURN_STAGGER_MS,
        returnDelay: 0,
      }));
    },

    release(t) {
      phase = 'back';
      returnT0 = t;
      let total = 0;
      for (const b of bubbles) {
        b.sx = b.x;
        b.sy = b.y;
        // Higher bubbles return in a gentle top→bottom wave
        b.returnDelay = (1 - Math.min(b.sy, viewH) / viewH) * B_RETURN_Y_STAGGER_MS;
        const end = b.returnDelay + b.dur;
        if (end > total) total = end;
      }
      return total;
    },

    step(ctx, dt, t, view) {
      viewH = view.vh;

      if (phase === 'out') {
        let allResting = true;
        for (const b of bubbles) {
          if (b.liftAt === 0) {
            if (t - liftT0 >= b.delay) {
              b.liftAt = t;
              b.anchorX = view.rect.left + b.hx;
              b.x = b.anchorX;
              b.y = view.rect.top + b.hy;
              // Tiny initial kick so lift-off isn't a dead start
              b.vy = -30 - Math.random() * 40;
            } else {
              // Still attached — track the live word position until lift-off
              b.anchorX = view.rect.left + b.hx;
              b.x = b.anchorX;
              b.y = view.rect.top + b.hy;
              allResting = false;
              drawBubble(ctx, b, view.color);
              continue;
            }
          }

          if (!b.ceiling) {
            const sinceLift = t - b.liftAt;
            const ramp = smooth(Math.min(1, sinceLift / B_LIFT_RAMP_MS));

            // Ease buoyancy and wobble amplitude in together
            b.vy += B_BUOYANCY * dt * ramp;
            b.vy += (b.terminal - b.vy) * (1 - Math.exp(-2.8 * dt));
            b.amp = b.maxAmp * ramp;

            // Soft brake as the bubble nears the ceiling
            const distTop = b.y - b.r;
            if (distTop < B_CEILING_EASE) {
              const proximity = Math.max(0, distTop / B_CEILING_EASE);
              b.vy *= 0.55 + 0.45 * proximity;
            }

            b.y += b.vy * dt;
            applyWobble(b, t);

            if (b.y - b.r <= 0.5) {
              b.y = b.r;
              b.vy = 0;
              b.ceiling = true;
            }
          } else {
            // At ceiling — wobble amplitude decays smoothly (frame-rate independent)
            b.amp = Math.max(0, b.amp * Math.exp(-5 * dt));
            applyWobble(b, t);
          }

          // Soft side walls — nudge anchor so wobble doesn't clip harshly
          if (b.x - b.r < 0) {
            b.anchorX += b.r - b.x;
            b.x = b.r;
          } else if (b.x + b.r > view.vw) {
            b.anchorX -= b.x + b.r - view.vw;
            b.x = view.vw - b.r;
          }

          if (!b.ceiling || b.amp > 0.8) allResting = false;
          drawBubble(ctx, b, view.color);
        }
        return allResting ? 'resting' : 'active';
      }

      // Fixed-duration ease-out tween back into the word, staggered by height
      let settled = true;
      for (const b of bubbles) {
        const p = Math.min(1, Math.max(0, (t - returnT0 - b.returnDelay) / b.dur));
        const e = 1 - (1 - p) ** 3;
        b.x = b.sx + (view.rect.left + b.hx - b.sx) * e;
        b.y = b.sy + (view.rect.top + b.hy - b.sy) * e;
        if (p < 1) settled = false;
        drawBubble(ctx, b, view.color);
      }
      return settled ? 'done' : 'active';
    },
  };
}

// ---------------------------------------------------------------------------
// Effect 4: Explosion — a blast from the word's center hurls tumbling shards
// up and outward; gravity rains the debris down toward the bottom edges.
// Click re-forms the word from the center outward.
// ---------------------------------------------------------------------------

/** Blast speed at the word's center (px/s), falling off with distance. */
const X_BLAST_SPEED = 950;
const X_GRAVITY = 2300;
/** Horizontal boost so debris spreads toward the bottom corners. */
const X_SPREAD = 1.7;
const X_FLOOR_RESTITUTION = 0.28;
const X_FLOOR_FRICTION = 0.86;
/** Shockwave ring lifetime (ms). */
const X_RING_MS = 380;
const X_RETURN_MS = 400;
const X_RETURN_STAGGER_MS = 160;
/** Re-form spreads center → outward over this window. */
const X_REFORM_SPREAD_MS = 260;

interface Shard {
  hx: number; hy: number;
  x: number; y: number;
  vx: number; vy: number;
  /** Triangle geometry — three local-space vertices. */
  verts: [number, number][];
  angle: number; va: number;
  /** Normalized distance from the blast center (0 = center, 1 = word edge). */
  cdist: number;
  sx: number; sy: number;
  dur: number; delay: number;
}

function createExplosionEffect(): WordEffect {
  let shards: Shard[] = [];
  let phase: 'out' | 'back' = 'out';
  let blastT0 = 0;
  let returnT0 = 0;
  let center = { x: 0, y: 0 };

  const drawShard = (c: CanvasRenderingContext2D, s: Shard, color: string) => {
    c.save();
    c.translate(s.x, s.y);
    c.rotate(s.angle);
    c.fillStyle = color;
    c.beginPath();
    c.moveTo(s.verts[0][0], s.verts[0][1]);
    c.lineTo(s.verts[1][0], s.verts[1][1]);
    c.lineTo(s.verts[2][0], s.verts[2][1]);
    c.closePath();
    c.fill();
    c.restore();
  };

  return {
    init(sample, rect, t) {
      phase = 'out';
      blastT0 = t;
      center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      const maxDist = Math.max(1, Math.hypot(rect.width / 2, rect.height / 2));

      shards = sample.pts.map(({ hx, hy }) => {
        const x = rect.left + hx;
        const y = rect.top + hy;
        let dx = x - center.x;
        let dy = y - center.y;
        const d = Math.hypot(dx, dy);
        if (d < 1) {
          // Dead-center points get a random direction
          const a = Math.random() * Math.PI * 2;
          dx = Math.cos(a);
          dy = Math.sin(a);
        } else {
          dx /= d;
          dy /= d;
        }

        // Speed falls off toward the word's edges + per-shard variance,
        // horizontal component boosted so debris reaches the bottom corners.
        const falloff = 1 - (d / maxDist) * 0.45;
        const speed = X_BLAST_SPEED * falloff * (0.7 + Math.random() * 0.6);
        const jitter = (Math.random() - 0.5) * 0.5;

        // Irregular triangle shard sized off the sampling grid
        const r = sample.step * (0.55 + Math.random() * 0.4);
        const a0 = Math.random() * Math.PI * 2;
        const verts: [number, number][] = [0, 1, 2].map((i) => {
          const a = a0 + (i / 3) * Math.PI * 2 + (Math.random() - 0.5) * 0.7;
          const rr = r * (0.6 + Math.random() * 0.5);
          return [Math.cos(a) * rr, Math.sin(a) * rr] as [number, number];
        });

        return {
          hx, hy, x, y,
          vx: (dx + jitter) * speed * X_SPREAD,
          // Slight upward bias so the arc reads as a blast, not a drop
          vy: dy * speed - 180 - Math.random() * 160,
          verts,
          angle: Math.random() * Math.PI * 2,
          va: (Math.random() - 0.5) * 16,
          cdist: Math.min(1, d / maxDist),
          sx: 0, sy: 0,
          dur: X_RETURN_MS + Math.random() * X_RETURN_STAGGER_MS,
          delay: 0,
        };
      });
    },

    release(t) {
      phase = 'back';
      returnT0 = t;
      let total = 0;
      for (const s of shards) {
        s.sx = s.x;
        s.sy = s.y;
        // Re-form center → outward, the blast in reverse
        s.delay = s.cdist * X_REFORM_SPREAD_MS;
        const end = s.delay + s.dur;
        if (end > total) total = end;
      }
      return total;
    },

    step(ctx, dt, t, view) {
      if (phase === 'out') {
        // Shockwave ring — expands and fades over the first few hundred ms
        const ringP = (t - blastT0) / X_RING_MS;
        if (ringP < 1) {
          const base = ctx.globalAlpha;
          ctx.globalAlpha = base * (1 - ringP) * 0.5;
          ctx.strokeStyle = view.color;
          ctx.lineWidth = 2 + (1 - ringP) * 3;
          ctx.beginPath();
          ctx.arc(center.x, center.y, 20 + ringP * ringP * 320, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = base;
        }

        let allResting = ringP >= 1;
        for (const s of shards) {
          s.vy += X_GRAVITY * dt;
          s.x += s.vx * dt;
          s.y += s.vy * dt;

          // Floor — dull bounce, slide out with friction. Kill threshold must
          // exceed GRAVITY * MAX_DT (~74) so shards can actually go to sleep.
          if (s.y > view.vh - 2) {
            s.y = view.vh - 2;
            if (Math.abs(s.vy) > 90) {
              s.vy = -s.vy * (X_FLOOR_RESTITUTION + Math.random() * 0.08);
            } else {
              s.vy = 0;
            }
            s.vx *= X_FLOOR_FRICTION;
            s.va *= 0.8;
          }
          // Side walls
          if (s.x < 4) {
            s.x = 4;
            s.vx = Math.abs(s.vx) * 0.5;
          } else if (s.x > view.vw - 4) {
            s.x = view.vw - 4;
            s.vx = -Math.abs(s.vx) * 0.5;
          }

          if (s.vy !== 0 || Math.abs(s.vx) > 2) {
            s.angle += s.va * dt;
            allResting = false;
          }
          drawShard(ctx, s, view.color);
        }
        return allResting ? 'resting' : 'active';
      }

      // Re-form: staggered ease-out tween, center → outward
      let settled = true;
      for (const s of shards) {
        const p = Math.min(1, Math.max(0, (t - returnT0 - s.delay) / s.dur));
        const e = 1 - (1 - p) ** 3;
        s.x = s.sx + (view.rect.left + s.hx - s.sx) * e;
        s.y = s.sy + (view.rect.top + s.hy - s.sy) * e;
        // Untumble so shards land aligned-ish rather than mid-spin
        s.angle *= 1 - e * 0.12;
        if (p < 1) settled = false;
        drawShard(ctx, s, view.color);
      }
      return settled ? 'done' : 'active';
    },
  };
}

// ---------------------------------------------------------------------------
// Host component
// ---------------------------------------------------------------------------

/**
 * The hero's emphasized word. A randomly chosen effect breaks the word apart
 * on a full-viewport canvas — bouncing marbles, an eraser sweep, rising
 * bubbles, or a center blast — never the same effect twice in a row. Fine
 * pointers trigger it on hover; touch
 * devices trigger it on tap. Clicking/tapping anywhere afterwards plays the
 * effect's exit and restores the text. Everything is painted with the
 * element's live computed color, so it adapts to either theme.
 */
const InteractiveWord: React.FC = () => {
  const emRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const em = emRef.current;
    if (!em) return;

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    const effects: WordEffect[] = [
      createMarbleEffect(),
      createEraserEffect(),
      createBubbleEffect(),
      createExplosionEffect(),
    ];
    let lastEffect = -1;

    let mode: 'idle' | 'scattered' | 'returning' = 'idle';
    let effect: WordEffect | null = null;
    let canvas: HTMLCanvasElement | null = null;
    let ctx: CanvasRenderingContext2D | null = null;
    let raf = 0;
    let lastT = 0;
    /** Exit tween window — drives the particle → text crossfade. */
    let returnT0 = 0;
    let returnTotal = 0;
    /** True when the effect reported 'resting' and the rAF loop is paused. */
    let sleeping = false;

    /** Fraction of the exit tween after which the real text crossfades in.
     *  Ease-out tweens cover ~94% of the distance by 60% of the duration, so
     *  the dead tail is masked by the fade instead of reading as a hang. */
    const FADE_START = 0.55;

    /** Rasterize the word with its computed font and sample it into points. */
    const buildSample = (color: string): SampledWord | null => {
      const rect = em.getBoundingClientRect();
      const cs = getComputedStyle(em);
      const fontSize = parseFloat(cs.fontSize);

      // Padding so italic overhang, ascenders and descenders aren't clipped
      const padX = Math.ceil(fontSize * 0.25);
      const padY = Math.ceil(fontSize * 0.35);
      const w = Math.ceil(rect.width) + padX * 2;
      const h = Math.ceil(rect.height) + padY * 2;

      const raster = document.createElement('canvas');
      raster.width = w;
      raster.height = h;
      const octx = raster.getContext('2d', { willReadFrequently: true });
      if (!octx) return null;

      octx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      octx.textBaseline = 'middle';
      octx.fillStyle = color;
      octx.fillText(WORD, padX, h / 2);

      const data = octx.getImageData(0, 0, w, h).data;

      // Adapt the grid step so the particle count stays under the cap
      const maxParticles = finePointer ? MAX_PARTICLES : MAX_PARTICLES_COARSE;
      let step = Math.max(3, Math.round(fontSize / 16));
      let pts: { hx: number; hy: number }[] = [];
      for (let attempt = 0; attempt < 4; attempt++) {
        pts = [];
        for (let y = 0; y < h; y += step) {
          for (let x = 0; x < w; x += step) {
            if (data[(y * w + x) * 4 + 3] > 128) pts.push({ hx: x - padX, hy: y - padY });
          }
        }
        if (pts.length <= maxParticles) break;
        step += 1;
      }
      if (pts.length > maxParticles) {
        const keep = maxParticles / pts.length;
        pts = pts.filter(() => Math.random() < keep);
      }

      return { pts, step, raster, padX, padY };
    };

    const sizeCanvas = () => {
      if (!canvas || !ctx) return;
      // Cap DPR lower on touch devices — moving particles look identical at
      // 1.5x and the canvas pushes ~44% fewer pixels per frame.
      const dpr = Math.min(window.devicePixelRatio || 1, finePointer ? 2 : 1.5);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    /** Single teardown path — used on exit completion and on unmount. */
    const teardown = () => {
      mode = 'idle';
      sleeping = false;
      cancelAnimationFrame(raf);
      raf = 0;
      window.removeEventListener('pointerdown', onRelease);
      canvas?.remove();
      canvas = null;
      ctx = null;
      effect = null;
      em.style.opacity = '';
    };

    const frame = (t: number) => {
      if (!ctx || !canvas || !effect) return;
      const dt = Math.min((t - lastT) / 1000, MAX_DT);
      lastT = t;

      const view: View = {
        vw: window.innerWidth,
        vh: window.innerHeight,
        rect: em.getBoundingClientRect(),
        color: getComputedStyle(em).color,
      };
      ctx.clearRect(0, 0, view.vw, view.vh);

      // Crossfade: as the exit tween enters its final stretch, dissolve the
      // particles into the real text instead of hard-swapping at the end.
      let fade = 0;
      if (mode === 'returning' && returnTotal > 0) {
        const fadeStart = returnT0 + returnTotal * FADE_START;
        const fadeDur = returnTotal * (1 - FADE_START);
        fade = Math.min(1, Math.max(0, (t - fadeStart) / fadeDur));
        em.style.opacity = fade.toFixed(3);
      }

      ctx.save();
      ctx.globalAlpha = 1 - fade;
      const status = effect.step(ctx, dt, t, view);
      ctx.restore();

      if (status === 'done') {
        teardown();
        return;
      }
      if (status === 'resting') {
        // Everything is still — pause the loop (zero idle cost) until a
        // click or resize wakes it.
        sleeping = true;
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (raf === 0) {
        lastT = performance.now();
        raf = requestAnimationFrame(frame);
      }
      sleeping = false;
    };

    /** When the scatter started — release ignores the same tap gesture. */
    let scatterTs = 0;

    const onRelease = (ev: PointerEvent) => {
      if (mode !== 'scattered' || !effect) return;
      // On hybrid/touch devices the tap that triggered the scatter also fires
      // a pointerdown right after; don't let it instantly restore the word.
      if (ev.timeStamp - scatterTs < 150) return;
      mode = 'returning';
      returnT0 = performance.now();
      returnTotal = effect.release(returnT0);
      window.removeEventListener('pointerdown', onRelease);
      wake();
    };

    const scatter = () => {
      if (mode !== 'idle') return;

      const sample = buildSample(getComputedStyle(em).color);
      if (!sample || sample.pts.length === 0) return;

      canvas = document.createElement('canvas');
      canvas.style.cssText =
        'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:9999;';
      ctx = canvas.getContext('2d');
      if (!ctx) {
        canvas = null;
        return;
      }
      sizeCanvas();
      document.body.appendChild(canvas);

      // Random pick, but never the same effect twice in a row
      let idx = Math.floor(Math.random() * effects.length);
      if (effects.length > 1 && idx === lastEffect) {
        idx = (idx + 1) % effects.length;
      }
      lastEffect = idx;
      effect = effects[idx];
      effect.init(sample, em.getBoundingClientRect(), performance.now());

      // Opacity (not visibility) so the exit can crossfade the text back in
      em.style.opacity = '0';
      mode = 'scattered';
      sleeping = false;
      scatterTs = performance.now();
      window.addEventListener('pointerdown', onRelease);
      lastT = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const onResize = () => {
      if (mode === 'idle') return;
      sizeCanvas();
      if (sleeping) wake();
    };

    // App-switch/tab-hide while scattered: tear down instead of keeping
    // physics state alive in the background — the word is simply restored
    // by the time the user returns.
    const onVisibility = () => {
      if (document.hidden && mode !== 'idle') teardown();
    };

    // Fine pointers scatter on hover; everyone (touch included) can also
    // scatter with a tap/click. `click` fires after the gesture's pointerdown,
    // so a tap on the word can't release the effect it just started — and a
    // tap anywhere else hits the window pointerdown listener to restore it.
    if (finePointer) em.addEventListener('pointerenter', scatter);
    em.addEventListener('click', scatter);
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      em.removeEventListener('pointerenter', scatter);
      em.removeEventListener('click', scatter);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      teardown();
    };
  }, []);

  return (
    <em ref={emRef} className="font-serif italic font-normal whitespace-nowrap cursor-pointer">
      {WORD}
    </em>
  );
};

export default InteractiveWord;
