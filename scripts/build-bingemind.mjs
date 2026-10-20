// Builds the copy for https://bingemind.com/<slug>/ into dist-bingemind/.
// Runs the tests first. Works on macOS, Windows and Linux (no shell env syntax).
import { spawnSync } from 'node:child_process';
const shell = process.platform === 'win32';
const t = spawnSync('npm', ['test'], { stdio: 'inherit', shell }).status ?? 1;
if (t !== 0) process.exit(t);
const b = spawnSync('npx', ['astro', 'build', '--outDir', 'dist-bingemind'], {
  stdio: 'inherit', shell, env: { ...process.env, SITE_MODE: 'bingemind' },
}).status ?? 1;
process.exit(b);
