import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer';
import ffmpeg from 'ffmpeg-static';

const URL = 'http://127.0.0.1:8080/';
const CAPTURE_DIR = path.resolve('public/assets/images/capture_temp_flashcore');
const OUTPUT_MP4 = path.resolve('public/assets/images/flashcore.mp4');
const OUTPUT_POSTER = path.resolve('public/assets/images/flashcore-poster.jpg');

async function main() {
  console.log('Starting Puppeteer for interactive flashcore.dev capture...');
  
  // Clean up any existing temp folder and recreate it
  try {
    rmSync(CAPTURE_DIR, { recursive: true, force: true });
  } catch {}
  mkdirSync(CAPTURE_DIR, { recursive: true });

  // Detect which port the Vite server is running on (Vite falls back dynamically if ports are occupied)
  let activeUrl = 'http://127.0.0.1:8080/';
  const ports = [8080, 8081, 8082, 8083];
  for (const port of ports) {
    try {
      console.log(`Checking port ${port}...`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000);
      const response = await fetch(`http://127.0.0.1:${port}/`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (response.ok) {
        const text = await response.text();
        const titleMatch = text.match(/<title>([\s\S]*?)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : 'Unknown';
        console.log(`Port ${port} title: "${title}"`);
        if (title.toLowerCase().includes('flashcore') || title.toLowerCase().includes('vite')) {
          activeUrl = `http://127.0.0.1:${port}/`;
          console.log(`Found active FlashCore/Vite server at ${activeUrl}`);
          break;
        }
      }
    } catch (e) {
      // ignore connection errors or timeouts
    }
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 750, deviceScaleFactor: 1 });

  // Listen to page errors and console logs
  page.on('pageerror', (err) => {
    console.error('PAGE ERROR EXCEPTION:', err.toString());
  });
  page.on('console', (msg) => {
    console.log('PAGE CONSOLE:', msg.text());
  });

  // Enable request interception to mock backend stats and queries cleanly
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const url = req.url();
    const isApiRequest = url.includes('/api/');

    if (isApiRequest) {
      if (req.method() === 'OPTIONS') {
        req.respond({
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, x-csrf-token, Authorization',
          }
        });
        return;
      }

      const headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      };

      // Mock various game statistics and social requests gracefully
      if (url.includes('/stats')) {
        req.respond({
          status: 200,
          headers,
          body: JSON.stringify({
            highScore: 1850,
            playTime: 360,
            hasPlayed: true,
            achievementsUnlocked: 4,
            achievementsTotal: 8
          }),
        });
      } else if (url.includes('/achievements')) {
        req.respond({
          status: 200,
          headers,
          body: JSON.stringify({ achievements: [] }),
        });
      } else if (url.includes('/leaderboard')) {
        req.respond({
          status: 200,
          headers,
          body: JSON.stringify({ leaderboard: [] }),
        });
      } else if (url.includes('/comments')) {
        req.respond({
          status: 200,
          headers,
          body: JSON.stringify({ comments: [], total: 0, page: 1, pageSize: 10, totalPages: 0 }),
        });
      } else {
        req.respond({
          status: 200,
          headers,
          body: JSON.stringify({}),
        });
      }
    } else {
      req.continue();
    }
  });

  try {
    console.log(`Navigating to ${activeUrl}...`);
    await page.goto(activeUrl, { waitUntil: 'networkidle2' });

    // Wait for hydration and assets to settle
    await new Promise((r) => setTimeout(r, 4000));

    let frameCount = 0;
    const saveFrame = async () => {
      const frameNum = String(frameCount++).padStart(3, '0');
      const screenshotPath = path.join(CAPTURE_DIR, `frame-${frameNum}.png`);
      await page.screenshot({ path: screenshotPath });
    };

    console.log('Capturing landing/hero section (6 frames)...');
    for (let i = 0; i < 6; i++) {
      await saveFrame();
      await new Promise((r) => setTimeout(r, 100));
    }

    // Scroll down to the featured games section
    console.log('Scrolling down to Featured Games...');
    await page.evaluate(() => {
      window.scrollBy({ top: 480, behavior: 'smooth' });
    });
    console.log('Capturing scrolling transition (8 frames)...');
    for (let i = 0; i < 8; i++) {
      await saveFrame();
      await new Promise((r) => setTimeout(r, 100));
    }

    // Locate the Void Runner game card
    console.log('Locating the Void Runner game card...');
    const linksInfo = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a')).map(l => ({
        text: l.textContent?.trim() || '',
        href: l.getAttribute('href') || ''
      }));
    });
    console.log('All links on page:', JSON.stringify(linksInfo, null, 2));

    const cardHandle = await page.evaluateHandle(() => {
      const links = Array.from(document.querySelectorAll('a'));
      return links.find(l => {
        const text = l.textContent || '';
        return text.includes('Void Runner') || l.getAttribute('href')?.includes('void-runner');
      });
    });

    const card = cardHandle.asElement();
    if (!card) {
      throw new Error('Could not find Void Runner game card on page');
    }

    console.log('Hovering over the Void Runner card...');
    const box = await card.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    }

    console.log('Capturing hover state (5 frames)...');
    for (let i = 0; i < 5; i++) {
      await saveFrame();
      await new Promise((r) => setTimeout(r, 120));
    }

    console.log('Clicking the game card...');
    await card.click();

    console.log('Capturing click navigation (5 frames)...');
    for (let i = 0; i < 5; i++) {
      await saveFrame();
      await new Promise((r) => setTimeout(r, 100));
    }

    // Wait for the game launcher page and iframe to hydrate
    console.log('Waiting for game page hydration...');
    await new Promise((r) => setTimeout(r, 4000));

    console.log('Capturing game launcher loaded state (10 frames)...');
    for (let i = 0; i < 10; i++) {
      await saveFrame();
      await new Promise((r) => setTimeout(r, 150));
    }

    await browser.close();
    console.log('Browser closed. Compiling video with FFmpeg...');

    // Compile frames to MP4
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

    // Generate poster from first frame
    execFileSync(
      ffmpeg,
      [
        '-y',
        '-i', path.join(CAPTURE_DIR, 'frame-000.png'),
        '-frames:v', '1',
        '-q:v', '4',
        OUTPUT_POSTER,
      ],
      { stdio: 'inherit' }
    );

    // Clean up temp screenshots
    try {
      rmSync(CAPTURE_DIR, { recursive: true, force: true });
    } catch {}

    console.log('flashcore.dev video & poster captured and generated successfully!');
  } catch (err) {
    await browser.close();
    throw err;
  }
}

main().catch((err) => {
  console.error('Capture failed:', err);
  process.exit(1);
});
