#!/usr/bin/env python3
"""
Puebla el campo `answerSnippet` (50-60 palabras, números REALES del calc) en las
calcs del backlog GSC que no lo tienen, ordenadas por impresiones.

answerSnippet alimenta: meta description + bloque de respuesta destacada + Speakable
schema (AEO/featured snippet). Distinto de `## ¿Qué es` (eso va en explanation).

Anti-invención: se le pasa SOLO el contenido real del calc (keyTakeaway, ejemplo,
fórmula) y se prohíbe inventar números. Validador post-gen marca cifras no-sourced.

Uso:
  python3 scripts/llm-add-answersnippet.py --limit 5     # smoke
  python3 scripts/llm-add-answersnippet.py               # top 50 (impr>=150)
  python3 scripts/llm-add-answersnippet.py --min-impr 100 --resume
"""
import argparse, asyncio, json, os, re, sys
from pathlib import Path
import anthropic

ROOT = Path(__file__).resolve().parent.parent
CALCS = ROOT / "src" / "content" / "calcs"
BACKLOG = ROOT / "docs" / "answersnippet-backlog.json"
STATE_FILE = ROOT / "scripts" / ".batch-answersnippet-state.json"
MODEL = "claude-sonnet-4-6"

SYSTEM = """Sos SEO copywriter experto en featured snippets y AEO (respuestas que las IA citan).

Tarea: dado el contenido REAL de una calculadora, escribís UN párrafo `answerSnippet`
que responde directo la pregunta de cabeza del tema, autocontenido, para que Google lo
levante como snippet y las IA lo citen.

# Reglas
- Idioma: español rioplatense (es-AR). Texto PLANO: sin markdown, sin viñetas, sin emojis, sin links.
- Largo: 50 a 60 palabras. Ni menos ni más.
- Estructura: (1) definición o método en una oración clara; (2) la fórmula o el número
  concreto; (3) un ejemplo o benchmark del contexto que ancle el dato.
- CRÍTICO — números: usá SOLO cifras que aparezcan textualmente en el CONTEXTO provisto.
  Está PROHIBIDO inventar porcentajes, montos, fechas o constantes. Si el contexto no
  trae un número, describí el método sin cifras inventadas.
- NO digas "esta calculadora", "esta herramienta", "ingresá", ni referencias a la app.
  Hablá del CONCEPTO, como una enciclopedia.
- Tono: directo, técnicamente preciso, sin fluff de marketing.

# Ejemplos de salida correcta
EJ1: "La rotación de inventario se calcula dividiendo el costo de la mercadería vendida anual por el inventario promedio. Si tu CMV es 300 millones y tu inventario promedio 50 millones, rotás 6 veces al año, equivalente a 61 días de stock. Usá siempre CMV, no ventas, porque ventas infla el indicador por el margen. Benchmark: supermercado 20 a 40, retail moda 4 a 8."
EJ2: "El costo anual de una carrera en universidad privada argentina (ITBA, UTDT, Austral) va de USD 5.000 a USD 14.000 según institución y carrera. Para el costo total multiplicá: cuota mensual por 10 meses por duración. Ejemplo: Ingeniería ITBA ronda los USD 42.500 totales."

Devolvé EXCLUSIVAMENTE el párrafo. Sin comillas, sin "Aquí está", sin meta-comentarios."""


def needs(data):
    return not (data.get("answerSnippet") or "").strip()


def ctx_for(data):
    parts = [
        f"h1: {data.get('h1','')}",
        f"category: {data.get('category','')}",
        f"description: {(data.get('description') or '')[:200]}",
        f"keyTakeaway: {data.get('keyTakeaway','')}",
    ]
    ex = data.get("example") or {}
    if ex:
        parts.append(f"ejemplo.title: {ex.get('title','')}")
        if ex.get("steps"):
            parts.append("ejemplo.steps: " + " | ".join(ex["steps"][:6]))
        parts.append(f"ejemplo.result: {ex.get('result','')}")
    # bloque fórmula: primeros ~900 chars del explanation (suele traer 'Cómo se calcula')
    expl = (data.get("explanation") or "")
    if expl:
        parts.append("explanation: " + expl[:900])
    for f in (data.get("faq") or [])[:2]:
        parts.append(f"faq: {f.get('q','')} -> {f.get('a','')}")
    return "\n".join(parts)


