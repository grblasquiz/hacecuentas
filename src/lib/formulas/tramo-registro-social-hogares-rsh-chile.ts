// Tramo del Registro Social de Hogares (RSH) — estimación referencial a partir del ingreso per cápita.
// El tramo oficial lo entrega la Cartola Hogar (registrosocial.gob.cl) y pondera además patrimonio,
// composición y necesidades del hogar. Acá estimamos solo por ingreso per cápita mensual.
import { fmtCLP } from '../data/chile-2026.ts';

export interface Inputs {
  ingresoHogar: number;   // ingreso total mensual del hogar (CLP)
  integrantes: number;    // número de personas del hogar
}
export interface Outputs {
  ingresoPerCapita: number;
  tramoEstimado: string;
  percentil: number;
  accedeBeneficios: string;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

// Cortes REFERENCIALES de ingreso per cápita mensual → tramo (percentil). No son cifras oficiales:
// el RSH fija los límites por percentil según la CASEN y se actualizan periódicamente.
const CORTES: { hasta: number; percentil: number; nombre: string }[] = [
  { hasta: 120_000, percentil: 40, nombre: 'Tramo 40% (hogares de menores ingresos)' },
  { hasta: 180_000, percentil: 50, nombre: 'Tramo 50%' },
  { hasta: 260_000, percentil: 60, nombre: 'Tramo 60%' },
  { hasta: 350_000, percentil: 70, nombre: 'Tramo 70%' },
  { hasta: 500_000, percentil: 80, nombre: 'Tramo 80%' },
  { hasta: 750_000, percentil: 90, nombre: 'Tramo 90%' },
  { hasta: Infinity, percentil: 100, nombre: 'Tramo 100% (mayores ingresos)' },
];

export function compute(i: Inputs): Outputs {
  const ingreso = Math.max(0, Number(i.ingresoHogar) || 0);
  const personas = Math.max(1, Math.round(Number(i.integrantes) || 1));

  const perCapita = Math.round(ingreso / personas);
  let corte = CORTES[CORTES.length - 1];
  for (const c of CORTES) { if (perCapita <= c.hasta) { corte = c; break; } }

  const accede = corte.percentil <= 60;
  const accedeBeneficios = accede
    ? 'Estás en el 60% priorizado: accedés a la mayoría de subsidios'
    : (corte.percentil <= 80 ? 'Tramo medio: accedés a beneficios de sectores medios (DS1, etc.)' : 'Tramo alto: menos beneficios focalizados');

  const _insight = {
    title: `Tramo estimado: ${corte.nombre}`,
    text: `Con ${fmtCLP(ingreso)} de ingreso mensual entre ${personas} persona${personas !== 1 ? 's' : ''}, tu ingreso per cápita es **${fmtCLP(perCapita)}**, que ubica al hogar de forma referencial en el **${corte.nombre}**. ${accede ? 'Estás dentro del 60% más vulnerable, el rango que abre la mayoría de subsidios (PGU, gratuidad, subsidios habitacionales).' : 'El valor oficial puede diferir: el RSH pondera también patrimonio, vivienda y composición del hogar.'}`,
    tone: accede ? 'good' : 'neutral',
    icon: '📋',
  };

  return {
    ingresoPerCapita: perCapita,
    tramoEstimado: corte.nombre,
    percentil: corte.percentil,
    accedeBeneficios,
    detalle: `Ingreso per cápita ${fmtCLP(perCapita)} → ${corte.nombre} (estimación referencial; el tramo oficial está en tu Cartola Hogar).`,
    _insight,
  };
}
