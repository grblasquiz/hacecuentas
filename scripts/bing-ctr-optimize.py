#!/usr/bin/env python3
"""Optimiza CTR de Bing reescribiendo title/description(meta)/answerSnippet de las
calcs que rankean bien (pos 4-7) pero clickean poco (<3% CTR). Pega a la API de
Anthropic (Sonnet 4.6) con la key de .env → gasto sale del crédito API, NO del plan.

Solo REFRASEA para matchear la query exacta de Bing + sumar gancho de click. NUNCA
toca números, tasas, fechas ni leyes. Tope de presupuesto medido en vivo.

Uso: python3 scripts/bing-ctr-optimize.py [--budget 30] [--workers 6] [--maxctr 3.0] [--minimpr 300] [--limit N] [--dry]
"""
import json, os, re, sys, threading, time, glob
from pathlib import Path
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
import anthropic

ROOT = Path('/Users/marrod/hacecuentas')
MODEL = 'claude-sonnet-4-6'
def arg(name, default, cast=float):
    return cast(sys.argv[sys.argv.index(name)+1]) if name in sys.argv else default
BUDGET = arg('--budget', 30.0)
WORKERS = arg('--workers', 6, int)
MAXCTR = arg('--maxctr', 3.0)
MINIMPR = arg('--minimpr', 300, int)
LIMIT = arg('--limit', 100000, int)
DRY = '--dry' in sys.argv
TODAY = '2026-06-20'
P_IN, P_OUT, P_CR, P_CW = 3/1e6, 15/1e6, 0.30/1e6, 3.75/1e6

key = None
for ln in (ROOT/'.env').read_text().splitlines():
    if ln.startswith('ANTHROPIC_API_KEY='):
        key = ln.split('=', 1)[1].strip().strip('"').strip("'")
client = anthropic.Anthropic(api_key=key)

# --- worklist: páginas Bing con impr alto + CTR bajo, resueltas a calc JSON ---
bing = json.load(open(ROOT/'data/bing-perf-latest.json'))
agg = defaultdict(lambda: [0, 0, []])
for p in bing['pages']:
    u = p['page'].replace('https://hacecuentas.com', '')
    agg[u][0] += p['impressions']; agg[u][1] += p['clicks']; agg[u][2].append(p['position'])
# queries para matchear phrasing
queries = sorted(bing['queries'], key=lambda r: -r['impressions'])
STOP = set('de la el en y a por con para del las los un una calculadora calcular 2026 cuanto como'.split())
def toks(s): return {w for w in re.findall(r'[a-záéíóúñ0-9]+', (s or '').lower()) if w not in STOP and len(w) > 2}
def match_queries(slug, h1, n=6):
    base = toks(slug) | toks(h1)
    scored = [(len(base & toks(q['query'])) + 0.001*0, q) for q in queries]
    scored = [(s, q) for s, q in scored if s > 0]
    scored.sort(key=lambda x: (-x[0], -x[1]['impressions']))
    return [q['query'] for _, q in scored[:n]]

LOC = {'calcs': '', 'calcs-en': '/en', 'calcs-pt': '/pt', 'calcs-mx': '/mx', 'calcs-co': '/co',
       'calcs-cl': '/cl', 'calcs-es': '/es', 'calcs-pe': '/pe', 'calcs-ec': '/ec'}
slugmap = {}
for dd, pref in LOC.items():
    for fp in glob.glob(str(ROOT/f'src/content/{dd}/*.json')):
        try: j = json.load(open(fp))
        except Exception: continue
        s = j.get('slug') or os.path.basename(fp)[:-5]
        slugmap[pref + '/' + s] = fp

work = []
for u, (im, cl, pos) in agg.items():
    if im < MINIMPR: continue
    ctr = 100 * cl / im if im else 0
    if ctr >= MAXCTR: continue
    fp = slugmap.get(u)
    if not fp: continue          # solo calc JSONs (tabla/blog/guia/standalone se hacen a mano)
    work.append((im, ctr, min(pos), u, fp))
work.sort(key=lambda x: -x[0])
work = work[:LIMIT]
print(f"targets: {len(work)} calcs (impr>={MINIMPR}, ctr<{MAXCTR}%) | budget ${BUDGET} | {'DRY' if DRY else 'LIVE'}")
for im, ctr, pos, u, fp in work:
    print(f"  {im:>5} {ctr:4.1f}% pos{pos:>2}  {u}")

