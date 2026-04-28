#!/usr/bin/env python3
"""
Clasifica el campo `audience` de calcs en src/content/calcs/ que están
sin etiquetar (no tienen audience o lo tienen vacío/?).

Usa Haiku 4.5 con cache. Costo total ~$0.30 para 1117 calcs.

Output: AR | global | MX | CO | CL | ES | BO | PE | UY

Uso:
  python3 scripts/llm-tag-audience.py --from-file scripts/audience-needs-llm.txt
  python3 scripts/llm-tag-audience.py --from-file ... --concurrency 16
  python3 scripts/llm-tag-audience.py --dry-run
"""
import argparse, asyncio, json, os, sys
from pathlib import Path
import anthropic

ROOT = Path(__file__).resolve().parent.parent
CALCS_DIR = ROOT / "src" / "content" / "calcs"
MODEL = "claude-haiku-4-5"
VALID = {"AR", "global", "MX", "CO", "CL", "ES", "BO", "PE", "UY"}

SYSTEM = """Sos un clasificador de calculadoras por audiencia/país.

Te paso una calc. Tu único output es UNA palabra: el código de audiencia.

# Códigos válidos

- `AR` — específico Argentina (AFIP/ARCA, ANSES, monotributo, aguinaldo,
  pesos argentinos, paritaria, MEP, blue, BCRA, indemnización LCT, IIBB,
  IVA AR, ARBA, agentes federales argentinos, ciudades AR, provincias AR).
- `MX` — específico México (SAT, IMSS, RFC, IVA MX 16%, AFORE, INFONAVIT, FONACOT, peso MX).
- `CL` — específico Chile (SII, AFP Chile, IVA 19%, peso chileno, RUT, isapre).
- `CO` — específico Colombia (DIAN, peso colombiano, ICA, retefuente, EPS).
- `ES` — específico España (IRPF, IBI, hipoteca España, Euribor, autónomo
  RETA, IVA España 21%, IRPF tramos España, comunidad autónoma, NIF, NIE).
- `BO` — Bolivia (boliviano, IDH).
- `PE` — Perú (sol, SUNAT, AFP Perú).
- `UY` — Uruguay (peso uruguayo, BPS, DGI).
- `global` — aplica a todo el mundo hispano sin localización: matemáticas
  puras, conversiones (cm/m, °C/°F), salud genérica (IMC, calorías, BMR,
  fórmulas médicas universales), cocina (recetas universales sin moneda),
  física, química, mascotas (alimentación por raza), embarazo, ovulación,
  conversores generales, deportes (1RM, VO2 max).

# Reglas

- Si la calc tiene moneda específica (ARS, MXN, CLP, COP, EUR-España) → ese país.
- Si menciona organismo regulatorio específico (AFIP, SAT, SII, DIAN, IRPF, INSS) → ese país.
- Si NO tiene referencia geográfica/monetaria/regulatoria y aplica universalmente → `global`.
- En caso de duda entre AR y global, optar por `global` solo si CLARAMENTE no es AR-específico.
- Calcs de "sueldo", "préstamo", "tarjeta crédito" SIN país explícito → AR (default histórico del sitio).

# Output

Responde EXCLUSIVAMENTE una palabra: AR, MX, CL, CO, ES, BO, PE, UY o global.
Sin explicación, sin markdown, sin punto al final."""


_slug_index = None

def get_path(slug):
    global _slug_index
    if _slug_index is None:
        _slug_index = {}
        for p in CALCS_DIR.glob("*.json"):
            try:
                d = json.loads(p.read_text())
                if d.get('slug'):
                    _slug_index[d['slug']] = p
            except: pass
    return _slug_index.get(slug)


async def classify(client, slug, sem):
    p = get_path(slug)
    if p is None:
        return slug, None, "file not found"
    try:
        d = json.loads(p.read_text())
    except Exception as e:
        return slug, None, f"parse: {e}"

    text = (
        f"slug: {slug}\n"
        f"h1: {d.get('h1','')}\n"
        f"description: {d.get('description','')[:200]}\n"
        f"intro: {(d.get('intro') or '')[:300]}\n"
        f"category: {d.get('category','')}"
    )

    async with sem:
        try:
            r = await client.messages.create(
                model=MODEL,
                max_tokens=10,
                system=[{"type":"text","text":SYSTEM,"cache_control":{"type":"ephemeral"}}],
                messages=[{"role":"user","content":text}],
            )
        except Exception as e:
            return slug, None, f"api: {e}"

    out = next((b.text for b in r.content if b.type == "text"), "").strip()
    out = out.split()[0] if out else ""
    out = out.rstrip(".,;:")
    if out not in VALID:
        return slug, None, f"invalid output: {out!r}"
    return slug, out, None


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--from-file", required=True)
    ap.add_argument("--concurrency", type=int, default=16)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--limit", type=int, default=None)
    args = ap.parse_args()

    if not os.environ.get("ANTHROPIC_API_KEY"):
        ef = ROOT / ".env"
        if ef.exists():
            for l in ef.read_text().splitlines():
                if l.startswith("ANTHROPIC_API_KEY="):
                    os.environ["ANTHROPIC_API_KEY"] = l.split("=",1)[1].strip().strip('"')
                    break

    slugs = [l.strip() for l in open(args.from_file) if l.strip()]
    if args.limit:
        slugs = slugs[:args.limit]
    print(f"[tag-audience] {len(slugs)} calcs to classify with {MODEL}", file=sys.stderr)

    client = anthropic.AsyncAnthropic()
    sem = asyncio.Semaphore(args.concurrency)
    tasks = [classify(client, s, sem) for s in slugs]

    from collections import Counter
    counts = Counter()
    errors = 0
    applied = 0
    for fut in asyncio.as_completed(tasks):
        slug, label, err = await fut
        if err:
            errors += 1
            print(f"  ✗ {slug}: {err}", file=sys.stderr)
            continue
        counts[label] += 1
        if not args.dry_run:
            p = get_path(slug)
            if p is None:
                errors += 1
                continue
            d = json.loads(p.read_text())
            d['audience'] = label
            p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + "\n")
            applied += 1

    print(f"\n[tag-audience] applied={applied} errors={errors}", file=sys.stderr)
    print(f"[tag-audience] distribution:", file=sys.stderr)
    for k, v in counts.most_common():
        print(f"  {k}: {v}", file=sys.stderr)


if __name__ == "__main__":
    asyncio.run(main())
