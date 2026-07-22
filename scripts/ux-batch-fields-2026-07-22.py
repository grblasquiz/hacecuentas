#!/usr/bin/env python3
"""Batch UX sobre JSONs de calcs (items 1-5 del pedido 2026-07-22).

Uso:
  python3 scripts/ux-batch-fields-2026-07-22.py            # dry-run (default)
  python3 scripts/ux-batch-fields-2026-07-22.py --apply

Items:
 1. porcentaje sin max -> max:100 (acotados) / max:1000 (dudosos) / nada (excluidos)
 2. step:1 en montos >=100k -> step:1000 (o 100 si default <500k)
 3. labels >60 chars -> mover cola a help (heuristica parentesis/coma/dos puntos)
 4. numericos sin unidad ni help en calcs top-traffic -> help generado por patrones
 5. advanced:true en top-20 con >6 campos
Bump lastReviewed SOLO en archivos tocados por items 3-4.
"""
import json, glob, re, sys, os, collections

APPLY = '--apply' in sys.argv
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TODAY = '2026-07-22'

# ---------- item 1: porcentajes ----------
# Excluidos (pueden superar 100 legitimamente): sin max
EXCLUDE_PCT = re.compile(r'inflaci[oó]n|infla[cç][aã]o|interanual|ipc\b|ipca|rentabilidad|retorno|rendimiento|markup|revaloriz|apreciaci|crecimiento|ganancia acumulada|cft|valoriza[cç]|hydration|hidrataci[oó]n|[ií]ndice acumulado|percentage change|bakers?', re.I)
# Dudosos (tasas que en AR/VE/cripto pueden pasar 100): max 1000
DOUBT_PCT = re.compile(r'inter[eé]s|juros|tna|tea\b|apr\b|apy|annual rate|annual return|growth rate|yield|volatilidad|volatility|std dev|spread|selic|cdi\b|iof\b|euribor|trea|tcea|tan\)|taxa (anual|mensal|prefixada)|tasa (nominal|efectiva|anual|mensual|real|libre|selic|de usura|cajitas|nequi|financiaci)|usura|tpm\b|funding|margen|margem|adicional|aumento|suba|variaci[oó]n|ajuste|% ?e\.?a\.?|% ?anual|% ?ao ano', re.I)
# Acotados semanticamente: max 100
BOUND_PCT = re.compile(r'al[ií]cuota|al[ií]quota|descuento|desconto|discount|proporci[oó]n|porcentaje|porcentagem|percentual|comisi[oó]n|comiss[aã]o|retenci[oó]n|reten[cç][aã]o|iva\b|propina|gorjeta|gratuity|\btip\b|ahorro|humedad|grasa|aportes?\b|aportaci[oó]n|contribu[ct]i|match rate|allocation|pendiente|eficien|efficien|ocupaci[oó]n|asistencia|avance|participaci[oó]n|bonificaci[oó]n|recargo|impuesto|imposto|sales tax|tax rate|se[nñ]a|anticipo|entrada|enganche|cuota inicial|down payment|dti|refund|coverage|cobertura|tarifa|honorarios|notar[ií]a|registro|derechos|igi\b|dta\b|prima|desperdicio|ctr\b|conversi[oó]n|cache hit|hba1c|tipo de|gasto administrativo|seguro de vida|l[ií]mite|calidad|quality', re.I)

NOT_PCT = re.compile(r'r\$|bs\.|usd|ars\b|dop\b|hz\b|por 1 |crlv|/[a-z]{3}\b|\bkm\b|refresco', re.I)

def is_pct_field(f):
    if f.get('type') not in (None, 'number', 'range'): return False
    txt = ' '.join(str(f.get(k, '')) for k in ('unit', 'suffix', 'label', 'help'))
    if NOT_PCT.search(str(f.get('label', '')) + ' ' + str(f.get('unit', '')) + ' ' + str(f.get('suffix', ''))):
        return False
    return ('%' in str(f.get('unit', '')) or '%' in str(f.get('suffix', ''))
            or re.search(r'porcentaje|porcentagem|percentual|\(%\)|en %|em %', txt, re.I) is not None
            or re.search(r'\btasa\b|\btaxa\b', str(f.get('label', '')), re.I) is not None)

