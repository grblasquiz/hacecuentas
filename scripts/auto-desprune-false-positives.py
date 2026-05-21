#!/usr/bin/env python3
"""
Auto-desprune masivo: para cada entry de pruning-redirects.ts donde:
  - El JSON existe en src/content/calcs/ con slug matching
  - GSC reporta impressions >= 5 en ultimos 30d
→ Remover del pruning-redirects.ts + _redirects (falso positivo).

Sin GSC threshold, una calc con JSON existente pero 0 trafico = sigue
pruneada (decision HCU original valida).

Idempotente.
"""
from __future__ import annotations
import json, os, re, sys, glob
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PRUNING_FILE = ROOT / "src" / "lib" / "pruning-redirects.ts"
REDIRECTS_FILE = ROOT / "public" / "_redirects"
IMPRESSIONS_THRESHOLD = 5

def _load_env(env_path):
    if not env_path.exists(): return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line: continue
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))
_load_env(ROOT / ".env")

print("Loading existing slugs from JSON...", file=sys.stderr)
slug_to_file = {}
for f in glob.glob(str(ROOT / "src/content/calcs/*.json")):
    try:
        c = json.load(open(f))
        slug = c.get("slug")
        if slug and not c.get("noindex"):
            slug_to_file[slug] = f
    except: pass
print(f"  {len(slug_to_file)} slugs activos en filesystem", file=sys.stderr)

print("Parsing pruning-redirects.ts...", file=sys.stderr)
pruning_txt = PRUNING_FILE.read_text(encoding="utf-8")
prune_keys = re.findall(r"'(/[^']+)':", pruning_txt)

falsos_positivos = []
for k in prune_keys:
    slug = k[1:]
    if slug in slug_to_file:
        falsos_positivos.append(slug)
print(f"  {len(falsos_positivos)} falsos positivos (JSON existe + en pruning)", file=sys.stderr)

print(f"Querying GSC for {len(falsos_positivos)} URLs...", file=sys.stderr)
from google.oauth2 import service_account
from googleapiclient.discovery import build
creds_path = os.path.expanduser(os.environ.get("GOOGLE_INDEXING_CREDS", "~/.config/gcp/hacecuentas-indexing.json"))
creds = service_account.Credentials.from_service_account_file(creds_path, scopes=["https://www.googleapis.com/auth/webmasters.readonly"])
s = build("searchconsole", "v1", credentials=creds, cache_discovery=False)

today = datetime.now(timezone.utc).date()
end = (today - timedelta(days=3)).isoformat()
start = (today - timedelta(days=30)).isoformat()

# Pull all GSC pages once (faster than per-URL)
all_rows = []
start_row = 0
while True:
    resp = s.searchanalytics().query(siteUrl="sc-domain:hacecuentas.com", body={
        "startDate": start, "endDate": end, "dimensions": ["page"],
        "rowLimit": 25000, "startRow": start_row, "dataState": "all",
    }).execute()
    chunk = resp.get("rows", [])
    if not chunk: break
    all_rows.extend(chunk)
    if len(chunk) < 25000: break
    start_row += 25000

gsc = {}
for r in all_rows:
    page = r["keys"][0].replace("https://hacecuentas.com", "").replace("https://www.hacecuentas.com", "")
    gsc[page] = {"clicks": int(r.get("clicks", 0)), "impressions": int(r.get("impressions", 0))}

print(f"  GSC has data for {len(gsc)} URLs", file=sys.stderr)

# Decide desprune
to_desprune = []
for slug in falsos_positivos:
    path = f"/{slug}"
    stats = gsc.get(path, {"clicks": 0, "impressions": 0})
    if stats["impressions"] >= IMPRESSIONS_THRESHOLD or stats["clicks"] > 0:
        to_desprune.append((slug, stats))

print(f"\n→ {len(to_desprune)} URLs a desprunar (impr>={IMPRESSIONS_THRESHOLD} o clicks>0)", file=sys.stderr)
to_desprune.sort(key=lambda x: -x[1]["impressions"])
print("\nTop 15:", file=sys.stderr)
for slug, stats in to_desprune[:15]:
    print(f"  {stats['impressions']:>4} impr  {stats['clicks']:>2} clicks  /{slug}", file=sys.stderr)

# Apply: remove entries from pruning-redirects.ts and _redirects
desprune_slugs_set = {f"/{slug}" for slug, _ in to_desprune}

# 1. pruning-redirects.ts
new_lines = []
removed_pr = 0
for line in pruning_txt.splitlines():
    m = re.match(r"\s*'(/[^']+)':", line)
    if m and m.group(1) in desprune_slugs_set:
        removed_pr += 1
        continue
    new_lines.append(line)
PRUNING_FILE.write_text("\n".join(new_lines) + ("\n" if pruning_txt.endswith("\n") else ""), encoding="utf-8")

# 2. _redirects
redirects_txt = REDIRECTS_FILE.read_text(encoding="utf-8")
new_redir_lines = []
removed_r = 0
for line in redirects_txt.splitlines():
    s_line = line.strip()
    if s_line and not s_line.startswith("#"):
        parts = s_line.split()
        if parts and parts[0] in desprune_slugs_set:
            removed_r += 1
            continue
    new_redir_lines.append(line)
REDIRECTS_FILE.write_text("\n".join(new_redir_lines) + ("\n" if redirects_txt.endswith("\n") else ""), encoding="utf-8")

print(f"\n✓ Removidas {removed_pr} entries de pruning-redirects.ts", file=sys.stderr)
print(f"✓ Removidas {removed_r} entries de _redirects", file=sys.stderr)
print(f"\nSaved: docs/desprune-auto-{today.isoformat()}.md", file=sys.stderr)

# Save report
report = ROOT / "docs" / f"desprune-auto-{today.isoformat()}.md"
report.parent.mkdir(exist_ok=True)
lines = [
    f"# Auto-desprune masivo — {today.isoformat()}",
    "",
    f"Criterio: JSON existe + en pruning-redirects + GSC impressions>={IMPRESSIONS_THRESHOLD} (30d) o clicks>0",
    "",
    f"**{len(to_desprune)} URLs despruneadas** (de {len(falsos_positivos)} falsos positivos totales):",
    "",
    "| Impr | Clicks | URL |",
    "|----:|-----:|-----|",
]
for slug, stats in to_desprune:
    lines.append(f"| {stats['impressions']} | {stats['clicks']} | /{slug} |")
lines.extend(["", f"Las {len(falsos_positivos) - len(to_desprune)} restantes sin trafico siguen pruneadas (decision HCU original valida).", ""])
report.write_text("\n".join(lines), encoding="utf-8")
