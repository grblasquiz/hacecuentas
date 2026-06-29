#!/usr/bin/env python3
"""Backlink Bot autónomo. Genera, publica e indexa backlinks solo. Sin humano.

Uso:
  python3 bot.py run         # un ciclo (lo que llama el cron)
  python3 bot.py verify      # re-verifica links vivos/caídos
  python3 bot.py report      # estado del pipeline
  python3 bot.py run --dry   # simula sin publicar (test)

Cron sugerido (launchd): correr `run` 1-2x/día. El cap interno limita el volumen.
"""
import argparse
import json
import random
import sys
from datetime import date
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))  # para webreq/db/spinner y publishers/

import db                       # noqa: E402
import spinner                  # noqa: E402
import indexer                  # noqa: E402
import verify as verifier       # noqa: E402
import parasite as parasite_mod  # noqa: E402
from webreq import get_json     # noqa: E402
from publishers import REGISTRY  # noqa: E402

CFG = json.loads((HERE / 'config.json').read_text())


# ---------- caps (velocidad creciente, anti-bandera dominio joven) ----------
def months_since(install_date):
    y, m, d = map(int, install_date.split('-'))
    today = date.today()
    return (today.year - y) * 12 + (today.month - m)


def cap_for(tier):
    c = CFG['caps']
    n = months_since(c['install_date'])
    base = c[f'tier{tier}_per_day_month1']
    val = base * ((1 + c['ramp_pct_per_month'] / 100) ** n)
    ceil = c[f'max_tier{tier}_per_day']
    return min(int(round(val)), ceil)


# ---------- topics (autónomo: baja slugs reales del site) ----------
def load_topics():
    src = CFG['topics_source']
    if src.get('mode') == 'auto':
        status, data = get_json(src['api'], timeout=25)
        topics = []
        if isinstance(data, list):
            for item in data[: src.get('max_from_api', 400)]:
                slug = item.get('s') or item.get('slug') or item.get('url')
                title = item.get('t') or item.get('title') or item.get('name')
                if slug and title:
                    slug = slug if slug.startswith('/') else f'/{slug}'
                    topics.append({'slug': slug, 'title': title})
        if topics:
            return topics
    # fallback
    return CFG['topics_seed']


def site_url(slug):
    base = CFG['site'].rstrip('/')
    return base + (slug if slug.startswith('/') else '/' + slug)


def _days_since_last(c, platform):
    """Días desde el último post (published/verified) en esa plataforma, o None si nunca."""
    row = c.execute(
        "SELECT created_at FROM links WHERE platform=? AND status IN "
        "('published','verified_live') ORDER BY created_at DESC LIMIT 1", (platform,)).fetchone()
    if not row:
        return None
    from datetime import datetime, timezone
    last = datetime.fromisoformat(row['created_at'])
    return (datetime.now(timezone.utc) - last).days


