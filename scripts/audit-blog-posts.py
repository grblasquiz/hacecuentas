#!/usr/bin/env python3
"""Valida los JSON del blog. El blog NO está en content.config.ts → no hay Zod:
un post mal formado NO rompe el build, entra a prod degradado y en silencio.

Chequea lo que el template `src/pages/blog/[slug].astro` realmente consume:
  - campos obligatorios presentes (un `date` faltante = "Invalid Date" en prod)
  - relatedCalcs resuelven contra calcs/ (AR), calcs-co/ o calcs-mx/
    → si no resuelven, `.filter(Boolean)` los descarta sin avisar y se caen
      los 3 CTAs y el sidebar entero
  - que la calc NO esté podada: "el JSON existe" != "la URL vive". Las podadas
    siguen teniendo su JSON en el repo pero devuelven 301 al hub del país.
    Pasó el 2026-07-14: 6 de 27 links iban a podadas y el audit daba 0 errores,
    incluido el CTA principal de la nota con deadline. Se chequea offline
    contra pruning-redirects.ts + gone-410.ts (apto pre-deploy); para prod,
    curl -sI (NUNCA -L, que sigue el redirect y lo tapa).
  - el prefijo de los links internos coincide con el audience del post
    (una nota CO que linkea /slug en vez de /co/slug = 404)
  - anchors del tableOfContents == id de los <h2>
  - title <= 66 chars (Bing trunca ~65), FAQ >= 7 (regla anti thin-content)
  - campos que el template NO lee (copiarlos es cargo cult)

Uso:  python3 scripts/audit-blog-posts.py [--only slug1,slug2]
Exit 1 si hay algún error (apto para pre-deploy).
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BLOG = os.path.join(ROOT, 'src/content/blog')

REQUIRED = ['slug', 'title', 'description', 'date', 'updatedDate', 'category',
            'content', 'readingTime', 'author', 'seoKeywords', 'relatedCalcs',
            'heroEmoji', 'faq']
# El template no los lee: si están, es ruido copiado de otro post.
DEAD = ['datePublished', 'dateModified', 'schema', 'relatedPosts', 'webStory', 'audience_']
# category que dispara el disclaimer YMYL (arriba / arriba+abajo)
YMYL = {'finanzas', 'negocios', 'salud', 'familia'}
PREFIX = {'AR': '', 'CO': '/co', 'MX': '/mx'}


def load_calcs():
    """slug -> prefijo de ruta. AR tiene precedencia (igual que el template)."""
    out = {}
    for d, pref in (('calcs', ''), ('calcs-co', '/co'), ('calcs-mx', '/mx')):
        p = os.path.join(ROOT, 'src/content', d)
        if not os.path.isdir(p):
            continue
        for f in os.listdir(p):
            if not f.endswith('.json'):
                continue
            try:
                j = json.load(open(os.path.join(p, f)))
            except Exception:
                continue
            s = j.get('slug')
            if s and s not in out:
                out[s] = pref
    return out


def load_dead():
    """Slugs cuya URL NO vive aunque el JSON siga en el repo: podadas (301 al
    hub) y 410. La poda es intencional — el fix es apuntar a otra calc, nunca
    ablandar estas listas.

    Ojo: pruning-redirects.ts mapea '/source': '/target'. Sólo la CLAVE está
    muerta; el target está vivo y es justamente adonde conviene apuntar. Hay
    que parsear sólo el lado izquierdo — matchear ambos marca como podadas a
    calcs sanas (p. ej. isr-mexico-2026-tarifa-mensual-empleado, que es target
    de isr-sueldo-mexico).
    """
    dead = set()

    p = os.path.join(ROOT, 'src/lib/pruning-redirects.ts')
    if os.path.exists(p):
        for m in re.finditer(r'^\s*[\'"`](/[^\'"`]+)[\'"`]\s*:', open(p).read(), re.M):
            dead.add(m.group(1).rstrip('/').split('/')[-1])

    # gone-410 es una lista plana de paths (no un mapa): todo el contenido muere.
    p = os.path.join(ROOT, 'src/lib/gone-410.ts')
    if os.path.exists(p):
        for m in re.finditer(r'[\'"`](/[a-z0-9/-]{6,})[\'"`]', open(p).read()):
            dead.add(m.group(1).rstrip('/').split('/')[-1])

    return dead


def audit(path, calcs, dead):
    errs, warns = [], []
    name = os.path.basename(path)
    try:
        d = json.load(open(path))
    except Exception as e:
        return [f'JSON inválido: {e}'], []

    for f in REQUIRED:
        if not d.get(f):
            errs.append(f'falta campo obligatorio `{f}`')
    if errs:
        return errs, warns

    if d['slug'] != name[:-5]:
        errs.append(f'slug "{d["slug"]}" != filename "{name[:-5]}" (el sitemap usa slug)')

    aud = str(d.get('audience', 'AR')).upper()
    if aud not in PREFIX:
        errs.append(f'audience "{aud}" desconocido (AR|CO|MX)')
        aud = 'AR'
    want = PREFIX[aud]

    t = d['title']
    if len(t) > 66:
        errs.append(f'title {len(t)} chars > 66 (Bing trunca ~65): "{t}"')

    n_faq = len(d.get('faq') or [])
    if n_faq < 7:
        errs.append(f'FAQ {n_faq} < 7 (thin content)')
    for i, qa in enumerate(d.get('faq') or []):
        if not qa.get('q') or not qa.get('a'):
            errs.append(f'faq[{i}] sin q o a')

    # relatedCalcs: el fallo es SILENCIOSO en prod
    rel = d.get('relatedCalcs') or []
    if not rel:
        errs.append('relatedCalcs vacío → sin CTA ni sidebar')
    for i, s in enumerate(rel):
        cta = ' [CTA PRINCIPAL]' if i == 0 else ''
        if s not in calcs:
            errs.append(f'relatedCalcs "{s}" NO EXISTE → se descarta en silencio{cta}')
        elif s in dead:
            errs.append(f'relatedCalcs "{s}" está PODADA → 301 al hub, el JSON existe pero la URL no vive{cta}')
        elif calcs[s] != want:
            errs.append(f'relatedCalcs "{s}" vive en "{calcs[s] or "/"}" pero el post es {aud}{cta}')

    content = d['content']

    # links internos a calcs: prefijo correcto
    for href in re.findall(r'href="(/[^"#][^"]*)"', content):
        m = re.match(r'^(/co|/mx)?/([a-z0-9-]+)$', href)
        if not m:
            continue
        slug = m.group(2)
        if slug in dead:
            errs.append(f'link "{href}" apunta a una calc PODADA → 301 al hub')
        elif slug in calcs:
            real = calcs[slug]
            if (m.group(1) or '') != real:
                errs.append(f'link "{href}" mal prefijado → debería ser "{real}/{slug}"')

    # anchors del TOC vs id reales de los h2
    ids = set(re.findall(r'<h2[^>]*id="([^"]+)"', content))
    for it in (d.get('tableOfContents') or []):
        a = it.get('anchor')
        if a and a not in ids:
            errs.append(f'tableOfContents anchor "{a}" no matchea ningún <h2 id>')

    for f in DEAD:
        if f in d:
            warns.append(f'campo `{f}` no lo lee el template')
    if d.get('heroImage'):
        p = os.path.join(ROOT, 'public', d['heroImage'].lstrip('/'))
        if not os.path.exists(p):
            errs.append(f'heroImage "{d["heroImage"]}" NO existe → rompe el OG')

    if len(content) < 4000:
        warns.append(f'content {len(content)} chars (¿thin?)')
    if d['category'] in YMYL and aud != 'AR':
        warns.append(f'category "{d["category"]}" dispara disclaimer YMYL — verificá que sea el de {aud}')

    return errs, warns


def main():
    calcs = load_calcs()
    dead = load_dead()
    only = None
    if '--only' in sys.argv:
        only = set(sys.argv[sys.argv.index('--only') + 1].split(','))

    files = sorted(f for f in os.listdir(BLOG) if f.endswith('.json'))
    if only:
        files = [f for f in files if f[:-5] in only]

    tot_e = tot_w = 0
    for f in files:
        e, w = audit(os.path.join(BLOG, f), calcs, dead)
        tot_e += len(e)
        tot_w += len(w)
        if e or w:
            print(f'\n{f[:-5]}')
            for x in e:
                print(f'  ERROR  {x}')
            for x in w:
                print(f'  warn   {x}')

    print(f'\n{"="*60}\n{len(files)} posts · {tot_e} errores · {tot_w} warnings')
    return 1 if tot_e else 0


if __name__ == '__main__':
    sys.exit(main())
