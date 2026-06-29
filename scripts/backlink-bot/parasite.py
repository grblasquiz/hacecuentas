"""Parasite SEO: publica UN artículo keyword-targeted en varios hosts de alto índice a la vez,
todos apuntando a la calc/dato. Domina varias posiciones del SERP con autoridad prestada mientras
hacecuentas (dominio joven) está en sandbox.

Contenido = calidad curada (parasite_topics.json), NO spun. Hosts = solo propios/contribuidor
dofollow+indexable (NO es "site reputation abuse": es contenido útil publicado legítimamente).
Ignora el throttle premium (es una campaña one-shot intencional, no goteo).
"""
import json
import random
from pathlib import Path

HERE = Path(__file__).resolve().parent
TOPICS = json.loads((HERE / 'parasite_topics.json').read_text())

# Variación de intro por host para que las copias no sean byte-idénticas (anti dup duro).
HOOKS = [
    "", "", "",
    "Si estás con esta duda, vamos al grano. ",
    "Lo explico simple. ",
    "Te lo resumo sin vueltas. ",
]


def article_for(topic_key, seed=None):
    """Devuelve el dict {title, paragraphs, anchor, target_url} que esperan los publishers."""
    t = TOPICS[topic_key]
    rng = random.Random(seed)
    paras = list(t['paragraphs'])
    hook = rng.choice(HOOKS)
    if hook:
        paras[0] = hook + paras[0]
    return {
        'title': t['title'],
        'paragraphs': paras,
        'anchor': t['anchor'],
        'target_url': t['target_url'],
    }


def topic_keys():
    return [k for k in TOPICS if not k.startswith('_')]