# ---------- item 4: help por patrones (solo semantica deducible) ----------
HELP_PATTERNS = [
    (r'sueldo.*bruto|salario.*bruto|remuneraci[oó]n bruta', 'Bruto mensual, antes de descuentos y aportes.'),
    (r'sueldo.*neto|salario.*neto|en mano', 'Neto mensual, lo que cobrás de bolsillo.'),
    (r'\bsueldo\b|\bsalario\b', 'Monto mensual bruto.'),
    (r'antig[uü]edad.*a[nñ]os|a[nñ]os.*antig[uü]edad|a[nñ]os trabajados', 'Años completos trabajados en el empleo.'),
    (r'antig[uü]edad.*meses|meses.*antig[uü]edad', 'Meses adicionales a los años completos.'),
    (r'\bedad\b|\bidade\b', 'Edad en años cumplidos.'),
    (r'\bpeso\b(?!.*(argentino|\$))', 'Peso corporal en kilogramos.'),
    (r'\baltura\b|\bestatura\b', 'Altura en centímetros.'),
    (r'monto.*pr[eé]stamo|capital.*pr[eé]stamo|monto a financiar|valor do empr[eé]stimo', 'Capital total a financiar, sin intereses.'),
    (r'\bcuotas?\b.*(cantidad|n[uú]mero)|cantidad de cuotas|plazo en cuotas', 'Cantidad total de cuotas del plan.'),
    (r'plazo.*meses|meses.*plazo', 'Duración total en meses.'),
    (r'plazo.*a[nñ]os|a[nñ]os.*plazo', 'Duración total en años.'),
    (r'alquiler mensual|\baluguel\b mensal|precio del alquiler|valor del alquiler', 'Valor mensual del alquiler.'),
    (r'monto inicial|capital inicial|inversi[oó]n inicial|aporte inicial', 'Monto con el que arrancás, en moneda local.'),
    (r'\bhoras\b.*(semana|semanales)', 'Horas trabajadas por semana.'),
    (r'\bhoras\b.*(mes|mensuales)', 'Horas trabajadas por mes.'),
    (r'\bhoras extra', 'Cantidad de horas extra en el período.'),
    (r'd[ií]as trabajados', 'Días efectivamente trabajados en el período.'),
    (r'd[ií]as de vacaciones', 'Días corridos de vacaciones que te corresponden.'),
    (r'consumo.*kwh|kwh', 'Consumo del período en kWh (figura en la factura).'),
    (r'\bkilometraje\b|\bkil[oó]metros\b|\bkm\b', 'Distancia en kilómetros.'),
    (r'precio por litro|litro', 'Precio por litro en moneda local.'),
    (r'facturaci[oó]n|ingresos brutos anuales|ingresos anuales', 'Total facturado en el año, sin IVA.'),
    (r'ingresos mensuales|ingreso mensual', 'Ingresos totales del mes, en moneda local.'),
    (r'\bdeuda\b|saldo deudor', 'Saldo adeudado a la fecha.'),
    (r'valor de la propiedad|valor del inmueble|precio.*propiedad', 'Valor total de la propiedad en moneda local.'),
    (r'\bmonto\b.*(invertir|inversi[oó]n)', 'Monto a invertir en moneda local.'),
]

def gen_help(label, calc):
    for pat, h in HELP_PATTERNS:
        if re.search(pat, label, re.I):
            return h
    return None

# ---------- item 5: top-20 advanced ----------
def load_top():
    top = json.load(open(os.path.join(ROOT, 'public/api/calcs-top.json')))
    return [t['slug'] for t in top]

