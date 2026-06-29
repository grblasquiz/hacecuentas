"""Crawlea las URLs publicadas y confirma que el backlink sigue vivo + dofollow/nofollow."""
import re

from webreq import request
import db


def _host_of(url):
    m = re.match(r'https?://([^/]+)', url or '')
    return m.group(1) if m else (url or '')


def check_url(published_url, target_url):
    """¿La página publicada tiene un <a href> REAL al target + sin noindex?
    Devuelve (alive, dofollow|None). NO da por bueno el host en texto plano (eso no es backlink).
    """
    target_host = _host_of(target_url)
    status, body, headers = request(published_url, method='GET', timeout=20)
    if not status or status >= 400 or not body:
        return False, None
    # noindex = la página no se indexa → el link no vale, lo tratamos como no-backlink
    xrobots = (headers.get('X-Robots-Tag') or '').lower()
    metarobots = ' '.join(re.findall(r'<meta[^>]*robots[^>]*>', body, flags=re.I)).lower()
    if 'noindex' in xrobots or 'noindex' in metarobots:
        return False, None
    # exige <a href> REAL al target (no texto plano)
    for a in re.findall(r'<a\b[^>]*>', body, flags=re.I):
        if target_host and target_host in a:
            rel = re.search(r'rel\s*=\s*["\']([^"\']*)["\']', a, flags=re.I)
            nofollow = bool(rel and 'nofollow' in rel.group(1).lower())
            return True, (not nofollow)
    return False, None


def run(limit=200):
    c = db.conn()
    rows = c.execute(
        "SELECT id, published_url, target_url FROM links WHERE published_url IS NOT NULL "
        "AND status IN ('published','verified_live','dead') ORDER BY created_at DESC LIMIT ?",
        (limit,),
    ).fetchall()
    live = dead = 0
    for r in rows:
        alive, dofollow = check_url(r['published_url'], r['target_url'])
        if alive:
            live += 1
            c.execute(
                "UPDATE links SET status='verified_live', dofollow=?, verified_at=? WHERE id=?",
                (None if dofollow is None else int(dofollow), db.now(), r['id']),
            )
        else:
            dead += 1
            c.execute("UPDATE links SET status='dead', verified_at=? WHERE id=?",
                      (db.now(), r['id']))
    c.commit()
    print(f'verify: live={live} dead={dead} (de {len(rows)} chequeados)')
    return live, dead


if __name__ == '__main__':
    run()