SYSTEM = [{
    "type": "text",
    "text": (
        "Sos editor SEO de hacecuentas.com (calculadoras, dominio YMYL). Tu objetivo: subir el CTR en Bing "
        "de una calc que YA rankea (posición 4-7) pero recibe pocos clicks. Te doy el contenido + las queries "
        "REALES por las que aparece en Bing.\n\n"
        "Reescribí 3 campos para que el snippet de Bing matchee la búsqueda y dé ganas de clickear:\n"
        "1. title: el <title> de la SERP. Arrancá con la frase de búsqueda de MAYOR volumen (lo más parecido a la query real), "
        "incluí el año si aplica, y UN gancho natural (gratis/online/actualizada/paso a paso/al instante) SOLO si queda natural. "
        "Máx ~62 caracteres ANTES del sufijo. Conservá el sufijo ' | Hacé Cuentas' EXACTO.\n"
        "2. description: la meta description (140-158 chars). Oración 1 = respuesta directa / qué obtenés. Sumá un beneficio o "
        "llamado a la acción. Incluí keywords de las queries de forma natural. Sin comillas dobles internas.\n"
        "3. answerSnippet: 50-60 palabras. La PRIMERA oración debe responder la query principal de forma directa y completa en "
        "<=25 palabras (para que Bing/Copilot la levanten al answer-box), seguida de 1-2 oraciones de apoyo.\n\n"
        "REGLAS DURAS: NO inventes ni cambies NINGÚN número, tasa, monto, fecha, ley ni dato — solo reformulás texto. "
        "Mismo idioma del contenido. Si el title/description/answerSnippet actuales ya están óptimos y no hay mejora real de CTR, "
        "devolvé action:skipped.\n\n"
        "Devolvé SOLO un objeto JSON sin markdown:\n"
        '{"action":"updated","title":"...","description":"...","answerSnippet":"..."}\n'
        'o {"action":"skipped","reason":"..."}'
    ),
    "cache_control": {"type": "ephemeral"},
}]

lock = threading.Lock()
state = {"spent": 0.0, "upd": 0, "skip": 0, "err": 0, "done": 0, "stop": False}

def extract_json(t):
    t = re.sub(r'^```(json)?|```$', '', t.strip(), flags=re.M).strip()
    m = re.search(r'\{.*\}', t, re.S)
    return json.loads(m.group(0)) if m else None

def process(item):
    im, ctr, pos, u, fp = item
    with lock:
        if state["stop"] or state["spent"] >= BUDGET:
            state["stop"] = True; return
    try:
        j = json.load(open(fp))
        mq = match_queries(j.get('slug', ''), j.get('h1', ''))
        ctx = {k: j.get(k) for k in ('slug', 'h1', 'title', 'description', 'answerSnippet', 'category', 'intro')}
        payload = {"calc": ctx, "bing_queries_reales": mq, "bing_impresiones": im, "bing_ctr_actual_pct": round(ctr, 2)}
        msg = client.messages.create(
            model=MODEL, max_tokens=1200, system=SYSTEM,
            messages=[{"role": "user", "content": json.dumps(payload, ensure_ascii=False)[:9000]}],
        )
        usg = msg.usage
        cost = (usg.input_tokens*P_IN + usg.output_tokens*P_OUT
                + getattr(usg, 'cache_read_input_tokens', 0)*P_CR
                + getattr(usg, 'cache_creation_input_tokens', 0)*P_CW)
        txt = "".join(b.text for b in msg.content if b.type == "text")
        obj = extract_json(txt)
        action = "err"
        if obj and obj.get("action") == "updated":
            t, d, a = obj.get("title"), obj.get("description"), obj.get("answerSnippet")
            if t and d and a and len(t) > 10 and 80 <= len(d) <= 175 and len(a) > 40:
                if not DRY:
                    j["title"] = t.strip(); j["description"] = d.strip(); j["answerSnippet"] = a.strip()
                    j["lastReviewed"] = TODAY
                    Path(fp).write_text(json.dumps(j, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
                action = "upd"
            else:
                action = "skip"
        elif obj and obj.get("action") == "skipped":
            action = "skip"
        with lock:
            state["spent"] += cost; state["done"] += 1
            state["upd" if action == "upd" else ("skip" if action == "skip" else "err")] += 1
            print(f"  [{state['done']}/{len(work)}] {action:4} ${state['spent']:.2f}  {u}", flush=True)
            if state["spent"] >= BUDGET: state["stop"] = True
    except Exception as e:
        with lock:
            state["err"] += 1; state["done"] += 1
        print("  ERR", Path(fp).stem[:40], str(e)[:90], flush=True)

if not DRY or '--run' in sys.argv:
    t0 = time.time()
    with ThreadPoolExecutor(max_workers=WORKERS) as ex:
        futs = []
        for item in work:
            with lock:
                if state["stop"]: break
            futs.append(ex.submit(process, item))
        for f in futs: f.result()
    print(f"\n=== FIN === upd:{state['upd']} skip:{state['skip']} err:{state['err']} | GASTO ${state['spent']:.2f} | {time.time()-t0:.0f}s")
    json.dump(state, open('/tmp/bing_ctr_state.json', 'w'))
else:
    print("\n(DRY: agregá --run para ejecutar)")