def main():
    files = sorted(glob.glob(os.path.join(ROOT, 'src/content/calcs*/[!_]*.json')))
    top_slugs = load_top()
    top_rank = {s: i for i, s in enumerate(top_slugs)}
    top100 = set(top_slugs[:200])

    stats = collections.Counter()
    changed_files = {}          # path -> data
    bump_files = set()          # paths que requieren bump lastReviewed (items 3-4)
    log = collections.defaultdict(list)

    # pre-pass para item 5: top 20 con >6 campos
    slug_to_path = {}
    datas = {}
    for p in files:
        try:
            d = json.load(open(p))
        except Exception as e:
            log['errores'].append(f'{p}: {e}'); continue
        datas[p] = d
        slug_to_path.setdefault(d.get('slug', ''), p)

    adv_targets = []
    for s in top_slugs:
        p = slug_to_path.get(s) or slug_to_path.get('calculadora-' + s) or slug_to_path.get(s.replace('calculadora-', ''))
        if p and len(datas[p].get('fields') or []) > 6:
            adv_targets.append(p)
        if len(adv_targets) >= 20:
            break

    for p in files:
        d = datas.get(p)
        if d is None: continue
        fields = d.get('fields')
        if not isinstance(fields, list): continue
        slug = d.get('slug', '')
        touched = False

        for f in fields:
            if not isinstance(f, dict): continue
            label = str(f.get('label', ''))
            ftype = f.get('type', 'number')

            # --- item 1 ---
            if ftype in (None, 'number', 'range') and 'max' not in f and is_pct_field(f):
                blob = label + ' ' + str(f.get('help', '')) + ' ' + str(f.get('unit', '')) + ' ' + str(f.get('suffix', ''))
                if EXCLUDE_PCT.search(blob):
                    stats['1_excluido'] += 1
                    log['1_excluidos'].append(f'{slug} :: {label}')
                elif BOUND_PCT.search(blob):
                    f['max'] = 100; touched = True; stats['1_max100'] += 1
                    log['1_max100'].append(f'{slug} :: {label}')
                elif DOUBT_PCT.search(blob):
                    f['max'] = 1000; touched = True; stats['1_max1000'] += 1
                    log['1_max1000'].append(f'{slug} :: {label}')
                else:
                    stats['1_sin_clasificar'] += 1
                    log['1_sin_clasificar'].append(f'{slug} :: {label}')

            # --- item 2 ---
            if ftype in (None, 'number') and f.get('step') == 1:
                dv = f.get('default')
                is_money = bool(f.get('prefix')) or f.get('format') == 'thousands' or re.search(r'\$|pesos|sueldo|salario|monto|precio|valor|ingreso', label, re.I)
                if isinstance(dv, (int, float)) and dv >= 100000 and is_money:
                    f['step'] = 100 if dv < 500000 else 1000
                    touched = True; stats['2_step'] += 1
                    log['2_step'].append(f'{slug} :: {label} (default {dv} -> step {f["step"]})')

            # --- item 3 ---
            if len(label) > 60 and slug not in QUESTIONNAIRE_SLUGS:
                new_label, extra = shorten_label(label)
                other_labels = {str(g.get('label', '')).lower() for g in fields if g is not f}
                if new_label and new_label.lower() in other_labels:
                    new_label = None  # colision de labels dentro del mismo calc
                    stats['3_colision'] += 1
                    log['3_no_acortable'].append(f'{slug} (colision) :: {label}')
                elif new_label and extra:
                    f['label'] = new_label
                    h = str(f.get('help', '')).strip()
                    if extra.rstrip('.').lower() not in h.lower():
                        f['help'] = (h + (' ' if h else '') + extra).strip()
                    touched = True; stats['3_label'] += 1
                    bump_files.add(p)
                    log['3_label'].append(f'{slug} :: "{label}" -> "{new_label}" | help+= "{extra}"')
                else:
                    stats['3_no_acortable'] += 1
                    log['3_no_acortable'].append(f'{slug} ({len(label)}) :: {label}')

            # --- item 4 ---
            if (slug in top100 or slug.replace('calculadora-', '') in top100) and ftype in (None, 'number') \
               and not f.get('help') and not f.get('unit') and not f.get('suffix') and not f.get('prefix'):
                h = gen_help(label, d)
                if h:
                    f['help'] = h; touched = True; stats['4_help'] += 1
                    bump_files.add(p)
                    log['4_help'].append(f'{slug} :: {label} -> "{h}"')
                else:
                    stats['4_skip'] += 1
                    log['4_skip'].append(f'{slug} :: {label}')

        # --- item 5 ---
        if p in adv_targets:
            marked = mark_advanced(fields)
            if marked:
                touched = True; stats['5_calcs'] += 1; stats['5_fields'] += len(marked)
                log['5_advanced'].append(f'{slug} :: advanced -> {marked} (visibles {len(fields)-len([f for f in fields if f.get("advanced")])})')

        if touched:
            changed_files[p] = d

    # bump lastReviewed solo items 3-4
    for p in bump_files:
        if p in changed_files:
            changed_files[p]['lastReviewed'] = TODAY

    # salida
    for section in ('1_max100', '1_max1000', '1_excluidos', '1_sin_clasificar', '2_step', '3_label', '3_no_acortable', '4_help', '4_skip', '5_advanced', 'errores'):
        items = log[section]
        print(f'\n=== {section} ({len(items)}) ===')
        for it in items[:400]:
            print('  ', it)

    print('\n=== RESUMEN ===')
    for k, v in sorted(stats.items()):
        print(f'  {k}: {v}')
    print(f'  archivos a modificar: {len(changed_files)} (bump lastReviewed: {len(bump_files & set(changed_files))})')

    if APPLY:
        for p, d in changed_files.items():
            with open(p, 'w', encoding='utf-8') as fh:
                json.dump(d, fh, ensure_ascii=False, indent=2)
                fh.write('\n')
        print(f'\nAPLICADO: {len(changed_files)} archivos escritos.')
    else:
        print('\nDRY-RUN (usa --apply para escribir).')


