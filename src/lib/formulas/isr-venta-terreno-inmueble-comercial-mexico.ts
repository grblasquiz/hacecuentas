/** ISR por venta de terreno o local comercial — México 2026.
 *  Enajenación de inmuebles NO casa habitación (sin exención): LISR Arts. 120, 126, 127, 152.
 *  Pago provisional del 5% sobre la ganancia (Art. 127, ante notario, a entidad federativa).
 *  ISR anual estimado: ganancia acumulable dividida entre años de posesión.
 *  Datos (tarifa ISR anual): fuente única src/lib/data/mexico-2026.ts.
 *  Estimación: NO incluye actualización por INPC del costo de adquisición.
 */
import { isrAnual2026 } from '../data/mexico-2026';

export interface Inputs {
  precioVenta: number;
  precioCompra: number;
  aniosPosesion: number;
  gastosNotariales?: number;
  __lang?: string;
}

export interface Outputs {
  ganancia: number;
  isrAnual: number;
  pagoProvisional5: number;
  tasaEfectiva: number;
  formula: string;
  explicacion: string;
  _chart?: any;
  _insight?: any;
}

export function isrVentaTerrenoInmuebleComercialMexico(i: Inputs): Outputs {
  const precioVenta = Number(i.precioVenta) || 0;
  const precioCompra = Number(i.precioCompra) || 0;
  const aniosPosesion = Math.max(0, Number(i.aniosPosesion) || 0);
  const gastosNotariales = Math.max(0, Number(i.gastosNotariales) || 0);

  if (precioVenta <= 0) throw new Error('Ingresá el precio de venta del inmueble');

  const costo = precioCompra + gastosNotariales;
  const ganancia = Math.max(0, precioVenta - costo);

  // Ganancia acumulable: se divide entre años de posesión, se aplica tarifa anual y se reescala.
  const gAcum = aniosPosesion > 0 ? ganancia / aniosPosesion : ganancia;
  const isrAnual = isrAnual2026(gAcum) * Math.max(1, aniosPosesion);

  // Pago provisional del 5% de la ganancia (Art. 127), enterado a la entidad federativa.
  const pagoProvisional5 = 0.05 * ganancia;

  const tasaEfectiva = ganancia > 0 ? isrAnual / ganancia : 0;

  const formula = `Ganancia = $${Math.round(precioVenta).toLocaleString('es-MX')} − $${Math.round(costo).toLocaleString('es-MX')} = $${Math.round(ganancia).toLocaleString('es-MX')}; ISR anual ≈ $${Math.round(isrAnual).toLocaleString('es-MX')}; pago provisional 5% = $${Math.round(pagoProvisional5).toLocaleString('es-MX')}`;
  const explicacion = `Vendés el inmueble (terreno o local, NO casa habitación, sin exención) en $${Math.round(precioVenta).toLocaleString('es-MX')} con un costo de $${Math.round(costo).toLocaleString('es-MX')} (compra + gastos notariales). La ganancia es $${Math.round(ganancia).toLocaleString('es-MX')}. El notario entera un pago provisional del 5% = $${Math.round(pagoProvisional5).toLocaleString('es-MX')} a la entidad federativa, que es a cuenta del ISR. El ISR anual estimado (ganancia acumulada entre ${Math.max(1, aniosPosesion)} año(s)) es ≈ $${Math.round(isrAnual).toLocaleString('es-MX')}, con tasa efectiva ${(tasaEfectiva * 100).toFixed(1)}%. Estimación sin actualización por INPC.`;

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Ganancia neta', value: Math.max(0, Math.round(ganancia - isrAnual)) },
      { label: 'ISR anual estimado', value: Math.round(isrAnual) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(ganancia).toLocaleString('es-MX'),
    centerLabel: 'Ganancia',
    ariaLabel: `Ganancia ${Math.round(ganancia)}: ISR estimado ${Math.round(isrAnual)}.`,
  };

  let insight: any;
  if (ganancia <= 0) {
    insight = {
      title: 'Sin ganancia, sin ISR',
      text: `Vendés sin ganancia (precio ≤ costo): no hay ISR ni pago provisional sobre utilidad.`,
      tone: 'good' as const,
      icon: '✅',
    };
  } else {
    insight = {
      title: 'Inmueble comercial: sí causa ISR',
      text: `Al no ser casa habitación **no hay exención**. ISR anual estimado **$${Math.round(isrAnual).toLocaleString('es-MX')}** (efectiva ${(tasaEfectiva * 100).toFixed(1)}%); el 5% provisional ($${Math.round(pagoProvisional5).toLocaleString('es-MX')}) va a cuenta. Definí el monto exacto en tu anual.`,
      tone: 'warn' as const,
      icon: '🏢',
    };
  }

  return {
    ganancia: Math.round(ganancia),
    isrAnual: Math.round(isrAnual),
    pagoProvisional5: Math.round(pagoProvisional5),
    tasaEfectiva: Math.round(tasaEfectiva * 1000) / 10,
    formula,
    explicacion,
    _chart: chart,
    _insight: insight,
  };
}
