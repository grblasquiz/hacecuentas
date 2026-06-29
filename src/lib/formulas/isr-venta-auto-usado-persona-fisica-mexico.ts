/** ISR por venta de auto usado (persona física) — México 2026.
 *  Enajenación de bienes muebles (LISR Arts. 93-XIX-b, 124, 126).
 *  Exención de 3 UMA anuales; retención del 20% si la venta ≥ $227,400.
 *  Datos (UMA anual, tarifa ISR anual): fuente única src/lib/data/mexico-2026.ts.
 *  Estimación: NO incluye actualización por INPC del costo de adquisición.
 */
import { MEXICO_2026, isrAnual2026 } from '../data/mexico-2026';

export interface Inputs {
  precioVenta: number;
  precioCompra: number;
  aniosPosesion: number;
  mejoras?: number;
  __lang?: string;
}

export interface Outputs {
  ganancia: number;
  exento: number;
  gravable: number;
  retencion20: number;
  isrEstimado: number;
  formula: string;
  explicacion: string;
  _chart?: any;
  _insight?: any;
}

const UMBRAL_RETENCION = 227400; // LISR Art. 126: retención 20% si la operación ≥ $227,400

export function isrVentaAutoUsadoPersonaFisicaMexico(i: Inputs): Outputs {
  const precioVenta = Number(i.precioVenta) || 0;
  const precioCompra = Number(i.precioCompra) || 0;
  const aniosPosesion = Math.max(0, Number(i.aniosPosesion) || 0);
  const mejoras = Math.max(0, Number(i.mejoras) || 0);

  if (precioVenta <= 0) throw new Error('Ingresá el precio de venta del auto');

  // Exención: 3 UMA anuales (LISR Art. 93-XIX-b) = 3 × $42,794.64 = $128,383.92.
  const exencion = 3 * MEXICO_2026.uma.anual;

  const costo = precioCompra + mejoras;
  const ganancia = Math.max(0, precioVenta - costo);
  const exento = Math.min(ganancia, exencion);
  const gravable = Math.max(0, ganancia - exencion);

  // Retención del 20% sobre el total de la operación si la venta ≥ $227,400 y hay ganancia gravable.
  const retencion20 = precioVenta >= UMBRAL_RETENCION && gravable > 0 ? 0.2 * precioVenta : 0;

  // ISR anual estimado: se divide la ganancia gravable entre años de posesión,
  // se aplica la tarifa anual y se multiplica de vuelta (Art. 120 LISR, ganancia acumulable).
  const parteAnual = aniosPosesion > 0 ? gravable / aniosPosesion : gravable;
  const isrEstimado = isrAnual2026(parteAnual) * Math.max(1, aniosPosesion);

  const formula = `Ganancia = $${Math.round(precioVenta).toLocaleString('es-MX')} − $${Math.round(costo).toLocaleString('es-MX')} = $${Math.round(ganancia).toLocaleString('es-MX')}; gravable (tras 3 UMA exentas) = $${Math.round(gravable).toLocaleString('es-MX')}; ISR estimado = $${Math.round(isrEstimado).toLocaleString('es-MX')}`;
  const explicacion = `Vendiste el auto en $${Math.round(precioVenta).toLocaleString('es-MX')} con un costo de $${Math.round(costo).toLocaleString('es-MX')} (compra + mejoras). La ganancia es $${Math.round(ganancia).toLocaleString('es-MX')}; de ella, $${Math.round(exento).toLocaleString('es-MX')} quedan exentos (3 UMA anuales) y $${Math.round(gravable).toLocaleString('es-MX')} son gravables. ${retencion20 > 0 ? `Como la venta supera $${UMBRAL_RETENCION.toLocaleString('es-MX')}, el comprador (persona moral) retiene el 20% = $${Math.round(retencion20).toLocaleString('es-MX')}, que es pago provisional a cuenta del ISR anual.` : 'Por el monto y/o la ganancia no aplica retención del 20%.'} ISR anual estimado: $${Math.round(isrEstimado).toLocaleString('es-MX')}. Estimación sin actualización por INPC del costo.`;

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Exento (3 UMA)', value: Math.round(exento) },
      { label: 'Gravable', value: Math.round(gravable) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(ganancia).toLocaleString('es-MX'),
    centerLabel: 'Ganancia',
    ariaLabel: `Ganancia de ${Math.round(ganancia)}: exento ${Math.round(exento)}, gravable ${Math.round(gravable)}.`,
  };

  let insight: any;
  if (ganancia <= 0) {
    insight = {
      title: 'No hay ISR a pagar',
      text: `Vendiste sin ganancia (precio ≤ costo de adquisición), así que **no generás ISR** por esta enajenación.`,
      tone: 'good' as const,
      icon: '✅',
    };
  } else if (gravable <= 0) {
    insight = {
      title: 'Ganancia exenta',
      text: `Tu ganancia de **$${Math.round(ganancia).toLocaleString('es-MX')}** no supera las 3 UMA anuales exentas ($${Math.round(exencion).toLocaleString('es-MX')}): **no pagás ISR**.`,
      tone: 'good' as const,
      icon: '🎉',
    };
  } else {
    insight = {
      title: 'Hay ISR estimado',
      text: `Sobre tu ganancia gravable de **$${Math.round(gravable).toLocaleString('es-MX')}** el ISR estimado es **$${Math.round(isrEstimado).toLocaleString('es-MX')}**.${retencion20 > 0 ? ` El 20% retenido ($${Math.round(retencion20).toLocaleString('es-MX')}) es pago a cuenta.` : ''} Es una estimación: el monto definitivo va en tu declaración anual.`,
      tone: 'warn' as const,
      icon: '🚗',
    };
  }

  return {
    ganancia: Math.round(ganancia),
    exento: Math.round(exento),
    gravable: Math.round(gravable),
    retencion20: Math.round(retencion20),
    isrEstimado: Math.round(isrEstimado),
    formula,
    explicacion,
    _chart: chart,
    _insight: insight,
  };
}
