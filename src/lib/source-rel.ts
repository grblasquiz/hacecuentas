// rel para links de FUENTES externas.
//
// Dofollow SOLO a dominios oficiales/autoritativos (gobierno, organismos
// multilaterales, salud pública, universidades) → señal E-E-A-T para revisores
// (AdSense) y motores: el sitio cita y enlaza fuentes verificables, no es spam.
// El resto de los enlaces externos sigue nofollow (no regalamos link-equity a
// dominios no autoritativos).
//
// Uso:  <a href={s.url} target="_blank" rel={sourceRel(s.url)}>…</a>

// Hosts oficiales exactos o sufijos (organismos, salud, multilaterales).
const OFFICIAL_HOSTS = [
  'who.int', 'paho.org', 'un.org', 'europa.eu', 'oecd.org', 'imf.org',
  'worldbank.org', 'ilo.org', 'fao.org', 'wto.org',
  'acog.org', 'aap.org', 'heart.org', 'diabetes.org',
];

/** ¿El host es un dominio oficial/autoritativo? (gobierno, .edu, organismos) */
export function isOfficialSource(url: string): boolean {
  let host = '';
  try {
    host = new URL(url).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return false;
  }
  if (!host) return false;

  // Gobierno: .gob.ar, gob.mx/cl/pe/es, .gov, gov.uk/br/co, etc.
  if (/(^|\.)gob\.[a-z]{2}$/.test(host)) return true;          // gob.ar, gob.mx, gob.cl…
  if (/(^|\.)gov(\.[a-z]{2})?$/.test(host)) return true;        // .gov, gov.uk, gov.br…
  // Universidades / académico
  if (/(^|\.)edu(\.[a-z]{2})?$/.test(host)) return true;        // .edu, edu.ar…
  if (/(^|\.)ac\.[a-z]{2}$/.test(host)) return true;            // ac.uk, ac.jp…

  // Allowlist explícita de organismos/salud.
  return OFFICIAL_HOSTS.some((h) => host === h || host.endsWith('.' + h));
}

/** rel para un link de fuente: dofollow si es oficial, nofollow si no. */
export function sourceRel(url: string): string {
  return isOfficialSource(url)
    ? 'noopener external'
    : 'noopener nofollow external';
}
