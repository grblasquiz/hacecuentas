/** Sueldo neto real de un autónomo/monotributista */

// Fuente única de verdad: cuotas oficiales ARCA vigentes 2026-02-01.
// Se usa la cuota de "servicios" (la mayoría de los freelancers/autónomos prestan
// servicios; en categorías altas es la cuota más alta, el escenario conservador).
import { CUOTA_SERVICIOS, type Cat } from '../data/monotributo-2026';

export interface Inputs {
  facturacionMensual: number;
  categoriaMonotributo: string;
  porcentajeIIBB: number;
}

export interface Outputs {
  netoEstimado: number;
  monotributo: number;
  iibb: number;
  otrosGastos: number;
  detalle: string;
  _chart?: any;
  _insight?: any;
}

export function sueldoAutonomoNeto(i: Inputs): Outputs {
  const facturacion = Number(i.facturacionMensual);
  const categoria = String(i.categoriaMonotributo).toUpperCase();
  const porcentajeIIBB = Number(i.porcentajeIIBB);

  if (isNaN(facturacion) || facturacion <= 0) throw new Error('Ingresá tu facturación mensual');
  if (!CUOTA_SERVICIOS[categoria as Cat]) throw new Error('Seleccioná una categoría válida (A-K)');
  if (isNaN(porcentajeIIBB) || porcentajeIIBB < 0) throw new Error('El porcentaje de IIBB no puede ser negativo');

  const monotributo = CUOTA_SERVICIOS[categoria as Cat];
  const iibb = facturacion * (porcentajeIIBB / 100);
  const otrosGastos = 15000; // estimado: contador, banco, etc.

  const netoEstimado = facturacion - monotributo - iibb - otrosGastos;
  const porcentajeNeto = (netoEstimado / facturacion) * 100;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  const detalle =
    `Facturás $${fmt.format(facturacion)}, pagás $${fmt.format(monotributo)} de monotributo (cat. ${categoria}), ` +
    `$${fmt.format(iibb)} de IIBB (${porcentajeIIBB}%) y ~$${fmt.format(otrosGastos)} de otros gastos. ` +
    `Te queda un neto de $${fmt.format(netoEstimado)} (${porcentajeNeto.toFixed(1)}% de tu facturación).`;

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Neto estimado', value: Math.round(Math.max(0, netoEstimado)) },
      { label: 'Monotributo', value: monotributo },
      { label: 'IIBB', value: Math.round(iibb) },
      { label: 'Otros gastos', value: otrosGastos },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(facturacion).toLocaleString('es-AR'),
    centerLabel: 'Facturación',
    ariaLabel: 'Composición de la facturación mensual: neto estimado, monotributo, IIBB y otros gastos',
  };

  const totalCostos = monotributo + iibb + otrosGastos;
  const insight = {
    title:
      netoEstimado < 0
        ? 'Tus costos superan lo que facturás'
        : porcentajeNeto < 70
        ? 'Buena parte se va en cargas y gastos'
        : 'Te queda la mayor parte de lo que facturás',
    text:
      netoEstimado < 0
        ? `Facturando **$${fmt.format(facturacion)}** no alcanzás a cubrir los **$${fmt.format(totalCostos)}** de monotributo (cat. ${categoria}), IIBB y gastos: quedás **$${fmt.format(Math.abs(netoEstimado))}** en rojo. Revisá tu categoría o el % de IIBB.`
        : `De los **$${fmt.format(facturacion)}** que facturás te queda un neto de **$${fmt.format(Math.round(netoEstimado))}** (**${porcentajeNeto.toFixed(1)}%**), tras **$${fmt.format(totalCostos)}** entre monotributo (cat. ${categoria}), IIBB y otros gastos.`,
    tone: netoEstimado < 0 ? 'warn' : porcentajeNeto < 70 ? 'warn' : 'good',
    icon: '🧾',
  };

  return {
    netoEstimado: Math.round(Math.max(0, netoEstimado)),
    monotributo,
    iibb: Math.round(iibb),
    otrosGastos,
    detalle,
    _chart: chart,
    _insight: insight,
  };
}
