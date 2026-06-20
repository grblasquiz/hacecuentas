#!/usr/bin/env python3
"""Genera tablas de referencia (info-gain) en calcs SIN tabla, pegando a la API
de Anthropic (Sonnet 4.6) con la key de .env → el gasto sale de los créditos de
API, NO del plan Claude Code. Tope de presupuesto medido en vivo (usage real).

Uso: python3 scripts/reftables-via-api.py [--budget 110] [--workers 6] [--limit N]
"""
import json, os, re, sys, threading, time
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import anthropic

ROOT = Path('/Users/marrod/hacecuentas')
MODEL = 'claude-sonnet-4-6'
BUDGET = float(sys.argv[sys.argv.index('--budget')+1]) if '--budget' in sys.argv else 110.0
WORKERS = int(sys.argv[sys.argv.index('--workers')+1]) if '--workers' in sys.argv else 6
LIMIT = int(sys.argv[sys.argv.index('--limit')+1]) if '--limit' in sys.argv else 100000
TODAY = '2026-06-20'

# precios Sonnet 4.6 (USD / token)
P_IN, P_OUT, P_CR, P_CW = 3/1e6, 15/1e6, 0.30/1e6, 3.75/1e6

# key desde .env
key = None
for ln in (ROOT/'.env').read_text().splitlines():
    if ln.startswith('ANTHROPIC_API_KEY='):
        key = ln.split('=', 1)[1].strip().strip('"').strip("'")
client = anthropic.Anthropic(api_key=key)

# worklist: calcs sin referenceTable, por tráfico GA4 desc
ga4 = json.load(open('/tmp/ga4_all.json'))
LOC = {'calcs':'','calcs-en':'/en','calcs-pt':'/pt','calcs-mx':'/mx','calcs-co':'/co','calcs-cl':'/cl','calcs-es':'/es','calcs-pe':'/pe','calcs-ec':'/ec'}
def sess(pref, slug): return (ga4.get(f"{pref}/{slug}".rstrip('/') or '/') or {}).get('sessions', 0)
work = []
for d, pref in LOC.items():
    for fp in (ROOT/f'src/content/{d}').glob('*.json'):
        try: j = json.load(open(fp))
        except Exception: continue
        if j.get('referenceTables'): continue
        work.append((sess(pref, j.get('slug') or fp.stem), str(fp)))
work.sort(key=lambda x: -x[0])
work = work[:LIMIT]
print(f"sin tabla: {len(work)} | budget ${BUDGET} | model {MODEL} | workers {WORKERS}")

SYSTEM = [{
    "type": "text",
    "text": (
        "Sos editor de datos de calculadoras (hacecuentas.com), dominio YMYL fiscal/legal/salud. "
        "Para la calc dada generá UNA tabla de referencia única y verificable (info-gain), basada EXCLUSIVAMENTE "
        "en los datos que la propia calc ya establece + su fuente oficial. NO inventes cifras/UVT/UMA/tasas.\n\n"
        "Devolvé SOLO un objeto JSON (sin markdown, sin texto extra):\n"
        '{\"action\":\"added\",\"table\":{\"title\":\"...\",\"headers\":[\"c1\",\"c2\"],\"rows\":[[\"a\",\"b\"]],\"note\":\"Fuente: <organismo> (2026)\"}}\n'
        "o, si la calc es simple (matemática directa, conversión, fecha) donde una tabla sería relleno, "
        "o si NO podés verificar los datos con confianza:\n"
        '{\"action\":\"skipped\",\"reason\":\"...\"}\n\n'
        "Reglas: la tabla debe ser info-gain real (tramos/tasas/categorías/componentes/valores de referencia), "
        "ÚNICA, cada fila con tantos valores como headers, note arrancando con 'Fuente:', en el MISMO idioma del contenido. "
        "Verificá cada número contra el contenido de la calc antes de incluirlo. Ante la duda, action:skipped."
    ),
    "cache_control": {"type": "ephemeral"},
}]

lock = threading.Lock()
state = {"spent": 0.0, "added": 0, "skipped": 0, "err": 0, "done": 0, "stop": False}

def extract_json(t):
    t = re.sub(r'^```(json)?|```$', '', t.strip(), flags=re.M).strip()
    m = re.search(r'\{.*\}', t, re.S)
    return json.loads(m.group(0)) if m else None

def process(item):
    sessn, fp = item
    with lock:
        if state["stop"] or state["spent"] >= BUDGET:
            state["stop"] = True
            return
    try:
        j = json.load(open(fp))
        ctx = {k: j.get(k) for k in ('slug','h1','category','intro','explanation','sources','answerSnippet')}
        msg = client.messages.create(
            model=MODEL, max_tokens=2000,
            system=SYSTEM,
            messages=[{"role": "user", "content": "Calc:\n" + json.dumps(ctx, ensure_ascii=False)[:9000]}],
        )
        u = msg.usage
        cost = (u.input_tokens*P_IN + u.output_tokens*P_OUT
                + getattr(u,'cache_read_input_tokens',0)*P_CR
                + getattr(u,'cache_creation_input_tokens',0)*P_CW)
        txt = "".join(b.text for b in msg.content if b.type == "text")
        obj = extract_json(txt)
        action = "err"
        if obj and obj.get("action") == "added" and obj.get("table"):
            t = obj["table"]
            if t.get("headers") and t.get("rows") and all(len(r)==len(t["headers"]) for r in t["rows"]):
                j.setdefault("referenceTables", []).append(
                    {"title": t.get("title",""), "headers": t["headers"], "rows": t["rows"], "note": t.get("note","")})
                j["lastReviewed"] = TODAY
                fp_w = Path(fp); fp_w.write_text(json.dumps(j, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
                action = "added"
            else:
                action = "skipped"
        elif obj and obj.get("action") == "skipped":
            action = "skipped"
        with lock:
            state["spent"] += cost; state["done"] += 1; state[action] += 1
            if state["done"] % 25 == 0:
                print(f"  {state['done']} hechas | +{state['added']} tablas / {state['skipped']} skip / {state['err']} err | ${state['spent']:.2f}", flush=True)
            if state["spent"] >= BUDGET: state["stop"] = True
    except Exception as e:
        with lock:
            state["err"] += 1; state["done"] += 1
        if state["err"] <= 5: print("  ERR", Path(fp).stem[:40], str(e)[:80], flush=True)

t0 = time.time()
with ThreadPoolExecutor(max_workers=WORKERS) as ex:
    futs = []
    for item in work:
        with lock:
            if state["stop"]: break
        futs.append(ex.submit(process, item))
    for f in futs: f.result()

print(f"\n=== FIN ===")
print(f"calcs procesadas: {state['done']} | tablas agregadas: {state['added']} | skip: {state['skipped']} | err: {state['err']}")
print(f"GASTO REAL API: ${state['spent']:.2f} de ${BUDGET} | {time.time()-t0:.0f}s")
json.dump(state, open('/tmp/reftables_api_state.json','w'))