UNIT_LIKE = re.compile(r'^(\$|€|%|R\$|Bs\.?|COP|ARS|USD|UYU|CLP|MXN|PEN|RD\$|S/\.?|Gs\.?|mg/dL|kg|km|m2|m²|Ah|W|kWh|Hz|hs|€/ECTS|en \$|en €|- ?\$|– ?COP)$', re.I)
SEPS = [' — ', ' – ', ': ', '; ', ', ', ' - ']

def _trailing_paren(s):
    """Devuelve (prefijo, contenido) si s termina en grupo balanceado (...)."""
    s = s.rstrip()
    if not s.endswith(')'): return None
    depth = 0
    for i in range(len(s) - 1, -1, -1):
        if s[i] == ')': depth += 1
        elif s[i] == '(':
            depth -= 1
            if depth == 0:
                return s[:i].rstrip(' ,;:—–-'), s[i + 1:-1].strip()
    return None

def _top_level_split(s, maxlen):
    """Mejor corte en separador a profundidad 0 con head<=maxlen."""
    best = None
    depth = 0
    for i, ch in enumerate(s):
        if ch == '(': depth += 1
        elif ch == ')': depth = max(0, depth - 1)
        if depth: continue
        for sep in SEPS:
            if s[i:i + len(sep)] == sep:
                head = s[:i].strip()
                tail = s[i + len(sep):].strip()
                if 12 <= len(head) <= maxlen and len(tail) >= 6:
                    if best is None or len(head) > len(best[0]):
                        best = (head, tail)
    return best

QUESTIONNAIRE_SLUGS = {
    'calculadora-nivel-introversion-extraversion', 'calculadora-nivel-estres-percibido',
    'postpartum-depression-screening', 'dieta-mediterranea-adherencia-score-test',
}

def shorten_label(label):
    """Devuelve (nuevo_label, texto_a_help) o (None, None)."""
    if re.match(r'^in the past', label, re.I):  # cuestionarios tipo EPDS: no tocar
        return None, None
    work = label.strip()
    moved = []
    unit = ''
    for _ in range(4):
        if len(work) + (len(unit) + 1 if unit else 0) <= 60:
            break
        tp = _trailing_paren(work)
        if tp and UNIT_LIKE.match(tp[1]):
            if not unit:
                unit = '(' + tp[1] + ')'
            work = tp[0]
            continue
        if tp and len(tp[0]) >= 12:
            moved.insert(0, tp[1])
            work = tp[0]
            continue
        # parentesis intermedio largo
        m = re.match(r'^(.{12,}?)\s*\(([^()]{10,})\)\s*(.+)$', work)
        if m and len(m.group(1) + ' ' + m.group(3)) <= 60:
            moved.insert(0, m.group(2).strip())
            work = (m.group(1).strip() + ' ' + m.group(3).strip()).strip()
            continue
        sp = _top_level_split(work, 60 - (len(unit) + 1 if unit else 0))
        if sp:
            # guard: no vaciar la semantica principal en help
            if len(sp[1]) > len(sp[0]) * 2.5 and '(' not in label:
                return None, None
            work, tail = sp
            moved.insert(0, tail)
            continue
        return None, None
    new_label = (work + (' ' + unit if unit else '')).strip()
    new_label = re.sub(r'\s+([?!.:])', r'\1', new_label)
    extra = '; '.join(m.strip(' .;') for m in moved if m.strip(' .;'))
    if not extra or not (12 <= len(new_label) <= 60):
        return None, None
    return new_label, cap(extra)

def cap(s):
    s = s.strip().rstrip('.…')
    return (s[0].upper() + s[1:] + '.') if s else s

def mark_advanced(fields):
    """Marca advanced en secundarios (default presente, no required o con default seguro),
    preservando >=3 visibles y sin tocar los 3 primeros."""
    marked = []
    visible = [f for f in fields if not f.get('advanced')]
    for i, f in enumerate(fields):
        if i < 3 or f.get('advanced'):
            continue
        has_default = 'default' in f and f['default'] not in (None, '')
        secondary = has_default and (not f.get('required') or f.get('type') in ('select', 'checkbox', 'toggle'))
        if secondary and (len(visible) - len(marked) - 1) >= 3:
            f['advanced'] = True
            marked.append(f.get('id', f.get('label', '?')))
    return marked

if __name__ == '__main__':
    main()
