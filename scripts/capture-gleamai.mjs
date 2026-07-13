import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer';
import ffmpeg from 'ffmpeg-static';

const CAPTURE_DIR = path.resolve('public/assets/images/capture_temp_gleamai');
const OUTPUT_MP4 = path.resolve('public/assets/images/gleamai.mp4');
const OUTPUT_POSTER = path.resolve('public/assets/images/gleamai-poster.webp');

// Production site - avoids the Next.js dev-tools badge that local dev injects.
const SITE_URL = 'https://gleamai.dev';
const API_HOST = 'api.gleamai.dev';

const LOGIN_EMAIL = 'codeybmv@gmail.com';
const LOGIN_PASSWORD = 'P@ssword123';

// ---------------------------------------------------------------------------
// Mock data - every backend (localhost:3001) /api request is intercepted so
// the dashboard renders a fully-populated, production-looking account.
// ---------------------------------------------------------------------------

const MOCK_USER = {
  id: 'usr_mv_001',
  email: LOGIN_EMAIL,
  name: 'Matt Valentine',
  role: 'USER',
  plan: 'PROFESSIONAL',
  organizationId: 'org_valentine_01',
  currentOrganizationId: 'org_valentine_01',
  hasCreatedAgent: true,
  hasMadeCall: true,
  hasSentMessage: true,
};

const MOCK_BILLING = {
  plan: 'PROFESSIONAL',
  trialStartsAt: null,
  trialEndsAt: null,
  trialPlan: null,
  trialConvertedAt: '2026-03-02T18:00:00.000Z',
  trialEndAcknowledgedAt: '2026-03-02T18:00:00.000Z',
  includedCreditsUsed: 24150,
  includedCreditsLimit: 50000,
  callMinutesUsed: 3120,
  callMinutesCap: 6000,
  smsUsedFromIncluded: 9480,
  smsCap: 20000,
  purchasedCredits: 5000,
  stripeCustomerId: 'cus_mock123',
  billingPeriodStart: '2026-05-15T00:00:00.000Z',
};

const MOCK_ORG = {
  id: 'org_valentine_01',
  name: 'Valentine Digital',
  slug: 'valentine-digital',
  plan: 'PROFESSIONAL',
  logoUrl: null,
  primaryColor: null,
  parentId: null,
  role: 'OWNER',
  isAgency: false,
  joinedAt: '2026-02-10T16:00:00.000Z',
  createdAt: '2026-02-10T16:00:00.000Z',
  industry: 'Professional Services',
  _count: { agents: 3, phoneNumbers: 2, calls: 1450, campaigns: 4 },
};

const MOCK_AGENTS = [
  {
    id: 'agt_aria',
    name: 'Aria - Front Desk',
    description: 'Inbound reception and appointment booking',
    systemPrompt: '',
    greeting: 'Thanks for calling Valentine Digital!',
    llmModel: 'gpt-4o',
    voiceProvider: 'elevenlabs',
    voice: 'rachel',
    mode: 'INBOUND',
    communicationChannel: 'OMNICHANNEL',
    isActive: true,
    callTimeout: 60,
    retryAttempts: 1,
    calendarEnabled: true,
    crmEnabled: false,
    imageToolEnabled: false,
    documentToolEnabled: false,
    videoToolEnabled: false,
    contextEnabled: true,
    language: 'en-US',
    createdAt: '2026-03-04T17:00:00.000Z',
    updatedAt: '2026-06-01T12:00:00.000Z',
    totalCalls: 842,
    totalMessages: 6210,
    avgDuration: 186,
  },
  {
    id: 'agt_nova',
    name: 'Nova - Sales Outreach',
    description: 'Outbound lead qualification campaigns',
    systemPrompt: '',
    greeting: 'Hi, this is Nova with Valentine Digital.',
    llmModel: 'gpt-4o',
    voiceProvider: 'elevenlabs',
    voice: 'adam',
    mode: 'OUTBOUND',
    communicationChannel: 'VOICE_ONLY',
    isActive: true,
    callTimeout: 45,
    retryAttempts: 2,
    calendarEnabled: false,
    crmEnabled: true,
    imageToolEnabled: false,
    documentToolEnabled: false,
    videoToolEnabled: false,
    contextEnabled: true,
    language: 'en-US',
    createdAt: '2026-03-18T17:00:00.000Z',
    updatedAt: '2026-06-05T12:00:00.000Z',
    totalCalls: 486,
    totalMessages: 1830,
    avgDuration: 142,
  },
  {
    id: 'agt_sage',
    name: 'Sage - Support',
    description: 'SMS-first customer support follow-ups',
    systemPrompt: '',
    greeting: 'Hey! Sage here from Valentine Digital.',
    llmModel: 'gpt-4o-mini',
    voiceProvider: 'elevenlabs',
    voice: 'bella',
    mode: 'HYBRID',
    communicationChannel: 'MESSAGING_ONLY',
    isActive: true,
    callTimeout: 60,
    retryAttempts: 1,
    calendarEnabled: false,
    crmEnabled: false,
    imageToolEnabled: true,
    documentToolEnabled: true,
    videoToolEnabled: false,
    contextEnabled: true,
    language: 'en-US',
    createdAt: '2026-04-02T17:00:00.000Z',
    updatedAt: '2026-06-08T12:00:00.000Z',
    totalCalls: 122,
    totalMessages: 4010,
    avgDuration: 98,
  },
];

