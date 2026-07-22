#!/usr/bin/env python3
"""
IPC República Dominicana — serie empalmada base Oct2019-Sep2020=100 del BCRD.
El BCRD no expone API JSON de precios, pero publica la serie completa en un
.xls con URL estable, actualizado cada mes (~día 10 con el dato del mes previo):
  https://cdn.bancentral.gov.do/documents/estadisticas/precios/documents/ipc_base_2019-2020.xls
Parseamos con xlrd (formato BIFF). Output: src/data/live/dominicana.json
Run: python3 scripts/data-sources/fetch-dominicana.py
"""
import json
import io
import datetime as dt
import subprocess

OUT = "src/data/live/dominicana.json"
URL = "https://cdn.bancentral.gov.do/documents/estadisticas/precios/documents/ipc_base_2019-2020.xls"
MESES = {
    "enero": "01", "febrero": "02", "marzo": "03", "abril": "04", "mayo": "05",
    "junio": "06", "julio": "07", "agosto": "08", "septiembre": "09",
    "setiembre": "09", "octubre": "10", "noviembre": "11", "diciembre": "12",
}


def main():
    import xlrd  # stdlib-adjacent; ya disponible en el entorno (ver fetch-arca-ganancias.py)

    # curl (usa el trust-store del sistema; urllib falla con algunos proxies TLS)
    raw = subprocess.run(
        ["curl", "-sSf", "--max-time", "60", "-A", "hacecuentas-data-refresh/1.0", URL],
        check=True, capture_output=True,
    ).stdout
    sh = xlrd.open_workbook(file_contents=raw).sheet_by_index(0)

    serie = {}  # "YYYY-MM" -> {indice, mensual, interanual}
    year = None
    for r in range(sh.nrows):
        row = sh.row_values(r)
        c0 = str(row[0]).strip()
        if c0[:4].isdigit() and len(c0) in (4, 6):  # "1984" o "1984.0"
            year = int(float(c0))
        mes = MESES.get(str(row[1]).strip().lower())
        if year is None or not mes:
            continue
        try:
            indice = float(row[2])
            mensual = float(row[3])
            interanual = float(row[5])
        except (TypeError, ValueError):
            continue
        serie[f"{year}-{mes}"] = {
            "indice": round(indice, 4),
            "mensual": round(mensual, 2),
            "interanual": round(interanual, 2),
        }

    keys = sorted(serie)
    if len(keys) < 24:
        raise SystemExit(f"[dominicana] serie IPC corta ({len(keys)} meses)")
    last = keys[-1]
    d = serie[last]
    # Bounds de sanidad (base Oct2019-Sep2020=100; RD inflación baja/moderada)
    if not (100 <= d["indice"] <= 250):
        raise SystemExit(f"[dominicana] índice fuera de rango: {d['indice']}")
    if not (-3 <= d["mensual"] <= 5):
        raise SystemExit(f"[dominicana] var mensual fuera de rango: {d['mensual']}")
    if not (-2 <= d["interanual"] <= 25):
        raise SystemExit(f"[dominicana] var interanual fuera de rango: {d['interanual']}")
    # frescura: el último dato no puede tener más de 3 meses
    y, m = map(int, last.split("-"))
    hoy = dt.date.today()
    if (hoy.year - y) * 12 + (hoy.month - m) > 3:
        raise SystemExit(f"[dominicana] serie vieja: último período {last}")

    out = {
        "_meta": {
            "source": "BCRD — IPC serie empalmada base Oct2019-Sep2020=100 (xls oficial)",
            "sourceUrl": URL,
            "fetchedAt": dt.datetime.now(dt.timezone.utc).isoformat().replace("+00:00", "Z"),
        },
        "ipc": {
            "fuente": "Banco Central de la República Dominicana (BCRD)",
            "sourceUrl": URL,
            "base": "Oct.2019-Sep.2020 = 100",
            "periodo": last,
            "indice": d["indice"],
            "variacionMensual": d["mensual"],
            "variacionInteranual": d["interanual"],
            "serie": {k: serie[k]["indice"] for k in keys[-24:]},
        },
    }
    with io.open(OUT, "w", encoding="utf-8") as f:
        f.write(json.dumps(out, ensure_ascii=False, indent=2) + "\n")
    print(f"[dominicana] wrote {OUT} — ipc={last}:{d['indice']} (i.a. {d['interanual']}%)")


if __name__ == "__main__":
    main()