# ---------- ciclo principal ----------
def run_once(dry=False):
    c = db.conn()
    topics = load_topics()
    rng = random.Random()  # no determinista: cada corrida varía
    published_urls = []

    # Plataformas activas: premium (baja frecuencia, directo al site) vs volumen (por tier)
    by_tier = {1: [], 2: []}
    premium = []
    for name, p in CFG['platforms'].items():
        if not isinstance(p, dict) or not (p.get('active') and name in REGISTRY):
            continue
        if p.get('premium'):
            premium.append((name, p))
        else:
            by_tier[p['tier']].append(name)

    # --- premium: 1 post si pasó min_days_between (no spamear cuentas fuertes) ---
    for name, p in premium:
        days = _days_since_last(c, name)
        gate = p.get('min_days_between', 14)
        if days is not None and days < gate:
            print(f'premium {name}: último hace {days}d < {gate}d → skip')
            continue
        topic = rng.choice(topics)
        target = site_url(topic['slug'])
        article = spinner.spin(topic, CFG, target, seed=rng.random())
        if dry:
            print(f'  [dry] premium {name} → {target}')
        else:
            try:
                url = REGISTRY[name].publish(article, CFG)
            except Exception as e:
                url = None
                print(f'  ✗ premium {name} error: {e}')
            st = 'published' if url else 'failed'
            db.record(c, target_url=target, anchor=article['anchor'], platform=name,
                      tier=1, published_url=url, status=st, title=article['title'])
            print(f'  {"✓" if url else "✗"} premium {name} → {url or "no publicó"}')
            if url:
                published_urls.append(url)

    # --- relleno hasta el TARGET DIARIO con Telegraph (volumen barato) ---
    # Las premium (dofollow de valor) ya se postearon arriba y cuentan para el target.
    target_total = CFG.get('daily_target', 10)
    fill = max(0, target_total - db.published_today_total(c))
    # repartir el relleno: ~1 de cada 4 a tier1 (telegra.ph→site), resto tier2 (graph.org→tier1)
    n_t1 = max(1, fill // 4) if fill else 0
    plan = [1] * n_t1 + [2] * (fill - n_t1)
    print(f'relleno Telegraph: target={target_total} ya_hoy={db.published_today_total(c)} '
          f'→ {fill} ({n_t1} tier1 + {fill - n_t1} tier2)')

    for tier in plan:
        plats = list(by_tier[tier])
        if plats:
            rng.shuffle(plats)
        if True:
            platform = plats[0] if plats else None
            if not platform:
                continue
            mod = REGISTRY[platform]

            if tier == 1:
                topic = rng.choice(topics)
                target = site_url(topic['slug'])
            else:
                # tier2 apunta a un tier1 vivo (le pasa jugo); si no hay, bootstrap al site
                t1 = db.live_tier1_urls(c, limit=200)
                topic = rng.choice(topics)
                target = rng.choice(t1) if t1 else site_url(topic['slug'])

            article = spinner.spin(topic, CFG, target, seed=rng.random())

            if dry:
                print(f'  [dry] {platform} tier{tier} → {target} anchor="{article["anchor"]}"')
                continue

            url = None
            try:
                url = mod.publish(article, CFG)
            except Exception as e:
                print(f'  ✗ {platform} error: {e}')

            if url:
                db.record(c, target_url=target, anchor=article['anchor'],
                          platform=platform, tier=tier, published_url=url,
                          status='published', title=article['title'])
                published_urls.append(url)
                print(f'  ✓ {platform} tier{tier} → {url}')
            else:
                db.record(c, target_url=target, anchor=article['anchor'],
                          platform=platform, tier=tier, published_url=None,
                          status='failed', title=article['title'])
                print(f'  ✗ {platform} tier{tier} no publicó')

    # Indexar lo nuevo (hub crawlable, ver indexer.py)
    if published_urls and not dry:
        indexer.index_new(published_urls, c)

    return published_urls


def parasite(topic_key, dry=False):
    """Publica un artículo keyword-targeted en TODOS los hosts parasite a la vez (SERP domination)."""
    c = db.conn()
    hosts = CFG.get('parasite_hosts', ['blogger', 'wpcom', 'github', 'telegraph', 'graphorg'])
    rng = random.Random()
    if topic_key not in parasite_mod.topic_keys():
        print(f'topic desconocido. Disponibles: {parasite_mod.topic_keys()}')
        return []
    t = parasite_mod.TOPICS[topic_key]
    print(f'parasite "{topic_key}" → query: "{t["query"]}" → {t["target_url"]}')
    urls = []
    for host in hosts:
        if host not in REGISTRY:
            continue
        article = parasite_mod.article_for(topic_key, seed=rng.random())
        if dry:
            print(f'  [dry] {host}'); continue
        try:
            url = REGISTRY[host].publish(article, CFG)
        except Exception as e:
            url = None; print(f'  ✗ {host} error: {e}')
        st = 'published' if url else 'failed'
        db.record(c, target_url=t['target_url'], anchor=article['anchor'], platform=host,
                  tier=1, published_url=url, status=st, title=article['title'],
                  note=f'parasite:{topic_key}')
        print(f'  {"✓" if url else "✗"} {host} → {url or "no publicó"}')
        if url:
            urls.append(url)
    if urls and not dry:
        indexer.index_new(urls, c)
    print(f'parasite: {len(urls)} hosts publicados para "{t["query"]}"')
    return urls


def report():
    c = db.conn()
    total = c.execute("SELECT COUNT(*) n FROM links").fetchone()['n']
    by_status = c.execute(
        "SELECT status, COUNT(*) n FROM links GROUP BY status").fetchall()
    by_plat = c.execute(
        "SELECT platform, tier, COUNT(*) n FROM links WHERE status IN "
        "('published','verified_live') GROUP BY platform, tier").fetchall()
    domains = c.execute(
        "SELECT COUNT(DISTINCT platform) n FROM links WHERE status IN "
        "('published','verified_live')").fetchone()['n']
    print(f'== Backlink Bot — reporte ==')
    print(f'links totales: {total} | plataformas activas con links: {domains}')
    print('por estado:', {r['status']: r['n'] for r in by_status})
    print('por plataforma/tier:')
    for r in by_plat:
        print(f'  {r["platform"]} (t{r["tier"]}): {r["n"]}')
    print(f'caps hoy → tier1={cap_for(1)}/día  tier2={cap_for(2)}/día '
          f'(mes {months_since(CFG["caps"]["install_date"])})')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('cmd', choices=['run', 'verify', 'report', 'parasite'])
    ap.add_argument('topic', nargs='?', help='topic key para parasite')
    ap.add_argument('--dry', action='store_true')
    args = ap.parse_args()
    if args.cmd == 'run':
        run_once(dry=args.dry)
    elif args.cmd == 'verify':
        verifier.run()
    elif args.cmd == 'report':
        report()
    elif args.cmd == 'parasite':
        topic = args.topic
        if not topic:
            # auto-rotación: el cron semanal elige el siguiente topic solo
            keys = parasite_mod.topic_keys()
            c = db.conn()
            idx = int(db.kv_get(c, 'parasite_rotate_idx', '0') or '0')
            topic = keys[idx % len(keys)]
            db.kv_set(c, 'parasite_rotate_idx', str(idx + 1))
            print(f'auto-rotate → topic "{topic}"')
        parasite(topic, dry=args.dry)


if __name__ == '__main__':
    main()