const MOCK_PHONE_NUMBERS = [
  {
    id: 'pn_001',
    phoneNumber: '+15205550143',
    twilioSid: 'PNmock0001',
    providerOwnership: 'GLEAM_MANAGED',
    webhookConfigurationStatus: 'CONFIGURED',
    provisionedAt: '2026-03-04T18:00:00.000Z',
    releasedAt: null,
    friendlyName: 'Main Line (Tucson)',
    isActive: true,
    createdAt: '2026-03-04T18:00:00.000Z',
    agentId: 'agt_aria',
    agent: { id: 'agt_aria', name: 'Aria - Front Desk', voice: 'rachel' },
  },
  {
    id: 'pn_002',
    phoneNumber: '+15205550177',
    twilioSid: 'PNmock0002',
    providerOwnership: 'GLEAM_MANAGED',
    webhookConfigurationStatus: 'CONFIGURED',
    provisionedAt: '2026-03-20T18:00:00.000Z',
    releasedAt: null,
    friendlyName: 'Outreach Line',
    isActive: true,
    createdAt: '2026-03-20T18:00:00.000Z',
    agentId: 'agt_nova',
    agent: { id: 'agt_nova', name: 'Nova - Sales Outreach', voice: 'adam' },
  },
];

/** 30 days of smooth-but-organic activity for sparklines + detailed chart. */
function buildTimeSeries(days = 30) {
  const points = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const t = days - 1 - i;
    // Weekly rhythm + upward trend + deterministic jitter
    const weekly = Math.sin((t / 7) * Math.PI * 2) * 0.25 + 1;
    const trend = 1 + t / (days * 1.6);
    const jitter = 0.85 + ((Math.sin(t * 12.9898) * 43758.5453) % 1 + 1) % 1 * 0.3;
    const calls = Math.round(38 * weekly * trend * jitter);
    const messages = Math.round(330 * weekly * trend * jitter);
    const duration = calls * (140 + Math.round(40 * weekly));
    const cost = +(calls * 0.42 + messages * 0.012).toFixed(2);
    points.push({
      date: d.toISOString().slice(0, 10),
      calls,
      failed: Math.round(calls * 0.04),
      messages,
      duration,
      cost,
      credits: Math.round(cost * 100),
    });
  }
  return points;
}

const TIME_SERIES = buildTimeSeries(30);

const PERFORMANCE = TIME_SERIES.map((p) => ({
  date: p.date,
  totalCalls: p.calls,
  completedCalls: p.calls - p.failed,
  completionRate: +((1 - p.failed / Math.max(p.calls, 1)) * 100).toFixed(1),
  avgLatency: 680 + Math.round(((p.calls * 7919) % 220)),
  p50Latency: 610,
  p95Latency: 1240,
  avgDuration: Math.round(p.duration / Math.max(p.calls, 1)),
  interruptions: Math.round(p.calls * 0.08),
}));

const CONTACT_NAMES = [
  ['+15203334121', 'Sarah Jenkins'],
  ['+16022218845', 'David Chen'],
  ['+15204447733', 'Maria Lopez'],
  ['+14803339210', 'James Whitfield'],
  ['+15209983321', 'Priya Natarajan'],
  ['+16025550162', 'Tom Becker'],
  ['+15206671190', 'Angela Ruiz'],
  ['+14807772514', 'Chris Okafor'],
  ['+15202214876', 'Emily Trask'],
  ['+16028873342', 'Robert Hale'],
];

