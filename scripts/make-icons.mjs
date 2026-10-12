// Renders public/icons/icon.svg to the PNG sizes the manifest needs, using Playwright's Chromium.
// Usage: npm run icons
import { chromium } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const svg = await readFile(new URL('../public/icons/icon.svg', import.meta.url), 'utf8');
const out = (name) => new URL(`../public/icons/${name}`, import.meta.url).pathname;

const browser = await chromium.launch();
const page = await browser.newPage();

async function render(size, file, { maskable = false } = {}) {
  await page.setViewportSize({ width: size, height: size });
  // Maskable icons need a full-bleed background with the symbol inside the 80% safe zone.
  const inner = maskable
    ? `<div style="width:100%;height:100%;background:#12212E;display:flex;align-items:center;justify-content:center"><div style="width:78%;height:78%">${svg.replace('rx="112"', 'rx="0"')}</div></div>`
    : svg;
  await page.setContent(
    `<style>html,body{margin:0;background:transparent}svg{width:100%;height:100%;display:block}</style><div style="width:${size}px;height:${size}px">${inner}</div>`,
  );
  await page.screenshot({
    path: out(file),
    omitBackground: !maskable,
    clip: { x: 0, y: 0, width: size, height: size },
  });
}

await render(192, 'icon-192.png');
await render(512, 'icon-512.png');
await render(512, 'icon-512-maskable.png', { maskable: true });
await browser.close();
console.log('Icons written to public/icons');
