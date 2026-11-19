// Leonida Platinum — hand-in program (Node 22, standard library only).
// The guide itself is plain static files in app/ (index.html, app.js,
// style.css, data/trophies.json) with no build step and no network use.
// This program copies app/ and screenshots/ beside this file into the
// output directory and writes dossier.json there with the vendored
// make.fun library, so the judge can read the screenshots and the
// source outline. vendor/makefun-frontend.ts must stay byte-identical
// to the kit copy: the scorer rebuilds the dossier with its own copy
// and compares the two byte for byte.
//
// Run it outside the grader with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Inside the grader, MAKEFUN_OUTPUT_DIR is unset and /output is used.
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// Caps from the competition gate: at most 4 screenshots of 256 KiB,
// app/ at most 993 files and directories and 48 MiB, dossier text
// capped at 160 KiB.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
console.log('wrote dossier to ' + join(outputDir, 'dossier.json'));