function minutesAgo(mins) {
  return new Date(Date.now() - mins * 60_000).toISOString();
}

const MOCK_CALLS = [
  { phone: CONTACT_NAMES[0][0], dir: 'inbound', status: 'completed', dur: 312, sent: 'positive', agent: MOCK_AGENTS[0], mins: 14 },
  { phone: CONTACT_NAMES[1][0], dir: 'outbound', status: 'completed', dur: 254, sent: 'positive', agent: MOCK_AGENTS[1], mins: 42 },
  { phone: CONTACT_NAMES[2][0], dir: 'inbound', status: 'completed', dur: 178, sent: 'neutral', agent: MOCK_AGENTS[0], mins: 88 },
  { phone: CONTACT_NAMES[3][0], dir: 'outbound', status: 'no-answer', dur: 0, sent: null, agent: MOCK_AGENTS[1], mins: 132 },
  { phone: CONTACT_NAMES[4][0], dir: 'inbound', status: 'completed', dur: 421, sent: 'positive', agent: MOCK_AGENTS[0], mins: 197 },
  { phone: CONTACT_NAMES[5][0], dir: 'outbound', status: 'completed', dur: 196, sent: 'neutral', agent: MOCK_AGENTS[1], mins: 260 },
  { phone: CONTACT_NAMES[6][0], dir: 'inbound', status: 'completed', dur: 233, sent: 'positive', agent: MOCK_AGENTS[0], mins: 340 },
  { phone: CONTACT_NAMES[7][0], dir: 'outbound', status: 'busy', dur: 0, sent: null, agent: MOCK_AGENTS[1], mins: 412 },
  { phone: CONTACT_NAMES[8][0], dir: 'inbound', status: 'completed', dur: 287, sent: 'positive', agent: MOCK_AGENTS[0], mins: 530 },
  { phone: CONTACT_NAMES[9][0], dir: 'outbound', status: 'completed', dur: 164, sent: 'neutral', agent: MOCK_AGENTS[1], mins: 615 },
].map((c, i) => ({
  id: `call_${String(i + 1).padStart(3, '0')}`,
  agentId: c.agent.id,
  direction: c.dir,
  status: c.status,
  from: c.dir === 'inbound' ? c.phone : '+15205550143',
  to: c.dir === 'inbound' ? '+15205550143' : c.phone,
  duration: c.dur,
  sentiment: c.sent,
  createdAt: minutesAgo(c.mins),
  agent: { id: c.agent.id, name: c.agent.name },
  agentName: c.agent.name,
}));

const MESSAGE_PREVIEWS = [
  'Perfect - see you Thursday at 2pm!',
  'Can you send over the pricing sheet?',
  'Thanks for the quick follow-up.',
  'Yes, please reschedule me for next week.',
  'That answered my question, thank you!',
  'What are your weekend hours?',
  'Appointment confirmed for tomorrow.',
  'I would like to speak with someone about billing.',
  'Got it, thanks!',
  'Sounds good. Talk soon.',
];

const MOCK_CONVERSATIONS = CONTACT_NAMES.map(([phone], i) => ({
  id: `conv_${String(i + 1).padStart(3, '0')}`,
  externalNumber: phone,
  twilioNumber: '+15205550143',
  lastMessageAt: minutesAgo(8 + i * 47),
  messageCount: 3 + ((i * 5) % 14),
  agent: i % 3 === 0
    ? { id: 'agt_sage', name: 'Sage - Support' }
    : { id: 'agt_aria', name: 'Aria - Front Desk' },
  lastMessage: {
    id: `msg_${i}`,
    body: MESSAGE_PREVIEWS[i],
    direction: i % 2 === 0 ? 'INBOUND' : 'OUTBOUND',
    status: 'DELIVERED',
    createdAt: minutesAgo(8 + i * 47),
    numMedia: 0,
  },
  createdAt: minutesAgo(60 * 24 * (i + 2)),
  updatedAt: minutesAgo(8 + i * 47),
}));

const MOCK_CONTACTS_BATCH = Object.fromEntries(
  CONTACT_NAMES.map(([phone, name], i) => [
    phone,
    { id: `ct_${i}`, name, phoneNumber: phone, createdAt: minutesAgo(99999), updatedAt: minutesAgo(99) },
  ]),
);

