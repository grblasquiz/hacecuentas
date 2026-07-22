/**
 * Coste de la vuelta al cole 2026 (España) — presupuesto desglosado por hijo.
 * Basado en el estudio OCU curso 2025-2026: 422 € de desembolso medio de septiembre
 * por alumno; coste anual medio 1.200 € (pública), 3.444 € (concertada), 8.200 € (privada).
 * Los importes por etapa/centro son estimaciones medias derivadas de ese estudio.
 */
import { fmtEUR } from '../data/espana-2026.ts';

export interface Inputs {
  numHijos: number;        // nº de hijos en edad escolar
  etapa: string;           // 'infantil' | 'primaria' | 'eso' | 'bachillerato'
  tipoCentro: string;      // 'publica' | 'concertada' | 'privada'
  comedor?: string;        // 'si' | 'no'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

// Desembolso inicial de septiembre por alumno (€), estimación media OCU 2025-26
// (libros de texto: media 203 €; material escolar: media 92 €).
const LIBROS: Record<string, number> = { infantil: 60, primaria: 180, eso: 240, bachillerato: 280 };
const MATERIAL: Record<string, number> = { infantil: 70, primaria: 90, eso: 100, bachillerato: 110 };
// Uniforme / ropa y calzado de inicio de curso, por tipo de centro.
const UNIFORME: Record<string, number> = { publica: 120, concertada: 250, privada: 350 };
// Comedor escolar: ~4,75 €/menú × ~20 días lectivos ≈ 95 €/mes.
const COMEDOR_MES = 95;
// Extraescolares medias por tipo de centro (€/mes).
const EXTRAESCOLARES_MES: Record<string, number> = { publica: 45, concertada: 60, privada: 80 };
// Cuota mensual del centro (0 en pública; cuota "voluntaria" media concertada; mensualidad privada).
const CUOTA_MES: Record<string, number> = { publica: 0, concertada: 130, privada: 500 };
const MESES_CURSO = 10; // septiembre a junio

const ETAPAS: Record<string, string> = {
  infantil: 'Infantil',
  primaria: 'Primaria',
  eso: 'ESO',
  bachillerato: 'Bachillerato',
};
const CENTROS: Record<string, string> = {
  publica: 'pública',
  concertada: 'concertada',
  privada: 'privada',
};

export function compute(i: Inputs): Outputs {
  const hijos = Math.max(1, Math.min(10, Math.round(Number(i.numHijos) || 1)));
  const etapa = String(i.etapa || 'primaria');
  const centro = String(i.tipoCentro || 'publica');
  const conComedor = String(i.comedor || 'no') === 'si';
  if (!(etapa in LIBROS)) throw new Error('Elige una etapa educativa');
  if (!(centro in UNIFORME)) throw new Error('Elige el tipo de centro');

  // En infantil de centros públicos los libros casi desaparecen; en concertada/privada
  // el material de etapa suele encarecerse un poco.
  const factorCentroLibros = centro === 'publica' ? 1 : centro === 'concertada' ? 1.1 : 1.2;
  const libros = LIBROS[etapa] * factorCentroLibros * hijos;
  const material = MATERIAL[etapa] * hijos;
  const uniforme = UNIFORME[centro] * hijos;
  const desembolsoInicial = libros + material + uniforme;

  const comedorMes = conComedor ? COMEDOR_MES * hijos : 0;
  const comedorCurso = comedorMes * MESES_CURSO;
  const extraMes = EXTRAESCOLARES_MES[centro] * hijos;
  const extraCurso = extraMes * MESES_CURSO;
  const cuotaCurso = CUOTA_MES[centro] * MESES_CURSO * hijos;

  const totalCurso = desembolsoInicial + comedorCurso + extraCurso + cuotaCurso;

  const _insight = {
    title: 'Tu presupuesto de vuelta al cole',
    text: `Para **${hijos} ${hijos === 1 ? 'hijo' : 'hijos'}** en **${ETAPAS[etapa]}** (escuela ${CENTROS[centro]}), el desembolso inicial de septiembre ronda **${fmtEUR(desembolsoInicial, 0)}** (libros + material + uniforme/ropa). Sumando ${conComedor ? 'comedor y ' : ''}extraescolares${cuotaCurso > 0 ? ' y cuotas del centro' : ''}, el curso completo 2026-27 se va a unos **${fmtEUR(totalCurso, 0)}**. La media OCU del desembolso de septiembre es 422 € por alumno.`,
    tone: totalCurso > 4000 * hijos ? 'warning' : 'neutral',
    icon: '🎒',
  };
  const _chart = {
    type: 'bar',
    items: [
      { label: 'Libros', value: Math.round(libros) },
      { label: 'Material', value: Math.round(material) },
      { label: 'Uniforme/ropa', value: Math.round(uniforme) },
      { label: 'Comedor (curso)', value: Math.round(comedorCurso) },
      { label: 'Extraescolares (curso)', value: Math.round(extraCurso) },
      ...(cuotaCurso > 0 ? [{ label: 'Cuotas centro (curso)', value: Math.round(cuotaCurso) }] : []),
    ],
    ariaLabel: `Desglose del coste del curso escolar: total ${fmtEUR(totalCurso, 0)}.`,
  };

  return {
    desembolsoInicial: fmtEUR(desembolsoInicial, 0),
    libros: fmtEUR(libros, 0),
    material: fmtEUR(material, 0),
    uniforme: fmtEUR(uniforme, 0),
    comedorMensual: conComedor ? fmtEUR(comedorMes, 0) + '/mes' : 'Sin comedor',
    extraescolaresMensual: fmtEUR(extraMes, 0) + '/mes',
    totalCurso: fmtEUR(totalCurso, 0),
    detalle: `${hijos} ${hijos === 1 ? 'hijo' : 'hijos'} · ${ETAPAS[etapa]} · ${CENTROS[centro]}${conComedor ? ' · con comedor' : ''} · curso de ${MESES_CURSO} meses.`,
    _insight,
    _chart,
  };
}
