import { test, expect } from 'vitest';
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { setTimeout as delay } from 'node:timers/promises';

test('integración de feriados en Chromium', async () => {
  const temp = mkdtempSync(join(tmpdir(), 'feriados-browser-'));
  const url = 'http://127.0.0.1:4179/fechas/feriados';
  const day = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const next = day <= '2026-11-23' ? '2026-11-23' : day <= '2026-12-08' ? '2026-12-08' : '2026-12-25';
  const server = spawn('node', ['node_modules/astro/astro.js', 'dev', '--host', '127.0.0.1', '--port', '4179']);
  let logs = '';
  server.stderr.on('data', (data) => { logs += String(data); });
  server.stdout.on('data', (data) => { logs += String(data); });
  try {
    execFileSync('npm', ['install', '--prefix', temp, 'playwright@1.56.1', '--no-audit', '--no-fund'], { timeout: 60000 });
    let response;
    for (let i = 0; i < 45 && server.exitCode === null && !response; i++) {
      response = await fetch(url).catch(() => undefined);
      if (!response) await delay(1000);
    }
    const html = await response?.text();
    expect(response?.status, logs).toBe(200);
    expect(response?.headers.get('cache-control')).toBe('no-store');
    expect(html).toContain(`id="next-national-holiday" datetime="${next}"`);
    expect(html).toContain(`id="from" type="date" value="${day}"`);
    expect(html).not.toContain('el día no laborable del 8 de diciembre');
    expect(html).toMatch(/data-date="2026-12-07" data-group="puente"/);
    expect(html).toMatch(/data-date="2026-12-08" data-group="nacional"/);
    const { chromium } = createRequire(join(temp, 'package.json'))('playwright');
    const browser = await chromium.launch({ channel: 'chrome', headless: true });
    try {
      const page = await browser.newPage({ timezoneId: 'Asia/Tokyo' });
      await page.goto(url);
      expect(await page.locator('#next-national-holiday').getAttribute('datetime')).toBe(next);
      expect(await page.locator('#from').inputValue()).toBe(day);
      await page.getByRole('button', { name: 'Días hábiles', exact: true }).click();
      for (const [date, ...counts] of [
        ['2026-11-20', 1, 1, 1],
        ['2026-11-23', 0, 0, 0],
        ['2026-12-07', 1, 0, 0],
        ['2026-12-08', 0, 0, 0],
      ]) {
        await page.locator('#from').fill(date);
        await page.locator('#to').fill(date);
        for (const [index, mode] of ['nacional', 'no-laborables', 'bancario'].entries()) {
          await page.locator('#calendar').selectOption(mode);
          const count = counts[index];
          expect(await page.locator('#answer').innerText(), date + ' ' + mode)
            .toBe(count === 1 ? '1 día hábil' : '0 días hábiles');
        }
      }
      await page.getByRole('button', { name: 'Próximo feriado', exact: true }).click();
      await page.locator('#from').fill('2026-11-23');
      await page.locator('#to').fill('2026-11-23');
      expect(await page.locator('#answer').innerText()).toBe('23 de noviembre');
      await page.getByRole('button', { name: 'No laborables', exact: true }).click();
      expect(await page.locator('[data-date="2026-12-07"]').isVisible()).toBe(true);
      expect(await page.locator('[data-date="2026-12-08"]').isVisible()).toBe(false);
      await page.getByRole('button', { name: 'Solo bancarios', exact: true }).click();
      expect(await page.locator('[data-date="2026-11-10"]').isVisible()).toBe(true);
    } finally {
      await browser.close();
    }
  } finally {
    server.kill();
    rmSync(temp, { recursive: true, force: true });
  }
}, 150_000);
