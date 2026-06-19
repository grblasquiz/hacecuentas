#!/usr/bin/env python3
"""Mide cuánto del contenido de las calcs es BOILERPLATE compartido (fingerprints)
que Google ve como 'copia'. Read-only. Por campo de prosa: n-gramas más repetidos
across el corpus + cuántas calcs los comparten, y % de unicidad.
"""
import json, re
from pathlib import Path
from collections import Counter

ROOT = Path('/Users/marrod/hacecuentas/src/content')
DIRS = ['calcs','calcs-en','calcs-pt','calcs-mx','calcs-co','calcs-cl','calcs-es','calcs-pe','calcs-ec']

calcs = []
for d in DIRS:
    for fp in (ROOT/d).glob('*.json'):
        try: calcs.append((d, json.load(open(fp))))
        except Exception: pass
N = len(calcs)
print(f"calcs analizadas: {N}\n")

def norm(s):
    s = (s or '').lower()
    s = re.sub(r'[0-9]+', '#', s)            # numerar como comodín (así "2026"/"2025" no rompen el match)
    s = re.sub(r'[^a-záéíóúñü #]', ' ', s)
    return re.sub(r'\s+', ' ', s).strip()

def ngrams(text, n=8):
    w = norm(text).split()
    return {' '.join(w[i:i+n]) for i in range(max(0, len(w)-n+1))}

def field_text(c, f):
    v = c.get(f)
    if isinstance(v, str): return v
    if isinstance(v, list):
        # faq: lista de {q,a}; useCases: lista de str
        out=[]
        for x in v:
            if isinstance(x, dict): out.append(' '.join(str(x.get(k,'')) for k in ('q','question','a','answer')))
            else: out.append(str(x))
        return ' '.join(out)
    return ''

def faq_questions(c):
    out=[]
    for x in (c.get('faq') or []):
        if isinstance(x, dict):
            q = x.get('q') or x.get('question')
            if q: out.append(norm(q))
    return out

# 1) Fingerprints por campo: 8-gramas compartidos por >=2 calcs
for field in ['intro','answerSnippet','explanation','keyTakeaway']:
    counter = Counter()
    present = 0
    for d, c in calcs:
        t = field_text(c, field)
        if not t.strip(): continue
        present += 1
        for g in ngrams(t, 8):
            counter[g] += 1
    shared = {g:n for g,n in counter.items() if n >= max(5, present*0.02)}
    top = sorted(shared.items(), key=lambda x:-x[1])[:6]
    # % de calcs que contienen AL MENOS un 8-grama compartido por >50% del corpus
    big = {g for g,n in counter.items() if n >= present*0.5}
    calcs_with_big = 0
    if big:
        for d, c in calcs:
            t = field_text(c, field)
            if t.strip() and (ngrams(t,8) & big): calcs_with_big += 1
    print(f"=== {field}  (presente en {present}/{N}) ===")
    print(f"  8-gramas compartidos por >50% del corpus: {len(big)}  → {calcs_with_big} calcs los usan")
    for g,n in top:
        print(f"   {n:>5}× ({100*n//max(1,present)}%)  “…{g[:70]}…”")
    print()

# 2) FAQ: preguntas EXACTAS repetidas across calcs
fq = Counter()
for d,c in calcs:
    for q in faq_questions(c): fq[q]+=1
print("=== FAQ: preguntas idénticas más repetidas (plantilla) ===")
for q,n in fq.most_common(10):
    print(f"   {n:>5}×  “{q[:72]}”")
dup_q = sum(n for q,n in fq.items() if n>=10)
tot_q = sum(fq.values())
print(f"  preguntas FAQ totales: {tot_q} | en plantillas (≥10 calcs misma pregunta): {dup_q} ({100*dup_q//max(1,tot_q)}%)\n")

# 3) Intro: primera oración — ¿cuántas arrancan igual?
starts = Counter()
for d,c in calcs:
    t = norm(field_text(c,'intro'))
    if t: starts[' '.join(t.split()[:6])] += 1
print("=== intro: primeras 6 palabras más repetidas ===")
for s,n in starts.most_common(8):
    print(f"   {n:>5}×  “{s}…”")
