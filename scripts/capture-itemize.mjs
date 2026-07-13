import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer';
import ffmpeg from 'ffmpeg-static';

const CAPTURE_DIR = path.resolve('public/assets/images/capture_temp_itemize');
const OUTPUT_MP4 = path.resolve('public/assets/images/itemize.mp4');
const OUTPUT_POSTER = path.resolve('public/assets/images/itemize-poster.webp');

const LOGIN_EMAIL = 'mevmusicofficial@gmail.com';
const LOGIN_PASSWORD = 'M@tthew56565';

const SITE_URL = 'https://itemize.cloud';
const API_HOST = 'itemize-backend-production-92ad.up.railway.app';

// ---------------------------------------------------------------------------
// Mock data - every backend /api request is intercepted. The login is mocked
// silently, then the Workspace Canvas is rendered with a curated collage of
// sample lists, notes, a whiteboard sketch and a locked vault.
// ---------------------------------------------------------------------------

const MOCK_USER = {
  id: 'usr_itemize_01',
  email: LOGIN_EMAIL,
  name: 'Matt Valentine',
  createdAt: '2026-05-15T00:00:00.000Z',
  emailVerified: true,
};

const MOCK_ORG = {
  id: 1,
  name: 'Valentine Digital',
  createdAt: '2026-05-15T00:00:00.000Z',
};

const MOCK_BILLING_STATUS = {
  plan: 'premium',
  subscription_status: 'active',
  billing_period: 'monthly',
  billing_period_start: '2026-06-01T00:00:00.000Z',
  billing_period_end: '2026-07-01T00:00:00.000Z',
  stripe_customer_id: 'cus_123',
  stripe_subscription_id: 'sub_123',
  emails_used: 1500,
  emails_limit: 5000,
  sms_used: 200,
  sms_limit: 1000,
  api_calls_used: 500,
  api_calls_limit: 10000,
  contacts_limit: 5000,
  users_limit: 5,
  workflows_limit: 10,
  landing_pages_limit: 5,
  forms_limit: 5,
  trial_ends_at: null,
  trial_end_acknowledged_at: null,
  cancel_at_period_end: false,
  canceled_at: null,
};

const MOCK_BILLING_PLANS = [
  {
    id: 'free',
    name: 'Free',
    displayName: 'Free',
    tagline: 'For hobbyists',
    description: 'Free plan',
    icon: 'zap',
    color: 'blue',
    bgColor: 'bg-blue-500',
    borderColor: 'border-blue-500',
    pricing: { monthly: 0, yearly: 0, yearlyMonthly: 0 },
    tier: 0,
    limits: { organizations: 1, contacts: 100, users: 1, workflows: 1, emails: 500, sms: 100, landingPages: 1, forms: 1 },
  },
  {
    id: 'premium',
    name: 'Premium',
    displayName: 'Premium',
    tagline: 'For professionals',
    description: 'Premium plan',
    icon: 'zap',
    color: 'indigo',
    bgColor: 'bg-indigo-500',
    borderColor: 'border-indigo-500',
    pricing: { monthly: 49, yearly: 490, yearlyMonthly: 41 },
    tier: 1,
    limits: { organizations: 1, contacts: 5000, users: 5, workflows: 10, emails: 5000, sms: 1000, landingPages: 5, forms: 5 },
  },
];

const MOCK_BILLING_USAGE = {
  emails_used: 1500,
  emails_limit: 5000,
  sms_used: 200,
  sms_limit: 1000,
  api_calls_used: 500,
  api_calls_limit: 10000,
};

// Mark every feature tour as seen+dismissed so no onboarding modal appears.
const ONBOARDED_FEATURE = { seen: true, dismissed: true, version: '1.0', step_completed: 99 };
const MOCK_ONBOARDING = Object.fromEntries(
  [
    'dashboard', 'contacts', 'pipelines', 'canvas', 'lists', 'notes', 'whiteboards',
    'vaults', 'wireframes', 'invoices', 'automations', 'calendars', 'inbox',
    'campaigns', 'pages', 'forms', 'bookings', 'chat_widget', 'social', 'reputation',
  ].map((key) => [key, ONBOARDED_FEATURE]),
);

const MOCK_CATEGORIES = [
  { id: 1, name: 'Software Development', color_value: '#3b82f6' },
  { id: 2, name: 'Audio Engineering', color_value: '#a855f7' },
  { id: 3, name: 'General', color_value: '#10b981' },
];

