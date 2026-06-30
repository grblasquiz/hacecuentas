"""Reddit — API OAuth. ⚠️ Links Reddit = NOFOLLOW (cero autoridad SEO; brand/referral only).
⚠️ Reddit = anti-bot agresivo: auto-postear links puede shadowbanear la cuenta (el activo).
Por eso: throttle ALTO (min_days_between grande) + por defecto postea en el PROPIO perfil
(u/usuario), no en subreddits (postear en subs sin permiso = remoción/ban inmediato).

Token: .reddit_token (refresh + client). User-Agent descriptivo OBLIGATORIO (Reddit bloquea UAs genéricos).
"""
import base64
import json
from pathlib import Path

from webreq import request

TOKEN_FILE = Path(__file__).resolve().parent.parent / '.reddit_token'
PLATFORM = 'reddit'


def _ua(cfg):
    return f"web:hacecuentas-guias:1.0 (by /u/{cfg.get('reddit_username','user')})"


def _access_token(cfg):
    if not TOKEN_FILE.exists():
        return None
    t = json.loads(TOKEN_FILE.read_text())
    basic = base64.b64encode(f"{t['client_id']}:{t['client_secret']}".encode()).decode()
    s, b, h = request('https://www.reddit.com/api/v1/access_token', method='POST',
                      form={'grant_type': 'refresh_token', 'refresh_token': t['refresh_token']},
                      headers={'Authorization': 'Basic ' + basic, 'User-Agent': _ua(cfg)})
    try:
        return json.loads(b).get('access_token')
    except Exception:
        return None


def publish(article, cfg):
    token = _access_token(cfg)
    if not token:
        print('  reddit: sin access token (¿corriste oauth_reddit_setup.py?)')
        return None
    user = cfg.get('reddit_username')
    sr = cfg.get('reddit_target') or (f'u_{user}' if user else None)
    if not sr:
        print('  reddit: falta reddit_username/reddit_target en config.json')
        return None
    # self-post: cuerpo útil + link al final (no link-only)
    body = '\n\n'.join(p.replace('{LINK}', f"[{article['anchor']}]({article['target_url']})")
                       for p in article['paragraphs'])
    s, b, h = request('https://oauth.reddit.com/api/submit', method='POST',
                      form={'sr': sr, 'kind': 'self', 'title': article['title'][:300],
                            'text': body, 'api_type': 'json', 'resubmit': 'true'},
                      headers={'Authorization': 'bearer ' + token, 'User-Agent': _ua(cfg)})
    try:
        d = json.loads(b)
        errs = d.get('json', {}).get('errors')
        if errs:
            print(f'  reddit errores: {errs}')
            return None
        url = d.get('json', {}).get('data', {}).get('url')
        if url:
            return url
    except Exception:
        pass
    print(f'  reddit API status={s} body={b[:160]}')
    return None
