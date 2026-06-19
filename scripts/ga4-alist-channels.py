#!/usr/bin/env python3
"""Tráfico por canal (90d) de los clusters 'ambas con tráfico' (lista A)."""
from datetime import datetime, timedelta, timezone
GA4='532962136'; SA='/Users/marrod/.config/gcp/hacecuentas-indexing.json'
from google.oauth2 import service_account
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (DateRange, Dimension, Metric, RunReportRequest,
    Filter, FilterExpression, FilterExpressionList)

CLUSTERS = [
 ("1 Alquiler ICL", ["/calculadora-actualizacion-alquiler-icl","/calculadora-actualizacion-alquiler-icl-bcra-mensual"]),
 ("2 Fecha parto", ["/calculadora-fecha-probable-parto","/calculadora-fecha-parto-fum-naegele","/calculadora-fecha-probable-parto-calcular-semanas","/calculadora-fecha-probable-parto-ecografia"]),
 ("3 UOCRA", ["/calculadora-paritaria-uocra-construccion-2026-categoria","/calculadora-sueldo-uocra-construccion-basico-neto"]),
 ("4 Peaje ruta", ["/calculadora-costo-peaje-ruta","/calculadora-peaje-ruta-costo-total-viaje"]),
 ("5 Uber/DiDi/Cabify", ["/calculadora-uber-didi-cabify-comparativa-ciudad","/calculadora-precio-uber-cabify-didi-comparador-argentina-2026"]),
 ("6 Transferencia auto", ["/calculadora-transfer-auto-costo-registro","/calculadora-costo-transferencia-auto-0km-usado"]),
 ("7 Ladrillos m2", ["/calculadora-cantidad-ladrillos-metro-cuadrado-pared","/calculadora-pared-ladrillos-metros-m2"]),
 ("8 Clearance creatinina", ["/calculadora-clearance-creatinina-cockcroft-gault","/calculadora-clearance-creatinina-cockcroft"]),
 ("9 Fechas/dias (OJO distintas)", ["/calculadora-edad-exacta-anos-meses-dias-segundos","/calculadora-dias-entre-fechas-laborales-habiles-corridos","/calculadora-fecha-exacta-sumar-restar-dias-habiles"]),
 ("10 Licencia maternidad", ["/calculadora-licencia-maternidad-paternidad","/calculadora-licencia-por-maternidad-paternidad-dias","/calculadora-dias-licencia-maternidad-paternidad-pais"]),
 ("11 Edad gato", ["/calculadora-edad-gato-humano","/calculadora-edad-gato-anos-humanos"]),
 ("12 TV vs Monitor (OJO distintas)", ["/calculadora-tamano-tv-distancia-ideal-pulgadas","/calculadora-monitor-tamano-distancia-ideal"]),
 ("13 Split gastos amigos", ["/calculadora-split-gastos-grupo-amigos","/calculadora-dividir-gastos-viaje-amigos"]),
]
ALL = [p for _,ps in CLUSTERS for p in ps]

creds=service_account.Credentials.from_service_account_file(SA,scopes=['https://www.googleapis.com/auth/analytics.readonly'])
client=BetaAnalyticsDataClient(credentials=creds)
end=datetime.now(timezone.utc).date()-timedelta(days=1); start=end-timedelta(days=89)
flt=FilterExpression(or_group=FilterExpressionList(expressions=[
    FilterExpression(filter=Filter(field_name='pagePath',string_filter=Filter.StringFilter(value=p))) for p in ALL]))
resp=client.run_report(RunReportRequest(property=f'properties/{GA4}',
    dimensions=[Dimension(name='pagePath'),Dimension(name='sessionDefaultChannelGroup')],
    metrics=[Metric(name='sessions')],
    date_ranges=[DateRange(start_date=start.isoformat(),end_date=end.isoformat())],
    dimension_filter=flt, limit=1000))
# path -> {channel: sessions}
data={}
for r in resp.rows:
    p=r.dimension_values[0].value.split('?')[0].rstrip('/') or '/'
    ch=r.dimension_values[1].value
    data.setdefault(p,{})[ch]=data.get(p,{}).get(ch,0)+int(r.metric_values[0].value)

def fmt(d):
    tot=sum(d.values())
    paid=sum(v for k,v in d.items() if 'Paid' in k or 'paid' in k.lower())
    org=d.get('Organic Search',0)
    direct=d.get('Direct',0)
    other=tot-paid-org-direct
    return tot,paid,org,direct,other

print(f"Lista A — tráfico por canal (90d: {start}..{end})\n")
print(f"{'':52} {'TOTAL':>6} {'Paid':>6} {'Org':>5} {'Direct':>6} {'Otro':>5}")
for name,paths in CLUSTERS:
    print(f"\n── {name}")
    for p in paths:
        d=data.get(p,{})
        tot,paid,org,direct,other=fmt(d)
        slug=p.replace('/calculadora-','…').replace('/','')
        print(f"  {slug[:50]:50} {tot:>6} {paid:>6} {org:>5} {direct:>6} {other:>5}")
