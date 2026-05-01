#!/usr/bin/env python3
"""
Reddit monitor — detecta threads en subreddits AR donde una calc de
hacecuentas.com sería la respuesta. No postea; genera un archivo MD
con drafts pre-redactados que Martin copia-pegá en 5 min/día.

Estrategia ganadora 2026 (sandbox workaround):
  1. La gente busca query en Google ("cómo se calcula aguinaldo")
  2. Reddit threads aparecen TOP 3 en Google (Reddit DA 91)
  3. El comentario de Martin con link a la calc está en el thread
  4. Click → tu calc → tráfico calificado sin sandbox

Uso:
  python3 scripts/reddit-monitor.py                  # last 24h, default subreddits
  python3 scripts/reddit-monitor.py --hours 48
  python3 scripts/reddit-monitor.py --out docs/reddit-queue.md

Requirements:
  Reddit JSON API es público (no requiere auth para read).
  Endpoint: https://www.reddit.com/r/{sub}/new.json?limit=100
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import time
from datetime import datetime, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Subreddits de Argentina y finanzas LATAM (ranked por relevancia)
SUBREDDITS = [
    'argentina',
    'AskArgentina',
    'merval',          # finanzas/inversión AR
    'finanzasargentina',
    'argentinos',
    'devargentina',    # devs AR (calc relevantes)
    'argentinaPyme',   # PyMEs (Monotributo, IIBB)
]

# Keywords → calc URL match (PATTERNS ESTRICTOS)
# Cada pattern requiere keyword DEDICADA + contexto financiero/calculable
KEYWORD_MAP = {
    # Sueldo & salario — requiere número o contexto laboral específico
    r'\b(sueldo|salario)\b.{0,40}\b(neto|bruto|mano|calcular|cu[aá]nto|liquidaci[oó]n|recib[oa])\b': {
        'calc': 'https://hacecuentas.com/sueldo-en-mano-argentina',
        'topic': 'sueldo neto/bruto',
    },
    r'\b(aguinaldo|\bsac\b|medio aguinaldo)\b': {
        'calc': 'https://hacecuentas.com/calculadora-aguinaldo-sac',
        'topic': 'aguinaldo SAC',
    },
    r'\b(indemnizaci[oó]n|despido sin causa|liquidaci[oó]n final|art\.?\s*245)\b': {
        'calc': 'https://hacecuentas.com/calculadora-indemnizacion-despido',
        'topic': 'indemnización despido',
    },
    r'\b(d[ií]as.*vacaciones|vacaciones.*d[ií]as|antigüedad.*vacaciones)\b': {
        'calc': 'https://hacecuentas.com/calculadora-dias-vacaciones-ley',
        'topic': 'días vacaciones',
    },
    # Impuestos
    r'\b(monotribut|recategorizaci[oó]n|categor[ií]a [a-k]\b)\b': {
        'calc': 'https://hacecuentas.com/calculadora-monotributo-2026',
        'topic': 'Monotributo',
    },
    r'\b(impuesto.*ganancias|ganancias.*sueldo|ganancias.*4ta|escala ganancias|MNI ganancias)\b': {
        'calc': 'https://hacecuentas.com/calculadora-ganancias-empleados-4ta-categoria-2026',
        'topic': 'Impuesto Ganancias',
    },
    r'\b(iibb\b|ingresos brutos|convenio multilateral|al[ií]cuota provincial)\b': {
        'calc': 'https://hacecuentas.com/categoria/impuestos-provinciales',
        'topic': 'IIBB provincial',
    },
    r'\b(bienes personales)\b': {
        'calc': 'https://hacecuentas.com/calculadora-bienes-personales-2026',
        'topic': 'Bienes Personales',
    },
    # Finanzas personales
    r'\b(plazo fijo|TNA|TEA|comparar bancos|mejor tasa)\b': {
        'calc': 'https://hacecuentas.com/comparador-plazo-fijo',
        'topic': 'plazo fijo',
    },
    r'\b(d[oó]lar.*blue|d[oó]lar.*mep|d[oó]lar.*ccl|brecha cambiaria|cotizaci[oó]n d[oó]lar)\b': {
        'calc': 'https://hacecuentas.com/cambio-de-monedas',
        'topic': 'dólar/cambio',
    },
    r'\b(inflaci[oó]n.*\d|ipc.*acumulad|poder.*compra)\b': {
        'calc': 'https://hacecuentas.com/inflacion-argentina',
        'topic': 'inflación',
    },
    r'\b(jubilaci[oó]n|anses.*aportes|aportes.*jubilaci[oó]n|moratoria.*jubila)\b': {
        'calc': 'https://hacecuentas.com/simulador-jubilacion-anses',
        'topic': 'jubilación',
    },
    r'\b(cr[eé]dito.*hipotecario|pr[eé]stamo personal|cuota.*pr[eé]stamo|cft\b|sistema franc[eé]s|amortizaci[oó]n)\b': {
        'calc': 'https://hacecuentas.com/calculadora-cuota-prestamo',
        'topic': 'crédito/préstamo',
    },
    r'\b(uva\b.*plazo|plazo.*uva|ahorro.*uva|vs d[oó]lar)\b': {
        'calc': 'https://hacecuentas.com/calculadora-ahorro-uva-vs-pesos-vs-dolar-12-meses',
        'topic': 'ahorro UVA vs pesos',
    },
    # Salud / personal
    r'\b(imc\b|[íi]ndice masa corporal)\b': {
        'calc': 'https://hacecuentas.com/calculadora-imc',
        'topic': 'IMC',
    },
    r'\b(embarazo.*semanas|fecha.*parto|fpp\b|semanas.*embarazo)\b': {
        'calc': 'https://hacecuentas.com/calculadora-embarazo',
        'topic': 'embarazo / fecha parto',
    },
    # Días / fechas — VERY strict para evitar false positives
    r'\b(d[ií]as.*entre.*fechas|cu[aá]ntos d[ií]as.*entre|d[ií]as h[aá]biles.*entre)\b': {
        'calc': 'https://hacecuentas.com/dias-entre-dos-fechas',
        'topic': 'días entre fechas',
    },
}

# Threads conversacionales/opinion que siempre skipear (no son calculable queries)
CONVERSATIONAL_PATTERNS = [
    r'\b(opinan|opinion|piensan|hablar|charlar|debate|discusi[oó]n)\b',
    r'\b(qu[eé] opinan|que piensan|qu[eé] hac[eé]n|c[oó]mo viven)\b',
    r'\b(rant|venteo|cag[oa]da|bardo|quilombo)\b',
    r'\b(re lindo|hermoso|bizarro|gracioso|hilarante)\b',
    r'^\?+$',  # solo preguntas de signo
]

# Threads claramente NO financieros aunque matcheen alguna keyword
NON_FINANCIAL_PATTERNS = [
    r'\b(novia|novio|amor|relaci[oó]n|pareja|cita|tinder|sex)\b',
    r'\b(droga|alcohol|fumar|marihuana|cocaina|fap)\b',
    r'\b(serie|pelicula|netflix|amazon|gaming)\b',
    r'\b(comida|receta|asado|milanesa|pizza|caf[eé])\b',
    r'\b(perro|gato|mascota|cachorro)\b',
    r'\b(viaje|vacacion(?!.*d[ií]as)|turismo|playa|monta[ñn]a)\b',
    r'\b(meme|chiste|joda|broma)\b',
]

# Skip patterns (threads que no queremos)
SKIP_PATTERNS = [
    r'\[politica\]',
    r'\[shitpost\]',
    r'\[meme\]',
    r'porn',
    r'fap',
]


def fetch_subreddit(sub: str, hours: int = 24, limit: int = 100) -> list[dict]:
    """Fetch latest posts from a subreddit. Returns list of post dicts."""
    url = f'https://www.reddit.com/r/{sub}/new.json?limit={limit}'
    try:
        result = subprocess.run(
            [
                'curl', '-s',
                '-H', 'User-Agent: hacecuentas-monitor/1.0 (research)',
                '-H', 'Accept: application/json',
                '--max-time', '30',
                url,
            ],
            capture_output=True, text=True, timeout=35,
        )
        if result.returncode != 0:
            return []
        data = json.loads(result.stdout)
        posts = data.get('data', {}).get('children', [])
        cutoff = (datetime.now() - timedelta(hours=hours)).timestamp()
        recent = [p['data'] for p in posts if p.get('data', {}).get('created_utc', 0) >= cutoff]
        return recent
    except Exception as e:
        sys.stderr.write(f'⚠️  Error fetching r/{sub}: {e}\n')
        return []


def matches_keywords(text: str) -> list[dict]:
    """Devuelve list de matches (topic + calc) si el texto contiene keywords FINANCIERAS."""
    matches = []
    text_lower = text.lower()
    for pattern, info in KEYWORD_MAP.items():
        if re.search(pattern, text_lower, re.IGNORECASE):
            matches.append(info)
    return matches


def is_conversational(text: str) -> bool:
    """¿Es un thread opinion/charla, sin pregunta calculable?"""
    text_lower = text.lower()
    return any(re.search(p, text_lower, re.IGNORECASE) for p in CONVERSATIONAL_PATTERNS)


def is_non_financial(text: str) -> bool:
    """¿Es un thread sobre temas NO calculables (relaciones, comida, etc.)?"""
    text_lower = text.lower()
    return any(re.search(p, text_lower, re.IGNORECASE) for p in NON_FINANCIAL_PATTERNS)


def should_skip(text: str) -> bool:
    text_lower = text.lower()
    if any(re.search(p, text_lower) for p in SKIP_PATTERNS):
        return True
    # Skip threads sin sustancia calculable
    if is_conversational(text) or is_non_financial(text):
        return True
    return False


def has_question_signal(post: dict) -> bool:
    """Bonus: el post hace una pregunta concreta que podría tener tu calc como answer.

    Indicators:
    - Title con '¿' o '?'
    - Contiene 'cómo', 'cuánto', 'cuándo', 'qué'
    - Tiene flair tipo 'pregunta', 'consulta', 'duda'
    """
    title = post.get('title', '').lower()
    selftext = post.get('selftext', '').lower()
    flair = (post.get('link_flair_text', '') or '').lower()

    if any(x in title for x in ['?', '¿', 'cómo', 'cuánto', 'cuántos', 'cuántas', 'cuándo', 'qué', 'como ', 'cuanto']):
        return True
    if any(x in flair for x in ['pregunta', 'consulta', 'duda', 'ayuda', 'finanzas', 'impuestos']):
        return True
    if 'help' in flair or 'question' in flair:
        return True
    return False


def score_thread(post: dict, matches: list[dict]) -> int:
    """Score: combo de relevancia + popularidad + recencia + question signal."""
    score = 0
    # Más matches = más relevante
    score += len(matches) * 30
    # Upvotes
    score += min(post.get('score', 0), 100)
    # Comments (discusión = engagement)
    score += min(post.get('num_comments', 0), 50)
    # Question signal (boost si es pregunta concreta)
    if has_question_signal(post):
        score += 50
    # Recencia (boost si <12h)
    age_hours = (datetime.now().timestamp() - post.get('created_utc', 0)) / 3600
    if age_hours < 6:
        score += 30
    elif age_hours < 12:
        score += 15
    # Penalty si es muy viejo
    if age_hours > 36:
        score -= 20
    return score


def build_draft(post: dict, matches: list[dict]) -> str:
    """Genera comentario pre-redactado para el thread."""
    primary = matches[0]  # primer match es el más prominente
    topic = primary['topic']
    calc = primary['calc']

    title = post.get('title', '')

    # Templates por topic — adapta tono según query
    templates = {
        'sueldo neto/bruto': f"""Para sacar el neto desde el bruto te conviene calcularlo con todos los descuentos vigentes 2026 (jubilación 11%, obra social 3%, ley 19.032 3%, ganancias si aplica). Yo armé esta calc que tiene los valores oficiales de AFIP actualizados: {calc}

