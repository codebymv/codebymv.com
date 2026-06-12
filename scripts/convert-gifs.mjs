/**
 * Converts project GIFs to MP4 (hardware-decoded, ~10x smaller) plus a
 * first-frame JPEG poster for instant paint before the video loads.
 *
 * Usage: npm run convert:gifs
 */
import { execFileSync } from 'node:child_process';
import { statSync } from 'node:fs';
import ffmpeg from 'ffmpeg-static';

const IMAGES_DIR = 'public/assets/images';
const projects = ['itemize', 'mixfade', 'opaquesound', 'wiplayer', 'encoder', 'forecaster'];

for (const name of projects) {
  const input = `${IMAGES_DIR}/${name}.gif`;
  const mp4 = `${IMAGES_DIR}/${name}.mp4`;
  const poster = `${IMAGES_DIR}/${name}-poster.webp`;

  execFileSync(
    ffmpeg,
    [
      '-y',
      '-i', input,
      '-movflags', '+faststart',
      '-pix_fmt', 'yuv420p',
      // h264 requires even dimensions
      '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
      '-an',
      '-crf', '28',
      '-preset', 'slow',
      mp4,
    ],
    { stdio: ['ignore', 'ignore', 'inherit'] }
  );

  execFileSync(
    ffmpeg,
    ['-y', '-i', input, '-frames:v', '1', '-c:v', 'libwebp', '-quality', '82', poster],
    { stdio: ['ignore', 'ignore', 'inherit'] }
  );

  const before = (statSync(input).size / 1024).toFixed(0);
  const after = (statSync(mp4).size / 1024).toFixed(0);
  console.log(`${name}: ${before} KB gif -> ${after} KB mp4`);
}
