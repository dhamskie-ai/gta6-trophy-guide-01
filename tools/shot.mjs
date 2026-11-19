// Take the dossier screenshots for Leonida Platinum with Playwright.
// The app is served straight from disk through page.route under a
// made-up host, so no local server (and no network) is needed. Each
// shot is a 1280x800 JPEG; the views come from shots.json in the repo
// root. Run from the repo root: `node tools/shot.mjs`.
import { chromium } from '/opt/muse/assets/spaces/ts-runtime/dist/node_modules/playwright/index.mjs';
import { readFileSync, existsSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const appDir = join(repoRoot, 'app');
const shotDir = join(repoRoot, 'screenshots');
const shots = JSON.parse(readFileSync(join(repoRoot, 'shots.json'), 'utf8'));
const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
};

const cleanEnv = {
  ...process.env,
  http_proxy: '', https_proxy: '', HTTP_PROXY: '', HTTPS_PROXY: '',
  all_proxy: '', ALL_PROXY: '', no_proxy: '*', NO_PROXY: '*',
};
const browser = await chromium.launch({
  executablePath: '/opt/meta-chromium/chrome',
  env: cleanEnv,
  args: [
    '--no-sandbox', '--disable-gpu', '--use-angle=swiftshader', '--no-proxy-server',
    '--hatch-webgl-allowed-domains-file=/tmp/webgl-policy.txt',
    '--hatch-webgl-allowed-domains-sha256=946935b2f40f4e274a02bea764ac855e19e5950a3a1b2b1fa35c9c4fa73130c0',
  ],
});

let failures = 0;
for (const shot of shots) {
  const page = await browser.newPage({ viewport: shot.viewport });
  const offHost = [];
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname !== 'leonida.guide') {
      offHost.push(route.request().url());
      await route.fulfill({ status: 404, body: 'off-host blocked' });
      return;
    }
    const requestPath = url.pathname === '/' ? '/index.html' : url.pathname;
    const fullPath = join(appDir, requestPath);
    if (existsSync(fullPath)) {
      await route.fulfill({
        status: 200,
        contentType: TYPES[extname(fullPath)] || 'application/octet-stream',
        body: readFileSync(fullPath),
      });
    } else {
      console.log(shot.file, 'missing', requestPath);
      await route.fulfill({ status: 404, body: 'not found' });
    }
  });
  page.on('console', (message) => {
    if (message.type() === 'error') {
      failures += 1;
      console.log(shot.file, 'console-error:', message.text());
    }
  });
  page.on('pageerror', (err) => {
    failures += 1;
    console.log(shot.file, 'pageerror:', String(err));
  });
  await page.goto('http://leonida.guide' + shot.path, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => window.__guideReady, null, { timeout: 30000 });
  // The page is taller than one viewport: scroll to the checklist and
  // the sticky guide pane so the shot shows the tracker at work.
  if (shot.scroll) await page.evaluate((y) => window.scrollTo(0, y), shot.scroll);
  await page.waitForTimeout(500);
  if (offHost.length) {
    failures += 1;
    console.log(shot.file, 'off-host requests:', offHost);
  }
  await page.screenshot({ path: join(shotDir, shot.file), type: 'jpeg', quality: 82, timeout: 60000 });
  console.log(shot.file, '-> done');
  await page.close();
}
await browser.close();
console.log('done, errors:', failures);
process.exit(failures > 0 ? 1 : 0);