Ojo con Ganancias 4ta categoría — la escala se actualizó en {datetime.now().strftime('%B %Y')} y el MNI cambió. Si querés te paso también la calc específica de Ganancias para que veas si te aplica.""",

        'aguinaldo SAC': f"""Aguinaldo (SAC) = mejor sueldo del semestre / 2. Para 2026:
- 1ra cuota: paga hasta el 4 de junio (en realidad se paga normalmente fin de mayo / primeros días junio)
- 2da cuota: hasta el 18 de diciembre

Ojo: en junio se descuenta Ganancias sobre la suma sueldo+aguinaldo, te puede impactar más que en mes normal.

Si querés ver el número exacto: {calc}""",

        'indemnización despido': f"""La indemnización por despido sin causa (LCT art 245) es 1 sueldo por año trabajado o fracción >3 meses, tomando el mejor sueldo de los últimos 12 meses (con tope CCT).

A eso le sumás:
- Preaviso (1 o 2 meses según antigüedad)
- Integración mes despido
- SAC proporcional + vacaciones no gozadas

Yo armé esta calc que te calcula todo junto con los datos vigentes 2026: {calc}""",

        'Monotributo': f"""Para Monotributo 2026 conviene calcular:
- Categoría según facturación últimos 12 meses (la escala cambió)
- Monto total: impuesto integrado + componente jubilatorio + obra social
- Si superás los topes de la cat F → recategorización obligatoria

