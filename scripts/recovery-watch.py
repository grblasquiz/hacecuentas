#!/usr/bin/env python3
"""
Recovery watch — monitor diario del recovery post-crash de tráfico orgánico.

Pull de GSC Search Analytics + Coverage data, compara contra baseline de
pre-crash (24 abr 2026, peak 106 clicks/día) y detecta tendencia.

Triggers de alerta:
  🟢 RECOVERING — 7-day rolling avg de clicks subiendo (>+5% día a día)
  🟡 STALLING   — flat por >7 días consecutivos (no progresa)
  🔴 DECLINING  — bajando >10% día a día (regresión, activar Fase 4 del plan)

Uso:
  python3 scripts/recovery-watch.py                    # análisis + JSON output
  python3 scripts/recovery-watch.py --json /tmp/r.json # custom output path
  python3 scripts/recovery-watch.py --days 30          # ventana de análisis

Output:
  scripts/recovery-watch.json — { trend, days_since_crash, clicks_7d_avg,
                                   recovery_pct, alerts[], coverage_health }
  STDOUT — tabla resumida + recomendación

Auth: misma Service Account que gsc-emerging-queries.py.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from dataclasses import dataclass, field, asdict
from datetime import date, datetime, timedelta
from pathlib import Path

try:
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
except ImportError:
    sys.stderr.write('pip install google-auth google-api-python-client\n')
    sys.exit(1)


# ─── Constantes del incidente ────────────────────────────────────────────────
BASELINE_PEAK_CLICKS = 106            # Pico observado: 24 abr 2026
BASELINE_PEAK_DATE = date(2026, 4, 24)
CRASH_START_DATE = date(2026, 4, 25)
FIXES_DEPLOY_DATE = date(2026, 4, 30)  # Fixes técnicos deployados

# Targets del recovery plan
TARGETS = {
    7: {'clicks_per_day': 30, 'crawled_not_indexed_max': 100},
    14: {'clicks_per_day': 80, 'crawled_not_indexed_max': 50},
    30: {'clicks_per_day': 100, 'crawled_not_indexed_max': 30},
}

CREDS_PATH = os.path.expanduser(
    os.environ.get('GOOGLE_INDEXING_CREDS', '~/.config/gcp/hacecuentas-indexing.json')
)
SITE_URL = 'sc-domain:hacecuentas.com'
SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly']
ROOT = Path(__file__).resolve().parent.parent


# ─── Modelos ─────────────────────────────────────────────────────────────────
@dataclass
class DayMetric:
    date: str
    clicks: int = 0
    impressions: int = 0
    ctr: float = 0.0
    position: float = 0.0


@dataclass
class TrendAnalysis:
    trend: str                          # 'recovering' | 'stalling' | 'declining' | 'insufficient-data'
    days_since_crash: int
    days_since_fixes: int
    clicks_today: int
    clicks_7d_avg: float
    clicks_7d_avg_prev: float
    clicks_7d_change_pct: float
    impressions_today: int
    impressions_7d_avg: float
    recovery_pct: float                 # % vs baseline peak
    target_at_day: int | None
    on_track: bool
    alerts: list[str] = field(default_factory=list)
    daily_series: list[DayMetric] = field(default_factory=list)


# ─── GSC API helpers ─────────────────────────────────────────────────────────
def get_service():
    creds = service_account.Credentials.from_service_account_file(CREDS_PATH, scopes=SCOPES)
    return build('searchconsole', 'v1', credentials=creds, cache_discovery=False)


def query_daily(svc, start: date, end: date) -> dict[str, dict]:
    """Pull daily clicks/impressions/CTR/position."""
    body = {
        'startDate': start.isoformat(),
        'endDate': end.isoformat(),
        'dimensions': ['date'],
        'rowLimit': 500,
    }
    resp = svc.searchanalytics().query(siteUrl=SITE_URL, body=body).execute()
    out = {}
    for r in resp.get('rows', []):
        d = r['keys'][0]
        out[d] = {
            'clicks': int(r.get('clicks', 0)),
            'impressions': int(r.get('impressions', 0)),
            'ctr': float(r.get('ctr', 0.0)),
            'position': float(r.get('position', 0.0)),
        }
    return out


# ─── Análisis de tendencia ───────────────────────────────────────────────────
def rolling_avg(series: list[int], window: int = 7) -> list[float]:
    """7-day rolling average."""
    out = []
    for i in range(len(series)):
        window_start = max(0, i - window + 1)
        chunk = series[window_start:i + 1]
        out.append(sum(chunk) / len(chunk))
    return out


def analyze(daily_data: dict[str, dict]) -> TrendAnalysis:
    today = date.today()
    days_since_crash = (today - CRASH_START_DATE).days
    days_since_fixes = (today - FIXES_DEPLOY_DATE).days

    # Build sorted daily series (last 30 days, with gap-filling for missing days = 0)
    end_date = max((datetime.fromisoformat(d).date() for d in daily_data), default=today - timedelta(days=2))
    start_date = end_date - timedelta(days=29)
    series = []
    cur = start_date
    while cur <= end_date:
        d_str = cur.isoformat()
        m = daily_data.get(d_str, {})
        series.append(DayMetric(
            date=d_str,
            clicks=m.get('clicks', 0),
            impressions=m.get('impressions', 0),
            ctr=m.get('ctr', 0.0),
            position=m.get('position', 0.0),
        ))
        cur += timedelta(days=1)

    if len(series) < 8:
        return TrendAnalysis(
            trend='insufficient-data',
            days_since_crash=days_since_crash,
            days_since_fixes=days_since_fixes,
            clicks_today=0,
            clicks_7d_avg=0,
            clicks_7d_avg_prev=0,
            clicks_7d_change_pct=0,
            impressions_today=0,
            impressions_7d_avg=0,
            recovery_pct=0,
            target_at_day=None,
            on_track=False,
            alerts=['Datos insuficientes — esperar 7+ días post-crash para análisis'],
            daily_series=series,
        )

    clicks_series = [d.clicks for d in series]
    impressions_series = [d.impressions for d in series]

    rolling_clicks = rolling_avg(clicks_series, 7)
    rolling_impr = rolling_avg(impressions_series, 7)

    clicks_today = clicks_series[-1]
    clicks_7d_avg = rolling_clicks[-1]
    clicks_7d_avg_prev = rolling_clicks[-2] if len(rolling_clicks) > 1 else 0
    impressions_today = impressions_series[-1]
    impressions_7d_avg = rolling_impr[-1]

    change_pct = 0.0
    if clicks_7d_avg_prev > 0:
        change_pct = ((clicks_7d_avg - clicks_7d_avg_prev) / clicks_7d_avg_prev) * 100

    recovery_pct = (clicks_7d_avg / BASELINE_PEAK_CLICKS) * 100

    # Determine trend
    # Look at last 7 days of rolling avg deltas
    deltas = []
    for i in range(max(0, len(rolling_clicks) - 7), len(rolling_clicks)):
        if i > 0:
            deltas.append(rolling_clicks[i] - rolling_clicks[i - 1])

    avg_delta = sum(deltas) / len(deltas) if deltas else 0
    pos_days = sum(1 for d in deltas if d > 0.1)
    flat_days = sum(1 for d in deltas if -0.1 <= d <= 0.1)
    neg_days = sum(1 for d in deltas if d < -0.1)

    alerts = []

    # Trend logic
    # Antes de día +3 post-fixes, GSC todavía está reflejando el crash.
    # No tiene sentido evaluar trend hasta que pase tiempo suficiente.
    if days_since_fixes < 3:
        trend = 'insufficient-data'
        alerts.append(
            f'⚪ Día +{days_since_fixes} post-fixes: esperar 3+ días antes de evaluar tendencia. '
            f'GSC tiene 2-3d de lag y los fixes recién están propagándose.'
        )
    elif change_pct > 5 and pos_days >= len(deltas) * 0.5:
        trend = 'recovering'
    elif change_pct < -10 or neg_days >= len(deltas) * 0.6:
        trend = 'declining'
        alerts.append(f'🔴 DECLINING: 7d-avg cayendo {change_pct:.1f}% día a día. {neg_days}/{len(deltas)} días negativos.')
    elif flat_days >= len(deltas) * 0.6:
        trend = 'stalling'
        if days_since_fixes >= 7:
            alerts.append(f'🟡 STALLING: 7d-avg planchada ({clicks_7d_avg:.1f} clicks) por {flat_days}/{len(deltas)} días post-fixes.')
    else:
        trend = 'recovering' if change_pct > 0 else 'stalling'

    # Target check vs plan
    target_at_day = None
    on_track = True
    for d, target in sorted(TARGETS.items()):
        if days_since_fixes >= d:
            target_at_day = d
            if clicks_7d_avg < target['clicks_per_day']:
                on_track = False
                alerts.append(
                    f'⚠️  Día +{days_since_fixes} post-fixes: target era {target["clicks_per_day"]} clicks/día, '
                    f'actual {clicks_7d_avg:.1f}. {"OFF-TRACK" if not on_track else "OK"}.'
                )

    # Special alerts
    if days_since_fixes >= 14 and recovery_pct < 30:
        alerts.append('🚨 ESCALATION: 14 días post-fixes con <30% recovery. Activar Fase 4 del plan (podar LLM bulk content).')

    if days_since_fixes >= 5 and impressions_7d_avg < 500:
        alerts.append(f'⚠️  Impressions 7d-avg muy bajas ({impressions_7d_avg:.0f}). Google no está mostrando suficiente el sitio.')

    return TrendAnalysis(
        trend=trend,
        days_since_crash=days_since_crash,
        days_since_fixes=days_since_fixes,
        clicks_today=clicks_today,
        clicks_7d_avg=round(clicks_7d_avg, 1),
        clicks_7d_avg_prev=round(clicks_7d_avg_prev, 1),
        clicks_7d_change_pct=round(change_pct, 1),
        impressions_today=impressions_today,
        impressions_7d_avg=round(impressions_7d_avg, 1),
        recovery_pct=round(recovery_pct, 1),
        target_at_day=target_at_day,
        on_track=on_track,
        alerts=alerts,
        daily_series=series,
    )


# ─── Output rendering ────────────────────────────────────────────────────────
def render_summary(analysis: TrendAnalysis) -> str:
    trend_emoji = {
        'recovering': '🟢',
        'stalling': '🟡',
        'declining': '🔴',
        'insufficient-data': '⚪',
    }
    e = trend_emoji.get(analysis.trend, '?')

    lines = [
        f'{e} RECOVERY WATCH — {date.today().isoformat()}',
        '─' * 60,
        f'Estado: {analysis.trend.upper()}',
        f'Días desde crash:  {analysis.days_since_crash}',
        f'Días desde fixes:  {analysis.days_since_fixes}',
        '',
        '📊 Clicks',
        f'  Hoy:           {analysis.clicks_today}',
        f'  7d-avg:        {analysis.clicks_7d_avg}  (vs ayer: {analysis.clicks_7d_avg_prev}, {analysis.clicks_7d_change_pct:+.1f}%)',
        f'  Recovery:      {analysis.recovery_pct:.1f}% vs peak ({BASELINE_PEAK_CLICKS})',
        '',
        '👀 Impressions',
        f'  Hoy:           {analysis.impressions_today:,}',
        f'  7d-avg:        {analysis.impressions_7d_avg:,.0f}',
        '',
    ]

    if analysis.target_at_day:
        target = TARGETS[analysis.target_at_day]
        ok = '✅' if analysis.on_track else '❌'
        lines.append(f'🎯 Target día +{analysis.target_at_day}: {target["clicks_per_day"]} clicks/día — {ok}')
        lines.append('')

    if analysis.alerts:
        lines.append('⚠️  Alertas:')
        for a in analysis.alerts:
            lines.append(f'  {a}')
        lines.append('')

    # Last 14 days mini-chart
    lines.append('📈 Últimos 14 días (clicks):')
    last14 = analysis.daily_series[-14:]
    if last14:
        max_clicks = max(d.clicks for d in last14) or 1
        for d in last14:
            bar = '█' * int((d.clicks / max_clicks) * 30)
            lines.append(f'  {d.date}  {d.clicks:>4d} {bar}')

    lines.append('')
    lines.append('─' * 60)

    # Recommendation
    if analysis.trend == 'recovering':
        lines.append('💚 Recomendación: continuar con plan, NO generar más LLM bulk content.')
    elif analysis.trend == 'stalling':
        lines.append('💛 Recomendación: revisar si llegaron backlinks de outreach. Si día +10 sigue planchado → Fase 4.')
    elif analysis.trend == 'declining':
        lines.append('💔 Recomendación: ACTIVAR FASE 4 del recovery plan (docs/recovery-plan-2026-04-30.md).')
    else:
        lines.append('⚪ Recomendación: esperar más datos.')

    return '\n'.join(lines)


def render_markdown(analysis: TrendAnalysis) -> str:
    """Markdown for GH issue body."""
    trend_label = {
        'recovering': '🟢 RECOVERING',
        'stalling': '🟡 STALLING',
        'declining': '🔴 DECLINING',
        'insufficient-data': '⚪ INSUFFICIENT DATA',
    }
    out = [
        f'# Recovery Watch — {date.today().isoformat()}',
        '',
        f'**Estado:** {trend_label.get(analysis.trend, "?")}',
        f'**Días desde fixes (2026-04-30):** {analysis.days_since_fixes}',
        f'**Recovery:** {analysis.recovery_pct:.1f}% vs peak ({BASELINE_PEAK_CLICKS} clicks)',
        '',
        '## Métricas clave',
        '',
        '| Métrica | Hoy | 7d-avg | vs ayer |',
        '|---------|-----|--------|---------|',
        f'| Clicks | {analysis.clicks_today} | {analysis.clicks_7d_avg} | {analysis.clicks_7d_change_pct:+.1f}% |',
        f'| Impressions | {analysis.impressions_today:,} | {analysis.impressions_7d_avg:,.0f} | — |',
        '',
    ]

    if analysis.alerts:
        out.append('## ⚠️ Alertas')
        out.append('')
        for a in analysis.alerts:
            out.append(f'- {a}')
        out.append('')

    out.append('## Últimos 14 días')
    out.append('')
    out.append('| Fecha | Clicks | Impressions |')
    out.append('|-------|--------|-------------|')
    for d in analysis.daily_series[-14:]:
        out.append(f'| {d.date} | {d.clicks} | {d.impressions:,} |')
    out.append('')

    if analysis.trend == 'declining':
        out.append('## 🚨 Acción requerida')
        out.append('')
        out.append('Tendencia DECLINING — activar **Fase 4** del plan de recovery:')
        out.append('1. Identificar las 300 calcs con más impressions histórica')
        out.append('2. Marcar `noindex:true` en las 2.500 restantes')
        out.append('3. Wait 8-12 semanas')
        out.append('')
        out.append('Ver `docs/recovery-plan-2026-04-30.md` para detalle.')
    elif analysis.trend == 'stalling' and analysis.days_since_fixes >= 10:
        out.append('## ⏸️ Stall persistente')
        out.append('')
        out.append('10+ días sin progreso. Revisar:')
        out.append('- ¿Llegaron backlinks de los 29 emails de outreach?')
        out.append('- ¿Coverage de "Crawled-not-indexed" bajó?')
        out.append('- Si día +14 sigue planchado → Fase 4.')

    return '\n'.join(out)


# ─── Main ────────────────────────────────────────────────────────────────────
def main():
    p = argparse.ArgumentParser()
    p.add_argument('--days', type=int, default=30, help='Days of GSC data to pull')
    p.add_argument('--json', default=str(ROOT / 'scripts' / 'recovery-watch.json'),
                   help='Output JSON path')
    p.add_argument('--md', default=None, help='Output markdown path (for GH issue body)')
    args = p.parse_args()

    if not Path(CREDS_PATH).expanduser().exists():
        sys.stderr.write(f'❌ Creds not found: {CREDS_PATH}\n')
        sys.exit(1)

    svc = get_service()

    # GSC has ~2-3 day lag for fresh data
    today = date.today()
    end = today - timedelta(days=2)
    start = end - timedelta(days=args.days)

    daily = query_daily(svc, start, end)
    analysis = analyze(daily)

    # Console output
    print(render_summary(analysis))

    # Persist JSON
    out_path = Path(args.json)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, 'w') as f:
        json.dump({
            **asdict(analysis),
            'generated_at': datetime.now().isoformat(),
            'baseline_peak_clicks': BASELINE_PEAK_CLICKS,
            'baseline_peak_date': BASELINE_PEAK_DATE.isoformat(),
            'crash_start_date': CRASH_START_DATE.isoformat(),
            'fixes_deploy_date': FIXES_DEPLOY_DATE.isoformat(),
        }, f, indent=2)

    # Markdown output (for GH workflow consumption)
    if args.md:
        Path(args.md).write_text(render_markdown(analysis))

    # Exit code signals workflow whether to alert
    # 0 = recovering OK, 1 = stalling, 2 = declining (escalate), 3 = insufficient-data
    exit_codes = {
        'recovering': 0,
        'stalling': 1,
        'declining': 2,
        'insufficient-data': 3,
    }
    sys.exit(exit_codes.get(analysis.trend, 0))


if __name__ == '__main__':
    main()
