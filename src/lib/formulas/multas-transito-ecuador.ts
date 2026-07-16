/**
 * Multas de tránsito (Ecuador) — contravenciones del COIP calculadas como % del SBU.
 * SBU 2026 = USD 482 (ECUADOR_2026.sbu). Las multas suben automáticamente cada enero
 * al subir el SBU. Estructura por clases de contravención (COIP arts. 386-388):
 *   Leve 1ª 5% (-1,5 pts) · Leve 2ª 10% (-3) · Leve 3ª 15% (-4,5) ·
 *   Grave 1ª 30% (-6) · Grave 2ª 40% (-7,5) · Grave 3ª 50% (-9) · Muy grave 1 SBU (-10).
 * Fuente: ANT y COIP. Verificado 2026-07-16.
 */
import { ECUADOR_2026, fmtUSDec } from '../data/ecuador-2026.ts';

export interface Inputs {
  infraccion: string; // clave de la clase de contravención
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; }

const SBU = ECUADOR_2026.sbu; // 482

interface Clase { label: string; clase: string; pct: number; puntos: number; }
const CLASES: Record<string, Clase> = {
  leve_1:    { label: 'Contravención leve 1ª clase (p. ej. no usar cinturón, exceso de ruido)', clase: 'Leve 1ª', pct: 0.05, puntos: 1.5 },
  leve_2:    { label: 'Contravención leve 2ª clase (usar el celular al conducir, mal estacionado)', clase: 'Leve 2ª', pct: 0.10, puntos: 3 },
  leve_3:    { label: 'Contravención leve 3ª clase (conducir sin luces, exceso leve de velocidad)', clase: 'Leve 3ª', pct: 0.15, puntos: 4.5 },
  grave_1:   { label: 'Contravención grave 1ª clase (no respetar señales o semáforo en rojo)', clase: 'Grave 1ª', pct: 0.30, puntos: 6 },
  grave_2:   { label: 'Contravención grave 2ª clase (exceso de velocidad fuera de rango moderado)', clase: 'Grave 2ª', pct: 0.40, puntos: 7.5 },
  grave_3:   { label: 'Contravención grave 3ª clase (conducir con licencia caducada)', clase: 'Grave 3ª', pct: 0.50, puntos: 9 },
  muy_grave: { label: 'Contravención muy grave (conducir sin licencia, en estado de embriaguez)', clase: 'Muy grave', pct: 1.00, puntos: 10 },
};

export function compute(i: Inputs): Outputs {
  const key = String(i.infraccion || 'leve_2');
  const c = CLASES[key] || CLASES.leve_2;
  const valor = c.pct * SBU;

  const _insight = {
    title: `Multa: ${c.clase}`,
    text: `Una **${c.clase.toLowerCase()}** se sanciona con el **${Math.round(c.pct * 100)}% del SBU** (SBU 2026 = ${fmtUSDec(SBU)}) = **${fmtUSDec(valor)}**, más la reducción de **${c.puntos} puntos** en la licencia. ${key === 'muy_grave' ? 'Además puede implicar prisión y, en reincidencia, la suspensión de la licencia.' : 'Pagar dentro del plazo evita recargos por mora.'}`,
    tone: key === 'muy_grave' || key === 'grave_3' ? 'warn' : 'neutral',
    icon: '🚦',
  };

  const _table = {
    title: `Multas de tránsito por clase (SBU 2026 = ${fmtUSDec(SBU)})`,
    headers: ['Clase de contravención', '% del SBU', 'Valor de la multa', 'Puntos'],
    align: ['left', 'right', 'right', 'right'] as ('left' | 'right' | 'center')[],
    rows: Object.values(CLASES).map((x) => [
      x.clase,
      `${Math.round(x.pct * 100)}%`,
      fmtUSDec(x.pct * SBU),
      `-${x.puntos}`,
    ]),
    note: 'Valores del Código Orgánico Integral Penal (COIP). Suben cada enero al actualizarse el SBU. La licencia parte de 30 puntos; llegar a 0 acarrea la suspensión.',
  };

  return {
    valorMulta: fmtUSDec(valor),
    puntosRebaja: `-${c.puntos} puntos`,
    claseInfraccion: c.clase,
    detalle: `${c.label}: ${Math.round(c.pct * 100)}% de ${fmtUSDec(SBU)} = ${fmtUSDec(valor)} y -${c.puntos} puntos.`,
    _insight,
    _table,
  };
}
