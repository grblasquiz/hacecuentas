#!/usr/bin/env python3
"""
Audita los targets de los redirects de la zona "pruning" de public/_redirects
(la que termina en src/lib/pruning-redirects.ts via extract-pruning-redirects.py):

  1. RE-APUNTADO: sources cuyo target es /categoria/* pero que matchean
     inequívocamente UN slug vivo del catálogo (match estricto de tokens:
     tokens del candidato ⊆ tokens del source + mismo head-token + único
     ganador por cantidad de tokens). Precisión sobre recall: cualquier
     empate o duda queda en categoría.
  2. CADENAS: targets que a su vez son source de otro redirect (A→B→C).
     Se aplana al destino final.
  3. TARGETS MUERTOS: targets que no son ni slug vivo ni página suelta ni
     source de otro redirect (sólo reporte, no se tocan).

Uso:
  python3 scripts/audit-redirect-targets.py           # dry-run (reporte)
  python3 scripts/audit-redirect-targets.py --apply   # reescribe _redirects

No toca nada fuera de la zona pruning (después del primer "# Pruning batch").
Después de --apply correr: python3 scripts/extract-pruning-redirects.py
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REDIRECTS_FILE = ROOT / 'public' / '_redirects'

PREFIX_MAP = {
    'calcs': '', 'calcs-en': '/en', 'calcs-pt': '/pt', 'calcs-es': '/es',
    'calcs-cl': '/cl', 'calcs-co': '/co', 'calcs-ec': '/ec',
    'calcs-pe': '/pe', 'calcs-mx': '/mx',
}

STOPWORDS = {
    'calculadora', 'calculator', 'conversor', 'de', 'del', 'la', 'el',
    'los', 'las', 'en', 'por', 'para', 'con', 'y', 'o', 'a', 'al', 'un',
    'una', 'vs', 'tu', 'mi', 'su', 'que', 'cuanto', 'cuanta', 'cuantos',
    'cuantas', 'como', 'gratis', 'online', '2024', '2025', '2026',
}

# Matches token-correctos pero semánticamente incorrectos (revisión manual
# 2026-06-09): calc de mascota matchearía la calc humana equivalente.
MANUAL_EXCLUDE = {
    '/calculadora-expectativa-vida-conejo-raza',   # conejo ≠ expectativa de vida humana
    '/calculadora-peso-ideal-perro',               # perro ≠ peso ideal humano
}

# Targets muertos (301 → 404) con equivalente vivo verificado a mano
# (2026-06-09). El target viejo era el slug sin prefijo calculadora- o un
# slug que nunca existió; el nuevo es el slug vivo real del catálogo.
MANUAL_DEAD_FIX = {
    '/en/choking-heimlich-age-maneuver': '/calculadora-choking-heimlich-edad-maniobra',
    '/en/ira-401k-argentina-equivalent': '/calculadora-rol-ira-401k-argentino-equivalente',
    '/convertidor-unidades': '/conversor-unidades-longitud-peso-volumen-temperatura',
    '/calculadora/jubilacion-proyeccion': '/calculadora-jubilacion-cuanto-necesito',
    '/magnitude-distance-modulus': '/calculadora-magnitud-aparente-absoluta',
    '/gas-cost-per-mile': '/calculadora-combustible-viaje-auto',
    '/tiempo-fuerza-bruta-contrasena': '/calculadora-generador-contrasena-segura',
    '/area-jardin': '/calculadora-area-perimetro-figuras',
    '/comparar': '/calculadora-comparar-dos-inversiones-rendimiento',
}


def live_urls() -> set[str]:
    urls: set[str] = set()
    for coll, pre in PREFIX_MAP.items():
        for f in (ROOT / 'src' / 'content' / coll).glob('*.json'):
            try:
                slug = json.loads(f.read_text(encoding='utf-8')).get('slug')
            except Exception:
                continue
            if slug:
                urls.add(f'{pre}/{slug}')
    # páginas sueltas en src/pages (top-level .astro)
    for f in (ROOT / 'src' / 'pages').glob('*.astro'):
        name = f.stem
        if name.startswith('[') or name in ('404', 'admin', 'index'):
            continue
        urls.add(f'/{name}')
    return urls


def gone_410() -> set[str]:
    txt = (ROOT / 'src' / 'lib' / 'gone-410.ts').read_text(encoding='utf-8')
    return set(re.findall(r'"(/[^"]+)"', txt))


def tokens(url: str) -> list[str]:
    slug = url.rsplit('/', 1)[-1]
    return [t for t in slug.split('-') if t and t not in STOPWORDS]


def locale_prefix(url: str) -> str:
    m = re.match(r'^/(en|pt|es|cl|co|ec|pe|mx)/', url)
    return m.group(1) if m else ''


def parse_redirects():
    """Devuelve (lines, entries) donde entries = [(line_idx, src, dst, in_pruning)]."""
    lines = REDIRECTS_FILE.read_text(encoding='utf-8').split('\n')
    entries = []
    in_pruning = False
    for i, line in enumerate(lines):
        s = line.strip()
        if s.startswith('# Pruning batch'):
            in_pruning = True
            continue
        if not s or s.startswith('#') or not s.startswith('/'):
            continue
        parts = s.split()
        if len(parts) < 3:
            continue
        entries.append((i, parts[0], parts[1], in_pruning))
    return lines, entries


def resolve_final(target: str, redirect_map: dict[str, str],
                  fires: set[str]) -> str:
    """Sigue la cadena de redirects hasta el destino final (anti-loop).

    `fires` = sources cuyo redirect realmente dispara: los de zona pruning
    (middleware gana aunque el HTML exista) + los de zona CF sin HTML vivo.
    """
    seen = []
    cur = target
    while cur in fires:
        if cur in seen:  # loop
            return target
        seen.append(cur)
        cur = redirect_map[cur]
    return cur


def main() -> int:
    apply = '--apply' in sys.argv
    live = live_urls()
    gone = gone_410()
    lines, entries = parse_redirects()
    redirect_map = {}
    for _, src, dst, _ in entries:
        redirect_map.setdefault(src, dst)  # CF: primer match gana

    # Sources cuyo redirect dispara de verdad:
    #   - zona pruning: el middleware redirige aunque el HTML exista
    #   - zona CF-only: solo dispara si NO hay HTML vivo
    shadowed = {src for _, src, _, p in entries if p}
    fires = shadowed | {src for _, src, _, p in entries if not p and src not in live}
    # "vivo efectivo" = tiene HTML y no está shadowed por el middleware
    eff_live = live - shadowed

    # candidatos vivos-efectivos indexados por (locale, head-token)
    by_head: dict[tuple[str, str], list[tuple[str, frozenset]]] = {}
    for u in eff_live:
        tk = tokens(u)
        if not tk:
            continue
        by_head.setdefault((locale_prefix(u), tk[0]), []).append((u, frozenset(tk)))

    repointed, ambiguous, kept, chains, dead = [], [], [], [], []
    edits: dict[int, tuple[str, str]] = {}  # line_idx -> (old_dst, new_dst)

    for idx, src, dst, in_pruning in entries:
        if not in_pruning:
            continue
        # 1) re-apuntado de targets /categoria/*
        if dst.startswith('/categoria/'):
            if src in MANUAL_EXCLUDE:
                kept.append((src, dst, 'excluido manual (mismatch semántico)'))
                continue
            stk = tokens(src)
            if not stk:
                kept.append((src, dst, 'sin tokens'))
                continue
            sset = set(stk)
            cands = []
            for u, utk in by_head.get((locale_prefix(src), stk[0]), []):
                if u == src or u in gone:
                    continue
                if utk <= sset:  # todos los tokens del vivo están en el source
                    cands.append((u, utk))
            if not cands:
                kept.append((src, dst, 'sin match'))
                continue
            best_n = max(len(utk) for _, utk in cands)
            winners = [u for u, utk in cands if len(utk) == best_n]
            if len(winners) != 1:
                ambiguous.append((src, dst, winners))
                continue
            new_dst = resolve_final(winners[0], redirect_map, fires)
            if new_dst not in eff_live:
                kept.append((src, dst, f'match {winners[0]} no vivo tras resolver'))
                continue
            repointed.append((src, dst, new_dst))
            edits[idx] = (dst, new_dst)
            continue
        # 2) cadenas: el target a su vez redirige (A→B→C) → aplanar
        if dst in fires:
            final = resolve_final(dst, redirect_map, fires)
            if final != dst and (final in eff_live or final == '/'
                                 or final.startswith('/categoria/')):
                chains.append((src, dst, final))
                edits[idx] = (dst, final)
            continue
        # 3) targets muertos: fix manual verificado o reporte
        if dst not in eff_live and dst != '/' \
                and not dst.startswith('/categoria/') and not dst.endswith('/en') \
                and dst not in ('/en', '/pt'):
            if src in MANUAL_DEAD_FIX:
                new_dst = MANUAL_DEAD_FIX[src]
                assert new_dst in eff_live, f'{new_dst} no está vivo'
                repointed.append((src, dst, new_dst))
                edits[idx] = (dst, new_dst)
            else:
                dead.append((src, dst))

    print(f'Zona pruning: {sum(1 for e in entries if e[3])} redirects')
    print(f'\n== RE-APUNTADOS (categoria → slug vivo): {len(repointed)}')
    for src, old, new in repointed:
        print(f'  {src}\n    {old}  →  {new}')
    print(f'\n== AMBIGUOS (quedan en categoría): {len(ambiguous)}')
    for src, dst, ws in ambiguous:
        print(f'  {src} [{dst}] candidatos: {ws}')
    print(f'\n== SIN MATCH (quedan en categoría): {len(kept)}')
    print(f'\n== CADENAS APLANADAS: {len(chains)}')
    for src, mid, final in chains:
        print(f'  {src} → {mid} → {final}   (aplanado a {final})')
    print(f'\n== TARGETS MUERTOS (reporte, no se tocan): {len(dead)}')
    for src, dst in dead:
        print(f'  {src} → {dst}')

    if apply and edits:
        for idx, (old, new) in edits.items():
            # reemplaza solo la columna target preservando el resto de la línea
            lines[idx] = re.sub(
                r'(?<=\s)' + re.escape(old) + r'(?=\s)', new, lines[idx], count=1)
        REDIRECTS_FILE.write_text('\n'.join(lines), encoding='utf-8')
        print(f'\n✓ Aplicados {len(edits)} cambios a {REDIRECTS_FILE.relative_to(ROOT)}')
        print('  Ahora corré: python3 scripts/extract-pruning-redirects.py')
    elif apply:
        print('\n(nada que aplicar)')
    else:
        print('\n(dry-run; usar --apply para escribir)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
