#!/usr/bin/env node
/**
 * Image optimization pipeline.
 *
 * Escanea public/og/*.png y emite public/og/*.webp + *.avif
 * sólo si el destino no existe o es más viejo que el origen (idempotente).
 *
 * Calidad ~80 — sweet spot entre tamaño y nitidez para OG cards.
 *
 * Hookeado al prebuild para que corra automáticamente. Es idempotente y
 * paralelo (limita concurrencia a CPU count) así que rebuilds no pagan
 * costo si los archivos ya están al día.
 *
 * Las OG cards aún se sirven como PNG (Twitter/Facebook/WhatsApp prefieren
 * PNG/JPG en og:image). Los webp/avif quedan disponibles para uso futuro
 * con <picture> o el componente <Image> de Astro.
 */
import { readdirSync, statSync, existsSync } from 'node:fs';
import { join, basename, extname } from 'node:path';
import { cpus } from 'node:os';
import sharp from 'sharp';

const SRC_DIR = 'public/og';
const QUALITY = 80;
const CONCURRENCY = Math.max(2, Math.min(8, cpus().length));

function listPngs(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => extname(f).toLowerCase() === '.png')
    .map((f) => join(dir, f));
}

function needsBuild(src, dst) {
  if (!existsSync(dst)) return true;
  try {
    return statSync(src).mtimeMs > statSync(dst).mtimeMs;
  } catch {
    return true;
  }
}

async function convertOne(srcPath) {
  const base = basename(srcPath, '.png');
  const dir = SRC_DIR;
  const webpPath = join(dir, `${base}.webp`);
  const avifPath = join(dir, `${base}.avif`);

  let producedWebp = false;
  let producedAvif = false;
  let bytesIn = 0;
  let bytesWebp = 0;
  let bytesAvif = 0;

  if (needsBuild(srcPath, webpPath)) {
    await sharp(srcPath).webp({ quality: QUALITY, effort: 4 }).toFile(webpPath);
    producedWebp = true;
  }
  if (needsBuild(srcPath, avifPath)) {
    // effort 4 = balance entre velocidad y compresión (default 9 es muy lento)
    await sharp(srcPath).avif({ quality: QUALITY, effort: 4 }).toFile(avifPath);
    producedAvif = true;
  }

  if (producedWebp || producedAvif) {
    try {
      bytesIn = statSync(srcPath).size;
      if (existsSync(webpPath)) bytesWebp = statSync(webpPath).size;
      if (existsSync(avifPath)) bytesAvif = statSync(avifPath).size;
    } catch {}
  }

  return { producedWebp, producedAvif, bytesIn, bytesWebp, bytesAvif };
}

async function pool(tasks, limit) {
  const results = [];
  let i = 0;
  const workers = Array.from({ length: limit }, async () => {
    while (i < tasks.length) {
      const idx = i++;
      try {
        results[idx] = await tasks[idx]();
      } catch (err) {
        results[idx] = { error: err.message };
      }
    }
  });
  await Promise.all(workers);
  return results;
}

async function main() {
  const t0 = Date.now();
  const pngs = listPngs(SRC_DIR);
  if (pngs.length === 0) {
    console.log('[optimize-images] sin PNGs en', SRC_DIR);
    return;
  }
  console.log(`[optimize-images] ${pngs.length} PNGs encontrados, concurrency=${CONCURRENCY}`);

  const tasks = pngs.map((p) => () => convertOne(p));
  const results = await pool(tasks, CONCURRENCY);

  let webpNew = 0;
  let avifNew = 0;
  let totalIn = 0;
  let totalWebp = 0;
  let totalAvif = 0;
  let errors = 0;
  for (const r of results) {
    if (r.error) {
      errors++;
      continue;
    }
    if (r.producedWebp) webpNew++;
    if (r.producedAvif) avifNew++;
    if (r.producedWebp || r.producedAvif) {
      totalIn += r.bytesIn;
      totalWebp += r.bytesWebp;
      totalAvif += r.bytesAvif;
    }
  }
  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  const kb = (n) => (n / 1024).toFixed(0);
  console.log(`[optimize-images] ✓ ${secs}s — webp:+${webpNew}, avif:+${avifNew}, errors:${errors}`);
  if (webpNew + avifNew > 0) {
    console.log(
      `[optimize-images]   procesados: PNG ${kb(totalIn)}KB → WEBP ${kb(totalWebp)}KB / AVIF ${kb(totalAvif)}KB`,
    );
  }
}

main().catch((err) => {
  console.error('[optimize-images] ✗', err);
  process.exit(1);
});
