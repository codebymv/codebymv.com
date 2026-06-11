import React, { useEffect, useRef } from 'react';

const WORD = 'interactive';

/** Falloff radius (px) of the cursor's influence field. */
const RADIUS = 90;
/** Max upward baseline shift (px) at influence = 1. */
const MAX_RISE = 14;
/** Max additional scale at influence = 1. */
const MAX_SCALE = 0.12;
/** Max horizontal push away from the cursor (px). */
const MAX_PUSH = 7;
/** Max lean away from the cursor (deg). */
const MAX_ROT = 9;
/** Max tint toward the accent color (%). */
const MAX_TINT = 100;

/** Spring physics — velocity-based so letters overshoot and settle. */
const STIFFNESS = 0.16;
const DAMPING = 0.72;

/** Click ripple — a wavefront that propagates through the word. */
const WAVE_SPEED = 0.7; // px per ms
const WAVE_BAND = 45; // px width of the wavefront
const WAVE_KICK = 0.09; // velocity impulse per frame as the front passes

const EPSILON = 0.001;

/**
 * The hero's emphasized word. On devices with a fine pointer, each letter is
 * driven by a damped spring toward a Gaussian cursor-proximity field — rising,
 * scaling, leaning and pushing away from the pointer, and tinting toward the
 * accent color. Clicking fires a ripple that propagates through the lettering.
 */
const InteractiveWord: React.FC = () => {
  const emRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const em = emRef.current;
    if (!em) return;

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || reducedMotion) return;

    const letters = Array.from(em.querySelectorAll<HTMLSpanElement>('.iw-letter'));
    const n = letters.length;
    const pos = new Float32Array(n); // current influence (springs past 1 on overshoot)
    const vel = new Float32Array(n);

    // Letter centers relative to the <em>, measured from untransformed rects.
    let centers: number[] = [];
    const measure = () => {
      const emRect = em.getBoundingClientRect();
      centers = letters.map((l) => {
        const r = l.getBoundingClientRect();
        return r.left - emRect.left + r.width / 2;
      });
    };
    measure();

    let mouseX = -1e4;
    let mouseY = -1e4;
    let raf = 0;
    let running = false;
    const waves: { x: number; t: number }[] = [];

    const frame = () => {
      const rect = em.getBoundingClientRect();
      const cy = rect.top + rect.height / 2;
      const dy = mouseY - cy;
      const now = performance.now();
      let alive = waves.length > 0;

      // Cull ripples that have fully crossed the word
      for (let w = waves.length - 1; w >= 0; w--) {
        if ((now - waves[w].t) * WAVE_SPEED > rect.width + RADIUS * 3) {
          waves.splice(w, 1);
        }
      }

      for (let i = 0; i < n; i++) {
        const cx = rect.left + centers[i];
        const dx = mouseX - cx;
        const dist = Math.hypot(dx, dy);
        // Gaussian falloff — smooth bell curve around the cursor
        const target = Math.exp(-((dist / RADIUS) ** 2));

        // Ripple wavefronts kick velocity as they pass each letter
        for (const wave of waves) {
          const front = (now - wave.t) * WAVE_SPEED;
          const toFront = Math.abs(Math.abs(cx - wave.x) - front);
          vel[i] += Math.exp(-((toFront / WAVE_BAND) ** 2)) * WAVE_KICK;
        }

        // Damped spring toward the target influence
        vel[i] = (vel[i] + (target - pos[i]) * STIFFNESS) * DAMPING;
        pos[i] += vel[i];

        const v = pos[i];
        if (Math.abs(v) > EPSILON || Math.abs(vel[i]) > EPSILON) {
          alive = true;
          // Lean and push away from the cursor, scaled by influence
          const dir = Math.max(-1, Math.min(1, -dx / RADIUS));
          const tx = dir * MAX_PUSH * v;
          const rot = dir * MAX_ROT * v;
          const tint = Math.max(0, Math.min(1, v));
          letters[i].style.transform =
            `translate(${tx.toFixed(2)}px, ${(-MAX_RISE * v).toFixed(2)}px) ` +
            `rotate(${rot.toFixed(2)}deg) scale(${(1 + MAX_SCALE * v).toFixed(4)})`;
          letters[i].style.color = `color-mix(in srgb, var(--accent) ${(MAX_TINT * tint).toFixed(1)}%, currentColor)`;
        } else if (letters[i].style.transform) {
          pos[i] = 0;
          vel[i] = 0;
          letters[i].style.transform = '';
          letters[i].style.color = '';
        }
      }

      if (alive) {
        raf = requestAnimationFrame(frame);
      } else {
        running = false;
      }
    };

    const wake = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      const rect = em.getBoundingClientRect();
      const margin = RADIUS * 2;
      if (
        e.clientX > rect.left - margin &&
        e.clientX < rect.right + margin &&
        e.clientY > rect.top - margin &&
        e.clientY < rect.bottom + margin
      ) {
        wake();
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      waves.push({ x: e.clientX, t: performance.now() });
      wake();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    em.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('resize', measure);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      em.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('resize', measure);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <em
      ref={emRef}
      className="font-serif italic font-normal whitespace-nowrap select-none"
      aria-label={WORD}
    >
      {WORD.split('').map((ch, i) => (
        <span key={i} aria-hidden="true" className="iw-letter">
          {ch}
        </span>
      ))}
    </em>
  );
};

export default InteractiveWord;
