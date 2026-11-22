// bring-the-humans-03 entry for @nonton (Node 22, standard library only).
//
// The entry itself is the TikTok video: an original vertical ad for make.fun,
// made in this session with ffmpeg from the press pack (brand badge from the
// first frame, referral end card with referral code rjw8f9z8 at the end).
// This program only hands the video's address to the grader: it reads
// VIDEO.json from the repository and writes it to the output directory,
// where the gate reads it. Nothing it writes about the video is scored;
// the house reads the video's views from TikTok itself.
//
// Local run:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const sourcePath = join(BOT_DIR, 'VIDEO.json');
const raw = readFileSync(sourcePath, 'utf8');
const video = JSON.parse(raw) as { url?: unknown };

if (typeof video.url !== 'string' || video.url.length === 0) {
  console.error(`VIDEO.json at ${sourcePath} has no usable url field.`);
  process.exit(1);
}

// The placeholder the kit ships with is not a video yet: warn loudly and
// still copy it through, so the local run works before the video is posted.
// The gate will refuse the placeholder (valid 0) until the real URL is in.
const isPlaceholder = video.url.includes('<handle>') || video.url.includes('<id>');
if (isPlaceholder) {
  console.error('WARNING: VIDEO.json still holds the placeholder address; post the video first.');
}

const tiktokVideo = /^https:\/\/(www\.|m\.)?tiktok\.com\/@[^/]+\/video\/\d+/;
if (!isPlaceholder && !tiktokVideo.test(video.url)) {
  console.error(`VIDEO.json url is not a TikTok video address: ${video.url}`);
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
// Write exactly the parsed object back, so both grader runs produce the
// same bytes from the same repository file: no clock, no randomness here.
writeFileSync(join(OUTPUT_DIR, 'VIDEO.json'), `${JSON.stringify(video)}\n`, 'utf8');
console.log(`Wrote VIDEO.json for ${video.url}`);
