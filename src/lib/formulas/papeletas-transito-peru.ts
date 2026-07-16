/**
 * Papeletas de tránsito Perú — monto en función de la UIT según la gravedad de la
 * infracción (Reglamento Nacional de Tránsito, D.S. 016-2009-MTC y su Tabla de
 * Infracciones). El monto de cada papeleta se fija como un porcentaje de la UIT,
 * más puntos que se acumulan en el récord del conductor.
 *
 * UIT 2026 = S/ 5.500 (importada de peru-2026). Los % por gravedad son los tramos
 * estándar de la Tabla de Infracciones; el código exacto de tu papeleta define el
 * tramo — verificá el código (M, G, L…) en el reverso de la papeleta.
 */
import { PERU_2026, fmtPEN } from '../data/peru-2026.ts';

export interface Inputs {
  codigo?: string;      // tramo de gravedad seleccionado
  descuento?: string;   // 'no' | 'prontopago'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** Tramos de la Tabla de Infracciones: % de UIT y puntos, con ejemplo de código. */
const TRAMOS: Record<string, { pct: number; puntos: number; label: string; ejemplo: string }> = {
  m100: { pct: 1.00, puntos: 100, label: 'Muy grave (100% UIT)', ejemplo: 'Conducir en estado de ebriedad (M.20)' },
  m50:  { pct: 0.50, puntos: 50,  label: 'Muy grave (50% UIT)',  ejemplo: 'Negarse al dosaje etílico / exceso de velocidad grave (M)' },
  g24:  { pct: 0.24, puntos: 50,  label: 'Grave (24% UIT)',       ejemplo: 'Pasar la luz roja del semáforo (G.59)' },
  g18:  { pct: 0.18, puntos: 40,  label: 'Grave (18% UIT)',       ejemplo: 'Estacionar en zona rígida / adelantar indebidamente (G)' },
  g12:  { pct: 0.12, puntos: 30,  label: 'Grave (12% UIT)',       ejemplo: 'No respetar la señal de PARE (G)' },
  g8:   { pct: 0.08, puntos: 20,  label: 'Grave (8% UIT)',        ejemplo: 'No usar cinturón de seguridad (G)' },
  l4:   { pct: 0.04, puntos: 0,   label: 'Leve (4% UIT)',         ejemplo: 'Falta leve sin puntos (L)' },
};

export function compute(i: Inputs): Outputs {
  const codigo = String(i.codigo || 'g24');
  const tramo = TRAMOS[codigo] || TRAMOS.g24;
  const prontoPago = String(i.descuento || 'no') === 'prontopago';

  const uit = PERU_2026.uit; // 5.500
  const monto = uit * tramo.pct;

  // Pronto pago / pago voluntario: muchas entidades (SAT Lima, MTC) aplican un
  // descuento por cancelar dentro del plazo. Referencial: hasta 83% para
  // infracciones no muy graves; las muy graves (M) suelen tener descuentos menores.
  const esMuyGrave = tramo.pct >= 0.50;
  const pctDescuento = prontoPago ? (esMuyGrave ? 0.5 : 0.83) : 0;
  const descuento = monto * pctDescuento;
  const montoConDescuento = monto - descuento;

  const _insight = {
    title: `Papeleta ${tramo.label}`,
    text: prontoPago
      ? `La papeleta **${tramo.label}** equivale a **${fmtPEN(monto)}** (${(tramo.pct * 100).toLocaleString('es-PE', { maximumFractionDigits: 0 })}% de la UIT ${fmtPEN(uit)}). Con **pago voluntario dentro del plazo** el descuento referencial es del **${(pctDescuento * 100).toFixed(0)}%**, así que pagarías **${fmtPEN(montoConDescuento)}**. Suma **${tramo.puntos} puntos** a tu récord de conductor.`
      : `La papeleta **${tramo.label}** es **${fmtPEN(monto)}** (${(tramo.pct * 100).toLocaleString('es-PE', { maximumFractionDigits: 0 })}% de la UIT ${fmtPEN(uit)}) y suma **${tramo.puntos} puntos** a tu récord. Si la pagás dentro del plazo de pago voluntario, muchas entidades aplican hasta 83% de descuento.`,
    tone: esMuyGrave ? 'warn' : 'neutral',
    icon: '🚗',
  };
  const _chart = prontoPago
    ? {
        type: 'doughnut' as const,
        slices: [
          { label: 'Pagás (con descuento)', value: Math.round(montoConDescuento) },
          { label: 'Descuento pronto pago', value: Math.round(descuento) },
        ].filter((s) => s.value > 0),
        prefix: 'S/ ',
        centerValue: fmtPEN(montoConDescuento),
        centerLabel: 'A pagar',
        ariaLabel: `Papeleta de ${fmtPEN(monto)} con descuento de ${fmtPEN(descuento)}: pagás ${fmtPEN(montoConDescuento)}.`,
      }
    : {
        type: 'bar' as const,
        labels: ['Monto papeleta', 'Con pronto pago (ref.)'],
        values: [Math.round(monto), Math.round(monto * (esMuyGrave ? 0.5 : 0.17))],
        prefix: 'S/ ',
        ariaLabel: `Monto de la papeleta ${fmtPEN(monto)} frente al pago voluntario con descuento.`,
      };

  return {
    monto: fmtPEN(monto),
    montoConDescuento: prontoPago ? fmtPEN(montoConDescuento) : 'Sin descuento aplicado',
    puntos: `${tramo.puntos} puntos`,
    porcentajeUit: `${(tramo.pct * 100).toLocaleString('es-PE', { maximumFractionDigits: 0 })}% de la UIT`,
    detalle: `${tramo.ejemplo} · ${(tramo.pct * 100).toLocaleString('es-PE', { maximumFractionDigits: 0 })}% × UIT ${fmtPEN(uit)} = ${fmtPEN(monto)}${prontoPago ? ` · con pronto pago (${(pctDescuento * 100).toFixed(0)}%) = ${fmtPEN(montoConDescuento)}` : ''} · ${tramo.puntos} puntos.`,
    _insight,
    _chart,
  };
}
