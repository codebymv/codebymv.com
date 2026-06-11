import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer';
import ffmpeg from 'ffmpeg-static';

const URL = 'http://127.0.0.1:5173/';
const CAPTURE_DIR = path.resolve('public/assets/images/capture_temp');
const OUTPUT_MP4 = path.resolve('public/assets/images/sampleseeker.mp4');
const OUTPUT_POSTER = path.resolve('public/assets/images/sampleseeker-poster.jpg');

async function main() {
  console.log('Starting Puppeteer for fully-mocked interactive SampleSeeker capture (no YouTube block)...');
  
  // Clean up any existing temp folder and recreate it
  try {
    rmSync(CAPTURE_DIR, { recursive: true, force: true });
  } catch {}
  mkdirSync(CAPTURE_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-web-security', // Disable CORS preflight checks
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

  // Track the number of seeks requested to return different mock videos deterministically
  let shuffleCount = 0;

  // Enable request interception to mock ALL api/ routes + YouTube players to prevent "Video unavailable" blocks!
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const url = req.url();
    const isApiRequest = url.includes(':8787/api/');
    const isYouTubeEmbed = url.includes('youtube.com/embed/');

    if (isYouTubeEmbed) {
      console.log('Intercepting and mocking YouTube embed iframe to prevent bot blocks:', url);
      // Extract video ID from embed URL
      const match = url.match(/\/embed\/([^?&\/]+)/);
      const videoId = match ? match[1] : 'F0V_A7G_p-I';
      
      // Select a beautiful, high-quality Unsplash thumbnail image matching the track's aesthetic perfectly.
      // Unsplash images never trigger YouTube/Google anti-bot or network blocks, ensuring 100% reliable capture.
      let thumbnailUrl = 'https://images.unsplash.com/photo-1487180142328-0c4e37023af5?auto=format&fit=crop&w=600&q=80'; // fallback retro vinyl/tape
      if (videoId === 'gUt7K8O3GkY') {
        thumbnailUrl = 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=80'; // Neon Tokyo street for City Pop
      } else if (videoId === 'hCCV6Y7S0EU') {
        thumbnailUrl = 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=600&q=80'; // Tropical lagoon beach for Blue Lagoon J-Fusion
      }

      // Respond with a clean, high-fidelity mock HTML player that mimics YouTube's UI but loads instantly
      req.respond({
        status: 200,
        contentType: 'text/html',
        body: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #000; font-family: sans-serif; }
              .player-container { position: relative; width: 100%; height: 100%; }
              img { width: 100%; height: 100%; object-fit: cover; filter: brightness(0.75); }
              .overlay {
                position: absolute;
                inset: 0;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                padding: 16px;
                background: linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 75%, rgba(0,0,0,0.6) 100%);
                box-sizing: border-box;
              }
              .title { color: #fff; font-size: 16px; font-weight: 500; text-shadow: 0 1px 2px rgba(0,0,0,0.8); }
              .play-btn {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 68px;
                height: 48px;
                background: rgba(33,33,33,0.8);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.1s;
                cursor: pointer;
              }
              .play-btn:hover { background: #f00; }
              .play-icon {
                width: 0;
                height: 0;
                border-style: solid;
                border-width: 10px 0 10px 18px;
                border-color: transparent transparent transparent #fff;
                margin-left: 4px;
              }
              .controls { display: flex; justify-content: space-between; align-items: center; color: #ccc; font-size: 12px; }
              .progress-bar { flex: 1; height: 3px; background: rgba(255,255,255,0.2); margin: 0 12px; position: relative; }
              .progress-fill { width: 35%; height: 100%; background: #f00; }
            </style>
          </head>
          <body>
            <div class="player-container">
              <img src="${thumbnailUrl}">
              <div class="play-btn"><div class="play-icon"></div></div>
              <div class="overlay">
                <div class="title">Watching on YouTube</div>
                <div class="controls">
                  <span>0:15 / 3:45</span>
                  <div class="progress-bar"><div class="progress-fill"></div></div>
                  <span>1080p</span>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      });
      return;
    }

    if (isApiRequest) {
      if (req.method() === 'OPTIONS') {
        req.respond({
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, x-csrf-token, Authorization',
            'Access-Control-Max-Age': '86400'
          }
        });
        return;
      }

      const headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      };

      if (url.includes('/api/auth/csrf')) {
        req.respond({
          status: 200,
          headers,
          body: JSON.stringify({ token: 'mock-csrf-token' }),
        });
      } else if (url.includes('/api/auth/me')) {
        req.respond({
          status: 200,
          headers,
          body: JSON.stringify({ user: null }), // Mock as guest user
        });
      } else if (url.includes('/api/auth/refresh')) {
        req.respond({
          status: 401,
          headers,
          body: JSON.stringify({ error: 'Session expired or not found' }), // Mock safe refresh fail
        });
      } else if (url.includes('/api/seek-quota')) {
        req.respond({
          status: 200,
          headers,
          body: JSON.stringify({
            used: shuffleCount,
            limit: 25,
            remaining: 25 - shuffleCount,
            unlimited: true,
            resetsAt: new Date(Date.now() + 86400000).toISOString(),
          }),
        });
      } else if (url.includes('/api/crates')) {
        req.respond({
          status: 200,
          headers,
          body: JSON.stringify({ crates: [] }),
        });
      } else if (url.includes('/api/crate')) {
        req.respond({
          status: 200,
          headers,
          body: JSON.stringify({ favs: [], history: [] }),
        });
      } else if (url.includes('/api/filters')) {
        req.respond({
          status: 200,
          headers,
          body: JSON.stringify({ filters: [] }),
        });
      } else if (url.includes('/api/history')) {
        req.respond({
          status: 200,
          headers,
          body: JSON.stringify({ ok: true }),
        });
      } else if (url.includes('/api/shuffle')) {
        shuffleCount++;
        console.log(`Intercepting and mocking /api/shuffle request #${shuffleCount}...`);
        
        // Return 100% available, popular, historic sample-friendly tracks!
        const video = shuffleCount === 1 
          ? {
              id: 'gUt7K8O3GkY', // Miki Matsubara - Stay With Me
              title: 'Miki Matsubara - Stay With Me (1979 City Pop Classic)',
              channel: 'City Pop Records',
              views: 12000000,
              publishedAt: '1979-11-05T00:00:00Z',
              thumbnail: 'https://i.ytimg.com/vi/gUt7K8O3GkY/hqdefault.jpg'
            }
          : {
              id: 'hCCV6Y7S0EU', // Masayoshi Takanaka - Blue Lagoon
              title: 'Masayoshi Takanaka - Blue Lagoon (1979 J-Fusion Masterpiece)',
              channel: 'Fusion Archives',
              views: 4500000,
              publishedAt: '1979-06-21T00:00:00Z',
              thumbnail: 'https://i.ytimg.com/vi/hCCV6Y7S0EU/hqdefault.jpg'
            };

        req.respond({
          status: 200,
          headers,
          body: JSON.stringify({
            video,
            quota: {
              used: shuffleCount,
              limit: 25,
              remaining: 25 - shuffleCount,
              resetsAt: new Date(Date.now() + 86400000).toISOString(),
              unlimited: true
            }
          })
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
    console.log(`Navigating to ${URL}...`);
    await page.goto(URL, { waitUntil: 'networkidle2' });

    // Wait for initial hydration
    await new Promise((r) => setTimeout(r, 4000));

    let frameCount = 0;
    const saveFrame = async () => {
      const frameNum = String(frameCount++).padStart(3, '0');
      const screenshotPath = path.join(CAPTURE_DIR, `frame-${frameNum}.png`);
      await page.screenshot({ path: screenshotPath });
    };

    console.log('Capturing initial state (6 frames)...');
    for (let i = 0; i < 6; i++) {
      await saveFrame();
      await new Promise((r) => setTimeout(r, 100));
    }

    // --- ENABLE AUTOPLAY (AUTO-ADVANCE) ---
    console.log('Locating Player settings button (gear)...');
    const settingsBtn = await page.$('button[aria-label="Player settings"]');
    if (!settingsBtn) {
      console.warn('Could not find Player settings button!');
    } else {
      console.log('Hovering over Player settings button...');
      const settingsBox = await settingsBtn.boundingBox();
      if (settingsBox) {
        await page.mouse.move(settingsBox.x + settingsBox.width / 2, settingsBox.y + settingsBox.height / 2);
      }
      await saveFrame();
      await new Promise((r) => setTimeout(r, 200));

      console.log('Clicking Player settings button...');
      await settingsBtn.click();
      // Wait for settings popover to open & capture frames
      console.log('Capturing settings popover opening (5 frames)...');
      for (let i = 0; i < 5; i++) {
        await saveFrame();
        await new Promise((r) => setTimeout(r, 150));
      }

      console.log('Clicking Auto-advance toggle...');
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const autoAdvanceBtn = buttons.find(b => b.textContent && b.textContent.includes('Auto-advance'));
        if (autoAdvanceBtn) autoAdvanceBtn.click();
      });
      // Capture the state transition where seconds options appear
      console.log('Capturing Auto-advance activation (4 frames)...');
      for (let i = 0; i < 4; i++) {
        await saveFrame();
        await new Promise((r) => setTimeout(r, 150));
      }

      console.log('Selecting 15 seconds limit...');
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const fifteenSecBtn = buttons.find(b => b.textContent && b.textContent.trim() === '15s');
        if (fifteenSecBtn) fifteenSecBtn.click();
      });
      console.log('Capturing 15s limit selection (4 frames)...');
      for (let i = 0; i < 4; i++) {
        await saveFrame();
        await new Promise((r) => setTimeout(r, 150));
      }

      console.log('Closing Player settings popover...');
      await settingsBtn.click();
      console.log('Capturing settings popover closing (4 frames)...');
      for (let i = 0; i < 4; i++) {
        await saveFrame();
        await new Promise((r) => setTimeout(r, 150));
      }
    }

    // --- SEEK 1 ---
    console.log('Locating the Seek button for Seek #1...');
    let buttonHandle = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.textContent && (b.textContent.includes('Seek') || b.textContent.includes('seek')));
    });

    let button = buttonHandle.asElement();
    if (!button) {
      throw new Error('Could not find Seek button for first seek');
    }

    console.log('Hovering over the Seek button...');
    let box = await button.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    }

    console.log('Capturing hover state (3 frames)...');
    for (let i = 0; i < 3; i++) {
      await saveFrame();
      await new Promise((r) => setTimeout(r, 100));
    }

    console.log('Clicking the Seek button...');
    await page.mouse.down();
    await saveFrame(); // Click frame
    await new Promise((r) => setTimeout(r, 50));
    await page.mouse.up();

    console.log('Capturing loading/seeking state #1 (5 frames)...');
    for (let i = 0; i < 5; i++) {
      await saveFrame();
      await new Promise((r) => setTimeout(r, 100));
    }

    // Wait for Video A to render
    await new Promise((r) => setTimeout(r, 1500));

    console.log('Capturing Video A playing state (10 frames)...');
    for (let i = 0; i < 10; i++) {
      await saveFrame();
      await new Promise((r) => setTimeout(r, 100));
    }

    // --- SEEK 2 (Seek Once More) ---
    console.log('Locating the Seek button for Seek #2 (Once More)...');
    buttonHandle = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.textContent && (b.textContent.includes('Seek') || b.textContent.includes('seek')));
    });

    button = buttonHandle.asElement();
    if (!button) {
      throw new Error('Could not find Seek button for second seek');
    }

    console.log('Hovering over the Seek button again...');
    box = await button.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    }

    console.log('Capturing hover state #2 (3 frames)...');
    for (let i = 0; i < 3; i++) {
      await saveFrame();
      await new Promise((r) => setTimeout(r, 100));
    }

    console.log('Clicking the Seek button once more...');
    await page.mouse.down();
    await saveFrame(); // Click frame
    await new Promise((r) => setTimeout(r, 50));
    await page.mouse.up();

    console.log('Capturing loading/seeking state #2 (5 frames)...');
    for (let i = 0; i < 5; i++) {
      await saveFrame();
      await new Promise((r) => setTimeout(r, 100));
    }

    // Wait for Video B to render
    await new Promise((r) => setTimeout(r, 1500));

    console.log('Capturing Video B playing state (15 frames)...');
    for (let i = 0; i < 15; i++) {
      await saveFrame();
      await new Promise((r) => setTimeout(r, 100));
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

    console.log('SampleSeeker video & poster captured and generated successfully!');
  } catch (err) {
    await browser.close();
    throw err;
  }
}

main().catch((err) => {
  console.error('Capture failed:', err);
  process.exit(1);
});