// ---- Canvas collage -------------------------------------------------------
// Coordinates live on a 4000x4000 canvas. The viewport transform is pre-seeded
// in localStorage (scale 0.72) so this 4-column collage (x:1450-2860,
// y:1630-2490) fills the frame right of the ~256px sidebar. The canvas area's
// screen origin is ~(128, 64), measured from a previous capture. Note/vault
// `height` is the FULL card height; whiteboard cards are min ~630 tall.

const NOW = '2026-06-10T18:30:00.000Z';

const MOCK_LISTS = [
  {
    id: '301',
    title: 'Studio Gear Checklist',
    category: 'Audio Engineering',
    items: [
      { id: 'i1', text: 'Recap SSL channel strip', completed: true },
      { id: 'i2', text: 'Replace patch bay cables', completed: true },
      { id: 'i3', text: 'Calibrate monitor levels', completed: true },
      { id: 'i4', text: 'Treat back wall reflections', completed: false },
    ],
    color_value: '#a855f7',
    position_x: 1450,
    position_y: 1630,
    width: 340,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: '302',
    title: 'Launch Tasks',
    category: 'Software Development',
    items: [
      { id: 'i1', text: 'Finalize pricing page copy', completed: true },
      { id: 'i2', text: 'Set up status page', completed: true },
      { id: 'i3', text: 'Load-test booking flow', completed: false },
      { id: 'i4', text: 'Schedule launch tweet thread', completed: false },
    ],
    color_value: '#3b82f6',
    position_x: 1810,
    position_y: 2050,
    width: 340,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: '303',
    title: 'Reading Queue',
    category: 'General',
    items: [
      { id: 'i1', text: 'Designing Data-Intensive Applications', completed: true },
      { id: 'i2', text: 'The Art of Mixing - D. Gibson', completed: false },
      { id: 'i3', text: 'Refactoring UI', completed: false },
      { id: 'i4', text: 'Mastering Audio - B. Katz', completed: false },
    ],
    color_value: '#10b981',
    position_x: 2170,
    position_y: 1630,
    width: 340,
    created_at: NOW,
    updated_at: NOW,
  },
];

const MOCK_NOTES = [
  {
    id: 401,
    user_id: 1,
    title: 'Mix Notes - Vocal Sessions',
    content:
      '<p>Lead vocal: ride 2-3 dB into chorus, de-ess around 6.8k.</p><p>Print both the dry stack and the quarter-note delay throw for the bridge.</p>',
    category: 'Audio Engineering',
    color_value: '#f59e0b',
    position_x: 1810,
    position_y: 1630,
    width: 340,
    height: 380,
    z_index: 1,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: 402,
    user_id: 1,
    title: 'Client Follow-ups',
    content:
      '<p>Send Opaque Sound the revised master by Friday.</p><p>Ping Sarah re: onboarding call notes.</p>',
    category: 'General',
    color_value: '#ec4899',
    position_x: 2170,
    position_y: 2120,
    width: 340,
    height: 340,
    z_index: 1,
    created_at: NOW,
    updated_at: NOW,
  },
];

// Build react-sketch-canvas path objects from simple point lists.
function interpolate(points, stepsPerSegment = 8) {
  const out = [];
  for (let i = 0; i < points.length - 1; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];
    for (let s = 0; s < stepsPerSegment; s++) {
      const t = s / stepsPerSegment;
      out.push({ x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t });
    }
  }
  const last = points[points.length - 1];
  out.push({ x: last[0], y: last[1] });
  return out;
}

function stroke(points, strokeColor, strokeWidth = 3) {
  return { drawMode: true, strokeColor, strokeWidth, paths: interpolate(points) };
}

function wave(x1, x2, y, amplitude, cycles) {
  const pts = [];
  const steps = cycles * 16;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    pts.push([x1 + (x2 - x1) * t, y + Math.sin(t * cycles * Math.PI * 2) * amplitude]);
  }
  return pts;
}

