"""Regression checks for published URLs and the organic-search changes."""
from html.parser import HTMLParser
from pathlib import Path
import re
from urllib.parse import urlsplit
from xml.etree import ElementTree

ROOT = Path("dist/client")
ORIGIN = "https://hacecuentas.com"
CANONICAL_RE = re.compile(r'<link\b[^>]*\brel=["\']canonical["\'][^>]*>', re.I)
HREF_RE = re.compile(r'\bhref=["\']([^"\']+)["\']', re.I)
ROBOTS_RE = re.compile(r'<meta\b[^>]*\bname=["\']robots["\'][^>]*>', re.I)

KEY_PAGES = {
    "/": "",
    "/sobre-nosotros": "",
    "/trabajo": "Calculadoras de sueldo y trabajo",
    "/impuestos": "",
    "/finanzas-personales": "",
    "/futbol": "",
    "/metodologia": "",
    "/buscar": "",
    "/impuestos/iva": "Calculadora de IVA en Argentina",
    "/trabajo/sueldo-bruto-y-neto": "Calculadora de sueldo bruto a neto",
    "/trabajo/sueldo-neto-a-bruto": "Calculadora de sueldo neto a bruto en Argentina",
    "/jubilacion/cuanto-voy-a-cobrar": "Calculadora de jubilación ANSES",
    "/alquiler/aumento-de-alquiler": "",
    "/auto/patente": "",
    "/impuestos/bienes-personales": "",
    "/impuestos/comprar-en-el-exterior": "",
    "/impuestos/ingresos-brutos": "",
    "/impuestos/retenciones": "",
    "/calculadora-actualizacion-inflacion-ipc": "",
    "/validar-cbu": "",
    "/es/vivienda/comprar-o-vender-piso": "Impuestos al comprar o vender un piso en España",
}
SSR_FORBIDDEN = (
    "No encontramos herramientas con esa búsqueda",
    "No encontramos una herramienta con esa búsqueda",
    "Cita sugerida",
    "Inventario editorial",
)
RETAINED = (
    "/mx/impuestos/iva", "/co/datos-salario-minimo-colombia-2026",
    "/en", "/futbol", "/salud", "/blog", "/buscar",
)


class Page(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.text = []
        self.headings = []
        self.embed_frames = []
        self.ignored = 0
        self.heading = None
        self.feed(source)

    def handle_starttag(self, tag, attributes):
        if tag in {"script", "style", "template"}:
            self.ignored += 1
        if self.ignored:
            return
        if tag in {"title", "h1", "h2", "h3"}:
            self.heading = (tag, [])
        if tag == "iframe":
            src = dict(attributes).get("src") or ""
            if "hc_embed=1" in src:
                self.embed_frames.append(src)

    def handle_endtag(self, tag):
        if tag in {"script", "style", "template"}:
            self.ignored -= 1
        if self.heading and tag == self.heading[0]:
            self.headings.append((tag, " ".join(" ".join(self.heading[1]).split())))
            self.heading = None

    def handle_data(self, data):
        if not self.ignored:
            self.text.append(data)
            if self.heading:
                self.heading[1].append(data)


def read_page(path):
    relative = path.strip("/")
    candidates = [ROOT / "index.html"] if not relative else [
        ROOT / (relative + ".html"), ROOT / relative / "index.html",
    ]
    return next((candidate.read_text() for candidate in candidates if candidate.is_file()), None)


def canonical(source):
    return [match.group(1) for tag in CANONICAL_RE.findall(source)
            if (match := HREF_RE.search(tag))]


def good_canonical(value):
    url = urlsplit(value)
    return (url.scheme == "https" and url.netloc == "hacecuentas.com"
            and not url.query and not url.fragment
            and (url.path == "/" or not url.path.endswith("/")))


def noindex(source):
    return any("noindex" in tag.lower() for tag in ROBOTS_RE.findall(source))


errors = []
for html in ROOT.rglob("*.html"):
    found = canonical(html.read_text())
    if found and (len(found) != 1 or not good_canonical(found[0])):
        errors.append(f"{html}: canonical inválido {found}")

sitemap_paths = set()
for xml in ROOT.glob("sitemap*.xml"):
    tree = ElementTree.parse(xml)
    if tree.getroot().tag.endswith("urlset"):
        sitemap_paths.update(urlsplit(loc.text).path for loc in tree.findall("./{*}url/{*}loc") if loc.text)

for path in sitemap_paths:
    source = read_page(path)
    if source and (noindex(source) or len(canonical(source)) != 1):
        errors.append(f"{path}: sitemap contiene noindex o carece de canonical único")

references = {
    "/auto/patente": "Dónde consultar la patente según la jurisdicción",
    "/impuestos/bienes-personales": "Mínimos de Bienes Personales para el período fiscal 2025",
    "/impuestos/comprar-en-el-exterior": "Límites para compras personales en el exterior",
    "/impuestos/ingresos-brutos": "Ingresos Brutos por provincia y CABA",
    "/impuestos/retenciones": "Qué revisar en el Anexo VIII de la RG 830",
    "/calculadora-actualizacion-inflacion-ipc": "Inflación mensual de Argentina en los últimos 12 meses publicados",
}
titles = {}
scale_paths = {path for path in sitemap_paths if path.startswith("/trabajo/escalas/")}
if len(scale_paths) < 6 or "/trabajo/sueldo-neto-a-bruto" not in sitemap_paths:
    errors.append("faltan fichas salariales o sueldo neto a bruto en el sitemap")

for path in set(KEY_PAGES) | set(RETAINED) | scale_paths:
    source = read_page(path)
    if source is None:
        errors.append(f"{path}: falta HTML")
        continue
    if canonical(source) != [ORIGIN + path] or noindex(source):
        errors.append(f"{path}: se esperaba canonical propio e indexable")
    if path not in KEY_PAGES and path not in scale_paths:
        continue

    page = Page(source)
    visible = " ".join(" ".join(page.text).split())
    headline = KEY_PAGES.get(path)
    if headline and not any(headline.casefold() in title.casefold() for tag, title in page.headings if tag == "h1"):
        errors.append(f"{path}: H1 esperado {headline!r}")
    for tag, heading in page.headings:
        if tag in {"title", "h1"} and heading:
            key = (tag, heading.casefold())
            other = titles.setdefault(key, path)
            if other != path:
                errors.append(f"{path}: {tag} duplicado con {other}: {heading}")
    if path in references and not any(heading == references[path] for _, heading in page.headings):
        errors.append(f"{path}: falta la tabla de referencia")
    for phrase in SSR_FORBIDDEN:
        if phrase.casefold() in visible.casefold():
            errors.append(f"{path}: texto de interfaz en HTML {phrase!r}")
    if sum(title.casefold() == "preguntas frecuentes" for _, title in page.headings) > 1:
        errors.append(f"{path}: Preguntas frecuentes duplicadas")
    if page.embed_frames:
        errors.append(f"{path}: iframe de embed activo en el HTML inicial")
    if path in scale_paths and (not re.search(r"<tbody\b", source) or "2026" not in visible):
        errors.append(f"{path}: falta tabla salarial con período")
    if path == "/es/vivienda/comprar-o-vender-piso" and re.search(r"\b(sentá|consultá a un contador)\b", visible, re.I):
        errors.append(f"{path}: aviso regional en voseo")

if errors:
    raise SystemExit("\n".join(errors))
print(f"[seo-audit] PASS: {len(sitemap_paths)} URLs de sitemap y {len(set(KEY_PAGES) | set(RETAINED) | scale_paths)} páginas auditadas")
