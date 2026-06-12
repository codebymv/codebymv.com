import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer';
import ffmpeg from 'ffmpeg-static';

const URL = 'https://tucsonlovesmusic.com/events';
const CAPTURE_DIR = path.resolve('public/assets/images/capture_temp_tucsonlovesmusic');
const OUTPUT_MP4 = path.resolve('public/assets/images/tucsonlovesmusic.mp4');
const OUTPUT_POSTER = path.resolve('public/assets/images/tucsonlovesmusic-poster.webp');

async function main() {
  console.log('Starting Puppeteer for tucsonlovesmusic.com capture...');

  try {
    rmSync(CAPTURE_DIR, { recursive: true, force: true });
  } catch {}
  mkdirSync(CAPTURE_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 750, deviceScaleFactor: 1 });
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
  );

  page.on('pageerror', (err) => console.error('PAGE ERROR:', err.toString()));

  let frameCount = 0;
  const saveFrame = async () => {
    const frameNum = String(frameCount++).padStart(3, '0');
    await page.screenshot({ path: path.join(CAPTURE_DIR, `frame-${frameNum}.png`) });
  };
  const burst = async (frames, delayMs) => {
    for (let i = 0; i < frames; i++) {
      await saveFrame();
      await new Promise((r) => setTimeout(r, delayMs));
    }
  };

  try {
    console.log(`Navigating to ${URL}...`);
    await page.goto(URL, { waitUntil: 'networkidle2', timeout: 90000 });

    // Hide cookie/consent banners and toasts if any appear
    await page.addStyleTag({
      content: `
        [class*="cookie" i], [id*="cookie" i],
        [class*="consent" i], [id*="consent" i],
        [class*="toast" i] { display: none !important; }
      `,
    });

    // Let hydration + images settle
    await new Promise((r) => setTimeout(r, 5000));

    console.log('Capturing events listing (8 frames)...');
    await burst(8, 120);

    console.log('Scrolling down the events page...');
    await page.evaluate(() => window.scrollBy({ top: 600, behavior: 'smooth' }));
    await burst(8, 110);

    await page.evaluate(() => window.scrollBy({ top: 600, behavior: 'smooth' }));
    await burst(8, 110);

    // Find an event detail link in (or near) the current view
    console.log('Locating an event card link...');
    const cardHandle = await page.evaluateHandle(() => {
      const links = Array.from(document.querySelectorAll('a[href*="/events/"]'));
      const viewportH = window.innerHeight;
      const candidates = links
        .map((l) => ({ l, rect: l.getBoundingClientRect(), href: l.getAttribute('href') || '' }))
        // Detail links look like /events/<uuid>, possibly with return params
        .filter(({ href, rect }) =>
          /\/events\/[0-9a-f]{8}-/i.test(href) &&
          rect.width > 80 && rect.height > 40 &&
          rect.bottom > 80 && rect.top < viewportH * 0.9
        )
        // Prefer the largest card in view
        .sort((a, b) => b.rect.width * b.rect.height - a.rect.width * a.rect.height);
      return candidates.length ? candidates[0].l : null;
    });

    const card = cardHandle.asElement();
    if (!card) {
      const hrefs = await page.evaluate(() =>
        Array.from(document.querySelectorAll('a[href*="/events/"]')).map((l) => l.getAttribute('href')).slice(0, 30)
      );
      console.log('Event links found:', JSON.stringify(hrefs, null, 2));
      throw new Error('Could not find a visible event card link');
    }

    const href = await card.evaluate((el) => el.getAttribute('href'));
    console.log(`Hovering event card: ${href}`);
    const box = await card.boundingBox();
    if (box) await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await burst(5, 120);

    console.log('Clicking the event card...');
    await card.click();

    // Next.js client-side navigation — wait for the URL to change
    await page.waitForFunction(
      (prev) => location.pathname !== prev,
      { timeout: 30000 },
      '/events'
    );
    console.log('Navigated to:', await page.evaluate(() => location.pathname));

    // Wait for the detail content to actually render (spinner gone, content in)
    console.log('Waiting for event detail content...');
    await page.waitForFunction(
      () =>
        document.body.innerText.includes('Back to Events') &&
        !document.querySelector('[class*="animate-spin"]'),
      { timeout: 30000 }
    );
    await new Promise((r) => setTimeout(r, 2500));

    console.log('Capturing event detail page (8 frames)...');
    await burst(8, 130);

    console.log('Scrolling event detail page...');
    await page.evaluate(() => window.scrollBy({ top: 500, behavior: 'smooth' }));
    await burst(8, 120);

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
        '-vf', 'scale=1200:750',
        '-crf', '24',
        '-preset', 'slow',
        OUTPUT_MP4,
      ],
      { stdio: 'inherit' }
    );

    execFileSync(
      ffmpeg,
      ['-y', '-i', path.join(CAPTURE_DIR, 'frame-000.png'), '-frames:v', '1', '-c:v', 'libwebp', '-quality', '82', OUTPUT_POSTER],
      { stdio: 'inherit' }
    );

    try {
      rmSync(CAPTURE_DIR, { recursive: true, force: true });
    } catch {}

    console.log('tucsonlovesmusic.com video & poster generated successfully!');
  } catch (err) {
    try {
      await page.screenshot({ path: path.resolve('public/assets/images/capture-error.png') });
    } catch {}
    await browser.close();
    throw err;
  }
}

main().catch((err) => {
  console.error('Capture failed:', err);
  process.exit(1);
});
