#!/usr/bin/env python3
"""
Mide, sobre el HTML RENDERIZADO (lo que ve Google), qué % del texto visible de una calc
es BOILERPLATE compartido con las demás vs contenido ÚNICO.

Método: extrae texto visible de una muestra de calcs de dist/client, shinglea (8-gramas),
calcula document-frequency de cada shingle y clasifica:
  - boilerplate  = shingle presente en >=90% de las calcs (nav/footer/secciones fijas del template)
  - compartido   = 10%–90%
  - único        = en 1 sola calc
Read-only.
"""
import re, glob
from collections import Counter

FILES = sorted(glob.glob('/Users/marrod/hacecuentas/dist/client/calculadora-*.html'))
# muestra espaciada para diversidad temática (rápido y representativo)
SAMPLE = FILES[::max(1, len(FILES)//150)][:150]

def visible_text(html):
    html = re.sub(r'(?is)<script.*?</script>', ' ', html)
    html = re.sub(r'(?is)<style.*?</style>', ' ', html)
    html = re.sub(r'(?is)<noscript.*?</noscript>', ' ', html)
    html = re.sub(r'(?s)<[^>]+>', ' ', html)            # quitar tags
    html = re.sub(r'&[a-z]+;', ' ', html)
    return html

def norm(s):
    s = s.lower()
    s = re.sub(r'[0-9]+', '#', s)
    s = re.sub(r'[^a-záéíóúñü #]', ' ', s)
    return re.sub(r'\s+', ' ', s).strip()

def shingles(text, n=8):
    w = norm(text).split()
    return {' '.join(w[i:i+n]) for i in range(max(0, len(w)-n+1))}

docs = {}        # file -> set(shingles)
words = {}        # file -> word count (texto visible)
df = Counter()
for fp in SAMPLE:
    try:
        t = visible_text(open(fp, encoding='utf-8', errors='ignore').read())
    except Exception:
        continue
    sh = shingles(t)
    docs[fp] = sh
    words[fp] = len(norm(t).split())
    for s in sh:
        df[s] += 1

M = len(docs)
if not M:
    print('Sin HTML en dist/client. Corré `npm run build` primero.'); raise SystemExit
boiler_th = 0.90 * M
mid_lo = 0.10 * M

# por-calc: % de sus shingles que son boilerplate / compartidos / únicos
b_shares, u_shares, m_shares = [], [], []
uniq_words_est = []
for fp, sh in docs.items():
    if not sh: continue
    nb = sum(1 for s in sh if df[s] >= boiler_th)
    nu = sum(1 for s in sh if df[s] == 1)
    nm = len(sh) - nb - nu
    b_shares.append(nb/len(sh)); u_shares.append(nu/len(sh)); m_shares.append(nm/len(sh))
    uniq_words_est.append(words[fp] * nu/len(sh))

def avg(x): return sum(x)/len(x) if x else 0
print(f'HTML renderizado · muestra {M} calcs de {len(FILES)} (dist/client)\n')
print(f'Texto visible promedio por calc: {avg(list(words.values())):.0f} palabras')
print(f'Shingles (8-gramas) únicos promedio por calc: {avg([len(s) for s in docs.values()]):.0f}\n')
print('REPARTO del texto visible de una calc PROMEDIO:')
print(f'  █ boilerplate (en ≥90% de las calcs) : {avg(b_shares)*100:5.1f}%   ← scaffold del template')
print(f'  ▓ compartido parcial (10–90%)        : {avg(m_shares)*100:5.1f}%')
print(f'  ░ ÚNICO (solo en esa calc)           : {avg(u_shares)*100:5.1f}%   ← información propia\n')
print(f'≈ contenido único por calc: {avg(uniq_words_est):.0f} palabras de {avg(list(words.values())):.0f} visibles')

# top boilerplate shingles (los bloques fijos más extendidos)
big = sorted([(s,n) for s,n in df.items() if n >= boiler_th], key=lambda x:-x[1])
print(f'\nBloques boilerplate (8-gramas en ≥90% de las calcs): {len(big)} distintos')
for s,n in big[:12]:
    print(f'   {100*n//M:>3}%  “…{s[:64]}…”')

# distribución global de shingles por frecuencia
total_sh = len(df)
b = sum(1 for n in df.values() if n >= boiler_th)
u = sum(1 for n in df.values() if n == 1)
print(f'\nDe {total_sh:,} 8-gramas distintos en el corpus: {u:,} ({100*u//total_sh}%) únicos · {b:,} ({100*b//max(1,total_sh)}%) boilerplate')
