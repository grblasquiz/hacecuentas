import { test, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { setTimeout as pause } from 'node:timers/promises';

test('producción de feriados en Chromium', async () => {
  const temp = mkdtempSync(join(tmpdir(), 'feriados-browser-'));
  const url = 'https://hacecuentas.com/fechas/feriados';
  const day = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const next = day <= '2026-11-23' ? '2026-11-23' : day <= '2026-12-08' ? '2026-12-08' : '2026-12-25';
  try {
    execFileSync('npm', ['install', '--prefix', temp, 'playwright@1.56.1', '--no-audit', '--no-fund'], { timeout: 60000 });
    let response;
    let html = '';
    for (let attempt = 0; attempt < 16; attempt++) {
      response = await fetch(url, { headers: { 'Cache-Control': 'no-cache' }, signal: AbortSignal.timeout(10_000) }).catch(() => undefined);
      html = await response?.text() ?? '';
      if (response?.status === 200 && html.includes('id="next-national-holiday"')) break;
      await pause(5000);
    }
    expect(response, 'La URL pública debe responder con el nuevo HTML').toBeDefined();
    if (!response) throw new Error('No se recibió respuesta de producción');
    expect(response.status).toBe(200);
    expect(response.url).toBe(url);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(html).toContain(`id="next-national-holiday" datetime="${next}"`);
    expect(html).toContain(`id="from" type="date" value="${day}"`);
    expect(html).toContain('rel="canonical" href="https://hacecuentas.com/fechas/feriados"');
    expect(html).not.toContain('el día no laborable del 8 de diciembre');
    expect(html).toMatch(/data-date="2026-12-07" data-group="puente"/);
    expect(html).toMatch(/data-date="2026-12-08" data-group="nacional"/);
    const { chromium } = createRequire(join(temp, 'package.json'))('playwright');
    const browser = await chromium.launch({ channel: 'chrome', headless: true });
    try {
      const page = await browser.newPage({ timezoneId: 'Pacific/Honolulu' });
      await page.route(/^(?!https:\/\/hacecuentas\.com\/)/, (route) => route.abort());
      await page.goto(url, { waitUntil: 'domcontentloaded' });
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
      await page.locator('#month').selectOption('12');
      expect(await page.locator('#empty').isVisible()).toBe(true);
    } finally {
      await browser.close();
    }
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}, 260_000);
