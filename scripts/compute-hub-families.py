#!/usr/bin/env python3
"""
Genera src/lib/hub-families.json (mapa bidireccional path → hermanos de otros
países) a partir de src/lib/hub-families-source.json (familias curadas a mano /
por agente: {"families":[{"topic":"...","members":["trabajo/aguinaldo","mx/trabajo/aguinaldo-prima-y-ptu"]}]}).

Lo consume src/components/HubCountryVariants.astro (rendereado desde Layout para
pageType=hub). Idempotente. Correr tras editar el source: `npm run hub-families`.

Los títulos salen de src/lib/hubs/**/*.ts (campo `title`), así el label nunca se
desincroniza del hub real. Un member cuyo .ts no existe se DESCARTA con warning
(no rompe el build por un slug tipeado mal).
"""
import glob, json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'src' / 'lib' / 'hub-families-source.json'
OUT = ROOT / 'src' / 'lib' / 'hub-families.json'

COUNTRY = {
    'AR': ('🇦🇷', 'Argentina'), 'mx': ('🇲🇽', 'México'), 'co': ('🇨🇴', 'Colombia'),
    'pe': ('🇵🇪', 'Perú'), 'ec': ('🇪🇨', 'Ecuador'), 'es': ('🇪🇸', 'España'),
    'cl': ('🇨🇱', 'Chile'), 'py': ('🇵🇾', 'Paraguay'), 'uy': ('🇺🇾', 'Uruguay'),
    'do': ('🇩🇴', 'Rep. Dominicana'), 've': ('🇻🇪', 'Venezuela'),
    'en': ('🌎', 'English'), 'pt': ('🇧🇷', 'Brasil'), 'pt-pt': ('🇵🇹', 'Portugal'),
}
ORDER = ['AR', 'mx', 'co', 'cl', 'pe', 'ec', 'es', 'py', 'uy', 'do', 've', 'pt', 'pt-pt', 'en']


def load_hub_titles() -> dict[str, str]:
    titles: dict[str, str] = {}
    for f in glob.glob(str(ROOT / 'src' / 'lib' / 'hubs' / '**' / '*.ts'), recursive=True):
        s = Path(f).read_text(encoding='utf-8')
        m = re.search(r"slug:\s*'([^']+)'", s)
        if not m:
            continue
        t = re.search(r"title:\s*'([^']*)'", s) or re.search(r'title:\s*"([^"]*)"', s)
        titles[m.group(1)] = (t.group(1) if t else '').strip()
    return titles


def locale_of(slug: str) -> str:
    head = slug.split('/')[0]
    return head if head in COUNTRY else 'AR'


def short_label(title: str) -> str:
    # "Sueldo neto México 2026: calculá ISR, IMSS y SDI" → "Sueldo neto México 2026"
    t = re.split(r'\s*[:|—–]\s*', title, maxsplit=1)[0].strip()
    return (t[:70] + '…') if len(t) > 71 else t


def main() -> int:
    if not SRC.exists():
        print(f'[hub-families] falta {SRC} — nada que generar', file=sys.stderr)
        OUT.write_text('{}\n', encoding='utf-8')
        return 0
    titles = load_hub_titles()
    data = json.loads(SRC.read_text(encoding='utf-8'))
    out: dict[str, dict] = {}
    seen: set[str] = set()
    fams = 0
    for fam in data.get('families', []):
        members = []
        for m in fam.get('members', []):
            m = m.strip().strip('/')
            if m not in titles:
                print(f'[hub-families] ⚠ member inexistente, se descarta: {m}', file=sys.stderr)
                continue
            if m in seen:
                print(f'[hub-families] ⚠ member repetido entre familias, se descarta: {m}', file=sys.stderr)
                continue
            members.append(m)
        if len(members) < 2:
            continue
        fams += 1
        seen.update(members)
        members.sort(key=lambda s: ORDER.index(locale_of(s)) if locale_of(s) in ORDER else 99)
        for me in members:
            sibs = []
            for other in members:
                if other == me:
                    continue
                loc = locale_of(other)
                flag, country = COUNTRY[loc]
                sibs.append({'url': '/' + other, 'country': country, 'flag': flag,
                             'label': short_label(titles[other]) or country})
            out['/' + me] = {'topic': fam.get('topic', '').strip() or 'Esta cuenta', 'siblings': sibs}
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=1, sort_keys=True) + '\n', encoding='utf-8')
    print(f'[hub-families] {fams} familias · {len(out)} hubs con bloque → {OUT.relative_to(ROOT)}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
