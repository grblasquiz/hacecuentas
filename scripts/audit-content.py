#!/usr/bin/env python3
"""
Audit + auto-fix de campos de calcs JSONs.

Cubre:
  - #2  Links muertos en intro/explanation/faq (markdown links a slugs)
  - #5  dataUpdate.lastUpdated faltante
  - #6  keyTakeaway débil (<80 chars o sin números/cifras)
  - #7  useCases vacío
  - #8  description corta (<50 chars)
  - #9  sources con URLs muertas (HEAD check)
  - #10 relatedSlugs apuntando a slugs inexistentes

Modos:
  --report     solo reporta (default)
  --fix        aplica fixes seguros (rewrite JSON)
  --check-urls hace HEAD a sources.url (lento, opcional)
  --slug X     audita solo un calc por slug
"""
import argparse
import json
import os
import re
import ssl
import sys
import time
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

# SSL context relajado para HEAD checks (solo nos importa DNS/4xx/5xx/network,
# no la cadena de cert — algunos sistemas Python tienen el cert store roto).
_SSL_CTX = ssl.create_default_context()
_SSL_CTX.check_hostname = False
_SSL_CTX.verify_mode = ssl.CERT_NONE

ROOT = Path(__file__).resolve().parent.parent
CALCS_DIR = ROOT / 'src' / 'content' / 'calcs'
REDIRECTS_FILE = ROOT / 'public' / '_redirects'

# ---- helpers ---------------------------------------------------------------

def load_calcs():
    out = []
    for f in sorted(CALCS_DIR.glob('*.json')):
        try:
            d = json.loads(f.read_text())
            out.append((f, d))
        except Exception as e:
            print(f'[skip] {f.name}: {e}', file=sys.stderr)
    return out

def load_redirects():
    """Returns dict source_path -> dest_path (sin trailing slash, lowercase)."""
    if not REDIRECTS_FILE.exists():
        return {}
    out = {}
    for line in REDIRECTS_FILE.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith('#'): continue
        parts = line.split()
        if len(parts) < 2: continue
        src, dst = parts[0], parts[1]
        if src.startswith('/') and dst.startswith('/'):
            out[src.rstrip('/').lower()] = dst.rstrip('/')
    return out

def collect_valid_slugs(calcs):
    """Slugs declarados explícitamente + paths de páginas estáticas (heurístico)."""
    slugs = set()
    for _, d in calcs:
        if d.get('slug'):
            slugs.add(d['slug'])
    # paths estáticos conocidos
    for static in ['glosario', 'metodologia', 'politica-editorial', 'privacidad',
                   'terminos', 'contacto', 'blog', 'buscar', 'sobre-nosotros',
                   'inflacion-argentina', 'cotizacion-cripto', 'cambio-de-monedas',
                   'sueldo-en-mano-argentina', 'dias-entre-dos-fechas',
                   'aguinaldo-junio-2026', 'valores-bcra']:
        slugs.add(static)
    return slugs

LINK_RE = re.compile(r'\[([^\]]+)\]\((/[^\s)]+)\)')

def find_internal_links(text):
    """Returns list of (label, path) tuples for [label](/path)."""
    if not isinstance(text, str): return []
    return [(m.group(1), m.group(2)) for m in LINK_RE.finditer(text)]

def head_check(url, timeout=8):
    """Returns (ok, status, error). ok = 200-399."""
    try:
        req = urllib.request.Request(url, method='HEAD', headers={
            'User-Agent': 'Mozilla/5.0 (compatible; HacecuentasAuditBot/1.0)'
        })
        with urllib.request.urlopen(req, timeout=timeout, context=_SSL_CTX) as r:
            return (200 <= r.status < 400, r.status, None)
    except urllib.error.HTTPError as e:
        # Algunas servers rechazan HEAD; intentar GET
        if e.code in (403, 405):
            try:
                req = urllib.request.Request(url, headers={
                    'User-Agent': 'Mozilla/5.0 (compatible; HacecuentasAuditBot/1.0)'
                })
                with urllib.request.urlopen(req, timeout=timeout, context=_SSL_CTX) as r:
                    return (200 <= r.status < 400, r.status, None)
            except Exception as e2:
                return (False, getattr(e2, 'code', 0), str(e2)[:80])
        return (False, e.code, e.reason)
    except Exception as e:
        return (False, 0, str(e)[:80])

# ---- audits ---------------------------------------------------------------

