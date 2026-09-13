#!/usr/bin/env python3
"""Check every sitemap landing in the built HTML before publishing to Bing."""
import json, sys, re
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
from xml.etree import ElementTree as ET
from datetime import datetime, timezone

class Parser(HTMLParser):
 def __init__(self):super().__init__();self.title='';self.h1=[];self.canonical=[];self.robots=[];self.description=[];self.links=[];self.intitle=False;self.inh1=False;self.schemas=[];self.schema=None;self.missingalt=0
 def handle_starttag(self,t,a):
  a=dict(a)
  if t=='title':self.intitle=True
  if t=='h1':self.inh1=True;self.h1.append('')
  if t=='link' and a.get('rel')=='canonical':self.canonical.append(a.get('href'))
  if t=='meta' and a.get('name','').lower() in ['robots','bingbot']:self.robots.append(a.get('content',''))
  if t=='meta' and a.get('name')=='description':self.description.append(a.get('content'))
  if t=='a' and a.get('href'):self.links.append(a['href'])
  if t=='img' and 'alt' not in a:self.missingalt+=1
  if t=='script' and a.get('type')=='application/ld+json':self.schema=''
 def handle_endtag(self,t):
  if t=='title':self.intitle=False
  if t=='h1':self.inh1=False
  if t=='script' and self.schema is not None:self.schemas.append(self.schema);self.schema=None
 def handle_data(self,d):
  if self.intitle:self.title+=d
  if self.inh1:self.h1[-1]+=d
  if self.schema is not None:self.schema+=d

def audit(root):
 ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
 site = 'https://hacecuentas.com'
 index = ET.parse(root / 'sitemap.xml')
 refs = [e.text for e in index.findall('.//s:loc', ns)]
 urls = set(); failures = []; titles = {}; deferred = []
 for ref in refs + [site + '/sitemap-fresh.xml']:
  parsed = urlsplit(ref)
  if parsed.netloc != 'hacecuentas.com':
   failures.append(f'foreign sitemap: {ref}'); continue
  feed = ET.parse(root / parsed.path.lstrip('/'))
  for entry in feed.findall('s:url', ns):
   url = entry.findtext('s:loc', namespaces=ns)
   if not url or not url.startswith(site + '/'):
    failures.append(f'invalid URL: {url}'); continue
   urls.add(url)
   date = entry.findtext('s:lastmod', namespaces=ns)
   if date:
    try:
     parsed_date = datetime.fromisoformat(date.replace('Z', '+00:00')).date()
     if parsed_date > datetime.now(timezone.utc).date(): failures.append(f'future lastmod: {url}')
    except ValueError: failures.append(f'invalid lastmod: {url}')
 for url in sorted(urls):
  path = unquote(urlsplit(url).path).strip('/')
  candidates = [root / path / 'index.html', root / (path + '.html')]
  file = next((p for p in candidates if p.is_file()), None)
  if file is None:
   source = Path('src/pages') / (path + '.astro')
   if source.is_file() and re.search(r'export\s+const\s+prerender\s*=\s*false', source.read_text()):
    deferred.append(url); continue
   failures.append(f'HTML missing: {url}'); continue
  p = Parser(); p.feed(file.read_text())
  if p.canonical != [url]: failures.append(f'canonical mismatch: {url}: {p.canonical}')
  if any('noindex' in v.lower() for v in p.robots): failures.append(f'noindex in sitemap: {url}')
  if not p.title.strip(): failures.append(f'missing title: {url}')
  if len(p.h1) != 1 or not p.h1[0].strip(): failures.append(f'invalid H1: {url}')
  if not p.description or not p.description[0].strip(): failures.append(f'missing description: {url}')
  if p.title in titles: failures.append(f'duplicate title: {url} and {titles[p.title]}')
  titles[p.title] = url
  for schema in p.schemas:
   try: json.loads(schema)
   except ValueError: failures.append(f'invalid JSON-LD: {url}')
 key = '00e48c587b06495db41032c4797d9d39'
 if not (root / (key + '.txt')).is_file() or (root / (key + '.txt')).read_text().strip() != key:
  failures.append('IndexNow verification file missing or invalid')
 return {'urls': len(urls), 'static_checked': len(urls) - len(deferred), 'runtime_urls': deferred, 'failures': failures}

if __name__ == '__main__':
 result = audit(Path(sys.argv[1] if len(sys.argv) > 1 else 'dist/client'))
 print(json.dumps(result, ensure_ascii=False, indent=2))
 sys.exit(bool(result['failures']))