const SKETCH_PATHS = [
  // "Booth" box
  stroke([[25, 55], [125, 55], [125, 150], [25, 150], [25, 55]], '#2563eb', 3),
  // "Control room" box
  stroke([[175, 55], [275, 55], [275, 150], [175, 150], [175, 55]], '#2563eb', 3),
  // Connecting arrow
  stroke([[125, 102], [175, 102]], '#a855f7', 3),
  stroke([[161, 90], [175, 102], [161, 114]], '#a855f7', 3),
  // Desk inside control room
  stroke([[198, 112], [255, 112], [255, 138], [198, 138], [198, 112]], '#64748b', 2),
  // Mic in booth
  stroke([[65, 82], [85, 82], [85, 104], [65, 104], [65, 82]], '#64748b', 2),
  stroke([[75, 104], [75, 124]], '#64748b', 2),
  // Sound waves through the middle
  { drawMode: true, strokeColor: '#10b981', strokeWidth: 3, paths: wave(25, 275, 215, 16, 4).map(([x, y]) => ({ x, y })) },
  { drawMode: true, strokeColor: '#f59e0b', strokeWidth: 2, paths: wave(25, 275, 268, 11, 6).map(([x, y]) => ({ x, y })) },
  // Monitor speakers at the bottom
  stroke([[40, 315], [95, 315], [95, 380], [40, 380], [40, 315]], '#ec4899', 3),
  stroke([[205, 315], [260, 315], [260, 380], [205, 380], [205, 315]], '#ec4899', 3),
  stroke([[67, 337], [67, 338]], '#ec4899', 5),
  stroke([[232, 337], [232, 338]], '#ec4899', 5),
];

const MOCK_WHITEBOARDS = [
  {
    id: 501,
    user_id: 1,
    title: 'Studio Layout Sketch',
    category: 'Audio Engineering',
    canvas_data: SKETCH_PATHS,
    canvas_width: 340,
    canvas_height: 620,
    background_color: '#ffffff',
    position_x: 2520,
    position_y: 1630,
    z_index: 1,
    color_value: '#3b82f6',
    created_at: NOW,
    updated_at: NOW,
  },
];

const MOCK_VAULTS = [
  {
    id: 601,
    user_id: 1,
    title: 'Client Credentials',
    category: 'General',
    color_value: '#64748b',
    position_x: 1450,
    position_y: 2150,
    width: 340,
    height: 360,
    z_index: 1,
    is_locked: true,
    item_count: 3,
    items: [
      // Deliberately NOT in the real AIza... format so secret scanners
      // (GitHub push protection, Netlify) don't flag this dummy value.
      { id: 1, vault_id: 601, item_type: 'key_value', label: 'Gemini API Key', value: 'gm-demo-4mO5tLqXw82hRkPnE6vTj9cYuB1aZsQg', order_index: 0, created_at: NOW, updated_at: NOW },
      { id: 2, vault_id: 601, item_type: 'key_value', label: 'Postgres URL', value: 'postgres://prod:****@db.internal:5432', order_index: 1, created_at: NOW, updated_at: NOW },
      { id: 3, vault_id: 601, item_type: 'key_value', label: 'Railway Token', value: 'rwy_4f9c2a7e1b8d4c3f9a6e5d2b7c1f8a3e', order_index: 2, created_at: NOW, updated_at: NOW },
    ],
    created_at: NOW,
    updated_at: NOW,
  },
];

// Pre-computed viewport transform: maps the collage into the usable area
// (screen x 256-1280, y 64-800) given the canvas-area origin of ~(128, 64).
const CANVAS_TRANSFORM = { x: -911, y: -1120, scale: 0.72 };

// ---------------------------------------------------------------------------

function ok(data) {
  return JSON.stringify({ success: true, data });
}

