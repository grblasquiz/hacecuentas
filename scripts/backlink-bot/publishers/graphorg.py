"""graph.org — mismo motor que Telegraph (Telegram), API en api.graph.org.
Dominio distinto = backlink de referring domain distinto. Reusa la lógica de telegraph.
"""
from pathlib import Path

from . import telegraph as _tg

API = 'https://api.graph.org'
TOKEN_FILE = Path(__file__).resolve().parent.parent / '.graphorg_token'
PLATFORM = 'graphorg'


def publish(article, cfg):
    # Token propio para graph.org (cuenta separada de telegra.ph)
    orig_tp, orig_api = _tg._token_path, _tg._api_base
    _tg._token_path = lambda: TOKEN_FILE
    _tg._api_base = lambda: API
    try:
        return _tg.publish(article, cfg, _base=API)
    finally:
        _tg._token_path, _tg._api_base = orig_tp, orig_api
