#!/usr/bin/env python3
"""Diagnóstico intradía de Unassigned/Cross-network sin tocar GTM ni Ads."""
from datetime import date, timedelta
from collections import defaultdict

from google.oauth2 import service_account
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import DateRange, Dimension, Metric, OrderBy, RunReportRequest

PROPERTY = "532962136"
CREDS = "/Users/marrod/.config/gcp/hacecuentas-indexing.json"


def pull(day: date) -> list[dict]:
    creds = service_account.Credentials.from_service_account_file(
        CREDS, scopes=["https://www.googleapis.com/auth/analytics.readonly"]
    )
    gc = BetaAnalyticsDataClient(credentials=creds)
    resp = gc.run_report(RunReportRequest(
        property=f"properties/{PROPERTY}",
        dimensions=[
            Dimension(name="sessionDefaultChannelGroup"),
            Dimension(name="sessionSourceMedium"),
            Dimension(name="sessionCampaignName"),
        ],
        metrics=[Metric(name="sessions")],
        date_ranges=[DateRange(start_date=day.isoformat(), end_date=day.isoformat())],
        order_bys=[OrderBy(metric=OrderBy.MetricOrderBy(metric_name="sessions"), desc=True)],
        limit=500,
    ))
    return [{
        "channel": r.dimension_values[0].value,
        "source_medium": r.dimension_values[1].value,
        "campaign": r.dimension_values[2].value,
        "sessions": int(r.metric_values[0].value or 0),
    } for r in resp.rows]


def print_day(day: date, rows: list[dict]) -> None:
    print(f"\n{day} — sesiones por canal/source/campaign")
    totals: dict[str, int] = defaultdict(int)
    for row in rows:
        totals[row["channel"]] += row["sessions"]
    for channel, sessions in sorted(totals.items(), key=lambda item: -item[1]):
        print(f"\n{channel}: {sessions}")
        subset = [r for r in rows if r["channel"] == channel][:12]
        for row in subset:
            print(f"  {row['sessions']:>5}  {row['source_medium'][:42]:42}  {row['campaign'][:55]}")


if __name__ == "__main__":
    today = date.today()
    print_day(today, pull(today))
    print_day(today - timedelta(days=7), pull(today - timedelta(days=7)))