async function main() {
  console.log('Starting Puppeteer for the Itemize.cloud Workspace Canvas capture...');

  try {
    rmSync(CAPTURE_DIR, { recursive: true, force: true });
  } catch {}
  mkdirSync(CAPTURE_DIR, { recursive: true });

  const activeUrl = SITE_URL;
  console.log(`Capturing against production: ${activeUrl}`);

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });

  page.on('pageerror', (err) => console.error('PAGE ERROR:', err.toString()));

  // Pre-seed localStorage: skip the cookie banner and pin the canvas viewport
  // transform so the collage is perfectly framed on first paint.
  await page.evaluateOnNewDocument((transform, userId) => {
    try {
      localStorage.setItem(
        'itemize_cookie_consent',
        JSON.stringify({
          version: '1.0',
          preferences: {
            essential: true,
            analytics: true,
            marketing: true,
            consentGiven: true,
            consentDate: new Date().toISOString(),
          },
        }),
      );
      const value = JSON.stringify(transform);
      localStorage.setItem(`canvas_viewport:${userId}`, value);
      localStorage.setItem('canvas_viewport:guest', value);
    } catch {}
  }, CANVAS_TRANSFORM, MOCK_USER.id);

  let loggedIn = false;

  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const rawUrl = req.url();
    let parsed;
    try {
      parsed = new URL(rawUrl);
    } catch {
      req.continue();
      return;
    }

    const isDirectApi = parsed.hostname === API_HOST || parsed.hostname.includes('up.railway.app');
    const isProxyApi = parsed.pathname.startsWith('/api/');

    if (!isDirectApi && !isProxyApi) {
      req.continue();
      return;
    }

    const baseHeaders = {
      'Access-Control-Allow-Origin': activeUrl,
      'Access-Control-Allow-Credentials': 'true',
      'Content-Type': 'application/json',
    };

    if (req.method() === 'OPTIONS') {
      req.respond({
        status: 204,
        headers: {
          ...baseHeaders,
          'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-csrf-token, x-organization-id',
          'Access-Control-Max-Age': '86400',
        },
      });
      return;
    }

    const respond = (body, status = 200) => req.respond({ status, headers: baseHeaders, body });
    const unauthorized = () =>
      respond(JSON.stringify({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }), 401);

    const apiPath = parsed.pathname;

    // ---- Auth ----
    if (apiPath.includes('/api/auth/login')) {
      loggedIn = true;
      respond(ok({ success: true, user: MOCK_USER }));
      return;
    }
    if (apiPath.includes('/api/auth/csrf')) {
      respond(JSON.stringify({ csrfToken: 'mock-csrf-token' }));
      return;
    }
    if (apiPath.includes('/api/auth/me')) {
      if (loggedIn) respond(ok(MOCK_USER));
      else unauthorized();
      return;
    }

    // ---- Organization ----
    if (apiPath.includes('/api/organizations/ensure-default')) {
      respond(ok(MOCK_ORG));
      return;
    }

    // ---- Billing ----
    if (apiPath.endsWith('/api/billing')) {
      respond(ok({ success: true, data: MOCK_BILLING_STATUS }));
      return;
    }
    if (apiPath.includes('/api/billing/plans')) {
      respond(ok({ success: true, data: MOCK_BILLING_PLANS }));
      return;
    }
    if (apiPath.includes('/api/billing/usage')) {
      respond(ok({ success: true, data: MOCK_BILLING_USAGE }));
      return;
    }

    // ---- Onboarding ----
    if (apiPath.includes('/api/onboarding/progress')) {
      const feature = apiPath.split('/api/onboarding/progress/')[1];
      respond(ok(feature ? ONBOARDED_FEATURE : MOCK_ONBOARDING));
      return;
    }
    if (apiPath.includes('/api/onboarding/mark-seen') || apiPath.includes('/api/onboarding/dismiss')) {
      respond(ok(MOCK_ONBOARDING));
      return;
    }

    // ---- Categories ----
    if (apiPath.includes('/api/categories')) {
      respond(ok(MOCK_CATEGORIES));
      return;
    }

    // ---- Workspace Canvas data ----
    if (apiPath.includes('/api/canvas/lists')) {
      respond(ok(MOCK_LISTS));
      return;
    }
    // Checking off an item PUTs the whole list; echo it back so the optimistic
    // UI sticks instead of reverting.
    if (/\/api\/lists\/[^/]+$/.test(apiPath) && req.method() === 'PUT') {
      try {
        respond(ok(JSON.parse(req.postData() || '{}')));
      } catch {
        respond(ok({}));
      }
      return;
    }
    if (apiPath.includes('/api/notes')) {
      respond(ok(MOCK_NOTES));
      return;
    }
    if (apiPath.includes('/api/whiteboards')) {
      respond(ok(MOCK_WHITEBOARDS));
      return;
    }
    if (apiPath.includes('/api/wireframes')) {
      respond(ok([]));
      return;
    }
    if (apiPath.includes('/api/vaults')) {
      respond(ok(MOCK_VAULTS));
      return;
    }

    // ---- Fallback: empty success ----
    respond(ok([]));
  });

  try {
    let frameCount = 0;
    const saveFrame = async () => {
      const frameNum = String(frameCount++).padStart(3, '0');
      await page.screenshot({ path: path.join(CAPTURE_DIR, `frame-${frameNum}.png`) });
    };
    const burst = async (count, delay = 110) => {
      for (let i = 0; i < count; i++) {
        await saveFrame();
        await new Promise((r) => setTimeout(r, delay));
      }
    };

    // --- Silent login (no frames captured) ---
    console.log('Loading production login page (silent)...');
    await page.goto(`${activeUrl}/login`, { waitUntil: 'networkidle2', timeout: 120_000 });

    console.log('Typing credentials silently...');
    await page.waitForSelector('#email', { timeout: 30_000 });
    await page.click('#email');
    await page.type('#email', LOGIN_EMAIL, { delay: 10 });
    await page.click('#password');
    await page.type('#password', LOGIN_PASSWORD, { delay: 10 });
    await page.click('button[type="submit"]');

    console.log('Waiting for post-login redirect...');
    await page.waitForFunction(() => !window.location.pathname.startsWith('/login'), { timeout: 45_000 });

    // --- Workspace Canvas ---
    console.log('Navigating to the Workspace Canvas...');
    await page.goto(`${activeUrl}/canvas`, { waitUntil: 'networkidle2', timeout: 60_000 });

    console.log('Waiting for canvas collage to render...');
    await page.waitForFunction(
      () =>
        document.body.innerText.includes('Studio Gear Checklist') &&
        document.body.innerText.includes('Reading Queue'),
      { timeout: 45_000 },
    );

    // Hide toast overlays (incl. socket.io connection errors)
    await page.addStyleTag({ content: 'ol[tabindex="-1"], [data-radix-toast-viewport] { display: none !important; }' });

    // Settle: whiteboard paths load, cards mount
    await new Promise((r) => setTimeout(r, 2500));

    console.log('Capturing settled canvas collage (12 frames)...');
    await burst(12);

    // --- Real interactions: check off list items, reveal a vault secret ---

    // Find the smallest element whose text matches, move the mouse there
    // naturally, and click it.
    const clickByText = async (text, offsetY = 0) => {
      const handle = await page.evaluateHandle((t) => {
        const all = Array.from(document.querySelectorAll('span, div, p, label'));
        const matches = all.filter(
          (el) => el.childElementCount === 0 && el.textContent && el.textContent.trim().includes(t),
        );
        // Prefer the smallest (deepest) match
        matches.sort((a, b) => a.getBoundingClientRect().width - b.getBoundingClientRect().width);
        return matches[0] || null;
      }, text);
      const el = handle.asElement();
      if (!el) {
        console.log(`Click target not found: ${text}`);
        return false;
      }
      const box = await el.boundingBox();
      if (!box) return false;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + offsetY, { steps: 14 });
      await new Promise((r) => setTimeout(r, 200));
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2 + offsetY);
      return true;
    };

    const clickBySelector = async (selector, index = 0) => {
      const els = await page.$$(selector);
      const el = els[index];
      if (!el) {
        console.log(`Click target not found: ${selector}`);
        return false;
      }
      const box = await el.boundingBox();
      if (!box) return false;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 14 });
      await new Promise((r) => setTimeout(r, 200));
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      return true;
    };

    console.log('Checking off "Treat back wall reflections"...');
    await clickByText('Treat back wall reflections');
    await burst(6);

    console.log('Checking off "Load-test booking flow"...');
    await clickByText('Load-test booking flow');
    await burst(5);

    console.log('Revealing a vault secret...');
    await clickBySelector('button[title="Show value"]', 0);
    await burst(6);

    console.log('Hiding the vault secret again...');
    await clickBySelector('button[title="Hide value"]', 0);
    await burst(4);

    // --- Final settle ---
    console.log('Final settle burst...');
    await page.mouse.move(1000, 720, { steps: 10 });
    await burst(6);

    await browser.close();
    console.log('Browser closed. Compiling video with FFmpeg...');

    execFileSync(
      ffmpeg,
      [
        '-y',
        '-framerate', '10',
        '-i', path.join(CAPTURE_DIR, 'frame-%03d.png'),
        '-movflags', '+faststart',
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-vf', 'scale=1280:800',
        '-crf', '24',
        '-preset', 'slow',
        OUTPUT_MP4,
      ],
      { stdio: 'inherit' },
    );

    // Poster from the settled collage view
    const posterFrame = path.join(CAPTURE_DIR, 'frame-006.png');
    execFileSync(
      ffmpeg,
      ['-y', '-i', posterFrame, '-frames:v', '1', '-update', '1', '-c:v', 'libwebp', '-quality', '82', OUTPUT_POSTER],
      { stdio: 'inherit' },
    );

    try {
      rmSync(CAPTURE_DIR, { recursive: true, force: true });
    } catch {}

    console.log('Itemize.cloud canvas video & poster generated successfully!');
  } catch (err) {
    await browser.close();
    throw err;
  }
}

main().catch((err) => {
  console.error('Capture failed:', err);
  process.exit(1);
});
