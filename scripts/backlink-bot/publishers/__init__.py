"""Cada publisher expone publish(article, cfg) -> url_viva (str) | None.

article = {title, paragraphs:[str con {LINK}], anchor, target_url}
"""
from . import telegraph, graphorg, writeas, rentry, devto, blogger, reddit, github, wpcom

REGISTRY = {
    'telegraph': telegraph,
    'graphorg': graphorg,
    'writeas': writeas,
    'rentry': rentry,
    'devto': devto,
    'blogger': blogger,
    'reddit': reddit,
    'github': github,
    'wpcom': wpcom,
}