NUM_RE = re.compile(r"\d[\d.,]*")
def norm_nums(text):
    out = set()
    for m in NUM_RE.findall(text):
        digits = m.replace(".", "").replace(",", "").rstrip("0") if False else m.replace(".", "").replace(",", "")
        if len(digits) >= 2:  # ignorar 1 dígito (ruido)
            out.add(digits)
    return out


def unsourced(snippet, context):
    src = norm_nums(context) | {str(y) for y in range(2024, 2028)}
    bad = [n for n in norm_nums(snippet) if n not in src]
    return bad


def load_state():
    if STATE_FILE.exists():
        try: return json.loads(STATE_FILE.read_text())
        except: pass
    return {"completed": [], "errors": {}, "review": {}}
def save_state(s): STATE_FILE.write_text(json.dumps(s, indent=2, ensure_ascii=False))


async def gen(client, slug, path, sem):
    data = json.loads(Path(path).read_text())
    context = ctx_for(data)
    async with sem:
        try:
            r = await client.messages.create(
                model=MODEL, max_tokens=400,
                system=[{"type":"text","text":SYSTEM,"cache_control":{"type":"ephemeral"}}],
                messages=[{"role":"user","content":f"CONTEXTO:\n{context}\n\nEscribí el answerSnippet (50-60 palabras, solo números del contexto)."}])
        except Exception as e:
            return slug, None, None, f"api: {type(e).__name__}: {e}"
    text = next((b.text for b in r.content if b.type=="text"), "").strip().strip('"').strip()
    wc = len(text.split())
    if not text or wc < 35 or wc > 80:
        return slug, None, context, f"len {wc}w: {text[:60]}"
    return slug, text, context, None


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int)
    ap.add_argument("--min-impr", type=int, default=100)
    ap.add_argument("--resume", action="store_true")
    ap.add_argument("--concurrency", type=int, default=8)
    args = ap.parse_args()

    if not os.environ.get("ANTHROPIC_API_KEY"):
        ef = ROOT / ".env"
        if ef.exists():
            for l in ef.read_text().splitlines():
                if l.startswith("ANTHROPIC_API_KEY="):
                    os.environ["ANTHROPIC_API_KEY"] = l.split("=",1)[1].strip().strip('"')

    # índice por campo slug (OJO: filename != slug en muchos calcs)
    idx = {}
    for p in CALCS.glob("*.json"):
        try: s = json.loads(p.read_text()).get("slug")
        except: continue
        if s: idx[s] = p
    backlog = json.loads(BACKLOG.read_text())
    work = []
    for item in backlog:
        if item["impressions"] < args.min_impr: continue
        p = idx.get(item["slug"])
        if not p: continue
        try: data = json.loads(p.read_text())
        except: continue
        if not needs(data): continue
        work.append((item["slug"], str(p), item["impressions"]))

    state = load_state()
    if args.resume:
        done = set(state["completed"])
        work = [w for w in work if w[0] not in done]
    if args.limit:
        work = work[:args.limit]
    print(f"[answerSnippet] {len(work)} calcs a procesar (min_impr={args.min_impr}) con {MODEL}", file=sys.stderr)
    if not work:
        print("Nada para hacer.", file=sys.stderr); return

    path_by_slug = {slug: path for slug, path, _ in work}
    client = anthropic.AsyncAnthropic()
    sem = asyncio.Semaphore(args.concurrency)
    tasks = [gen(client, slug, path, sem) for slug, path, _ in work]
    ok = err = flagged = 0
    samples = []
    for fut in asyncio.as_completed(tasks):
        slug, snippet, context, e = await fut
        if e:
            err += 1; state["errors"][slug] = e
            print(f"  ✗ {slug}: {e}", file=sys.stderr); continue
        bad = unsourced(snippet, context)
        p = Path(path_by_slug[slug])
        data = json.loads(p.read_text())
        data["answerSnippet"] = snippet
        p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
        state["completed"] = list(dict.fromkeys(state["completed"] + [slug]))
        ok += 1
        if bad:
            flagged += 1; state["review"][slug] = {"nums": bad, "snippet": snippet}
            print(f"  ⚠ REVISAR {slug}: cifras no-sourced {bad}", file=sys.stderr)
        if len(samples) < 6:
            samples.append((slug, snippet, bad))
        save_state(state)
    save_state(state)
    print(f"\n[answerSnippet] ok={ok} err={err} flagged={flagged}", file=sys.stderr)
    print("\n=== MUESTRAS ===")
    for slug, snip, bad in samples:
        print(f"\n• {slug}{'  [⚠ '+str(bad)+']' if bad else ''}\n  {snip}")


if __name__ == "__main__":
    asyncio.run(main())
