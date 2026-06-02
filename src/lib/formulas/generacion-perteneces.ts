export interface Inputs { anioNacimiento: number; }
export interface Outputs { generacion: string; rango: string; caracteristicas: string; mensaje: string; _insight?: any; _chart?: any; }
const GENS:{nombre:string;desde:number;hasta:number;caract:string;ctx:string}[] = [
  {nombre:'Generación Silenciosa',desde:1928,hasta:1945,caract:'Disciplinados, ahorradores, respetuosos de la autoridad. Crecieron en tiempos de guerra y escasez.',ctx:'Vivieron la Segunda Guerra Mundial, la posguerra y los inicios de la TV.'},
  {nombre:'Baby Boomer',desde:1946,hasta:1964,caract:'Idealistas, competitivos, workaholics. La generación del rock, la revolución cultural y el consumo masivo.',ctx:'En Argentina: dictadura militar, Malvinas, vuelta a la democracia en 1983.'},
  {nombre:'Generación X',desde:1965,hasta:1980,caract:'Independientes, escépticos, adaptables. La generación olvidada entre boomers y millennials.',ctx:'En Argentina: hiperinflación, menemismo, convertibilidad 1 a 1, MTV, primera PC.'},
  {nombre:'Millennial (Gen Y)',desde:1981,hasta:1996,caract:'Nativos de internet, idealistas, multitask. Primera generación digital, marcada por las redes sociales.',ctx:'En Argentina: crisis 2001, corralito, kirchnerismo, smartphones, Facebook/Instagram.'},
  {nombre:'Generación Z (Centennial)',desde:1997,hasta:2012,caract:'Nativos del smartphone, pragmáticos, diversos. Crecieron con YouTube, TikTok y redes como extensión de la vida.',ctx:'En Argentina: macrismo, COVID-19, dólar blue, TikTok, educación virtual.'},
  {nombre:'Generación Alpha',desde:2013,hasta:2025,caract:'Nativos de la IA, hiperconectados desde bebés. Hijos de millennials, educados con pantallas desde el día 1.',ctx:'Post-pandemia, inteligencia artificial, educación digital nativa, tablets en el jardín.'},
];
const GEN_COLORS = ['#94a3b8', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
const GEN_COLORS_DARK = ['#cbd5e1', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6'];

function buildChart(anio: number, nombreActual: string) {
  const segments = GENS.map((g, idx) => ({
    nombre: g.nombre,
    // último tramo extendido a 2026 para que el marcador siempre caiga dentro del rango
    max: idx === GENS.length - 1 ? 2026 : g.hasta,
    color: GEN_COLORS[idx],
    colorDark: GEN_COLORS_DARK[idx],
  }));
  return {
    type: 'scale',
    marker: anio,
    markerLabel: `${anio}`,
    min: GENS[0].desde,
    segments,
    ariaLabel: `Línea de tiempo generacional: el año ${anio} corresponde a ${nombreActual}.`,
  };
}

export function generacionPerteneces(i: Inputs): Outputs {
  const anio = Math.round(Number(i.anioNacimiento));
  if (!anio || anio < 1928 || anio > 2026) throw new Error('Ingresá un año entre 1928 y 2026');
  for (const g of GENS) {
    if (anio >= g.desde && anio <= g.hasta) {
      const _insight = {
        title: 'Tu generación',
        text: `Nacido en **${anio}** pertenecés a la **${g.nombre}** (${g.desde}-${g.hasta}). ${g.caract.split('.')[0]}.`,
        tone: 'neutral',
        icon: '🎂',
      };
      return { generacion: g.nombre, rango: `${g.desde}-${g.hasta}`, caracteristicas: g.caract, mensaje: g.ctx, _insight, _chart: buildChart(anio, g.nombre) };
    }
  }
  const _insight = {
    title: 'Tu generación',
    text: `Nacido en **${anio}** estás en el límite de la **Generación Alpha** y la naciente Gen Beta: la primera generación íntegramente post-IA.`,
    tone: 'neutral',
    icon: '🎂',
  };
  return { generacion: 'Gen Beta (probable)', rango: '2025+', caracteristicas: 'Demasiado temprano para definir.', mensaje: 'Primera generación post-IA.', _insight, _chart: buildChart(anio, 'Gen Beta') };
}