Acá te calcula la categoría que te corresponde con los topes vigentes: {calc}""",

        'Impuesto Ganancias': f"""Para Ganancias 4ta categoría 2026, la escala está en:
- MNI (mínimo no imponible): se actualizó por inflación
- Tramos: 5% / 9% / 12% / 15% / 19% / 23% / 27% / 31% / 35%
- Deducciones especiales: cónyuge, hijos, gastos médicos, alquiler (40%), prepaga, etc.

Yo armé esta calc con la escala progresiva real (no la simplificada), con los valores 2026: {calc}""",

        'IIBB provincial': f"""IIBB depende de tu provincia y actividad. Cada jurisdicción tiene sus propias alícuotas (CABA típica 3-5%, Bs As 4-5%, etc.) y mínimos.

Si convenís múltiples jurisdicciones aplica Convenio Multilateral.

Yo tengo todas las provincias con alícuotas vigentes: {calc}""",

        'Bienes Personales': f"""Bienes Personales 2026:
- MNI: subió por la última actualización
- Inmuebles: se computa valor fiscal (no inmobiliario) o avaluación con descuento por casa habitación
- Vehículos: tabla AFIP
- Plazos fijos / acciones / cripto: cotización al 31/12

Acá te calcula el monto a pagar con la escala 2026: {calc}""",

        'plazo fijo': f"""Para plazo fijo conviene comparar:
