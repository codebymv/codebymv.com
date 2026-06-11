import React, { useEffect, useRef } from 'react';

const WORD = 'interactive';

/** Hard cap on particle count — sampling step adapts to stay under this. */
const MAX_PARTICLES = 320;
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
// Host component
// ---------------------------------------------------------------------------

/**
 * The hero's emphasized word. On hover (fine pointers only) a randomly chosen
 * effect breaks the word apart on a full-viewport canvas — bouncing marbles or
 * an eraser sweep, never the same effect twice in a row. Clicking anywhere
 * plays the effect's exit and restores the text. Everything is painted with
 * the element's live computed color, so it adapts to either theme.
 */
const InteractiveWord: React.FC = () => {
  const emRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const em = emRef.current;
    if (!em) return;

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || reducedMotion) return;

    const effects: WordEffect[] = [createMarbleEffect(), createEraserEffect()];
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
      let step = Math.max(3, Math.round(fontSize / 16));
      let pts: { hx: number; hy: number }[] = [];
      for (let attempt = 0; attempt < 4; attempt++) {
        pts = [];
        for (let y = 0; y < h; y += step) {
          for (let x = 0; x < w; x += step) {
            if (data[(y * w + x) * 4 + 3] > 128) pts.push({ hx: x - padX, hy: y - padY });
          }
        }
        if (pts.length <= MAX_PARTICLES) break;
        step += 1;
      }
      if (pts.length > MAX_PARTICLES) {
        const keep = MAX_PARTICLES / pts.length;
        pts = pts.filter(() => Math.random() < keep);
      }

      return { pts, step, raster, padX, padY };
    };

    const sizeCanvas = () => {
      if (!canvas || !ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
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

    const onRelease = () => {
      if (mode !== 'scattered' || !effect) return;
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
      window.addEventListener('pointerdown', onRelease);
      lastT = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const onResize = () => {
      if (mode === 'idle') return;
      sizeCanvas();
      if (sleeping) wake();
    };

    em.addEventListener('pointerenter', scatter);
    window.addEventListener('resize', onResize);

    return () => {
      em.removeEventListener('pointerenter', scatter);
      window.removeEventListener('resize', onResize);
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