def audit_calc(file, d, valid_slugs, redirects, build_date):
    slug = d.get('slug') or file.stem
    issues = []  # tuples (severity, kind, msg)

    # #5 dataUpdate.lastUpdated
    du = d.get('dataUpdate') or {}
    if not du.get('lastUpdated'):
        issues.append(('warn', '5', 'dataUpdate.lastUpdated missing'))

    # #6 keyTakeaway weak
    kt = d.get('keyTakeaway') or ''
    if not kt:
        issues.append(('warn', '6', 'keyTakeaway empty'))
    elif len(kt) < 80:
        issues.append(('warn', '6', f'keyTakeaway short ({len(kt)} chars)'))
    elif not re.search(r'\d', kt):
        issues.append(('info', '6', 'keyTakeaway sin cifras'))

    # #7 useCases empty
    uc = d.get('useCases') or []
    if not uc:
        issues.append(('warn', '7', 'useCases empty'))

    # #8 description short
    desc = d.get('description') or ''
    if len(desc) < 50:
        issues.append(('warn', '8', f'description short ({len(desc)} chars)'))
    elif len(desc) > 200:
        issues.append(('info', '8', f'description long ({len(desc)} chars, óptimo ≤160)'))

    # #2 internal markdown links
    for field in ('intro', 'explanation', 'keyTakeaway'):
        links = find_internal_links(d.get(field, ''))
        for label, path in links:
            base = path.rstrip('/').lstrip('/').split('#')[0]
            head = base.split('/')[0]
            full_clean = '/' + base.lower()
            # Verificar: existe slug, o está en redirects?
            if head in valid_slugs:
                continue
            if base.lower() in {s.lower() for s in valid_slugs}:
                continue
            # El base puede ser /glosario/X — el primer segmento ya cubierto arriba
            if full_clean in redirects:
                issues.append(('info', '2', f'link "{label}" → /{base} apunta a redirect (ok pero óptimo: usar destino directo)'))
            else:
                issues.append(('warn', '2', f'BROKEN link [{label}](/{base}) en {field}'))

    # FAQ markdown links
    for i, faq in enumerate(d.get('faq') or []):
        if not isinstance(faq, dict): continue  # algunos faq son strings sueltos
        for field in ('q', 'a'):
            for label, path in find_internal_links(faq.get(field, '')):
                base = path.rstrip('/').lstrip('/').split('#')[0]
                head = base.split('/')[0]
                if head in valid_slugs: continue
                if base.lower() in {s.lower() for s in valid_slugs}: continue
                full_clean = '/' + base.lower()
                if full_clean in redirects:
                    issues.append(('info', '2', f'faq[{i}].{field} link "{label}" → /{base} via redirect'))
                else:
                    issues.append(('warn', '2', f'BROKEN faq[{i}].{field} link [{label}](/{base})'))

    # #10 relatedSlugs muertos
    related = d.get('relatedSlugs') or []
    dead = [s for s in related if s not in valid_slugs]
    if dead:
        issues.append(('warn', '10', f'relatedSlugs muertos: {dead}'))

    return slug, issues

def fix_calc(file, d, valid_slugs, redirects, build_date):
    """Aplica fixes seguros y retorna lista de fixes aplicados."""
    fixes = []
    changed = False

    # #5 dataUpdate.lastUpdated → poner build_date como fallback razonable
    if not d.get('dataUpdate'):
        d['dataUpdate'] = {}
    if not d['dataUpdate'].get('lastUpdated'):
        d['dataUpdate']['lastUpdated'] = build_date
        if not d['dataUpdate'].get('frequency'):
            d['dataUpdate']['frequency'] = 'as-needed'
        fixes.append(f'#5 dataUpdate.lastUpdated → {build_date}')
        changed = True

    # #2 markdown links: si apunta a redirect, reemplazar por destino real.
    # También fix prefix /calc/ → / cuando el slug exists sin prefix.
    valid_slugs_lower = {s.lower() for s in valid_slugs}
    def fix_text(text):
        if not isinstance(text, str): return text, 0
        n = 0
        def repl(m):
            nonlocal n
            label = m.group(1); path = m.group(2)
            base_full = path.rstrip('/').lower()
            # Fix #1: prefix /calc/ → /
            if base_full.startswith('/calc/'):
                stripped = '/' + base_full[len('/calc/'):]
                slug_only = stripped.lstrip('/').split('/')[0]
                if slug_only in valid_slugs_lower:
                    n += 1
                    return f'[{label}]({stripped})'
            # Fix #2: redirect → destino directo
            if base_full in redirects:
                n += 1
                return f'[{label}]({redirects[base_full]})'
            return m.group(0)
        new = LINK_RE.sub(repl, text)
        return new, n

    # Strip broken links: [texto](/slug-roto) → texto cuando el destino no existe
    # ni vía redirect ni con fix de prefix /calc/.
    def strip_text(text):
        if not isinstance(text, str): return text, 0
        n = 0
        def repl(m):
            nonlocal n
            label = m.group(1); path = m.group(2)
            base_full = path.rstrip('/').lower()
            slug_only = base_full.lstrip('/').split('/')[0]
            # Existe el destino directo?
            if slug_only in valid_slugs_lower: return m.group(0)
            if base_full.lstrip('/') in valid_slugs_lower: return m.group(0)
            # Existe vía redirect?
            if base_full in redirects: return m.group(0)
            # Es path multi-segmento conocido? (/glosario/X /argentina/X)
            if base_full.startswith(('/glosario/', '/argentina/', '/tabla/', '/comparar/', '/categoria/')):
                return m.group(0)  # no podemos validar fácil, dejar
            n += 1
            return label  # solo el texto, sin el wrapper
        new = LINK_RE.sub(repl, text)
        return new, n

    fix_fn = strip_text if globals().get('STRIP_MODE') else fix_text

    for field in ('intro', 'explanation', 'keyTakeaway'):
        if field in d:
            new, n = fix_fn(d[field])
            if n > 0:
                d[field] = new
                action = 'strip broken' if globals().get('STRIP_MODE') else 'redirect→destino'
                fixes.append(f'#2 {field}: {n} link(s) {action}')
                changed = True

    if 'faq' in d and isinstance(d['faq'], list):
        for i, faq in enumerate(d['faq']):
            if not isinstance(faq, dict): continue
            for fk in ('q', 'a'):
                if fk in faq:
                    new, n = fix_fn(faq[fk])
                    if n > 0:
                        faq[fk] = new
                        action = 'strip broken' if globals().get('STRIP_MODE') else 'redirect→destino'
                        fixes.append(f'#2 faq[{i}].{fk}: {n} link(s) {action}')
                        changed = True

    # #10 relatedSlugs muertos: limpiar
    if 'relatedSlugs' in d:
        before = list(d['relatedSlugs'])
        cleaned = [s for s in before if s in valid_slugs]
        if len(cleaned) != len(before):
            removed = [s for s in before if s not in valid_slugs]
            d['relatedSlugs'] = cleaned
            fixes.append(f'#10 relatedSlugs limpia: removidos {removed}')
            changed = True

    return changed, fixes

