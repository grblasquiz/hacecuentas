/**
 * Presupuesto de útiles escolares — régimen Sierra-Amazonía, Ecuador 2026-2027.
 * El año lectivo Sierra-Amazonía 2026-2027 inicia escalonado desde el martes
 * 1 de septiembre de 2026 (Ministerio de Educación).
 * Referencias de prensa/temporada (vigentes a julio 2026): lista fiscal promedio ~$50;
 * regreso a clases completo (útiles + uniformes + mochila) $90-200 por estudiante
 * en fiscal y bastante más en particulares.
 */
import { fmtUSDec } from '../data/ecuador-2026.ts';

export interface Inputs {
  hijos: number;            // cantidad de estudiantes
  nivel?: string;           // 'inicial' | 'basica' | 'superior' | 'bachillerato'
  tipo?: string;            // 'fiscal' | 'particular'
  incluyeUniformes?: string; // 'si' | 'no'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

function num(v: unknown, d: number): number {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

// Costos por estudiante (USD, promedios de temporada Sierra 2026 — orientativos)
// [útiles (lista), uniformes, mochila + lonchera + zapatos]
const COSTOS: Record<string, Record<string, [number, number, number]>> = {
  fiscal: {
    inicial: [35, 45, 40],
    basica: [50, 50, 45],       // EGB elemental y media (lista promedio ~$50)
    superior: [65, 55, 50],     // EGB superior (8vo-10mo)
    bachillerato: [80, 60, 55],
  },
  particular: {
    inicial: [70, 90, 55],
    basica: [110, 100, 60],
    superior: [140, 110, 65],
    bachillerato: [170, 120, 70],
  },
};

const NIVEL_LABEL: Record<string, string> = {
  inicial: 'inicial',
  basica: 'básica (EGB elemental/media)',
  superior: 'básica superior (8vo-10mo)',
  bachillerato: 'bachillerato',
};

export function compute(i: Inputs): Outputs {
  const hijos = Math.max(1, Math.min(10, Math.round(num(i.hijos, 1))));
  const nivel = String(i.nivel || 'basica');
  const tipo = String(i.tipo || 'fiscal');
  const conUniformes = String(i.incluyeUniformes || 'si') === 'si';

  const fila = (COSTOS[tipo] || COSTOS.fiscal)[nivel] || COSTOS.fiscal.basica;
  const [utiles, uniformes, mochila] = fila;
  const uniformesAplicado = conUniformes ? uniformes : 0;

  const porEstudiante = utiles + uniformesAplicado + mochila;
  const total = porEstudiante * hijos;

  const _insight = {
    title: 'Tu presupuesto de regreso a clases Sierra-Amazonía',
    text: `Para **${hijos} ${hijos === 1 ? 'estudiante' : 'estudiantes'}** de **${NIVEL_LABEL[nivel] || nivel}** en institución **${tipo === 'particular' ? 'particular' : 'fiscal'}**, presupuestá **${fmtUSDec(total)}** (${fmtUSDec(porEstudiante)} por estudiante). La lista fiscal promedio ronda los $50, pero con uniformes, mochila y zapatos el gasto real sube. Las clases del régimen Sierra-Amazonía 2026-2027 arrancan de forma **escalonada desde el martes 1 de septiembre de 2026**. Precios vigentes a julio 2026.`,
    tone: total > 400 ? 'warn' : 'good',
    icon: '🎒',
  };

  const bars = [
    { label: 'Útiles (lista)', value: utiles * hijos },
    { label: 'Uniformes', value: uniformesAplicado * hijos },
    { label: 'Mochila y zapatos', value: mochila * hijos },
  ];
  const _chart = {
    type: 'bars',
    bars,
    ariaLabel: `Desglose: útiles ${fmtUSDec(utiles * hijos)}, uniformes ${fmtUSDec(uniformesAplicado * hijos)}, mochila y zapatos ${fmtUSDec(mochila * hijos)}.`,
  };

  return {
    total: fmtUSDec(total),
    porEstudiante: fmtUSDec(porEstudiante),
    utiles: fmtUSDec(utiles * hijos),
    uniformes: conUniformes ? fmtUSDec(uniformesAplicado * hijos) : 'No incluidos',
    mochilaZapatos: fmtUSDec(mochila * hijos),
    detalle: `${hijos} ${hijos === 1 ? 'estudiante' : 'estudiantes'} · ${NIVEL_LABEL[nivel] || nivel} · ${tipo === 'particular' ? 'particular' : 'fiscal'}${conUniformes ? '' : ' · sin uniformes'} · inicio de clases: desde el 1-sep-2026 (escalonado).`,
    _insight,
    _chart,
  };
}
