/**
 * Impuesto sucesoral / de herencia (SENIAT) — Venezuela.
 * Ley de Impuesto sobre Sucesiones, Donaciones y Demás Ramos Conexos, Art. 7.
 *
 * El impuesto es PROGRESIVO sobre la cuota líquida que recibe cada heredero,
 * expresada en Unidades Tributarias (U.T.), y la escala se endurece a medida
 * que el parentesco se aleja del causante. Se calcula por tramos marginales:
 *
 *   baseUT   = líquidoHereditario / valorUT
 *   impuesto = Σ (porción del tramo × tasa del tramo)   por grupo de parentesco
 *
 * ⚠️ TASAS REFERENCIALES de la estructura del Art. 7. La tarifa exacta (con sus
 * sustraendos y desgravámenes) la fija el SENIAT: verificá con un profesional
 * antes de declarar. El valor de la U.T. sale del módulo venezuela-2026.ts.
 *
 * Fuente: SENIAT — Ley de Impuesto sobre Sucesiones, Donaciones y Demás Ramos
 * Conexos (Art. 7).
 */
import { VENEZUELA_2026, fmtVES } from '../data/venezuela-2026';

export interface Inputs {
  liquidoHereditario?: number; // cuota líquida que recibe el heredero (Bs.)
  parentesco?: string;         // 'grupo1' | 'grupo2' | 'grupo3' | 'grupo4'
  valorUt?: number;            // Bs. por U.T.; default módulo
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

// Tramos marginales en U.T. (límite superior) y tasa por grupo de parentesco.
// Estructura progresiva referencial del Art. 7 (endurece con la lejanía).
type Tramo = { hastaUt: number; tasa: number };
const ESCALAS: Record<string, { label: string; tramos: Tramo[] }> = {
  grupo1: {
    label: 'Descendientes, ascendientes y cónyuge',
    tramos: [
      { hastaUt: 15, tasa: 0.01 }, { hastaUt: 50, tasa: 0.025 }, { hastaUt: 100, tasa: 0.05 },
      { hastaUt: 250, tasa: 0.075 }, { hastaUt: 500, tasa: 0.10 }, { hastaUt: 1000, tasa: 0.15 },
      { hastaUt: Infinity, tasa: 0.20 },
    ],
  },
  grupo2: {
    label: 'Hermanos y sobrinos (por representación)',
    tramos: [
      { hastaUt: 15, tasa: 0.025 }, { hastaUt: 50, tasa: 0.05 }, { hastaUt: 100, tasa: 0.075 },
      { hastaUt: 250, tasa: 0.10 }, { hastaUt: 500, tasa: 0.15 }, { hastaUt: 1000, tasa: 0.225 },
      { hastaUt: Infinity, tasa: 0.30 },
    ],
  },
  grupo3: {
    label: 'Otros colaterales (3.º y 4.º grado) y afines',
    tramos: [
      { hastaUt: 15, tasa: 0.04 }, { hastaUt: 50, tasa: 0.08 }, { hastaUt: 100, tasa: 0.12 },
      { hastaUt: 250, tasa: 0.16 }, { hastaUt: 500, tasa: 0.22 }, { hastaUt: 1000, tasa: 0.30 },
      { hastaUt: Infinity, tasa: 0.40 },
    ],
  },
  grupo4: {
    label: 'Extraños (sin parentesco)',
    tramos: [
      { hastaUt: 15, tasa: 0.06 }, { hastaUt: 50, tasa: 0.12 }, { hastaUt: 100, tasa: 0.18 },
      { hastaUt: 250, tasa: 0.24 }, { hastaUt: 500, tasa: 0.34 }, { hastaUt: 1000, tasa: 0.45 },
      { hastaUt: Infinity, tasa: 0.55 },
    ],
  },
};

function impuestoMarginalUt(baseUt: number, tramos: Tramo[]): number {
  let restante = baseUt;
  let previo = 0;
  let impuesto = 0;
  for (const t of tramos) {
    if (restante <= 0) break;
    const anchoTramo = t.hastaUt - previo;
    const porcion = Math.min(restante, anchoTramo);
    impuesto += porcion * t.tasa;
    restante -= porcion;
    previo = t.hastaUt;
  }
  return impuesto;
}

export function compute(i: Inputs): Outputs {
  const liquido = Math.max(0, Number(i.liquidoHereditario) || 0);
  if (liquido <= 0) throw new Error('Ingresá la cuota líquida que recibe el heredero (Bs.)');

  const grupoKey = ESCALAS[String(i.parentesco ?? 'grupo1')] ? String(i.parentesco) : 'grupo1';
  const escala = ESCALAS[grupoKey];
  const valorUt = i.valorUt != null && Number(i.valorUt) > 0 ? Number(i.valorUt) : VENEZUELA_2026.unidadTributaria;

  const baseUt = liquido / valorUt;
  const impuestoUt = impuestoMarginalUt(baseUt, escala.tramos);
  const impuestoBs = impuestoUt * valorUt;
  const tasaEfectiva = liquido > 0 ? (impuestoBs / liquido) * 100 : 0;
  const netoHeredero = liquido - impuestoBs;

  const narrativa =
    `Una cuota líquida de ${fmtVES(liquido)} (${baseUt.toLocaleString('de-DE', { maximumFractionDigits: 0 })} U.T. a ${fmtVES(valorUt)}/U.T.) ` +
    `para el grupo "${escala.label.toLowerCase()}" paga un impuesto sucesoral aproximado de ${fmtVES(impuestoBs)} ` +
    `(tasa efectiva ${tasaEfectiva.toLocaleString('de-DE', { maximumFractionDigits: 1 })}%), y el heredero recibe ${fmtVES(netoHeredero)}. ` +
    `La escala es progresiva y más alta cuanto más lejano es el parentesco. Cálculo referencial: la tarifa exacta la fija el SENIAT.`;

  return {
    impuestoBs: Number(impuestoBs.toFixed(2)),
    impuestoUt: Number(impuestoUt.toFixed(2)),
    baseUt: Number(baseUt.toFixed(2)),
    tasaEfectiva: Number(tasaEfectiva.toFixed(2)),
    netoHeredero: Number(netoHeredero.toFixed(2)),
    detalle: `Impuesto sucesoral aprox.: ${fmtVES(impuestoBs)} (tasa efectiva ${tasaEfectiva.toLocaleString('de-DE', { maximumFractionDigits: 1 })}%) — grupo ${escala.label.toLowerCase()}`,
    _insight: { type: 'highlight', icon: '⚖️', text: narrativa },
    _table: {
      title: `Escala progresiva referencial — ${escala.label}`,
      headers: ['Tramo (U.T.)', 'Tasa marginal'],
      rows: escala.tramos.map((t, idx) => {
        const desde = idx === 0 ? 0 : escala.tramos[idx - 1].hastaUt;
        const hasta = t.hastaUt === Infinity ? 'en adelante' : t.hastaUt.toLocaleString('de-DE');
        return [`${desde.toLocaleString('de-DE')} – ${hasta}`, `${(t.tasa * 100).toLocaleString('de-DE')}%`];
      }),
      note: 'Tasas marginales referenciales de la estructura del Art. 7 (Ley de Sucesiones): la escala se endurece con la lejanía del parentesco. La tarifa exacta, sus sustraendos y los desgravámenes los fija el SENIAT. Verificá con un profesional antes de declarar.',
    },
  };
}