const ANALYTICS_SUMMARY = {
  totalCalls: 1450,
  completedCalls: 1364,
  failedCalls: 86,
  totalDuration: 273400,
  avgDuration: 188,
  totalCost: 196.4,
  totalCredits: 24150,
  callCredits: 17350,
  messageCredits: 6800,
  totalMessages: 12050,
  deliveredMessages: 11875,
  failedMessages: 175,
  messageCost: 144.6,
  sentiment: { positive: 61, neutral: 31, negative: 8 },
};

// ---------------------------------------------------------------------------

function ok(data, meta) {
  return JSON.stringify({ success: true, data, ...(meta ? { meta } : {}) });
}

async function main() {
  console.log('Starting Puppeteer for fully-mocked GleamAI dashboard capture...');

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
  page.on('console', (msg) => {
    const text = msg.text();
    if (!text.includes('Download the React DevTools')) console.log('PAGE CONSOLE:', text);
  });

  // Pre-seed localStorage so the cookie consent banner never appears.
  await page.evaluateOnNewDocument(() => {
    try {
      localStorage.setItem(
        'gleam_cookie_consent',
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
    } catch {}
  });

  // The user is "logged out" until the login POST is intercepted.
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

    // Intercept every backend API call (direct host or Next rewrite proxy) so
    // nothing ever reaches the real production API.
    const isDirectApi = parsed.hostname === API_HOST;
    const isProxyApi = parsed.pathname.startsWith('/api/backend/');
    if (!isDirectApi && !isProxyApi) {
      req.continue();
      return;
    }

    // Normalize so handlers below can match on canonical /api/... paths
    const apiPath = isProxyApi ? `/api${parsed.pathname.slice('/api/backend'.length)}` : parsed.pathname;
    const url = `${apiPath}${parsed.search}`;

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

    // ---- Auth ----
    if (url.includes('/api/auth/login')) {
      loggedIn = true;
      console.log('Mocking successful login...');
      respond(ok({ user: MOCK_USER, token: 'mock-access-token' }));
      return;
    }
    if (url.includes('/api/auth/csrf')) {
      respond(JSON.stringify({ csrfToken: 'mock-csrf' }));
      return;
    }
    if (url.includes('/api/auth/refresh')) {
      if (loggedIn) respond(ok({ token: 'mock-access-token' }));
      else unauthorized();
      return;
    }
    if (url.includes('/api/auth/me')) {
      if (loggedIn) respond(ok(MOCK_USER));
      else unauthorized();
      return;
    }

    // ---- Billing / org ----
    if (url.includes('/api/billing/products')) {
      respond(ok({ creditPacks: [] }));
      return;
    }
    if (url.includes('/api/billing')) {
      respond(ok(MOCK_BILLING));
      return;
    }
    if (url.includes('/api/organizations/current')) {
      respond(ok(MOCK_ORG));
      return;
    }
    if (url.includes('/api/organizations')) {
      respond(ok([MOCK_ORG]));
      return;
    }

    // ---- Setup ----
    if (url.includes('/api/agents')) {
      respond(ok(MOCK_AGENTS));
      return;
    }
    if (url.includes('/api/phone-numbers')) {
      respond(ok(MOCK_PHONE_NUMBERS));
      return;
    }

    // ---- Analytics ----
    if (url.includes('/api/calls/analytics/summary')) {
      respond(ok(ANALYTICS_SUMMARY));
      return;
    }
    if (url.includes('/api/calls/analytics/timeseries')) {
      respond(ok(TIME_SERIES));
      return;
    }
    if (url.includes('/api/calls/analytics/performance')) {
      respond(ok(PERFORMANCE));
      return;
    }
    if (url.includes('/api/calls/analytics')) {
      respond(ok([]));
      return;
    }

    // ---- Communications (only page 1 has data so infinite scroll terminates) ----
    const pageParam = Number(parsed.searchParams.get('page') || '1');
    if (url.includes('/api/calls')) {
      if (pageParam > 1) respond(ok([], { page: pageParam, limit: 10, total: 10, hasMore: false }));
      else respond(ok(MOCK_CALLS, { page: 1, limit: 10, total: 10, hasMore: false }));
      return;
    }
    if (url.includes('/api/messages/conversations')) {
      if (pageParam > 1) respond(ok([], { page: pageParam, limit: 10, total: 10, hasMore: false }));
      else respond(ok(MOCK_CONVERSATIONS, { page: 1, limit: 10, total: 10, hasMore: false }));
      return;
    }
    if (url.includes('/api/contacts/batch')) {
      respond(ok(MOCK_CONTACTS_BATCH));
      return;
    }
    if (url.includes('/api/contacts')) {
      respond(ok(Object.values(MOCK_CONTACTS_BATCH)));
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

    console.log('Loading production login page...');
    await page.goto(`${activeUrl}/login`, { waitUntil: 'networkidle2', timeout: 120_000 });
    await new Promise((r) => setTimeout(r, 2500));

    // --- Login page ---
    console.log('Capturing login page (4 frames)...');
    await burst(4);

    console.log('Typing credentials...');
    await page.waitForSelector('#email', { timeout: 30_000 });
    await page.click('#email');
    await page.type('#email', LOGIN_EMAIL, { delay: 28 });
    await burst(2);
    await page.click('#password');
    await page.type('#password', LOGIN_PASSWORD, { delay: 24 });
    await burst(3);

    console.log('Submitting login...');
    await page.click('button[type="submit"]');
    await burst(3, 150);

    // --- Dashboard ---
    console.log('Waiting for dashboard to render with mocked data...');
    await page.waitForFunction(
      () => document.body.innerText.includes('Usage Credits') && document.body.innerText.includes('24,150'),
      { timeout: 120_000 },
    );
    // Let sparklines, charts and live feed settle
    await new Promise((r) => setTimeout(r, 2500));

    // Hide the "Welcome back!" toast so it doesn't sit over the dashboard
    await page.addStyleTag({ content: 'ol[tabindex="-1"], [data-radix-toast-viewport] { display: none !important; }' });
    await new Promise((r) => setTimeout(r, 300));

    console.log('Capturing populated dashboard (10 frames)...');
    await burst(10);

    // --- Click "Total Calls" metric card ---
    console.log('Clicking the Total Calls metric card...');
    const clickMetricCard = async (label) => {
      const handle = await page.evaluateHandle((text) => {
        const candidates = Array.from(document.querySelectorAll('p'));
        const labelEl = candidates.find((p) => p.textContent?.trim() === text);
        return labelEl ? labelEl.closest('.cursor-pointer') : null;
      }, label);
      const el = handle.asElement();
      if (!el) {
        console.warn(`Could not find metric card "${label}"`);
        return false;
      }
      const box = await el.boundingBox();
      if (box) await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await new Promise((r) => setTimeout(r, 250));
      await el.click();
      return true;
    };

    await clickMetricCard('Total Calls');
    console.log('Capturing calls chart transition (8 frames)...');
    await burst(8);

    console.log('Clicking the Total Messages metric card...');
    await clickMetricCard('Total Messages');
    console.log('Capturing messages chart transition (8 frames)...');
    await burst(8);

    // --- Scroll to Recent Communications ---
    console.log('Scrolling to Recent Communications...');
    await page.evaluate(() => {
      const headers = Array.from(document.querySelectorAll('*'));
      const target = headers.find((el) => el.textContent?.trim() === 'Recent Communications');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else window.scrollBy({ top: 700, behavior: 'smooth' });
    });
    console.log('Capturing scroll transition (8 frames)...');
    await burst(8);

    // Hover a recent call entry for a final touch of life
    await page.evaluate(() => {
      const list = document.querySelector('[aria-label="Recent calls"]');
      if (list) list.scrollBy({ top: 160, behavior: 'smooth' });
    });
    console.log('Capturing recent calls list scroll (8 frames)...');
    await burst(8);

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

    // Poster from a populated dashboard frame (after login, not the login form)
    const posterFrame = path.join(CAPTURE_DIR, 'frame-014.png');
    execFileSync(
      ffmpeg,
      ['-y', '-i', posterFrame, '-frames:v', '1', '-update', '1', '-c:v', 'libwebp', '-quality', '82', OUTPUT_POSTER],
      { stdio: 'inherit' },
    );

    try {
      rmSync(CAPTURE_DIR, { recursive: true, force: true });
    } catch {}

    console.log('GleamAI video & poster captured and generated successfully!');
  } catch (err) {
    await browser.close();
    throw err;
  }
}

main().catch((err) => {
  console.error('Capture failed:', err);
  process.exit(1);
});
