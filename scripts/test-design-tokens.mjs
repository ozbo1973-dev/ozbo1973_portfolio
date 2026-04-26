// Design token acceptance tests for issue #17 — Dark Design Token Foundation
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __dirname = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(__dirname, '../src/app/globals.css'), 'utf-8');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (e) {
    console.log(`  ✗ ${name}`);
    console.log(`    ${e.message}`);
    failed++;
  }
}

function getRootToken(name) {
  const rootMatch = css.match(/:root\s*\{([^}]+)\}/s);
  if (!rootMatch) throw new Error(':root block not found');
  const tokenMatch = rootMatch[1].match(new RegExp(`${name.replace('--', '--')}:\\s*([^;]+);`));
  if (!tokenMatch) throw new Error(`Token ${name} not found in :root`);
  return tokenMatch[1].trim();
}

function getThemeInlineBlock() {
  const match = css.match(/@theme\s+inline\s*\{([^}]+)\}/s);
  if (!match) throw new Error('@theme inline block not found');
  return match[1];
}

function getOklchLightness(value) {
  const match = value.match(/oklch\(\s*([\d.]+)/);
  if (!match) throw new Error(`Not an oklch value: "${value}"`);
  return parseFloat(match[1]);
}

function getOklchHue(value) {
  const match = value.match(/oklch\(\s*[\d.]+\s+[\d.]+\s+([\d.]+)/);
  if (!match) throw new Error(`Cannot extract hue from oklch value: "${value}"`);
  return parseFloat(match[1]);
}

console.log('\nDesign Token Tests\n');

// Tracer bullet: background must be dark
test('--background in :root is dark (lightness < 0.20)', () => {
  const value = getRootToken('--background');
  const l = getOklchLightness(value);
  assert(l < 0.20, `Expected lightness < 0.20, got ${l} (value: ${value})`);
});

test('--background in :root uses a warm hue (20 ≤ H ≤ 100)', () => {
  const value = getRootToken('--background');
  const h = getOklchHue(value);
  assert(h >= 20 && h <= 100, `Expected hue 20–100, got ${h} (value: ${value})`);
});

test('--foreground in :root is near-white (lightness > 0.90)', () => {
  const value = getRootToken('--foreground');
  const l = getOklchLightness(value);
  assert(l > 0.90, `Expected lightness > 0.90, got ${l} (value: ${value})`);
});

test('--card in :root is elevated above background (L > bg L, but still dark L < 0.30)', () => {
  const bgValue = getRootToken('--background');
  const cardValue = getRootToken('--card');
  const bgL = getOklchLightness(bgValue);
  const cardL = getOklchLightness(cardValue);
  assert(cardL > bgL, `Expected card L (${cardL}) > background L (${bgL})`);
  assert(cardL < 0.30, `Expected card L < 0.30, got ${cardL}`);
});

test('--muted in :root is dark (lightness < 0.30)', () => {
  const value = getRootToken('--muted');
  const l = getOklchLightness(value);
  assert(l < 0.30, `Expected lightness < 0.30, got ${l} (value: ${value})`);
});

test('--border in :root is a subtle value (not the original light oklch(0.92 ...))', () => {
  const value = getRootToken('--border');
  assert(
    !value.includes('oklch(0.92'),
    `Border should not be the original light value, got: ${value}`
  );
});

test('--primary amber token is unchanged (oklch(0.705 0.213 47.604))', () => {
  const value = getRootToken('--primary');
  assert(
    value === 'oklch(0.705 0.213 47.604)',
    `Expected amber primary unchanged, got: ${value}`
  );
});

test('@keyframes fadeInUp is defined in globals.css', () => {
  assert(
    css.includes('@keyframes fadeInUp'),
    '@keyframes fadeInUp not found in globals.css'
  );
});

test('@keyframes fadeInUp has from/to with opacity and transform', () => {
  const kfMatch = css.match(/@keyframes\s+fadeInUp\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/s);
  assert(kfMatch, '@keyframes fadeInUp block not parseable');
  const kfBody = kfMatch[1];
  assert(kfBody.includes('opacity'), 'fadeInUp should include opacity');
  assert(kfBody.includes('transform'), 'fadeInUp should include transform');
});

test('--font-playfair is defined in @theme inline block', () => {
  const themeBlock = getThemeInlineBlock();
  assert(
    themeBlock.includes('--font-playfair'),
    '--font-playfair not found in @theme inline block'
  );
});

test('.dark class is still present (untouched)', () => {
  assert(css.includes('.dark {') || css.includes('.dark{'), '.dark class not found in globals.css');
});

console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
