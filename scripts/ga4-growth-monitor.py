#!/usr/bin/env python3
"""Monitor del objetivo 100 usuarios activos en los últimos 30 minutos.

Cada ejecución agrega una muestra realtime y regenera un reporte legible con:
  - activeUsers últimos 30 minutos,
  - mediana del día y de la franja 10–18 h,
  - comparación contra el objetivo 100,
  - países/dispositivos realtime,
  - sesiones de hoy por canal y landing.

Los artefactos viven en data/growth-monitor/ (data/ está gitignored). El plist
com.hacecuentas.growth-monitor ejecuta este script cada 15 minutos.
"""
from __future__ import annotations

import argparse
import csv
import json
import os
import statistics
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from google.oauth2 import service_account
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange,
    Dimension,
    Metric,
    OrderBy,
    RunRealtimeReportRequest,
    RunReportRequest,
)

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "data" / "growth-monitor"
CREDS = Path(os.path.expanduser(os.environ.get(
    "GOOGLE_INDEXING_CREDS", "~/.config/gcp/hacecuentas-indexing.json"
)))
PROPERTY = "532962136"
TZ = ZoneInfo("America/Argentina/Buenos_Aires")
TARGET = 100
PEAK_START = 10
PEAK_END = 18


def client() -> BetaAnalyticsDataClient:
    creds = service_account.Credentials.from_service_account_file(
        CREDS, scopes=["https://www.googleapis.com/auth/analytics.readonly"]
    )
    return BetaAnalyticsDataClient(credentials=creds)


def realtime_total(gc: BetaAnalyticsDataClient) -> int:
    resp = gc.run_realtime_report(RunRealtimeReportRequest(
        property=f"properties/{PROPERTY}", metrics=[Metric(name="activeUsers")]
    ))
    return sum(int(r.metric_values[0].value or 0) for r in resp.rows)


def realtime_breakdown(gc: BetaAnalyticsDataClient, dimension: str, limit: int = 8) -> list[dict]:
    try:
        resp = gc.run_realtime_report(RunRealtimeReportRequest(
            property=f"properties/{PROPERTY}",
            dimensions=[Dimension(name=dimension)],
            metrics=[Metric(name="activeUsers")],
            order_bys=[OrderBy(metric=OrderBy.MetricOrderBy(metric_name="activeUsers"), desc=True)],
            limit=limit,
        ))
        return [
            {dimension: r.dimension_values[0].value, "activeUsers": int(r.metric_values[0].value or 0)}
            for r in resp.rows
        ]
    except Exception as exc:
        return [{"error": f"{dimension}: {type(exc).__name__}"}]


def today_breakdown(gc: BetaAnalyticsDataClient, dimension: str, limit: int = 12) -> list[dict]:
    try:
        resp = gc.run_report(RunReportRequest(
            property=f"properties/{PROPERTY}",
            dimensions=[Dimension(name=dimension)],
            metrics=[Metric(name="sessions")],
            date_ranges=[DateRange(start_date="today", end_date="today")],
            order_bys=[OrderBy(metric=OrderBy.MetricOrderBy(metric_name="sessions"), desc=True)],
            limit=limit,
        ))
        return [
            {dimension: r.dimension_values[0].value, "sessions": int(r.metric_values[0].value or 0)}
            for r in resp.rows
        ]
    except Exception as exc:
        return [{"error": f"{dimension}: {type(exc).__name__}"}]


def append_sample(now: datetime, active: int) -> Path:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    path = OUT_DIR / "realtime-samples.csv"
    exists = path.exists()
    with path.open("a", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=["timestamp", "date", "hour", "active_users"])
        if not exists:
            writer.writeheader()
        writer.writerow({
            "timestamp": now.isoformat(timespec="seconds"),
            "date": now.date().isoformat(),
            "hour": now.hour,
            "active_users": active,
        })
    return path


def sample_stats(path: Path, today: str) -> dict:
    values_today: list[int] = []
    values_peak: list[int] = []
    by_hour: dict[int, list[int]] = defaultdict(list)
    if path.exists():
        with path.open(newline="") as fh:
            for row in csv.DictReader(fh):
                if row.get("date") != today:
                    continue
                try:
                    hour = int(row["hour"])
                    value = int(row["active_users"])
                except (KeyError, ValueError):
                    continue
                values_today.append(value)
                by_hour[hour].append(value)
                if PEAK_START <= hour <= PEAK_END:
                    values_peak.append(value)
    return {
        "samplesToday": len(values_today),
        "medianToday": round(statistics.median(values_today), 1) if values_today else None,
        "medianPeak": round(statistics.median(values_peak), 1) if values_peak else None,
        "maxToday": max(values_today) if values_today else None,
        "hourlyMedian": {
            str(hour): round(statistics.median(values), 1)
            for hour, values in sorted(by_hour.items())
        },
    }


def markdown(payload: dict) -> str:
    stats = payload["stats"]
    median_peak = stats.get("medianPeak")
    gap = None if median_peak is None else TARGET - median_peak
    lines = [
        "# Hacé Cuentas — pulso de crecimiento",
        "",
        f"Actualizado: **{payload['timestamp']}**",
        "",
        f"- Realtime (últimos 30 min): **{payload['activeUsers']}**",
        f"- Mediana 10–18 h: **{median_peak if median_peak is not None else 'sin muestra suficiente'}**",
        f"- Máximo de hoy: **{stats.get('maxToday')}**",
        f"- Objetivo: **{TARGET}**",
    ]
    if gap is not None:
        lines.append(f"- Brecha a objetivo: **{gap:+g}**")
    lines.extend(["", "## Realtime por país", ""])
    for row in payload["countries"]:
        if "error" in row:
            lines.append(f"- {row['error']}")
        else:
            lines.append(f"- {row.get('country') or '(not set)'}: {row['activeUsers']}")
    lines.extend(["", "## Sesiones de hoy por canal", ""])
    for row in payload["channels"]:
        if "error" in row:
            lines.append(f"- {row['error']}")
        else:
            lines.append(f"- {row.get('sessionDefaultChannelGroup') or '(not set)'}: {row['sessions']}")
    lines.extend(["", "## Landing pages de hoy", ""])
    for row in payload["landings"]:
        if "error" in row:
            lines.append(f"- {row['error']}")
        else:
            lines.append(f"- {row.get('landingPagePlusQueryString') or '(not set)'}: {row['sessions']}")
    return "\n".join(lines) + "\n"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--stdout", action="store_true", help="imprime el reporte Markdown")
    args = ap.parse_args()

    now = datetime.now(TZ)
    gc = client()
    active = realtime_total(gc)
    samples_path = append_sample(now, active)
    payload = {
        "timestamp": now.isoformat(timespec="seconds"),
        "target": TARGET,
        "activeUsers": active,
        "stats": sample_stats(samples_path, now.date().isoformat()),
        "countries": realtime_breakdown(gc, "country"),
        "devices": realtime_breakdown(gc, "deviceCategory"),
        "channels": today_breakdown(gc, "sessionDefaultChannelGroup"),
        "landings": today_breakdown(gc, "landingPagePlusQueryString"),
    }
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / "latest.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n")
    report = markdown(payload)
    (OUT_DIR / "latest.md").write_text(report)
    if args.stdout:
        print(report, end="")
    else:
        print(f"{payload['timestamp']} active={active} median_peak={payload['stats'].get('medianPeak')}")


if __name__ == "__main__":
    main()
