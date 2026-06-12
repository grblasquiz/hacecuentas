#!/usr/bin/env python3
"""
Motor Discover — chequeador de cadencia.

Lee scripts/discover/discover-calendar.json y src/content/blog/, y dice qué
notas noticiosas tocan (vencidas / próximas) y si ya existen. Pensado para
correr a diario por cron y avisar (o para mirarlo a mano): así el motor "no se
olvida" de ninguna pieza del calendario de plata-AR.

  python3 scripts/discover/discover-due.py            # estado de hoy
  python3 scripts/discover/discover-due.py --soon 10  # ventana de N días
"""
import json
import sys
import glob
from datetime import datetime, timedelta
from pathlib import Path

MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
         'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
ROOT = Path(__file__).resolve().parents[2]
CAL = ROOT / 'scripts' / 'discover' / 'discover-calendar.json'
BLOG = ROOT / 'src' / 'content' / 'blog'


def mes_nombre(m):
    return MESES[(m - 1) % 12]


def resolve_slug(pattern, today):
    prev_m = today.month - 1 or 12
    prev_y = today.year if today.month != 1 else today.year - 1
    return (pattern
            .replace('{año}', str(today.year))
            .replace('{mes}', mes_nombre(today.month))
            .replace('{mesAnterior}', mes_nombre(prev_m))
            .replace('{mesEvento}', mes_nombre(today.month))
            # para {año} en contexto de mes anterior de enero, dejamos el año actual:
            ) if pattern else ''


def post_exists(slug_core):
    if not slug_core:
        return None
    hits = glob.glob(str(BLOG / f'*{slug_core}*.json'))
    return Path(hits[0]).name if hits else None


def is_due(t, today):
    months = t.get('months') or ([t['month']] if 'month' in t else [])
    wd = t.get('windowDays')
    if months and wd:
        return today.month in months and wd[0] <= today.day <= wd[1]
    if t['id'] == 'inflacion-mensual':
        # INDEC publica el IPC del mes anterior ~mediados de mes
        return today.day >= 14
    if t['id'] == 'informe-financiero-mensual':
        return today.day <= 7
    return False  # event-driven → watch


def main():
    today = datetime.now()
    cal = json.loads(CAL.read_text())
    print(f"🗓️  Motor Discover — estado {today.strftime('%Y-%m-%d')}\n")
    due, watch, done = [], [], []

    for t in cal['triggers']:
        # core del slug sin los placeholders de año para detectar el período
        core = resolve_slug(t.get('checkSlug', ''), today)
        # para chequear existencia usamos un fragmento estable (sin año por si difiere)
        frag = core.replace(f'-{today.year}', '') if core else ''
        exists = post_exists(frag) if frag else None
        due_now = is_due(t, today)
        gen = t.get('generator')
        kind = t.get('type')

        if kind == 'auto' and t.get('cadence', '').startswith('event'):
            watch.append(t)
        elif due_now and not exists:
            due.append((t, gen))
        elif due_now and exists:
            done.append((t, exists))
        elif kind == 'editorial' and not t.get('months') and 'month' not in t:
            watch.append(t)

    if due:
        print("🔴 VENCIDO / a publicar AHORA:")
        for t, gen in due:
            how = f"→ correr: python3 {gen}" if gen else "→ EDITORIAL (escribir nota)"
            print(f"  • {t['label']}  {how}")
        print()
    if done:
        print("✅ Ya publicado este período:")
        for t, fname in done:
            print(f"  • {t['label']}  ({fname})")
        print()
    if watch:
        print("👀 Event-driven (disparar cuando ocurra el anuncio):")
        for t in watch:
            print(f"  • {t['label']}")
        print()
    if not due:
        print("Nada vencido hoy. ✨")


if __name__ == '__main__':
    main()
