#!/usr/bin/env python3
"""Actualiza la infografía del subte desde Buenos Aires Data.

Descarga los ZIP oficiales de molinetes 2026 y 2025, detecta el último mes
disponible en 2026 y compara exactamente ese mismo período contra 2025.
Sólo reemplaza el JSON si el contenido estadístico cambió.
"""

from __future__ import annotations

import json
import subprocess
import tempfile
import zipfile
from collections import defaultdict
from datetime import date, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src/data/subte-2026.json"
DATASET = "https://data.buenosaires.gob.ar/dataset/subte-viajes-molinetes"
API = "https://data.buenosaires.gob.ar/api/3/action/package_show?id=subte-viajes-molinetes"
CDN = "https://cdn.buenosaires.gob.ar/datosabiertos/datasets/sbase/subte-viajes-molinetes"
LINES = {"A", "B", "C", "D", "E", "H", "Premetro"}
MONTH_NAMES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]


def bucket():
    return {
        "total": 0, "byLine": defaultdict(int), "byStation": defaultdict(int),
        "byMonth": defaultdict(int), "byHour": defaultdict(int), "byWeekday": defaultdict(int),
        "stationHours": defaultdict(lambda: defaultdict(int)),
        "stationWeekdays": defaultdict(lambda: defaultdict(int)),
        "stationMonths": defaultdict(lambda: defaultdict(int)),
        "lineHours": defaultdict(lambda: defaultdict(int)),
        "lineWeekdays": defaultdict(lambda: defaultdict(int)),
        "lineMonths": defaultdict(lambda: defaultdict(int)), "stationLine": {},
    }


def download(url: str, target: Path) -> None:
    subprocess.run([
        "curl", "--fail", "--silent", "--show-error", "--location",
        "--retry", "3", "--connect-timeout", "30", "--max-time", "900",
        "--user-agent", "HaceCuentas-data-refresh/1.0", "--output", str(target), url,
    ], check=True)


def months_in(archive_path: Path, year: int) -> list[int]:
    with zipfile.ZipFile(archive_path) as archive:
        found = []
        for name in archive.namelist():
            base = Path(name).name
            if str(year) not in base or not base.lower().endswith(".csv"):
                continue
            try:
                found.append(int(base[4:6]))
            except ValueError:
                pass
        return sorted(set(month for month in found if 1 <= month <= 12))


def clean_line(value: str) -> str:
    value = value.strip().replace("Línea", "").replace("Linea", "").upper()
    return "Premetro" if value in {"P", "PM", "PREMETRO"} else value


def consume(archive_path: Path, year: int, max_month: int):
    agg = bucket()
    with zipfile.ZipFile(archive_path) as archive:
        for name in archive.namelist():
            base = Path(name).name
            if str(year) not in base or not base.lower().endswith(".csv"):
                continue
            try:
                file_month = int(base[4:6])
            except ValueError:
                continue
            if file_month > max_month:
                continue
            with archive.open(name) as raw:
                for idx, raw_line in enumerate(raw):
                    if idx == 0:
                        continue
                    text = raw_line.decode("utf-8-sig", errors="replace").strip()
                    if text.startswith('"'):
                        text = text.split('";', 1)[0].strip('"')
                    parts = text.split(";")
                    if len(parts) < 10:
                        continue
                    date_text, start, _, line, _, station = parts[:6]
                    try:
                        passengers = int(float(parts[-1].replace(",", ".")))
                        stamp = datetime.strptime(date_text, "%d/%m/%Y")
                        hour = int(start.split(":")[0])
                    except (ValueError, IndexError):
                        continue
                    line, station = clean_line(line), station.strip()
                    if line not in LINES or not station or passengers < 0:
                        continue
                    month, weekday, hour_key = str(stamp.month), str(stamp.weekday()), str(hour)
                    agg["total"] += passengers
                    for key, value in (("byLine", line), ("byStation", station), ("byMonth", month), ("byHour", hour_key), ("byWeekday", weekday)):
                        agg[key][value] += passengers
                    for key, first, second in (("stationHours", station, hour_key), ("stationWeekdays", station, weekday), ("stationMonths", station, month), ("lineHours", line, hour_key), ("lineWeekdays", line, weekday), ("lineMonths", line, month)):
                        agg[key][first][second] += passengers
                    agg["stationLine"][station] = line
    return json.loads(json.dumps(agg))


def main() -> None:
    with tempfile.TemporaryDirectory(prefix="hc-subte-") as tmp:
        tmpdir = Path(tmp)
        current_zip, previous_zip = tmpdir / "2026.zip", tmpdir / "2025.zip"
        download(f"{CDN}/molinetes-2026.zip", current_zip)
        download(f"{CDN}/molinetes-2025.zip", previous_zip)
        available = months_in(current_zip, 2026)
        if not available:
            raise RuntimeError("El ZIP oficial 2026 no contiene meses reconocibles")
        last_month = max(available)
        metadata_file = tmpdir / "metadata.json"
        download(API, metadata_file)
        metadata = json.loads(metadata_file.read_text())["result"]
        next_data = {
            "generatedAt": date.today().isoformat(),
            "period": f"enero–{MONTH_NAMES[last_month - 1]} de 2026",
            "sourceUpdatedAt": metadata["metadata_modified"][:10],
            "sourceUrl": DATASET,
            "current": consume(current_zip, 2026, last_month),
            "previous": consume(previous_zip, 2025, last_month),
        }
        previous = json.loads(OUT.read_text()) if OUT.exists() else None
        if previous and {k: previous[k] for k in ("period", "current", "previous")} == {k: next_data[k] for k in ("period", "current", "previous")}:
            print(f"Sin cambios: el último mes oficial sigue siendo {MONTH_NAMES[last_month - 1]}.")
            return
        OUT.write_text(json.dumps(next_data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
        print(f"Actualizado {OUT}: {next_data['period']} · {next_data['current']['total']:,} entradas")


if __name__ == "__main__":
    main()