# ---- main -----------------------------------------------------------------

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--fix', action='store_true', help='Aplica fixes seguros (rewrite JSON)')
    ap.add_argument('--strip-broken-links', action='store_true', help='Convierte [texto](slug-roto) → texto (cuando el destino no existe)')
    ap.add_argument('--check-urls', action='store_true', help='HEAD check de sources.url (lento)')
    ap.add_argument('--slug', help='Solo este slug')
    ap.add_argument('--summary-only', action='store_true', help='Solo conteo final')
    args = ap.parse_args()

    build_date = time.strftime('%Y-%m-%d')
    globals()['STRIP_MODE'] = bool(args.strip_broken_links)
    calcs = load_calcs()
    if args.slug:
        calcs = [(f, d) for f, d in calcs if (d.get('slug') or f.stem) == args.slug]
    valid_slugs = collect_valid_slugs(calcs if not args.slug else load_calcs())
    redirects = load_redirects()

    print(f'[audit] {len(calcs)} calcs · {len(valid_slugs)} slugs válidos · {len(redirects)} redirects · build_date={build_date}\n')

    counters = {'2': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0}
    bad_links = []  # for terse fix mode
    fix_summary = []

    for file, d in calcs:
        slug, issues = audit_calc(file, d, valid_slugs, redirects, build_date)
        for sev, kind, msg in issues:
            counters[kind] += 1
            if not args.summary_only and sev == 'warn':
                print(f'[#{kind}] {slug}: {msg}')
            if kind == '2' and 'BROKEN' in msg:
                bad_links.append((slug, msg))

        if args.fix:
            changed, fixes = fix_calc(file, d, valid_slugs, redirects, build_date)
            if changed:
                with file.open('w') as fh:
                    json.dump(d, fh, ensure_ascii=False, indent=2)
                    fh.write('\n')
                fix_summary.extend([(slug, f) for f in fixes])

    # #9 URL HEAD check (paralelo)
    if args.check_urls:
        print('\n[#9] HEAD check de sources URLs (paralelo)...')
        urls = []
        for file, d in calcs:
            for s in (d.get('sources') or []):
                u = s.get('url') if isinstance(s, dict) else None
                if u and u.startswith('http'):
                    urls.append((d.get('slug'), file, s.get('name'), u))
        seen = set()
        unique_urls = [(s, f, n, u) for s, f, n, u in urls if u not in seen and not seen.add(u)]
        print(f'   {len(unique_urls)} URLs únicas a verificar...')
        bad = []
        with ThreadPoolExecutor(max_workers=12) as ex:
            for (slug, fpath, name, u), (ok, status, err) in zip(unique_urls, ex.map(lambda x: head_check(x[3]), unique_urls)):
                if not ok:
                    bad.append((slug, name, u, status, err))
                    counters['9'] += 1
        for slug, name, u, status, err in bad:
            print(f'[#9] {slug} → {name}: {u} [{status} {err or ""}]')

    print(f'\n--- summary ---')
    print(f'  #2  links muertos                : {counters["2"]}')
    print(f'  #5  dataUpdate.lastUpdated faltan: {counters["5"]}')
    print(f'  #6  keyTakeaway débiles          : {counters["6"]}')
    print(f'  #7  useCases vacíos              : {counters["7"]}')
    print(f'  #8  description corta/larga      : {counters["8"]}')
    print(f'  #9  sources URL fallidas         : {counters["9"]}{"" if args.check_urls else " (--check-urls no usado)"}')
    print(f'  #10 relatedSlugs muertos         : {counters["10"]}')

    if args.fix:
        files_changed = len(set(s for s, _ in fix_summary))
        print(f'\n[fix] {len(fix_summary)} fixes aplicados en {files_changed} archivos.')

if __name__ == '__main__':
    main()