- Tasa nominal anual (TNA) — lo que publica el banco
- Tasa efectiva mensual (TEM) — la real que ganás
- Tasa efectiva anual (TEA) — comparable entre productos

Acá tenés un comparador de bancos AR actualizado a hoy: {calc}""",

        'dólar/cambio': f"""Hoy las cotizaciones (BCRA + DolarApi) están así:
- Dólar oficial: ~$X
- Blue: ~$X (brecha ~Y%)
- MEP: ~$X
- CCL: ~$X

Acá las tenés actualizadas en tiempo real con conversor: {calc}""",

        'inflación': f"""Para calcular el poder de compra desde fecha X a fecha Y conviene usar el IPC del INDEC (es la fuente oficial).

Acá tenés la herramienta con datos actualizados al último mes publicado: {calc}""",

        'jubilación': f"""Para estimar tu jubilación ANSES tenés que considerar:
- Edad (60 mujer, 65 hombre — moratoria con condiciones)
- Aportes (mínimo 30 años con aportes, hay regímenes especiales)
- Mejor sueldo últimos 10 años (para PBU + PC)

Acá te calcula el monto estimado: {calc}""",

        'crédito/préstamo': f"""Para comparar préstamos conviene mirar:
- CFT (no la TNA) — incluye gastos, seguros, IVA
- Sistema de amortización (francés vs alemán cambia mucho la cuota)
- Plazo total (a más plazo, más interés total)

Acá te calcula la cuota y total a pagar con CFT: {calc}""",

        'ahorro UVA vs pesos': f"""Históricamente UVA gana cuando hay alta inflación, plazo fijo gana en periodos de tasas reales positivas.

Para 12 meses conviene comparar:
- Plazo fijo tradicional (TNA actual ~X%)
- Plazo fijo UVA (UVA + 1%)
- Dólar (subió ~X% últimos 12m)

Acá te lo simula: {calc}""",

        'IMC': f"""IMC = peso (kg) / altura (m)². Categorías OMS:
- <18.5: bajo peso
- 18.5-24.9: normal
- 25-29.9: sobrepeso
- 30+: obesidad (grado I/II/III)

Es referencial, no aplica a deportistas con mucha masa muscular. Acá lo calculás: {calc}""",

        'embarazo / fecha parto': f"""La FPP (fecha probable de parto) se calcula con la regla de Naegele desde el primer día de la última menstruación + 280 días.

Si tu ciclo no es de 28 días hay que ajustar. También se puede ajustar con ecografía precoz.

