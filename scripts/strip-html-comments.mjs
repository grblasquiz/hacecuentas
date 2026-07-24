#!/usr/bin/env node
/**
 * Post-build: elimina comentarios HTML de los archivos estáticos en
 * dist/client. Los .astro emiten los <!-- --> del template al HTML final:
 * ~55 comentarios (~17KB) de notas internas por página que no aportan nada
 * al usuario y le cuentan el pipeline a cualquiera que mire el view-source.
 *
 * Tokenizador secuencial (un solo pase, precedencia real de HTML): en cada
 * posición gana lo que aparece primero — un <!-- abre comentario hasta -->,
 * un <script/<style abre bloque raw hasta su cierre. Así un "<script" citado
 * DENTRO de un comentario no desalinea nada (bug 2026-07-08: el enfoque
 * anterior enmascaraba scripts con regex antes de mirar comentarios y se
 * tragó el meta google-adsense-account + loader adsbygoogle del Layout).
 *
 * Se preservan: comentarios condicionales (<!--[if / <![endif]),
 * SSI (<!--#) y marcadores de Astro (<!--astro).
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_CLIENT = join(__dirname, '..', 'dist', 'client');

const PRESERVE = /^<!--(\[if|astro|#)|^<!\[endif\]/i;

// `walk` es perezoso: entre el readdir de un directorio y el momento en que
// realmente tocamos el archivo pueden pasar minutos. En ese hueco el HTML puede
// haber desaparecido — strip-pruned-html borra ~870 archivos justo antes, y con
// varias sesiones buildeando a la vez dist/ se reescribe debajo nuestro. Un
// archivo que ya no existe no se publica, así que saltearlo es lo correcto;
// hacer explotar el build entero por un ENOENT no (bug 2026-07-24).
function* walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch (err) {
    if (err.code === 'ENOENT') return;
    throw err;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    let st;
    try {
      st = statSync(full);
    } catch (err) {
      if (err.code === 'ENOENT') continue;
      throw err;
    }
    if (st.isDirectory()) yield* walk(full);
    else if (entry.endsWith('.html')) yield full;
  }
}

function stripComments(html) {
  const lower = html.toLowerCase();
  let out = '';
  let pos = 0;
  while (pos < html.length) {
    const nextComment = lower.indexOf('<!--', pos);
    const nextScript = lower.indexOf('<script', pos);
    const nextStyle = lower.indexOf('<style', pos);

    // candidato raw block más cercano
    let rawStart = -1;
    let rawTag = '';
    if (nextScript !== -1 && (nextStyle === -1 || nextScript < nextStyle)) {
      rawStart = nextScript;
      rawTag = 'script';
    } else if (nextStyle !== -1) {
      rawStart = nextStyle;
      rawTag = 'style';
    }

    if (nextComment === -1 && rawStart === -1) {
      out += html.slice(pos);
      break;
    }

    if (nextComment !== -1 && (rawStart === -1 || nextComment < rawStart)) {
      // comentario primero
      out += html.slice(pos, nextComment);
      const end = lower.indexOf('-->', nextComment + 4);
      if (end === -1) {
        // comentario sin cerrar: copiar tal cual el resto (no inventar)
        out += html.slice(nextComment);
        break;
      }
      const comment = html.slice(nextComment, end + 3);
      if (PRESERVE.test(comment)) out += comment;
      pos = end + 3;
    } else {
      // script/style primero: copiar el bloque entero intacto
      const close = lower.indexOf(`</${rawTag}`, rawStart);
      const closeEnd = close === -1 ? html.length : lower.indexOf('>', close) + 1;
      out += html.slice(pos, closeEnd === 0 ? html.length : closeEnd);
      pos = closeEnd === 0 ? html.length : closeEnd;
    }
  }
  return out;
}

let files = 0;
let bytes = 0;
let vanished = 0;

for (const file of walk(DIST_CLIENT)) {
  let html;
  try {
    html = readFileSync(file, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') {
      vanished += 1;
      continue;
    }
    throw err;
  }
  const stripped = stripComments(html);
  if (stripped === html) continue;
  try {
    writeFileSync(file, stripped);
  } catch (err) {
    if (err.code === 'ENOENT') {
      vanished += 1;
      continue;
    }
    throw err;
  }
  bytes += html.length - stripped.length;
  files += 1;
}

console.log(
  `[strip-html-comments] ${files} HTML limpiados, ${(bytes / 1024).toFixed(0)}KB de comentarios eliminados` +
    (vanished ? ` (${vanished} desaparecidos durante el barrido — omitidos)` : ''),
);
