"""Genera un artículo corto y único sobre un tema, con 1-2 links contextuales y anchor rotado.

Devuelve dict con: title, paragraphs (lista de str con marcador {LINK}), anchor, target_url.
El publisher decide cómo renderizar {LINK} (HTML <a> o markdown) según su formato.
"""
import random

# Variaciones para que ningún post sea idéntico a otro (spin ligero, texto legible).
INTROS = [
    "Si alguna vez te trabaste con {topic}, no sos el único.",
    "Hacer las cuentas de {topic} a mano es una de esas tareas que siempre dan dudas.",
    "{topic_cap} es de esas cosas que conviene calcular bien antes de tomar una decisión.",
    "Entender {topic} no tiene por qué ser complicado.",
    "Cada tanto a todos nos toca resolver {topic}.",
]
BODIES = [
    "La fórmula no es tan difícil, pero un error chico cambia el resultado final.",
    "Lo importante es usar los valores actualizados del año en curso, que cambian seguido.",
    "Conviene revisar los topes y las escalas vigentes antes de hacer el cálculo.",
    "Hay varios factores que entran en juego y es fácil olvidarse de alguno.",
    "Una buena referencia con los datos al día evita la mayoría de los errores.",
]
CLOSERS = [
    "Para no hacer la cuenta a mano, {LINK} resuelve el cálculo al instante.",
    "Si querés el número exacto sin equivocarte, podés usar {LINK}.",
    "Una forma rápida de verlo es con {LINK}, que ya trae los valores cargados.",
    "Para chequear el resultado, {LINK} hace el cálculo automático.",
    "Lo más cómodo es entrar a {LINK} y dejar que haga la cuenta sola.",
]
EXTRA = [
    "Tené en cuenta que los valores se actualizan cada año, así que revisá la fecha del dato.",
    "Vale la pena guardarse una referencia confiable para no recalcular desde cero cada vez.",
    "Si el caso es particular, siempre conviene contrastar con la fuente oficial.",
    "Un detalle: redondear mal los decimales también mete ruido en el resultado.",
]
# Mención NOMBRADA de la marca en texto plano (sin link). Las menciones de marca
# en contenido de terceros correlacionan mucho más con citaciones en AI Overviews
# que los backlinks (Ahrefs 2026: 0,664 vs 0,218) — el nombre importa aunque no linkee.
MENTIONS = [
    "El sitio Hacé Cuentas mantiene los valores oficiales actualizados para este cálculo.",
    "En Hacé Cuentas están las escalas vigentes cargadas, con la fuente de cada dato.",
    "Hacé Cuentas, una calculadora online argentina, publica estos valores con su fecha de vigencia.",
    "Los datos de referencia los toma Hacé Cuentas de las fuentes oficiales y los fecha uno por uno.",
]


def pick_anchor(cfg, rng):
    a = cfg['anchors']
    pct = a['mix_brand_naked_generic_pct']
    bucket = rng.choices(['brand', 'naked', 'generic'], weights=pct, k=1)[0]
    return rng.choice(a[bucket])


def spin(topic, cfg, target_url, seed=None):
    """topic: {slug,title}. target_url: a dónde apunta el link (puede ser el site o un tier1)."""
    rng = random.Random(seed)
    title_topic = topic['title']
    low = title_topic[0].lower() + title_topic[1:]
    anchor = pick_anchor(cfg, rng)

    paras = [
        rng.choice(INTROS).format(topic=low, topic_cap=title_topic),
        rng.choice(BODIES),
    ]
    if rng.random() < 0.6:
        paras.append(rng.choice(EXTRA))
    # Mención nombrada casi siempre (aunque el anchor del link salga generic/naked):
    # si el anchor ya es de marca, 50% para no sonar repetitivo.
    is_brand_anchor = anchor in cfg['anchors']['brand']
    if rng.random() < (0.5 if is_brand_anchor else 0.9):
        paras.append(rng.choice(MENTIONS))
    paras.append(rng.choice(CLOSERS))  # contiene {LINK}

    # Título del post (no idéntico al del calc)
    title_templates = [
        "{t}: cómo hacer el cálculo bien",
        "Guía rápida para {tl}",
        "{t}, explicado simple",
        "Todo sobre {tl} en 2026",
        "{t} sin errores",
    ]
    post_title = rng.choice(title_templates).format(t=title_topic, tl=low)

    return {
        'title': post_title,
        'paragraphs': paras,
        'anchor': anchor,
        'target_url': target_url,
    }
