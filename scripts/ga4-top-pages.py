#!/usr/bin/env python3
"""Top calcs por pageviews (todos los canales). Last N días."""
import sys
from datetime import datetime, timedelta, timezone
GA4_PROPERTY='532962136'; SA_PATH='/Users/marrod/.config/gcp/hacecuentas-indexing.json'
from google.oauth2 import service_account
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import DateRange, Dimension, Metric, RunReportRequest, OrderBy
DAYS=int(sys.argv[sys.argv.index('--days')+1]) if '--days' in sys.argv else 90
TOP=int(sys.argv[sys.argv.index('--top')+1]) if '--top' in sys.argv else 50
creds=service_account.Credentials.from_service_account_file(SA_PATH,scopes=['https://www.googleapis.com/auth/analytics.readonly'])
client=BetaAnalyticsDataClient(credentials=creds)
end=datetime.now(timezone.utc).date()-timedelta(days=1); start=end-timedelta(days=DAYS-1)
resp=client.run_report(RunReportRequest(property=f'properties/{GA4_PROPERTY}',
    dimensions=[Dimension(name='pagePath')], metrics=[Metric(name='screenPageViews')],
    date_ranges=[DateRange(start_date=start.isoformat(),end_date=end.isoformat())],
    order_bys=[OrderBy(metric=OrderBy.MetricOrderBy(metric_name='screenPageViews'),desc=True)], limit=TOP))
for r in resp.rows:
    print(f"{int(r.metric_values[0].value):>8,}  {r.dimension_values[0].value}")