Acá te calcula semanas + FPP: {calc}""",

        'días entre fechas': f"""Para días entre 2 fechas (incluye opciones de "días corridos" vs "días hábiles" excluyendo feriados AR): {calc}""",
    }

    body = templates.get(topic, f"""Para esto te puede servir esta calc: {calc}""")
    return body.strip()


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--hours', type=int, default=24, help='Window de búsqueda (horas)')
    p.add_argument('--out', default=None, help='Output MD path (default: docs/reddit-queue-YYYYMMDD.md)')
    p.add_argument('--limit', type=int, default=10, help='Top N threads a generar drafts')
    args = p.parse_args()

    if not args.out:
        args.out = str(ROOT / 'docs' / f'reddit-queue-{datetime.now().strftime("%Y-%m-%d")}.md')

    print(f'🔍 Reddit monitor — last {args.hours}h, top {args.limit}\n')

    candidates = []
    for sub in SUBREDDITS:
        print(f'  Fetching r/{sub}...')
        posts = fetch_subreddit(sub, hours=args.hours)
        for post in posts:
            title = post.get('title', '')
            selftext = post.get('selftext', '')
            full_text = f'{title}\n{selftext}'

            if should_skip(full_text):
                continue

            matches = matches_keywords(full_text)
            if not matches:
                continue

            # Require question signal — sino es probablemente off-topic
            if not has_question_signal(post):
                continue

            score = score_thread(post, matches)
            candidates.append({
                'sub': sub,
                'title': title,
                'permalink': f'https://reddit.com{post.get("permalink", "")}',
                'score': post.get('score', 0),
                'comments': post.get('num_comments', 0),
                'created_hours_ago': round((datetime.now().timestamp() - post.get('created_utc', 0)) / 3600, 1),
                'matches': matches,
                'rank_score': score,
                'snippet': (selftext[:300] + '...') if len(selftext) > 300 else selftext,
                'draft': build_draft(post, matches),
            })

        time.sleep(2)  # rate limit Reddit

    # Order por score
    candidates.sort(key=lambda c: c['rank_score'], reverse=True)
    top = candidates[:args.limit]

    print(f'\n📋 {len(candidates)} threads relevantes encontrados, top {len(top)}\n')

    # Write MD output
    out = []
    out.append(f'# Reddit queue — {datetime.now().strftime("%Y-%m-%d %H:%M")} ART')
    out.append('')
    out.append(f'Threads detectados en últimas {args.hours}h con queries que matchean tus calcs.')
    out.append('Copia-pegá el draft en el thread (5-10 min total).')
    out.append('')
    out.append('**Reglas para ganar en Reddit:**')
    out.append('- 80% del comentario = respuesta útil; el link viene al final, casual')
    out.append('- NUNCA arrancar con el link')
    out.append('- Si el thread tiene >24h, tu comment va a tener menos visibilidad')
    out.append('- Hablá como humano, no como copy paste')
    out.append('- Si se repite el thread, mandá el comment 1 vez sola')
    out.append('')
    out.append('---')
    out.append('')

    for i, c in enumerate(top, 1):
        out.append(f'## {i}. r/{c["sub"]} — {c["title"][:80]}')
        out.append('')
        out.append(f'**Link**: {c["permalink"]}')
        out.append(f'**Score**: {c["score"]} upvotes, {c["comments"]} comments, {c["created_hours_ago"]}h ago')
        out.append(f'**Match**: {", ".join(m["topic"] for m in c["matches"])}')
        out.append('')
        if c.get('snippet'):
            out.append('**Contexto del post:**')
            out.append('')
            out.append(f'> {c["snippet"]}')
            out.append('')
        out.append('**Draft del comentario** (revisalo antes de pegar — adaptalo al contexto del thread):')
        out.append('')
        out.append('```')
        out.append(c['draft'])
        out.append('```')
        out.append('')
        out.append('---')
        out.append('')

    if not top:
        out.append('⚠️  No se encontraron threads relevantes en el window. Volvé mañana.')

    Path(args.out).parent.mkdir(parents=True, exist_ok=True)
    Path(args.out).write_text('\n'.join(out))
    print(f'✅ Escrito: {args.out}')
    print()
    print('Top 3 threads:')
    for i, c in enumerate(top[:3], 1):
        print(f'  {i}. r/{c["sub"]}: {c["title"][:70]}')


if __name__ == '__main__':
    main()
