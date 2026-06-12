#!/usr/bin/env python3
"""
Reporte de Google Discover desde GSC (canal separado, type=discover).

Discover NO aparece en el reporte web normal: es una superficie distinta
(feed de Chrome/app Google en Android). Su data sólo se obtiene pidiendo
type="discover" a la Search Analytics API. Ningún otro script lo hacía →
estábamos ciegos al canal.

Discover sólo admite dimensiones: date, country, device, page (NO query,
NO searchAppearance). Por eso acá comparamos Discover vs Web y listamos
las páginas que YA traen impresiones en la feed (las semillas a explotar).

Uso:
  python3 scripts/gsc-discover-report.py            # últimos 90 días
  python3 scripts/gsc-discover-report.py 30         # últimos N días

Requiere las mismas credenciales que el resto de scripts GSC:
  GOOGLE_INDEXING_CREDS=~/.config/gcp/hacecuentas-indexing.json
"""
import os
import sys
from datetime import date, timedelta
from pathlib import Path

try:
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
except ImportError:
    sys.stderr.write("pip install google-auth google-api-python-client\n")
    sys.exit(1)

CREDS = os.path.expanduser(os.environ.get("GOOGLE_INDEXING_CREDS", "~/.config/gcp/hacecuentas-indexing.json"))
SITE = "sc-domain:hacecuentas.com"
SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]

DAYS = int(sys.argv[1]) if len(sys.argv) > 1 else 90


def svc():
    creds = service_account.Credentials.from_service_account_file(CREDS, scopes=SCOPES)
    return build("searchconsole", "v1", credentials=creds, cache_discovery=False)


def query(service, body):
    return service.searchanalytics().query(siteUrl=SITE, body=body).execute()


def totals(service, search_type, start, end):
    r = query(service, {"startDate": start, "endDate": end, "type": search_type, "rowLimit": 1})
    rows = r.get("rows", [])
    if not rows:
        return {"clicks": 0, "impressions": 0, "ctr": 0.0}
    row = rows[0]
    return {"clicks": row.get("clicks", 0), "impressions": row.get("impressions", 0), "ctr": row.get("ctr", 0.0)}


def by_dim(service, search_type, dim, start, end, limit=25):
    r = query(service, {
        "startDate": start, "endDate": end, "type": search_type,
        "dimensions": [dim], "rowLimit": limit,
    })
    return r.get("rows", [])


def main():
    if not os.path.exists(CREDS):
        sys.stderr.write(f"No encuentro credenciales en {CREDS}\n")
        sys.stderr.write("Exportá GOOGLE_INDEXING_CREDS apuntando al service-account JSON.\n")
        sys.exit(2)

    service = svc()
    end = date.today() - timedelta(days=2)        # GSC tiene ~2 días de lag
    start = end - timedelta(days=DAYS)
    s, e = start.isoformat(), end.isoformat()

    print(f"=== Google Discover vs Web — {s} a {e} ({DAYS}d) ===\n")

    disc = totals(service, "discover", s, e)
    web = totals(service, "web", s, e)

    def line(name, t):
        print(f"  {name:10s}  clicks={t['clicks']:>7}   impresiones={t['impressions']:>9}   CTR={t['ctr']*100:>5.1f}%")

    line("DISCOVER", disc)
    line("WEB", web)
    share = (disc["clicks"] / web["clicks"] * 100) if web["clicks"] else 0
    print(f"\n  Discover = {share:.1f}% de los clicks de Web. "
          f"({'CANAL VIVO' if disc['clicks'] > 0 else 'CANAL DORMIDO — 0 clicks, hay que despertarlo'})\n")

    if disc["impressions"] == 0:
        print("  Discover con 0 impresiones: Google todavía no eligió ninguna página para la feed.")
        print("  Eso NO es un bug técnico (max-image-preview:large ya está) — es falta de")
        print("  contenido fresco/noticioso que el feed quiera mostrar. Ahí va el trabajo.\n")
        return

    print("  --- Top páginas en Discover (las semillas a explotar) ---")
    for row in by_dim(service, "discover", "page", s, e, limit=25):
        page = row["keys"][0].replace("https://hacecuentas.com", "")
        print(f"    {row['clicks']:>5} clk · {row['impressions']:>7} impr · "
              f"{row['ctr']*100:>4.1f}% CTR  {page}")

    print("\n  --- Discover por dispositivo ---")
    for row in by_dim(service, "discover", "device", s, e, limit=5):
        print(f"    {row['keys'][0]:10s}  {row['clicks']:>5} clk · {row['impressions']:>7} impr")

    print("\n  --- Tendencia (últimos días con datos) ---")
    daily = by_dim(service, "discover", "date", s, e, limit=DAYS)
    for row in daily[-14:]:
        bar = "█" * min(40, int(row["clicks"]))
        print(f"    {row['keys'][0]}  {row['clicks']:>4} clk  {bar}")


if __name__ == "__main__":
    main()
